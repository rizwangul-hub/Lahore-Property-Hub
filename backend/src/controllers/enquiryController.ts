import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Enquiry } from '../models/Enquiry.js';
import { Property } from '../models/Property.js';
import { Notification } from '../models/Notification.js';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import {
  normalizePhoneNumber,
  isValidPhoneNumber,
  detectSpam,
  checkDuplicateEnquiry,
} from '../utils/antiSpam.js';
import { notifyAdminNewEnquiry } from '../services/emailService.js';

/**
 * POST /api/enquiries
 * Public endpoint to submit a property lead enquiry.
 */
export const submitCustomerEnquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      propertyId,
      customerName,
      customerPhone,
      customerEmail,
      message,
      preferredContactMethod,
      _hp, // Honeypot field from public form
    } = req.body;

    // 1. Validation of required inputs
    if (!propertyId || !customerName || !customerPhone || !message) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, WhatsApp number, and message',
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid property identifier',
      });
      return;
    }

    // 2. Validate and normalize phone number
    const normalizedPhone = normalizePhoneNumber(customerPhone);
    if (!isValidPhoneNumber(normalizedPhone)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid Pakistani (+923XXXXXXXXX) or international phone number',
      });
      return;
    }

    // 3. Message length validation
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 5) {
      res.status(400).json({
        success: false,
        message: 'Message must be at least 5 characters long',
      });
      return;
    }

    if (trimmedMessage.length > 2000) {
      res.status(400).json({
        success: false,
        message: 'Message cannot exceed 2000 characters',
      });
      return;
    }

    // 4. Verify property existence and approval status
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Referenced property could not be found',
      });
      return;
    }

    if (property.status !== 'APPROVED') {
      res.status(400).json({
        success: false,
        message: 'Enquiries can only be submitted for active, approved property listings',
      });
      return;
    }

    // 5. Anti-Spam Evaluation
    const spamCheck = detectSpam({
      honeypot: _hp,
      name: customerName,
      message: trimmedMessage,
      phone: normalizedPhone,
    });

    // Check for duplicate rapid submission
    const isDuplicate = await checkDuplicateEnquiry(normalizedPhone, propertyId);
    if (isDuplicate) {
      res.status(429).json({
        success: false,
        message: 'You have recently sent an enquiry for this property. Please wait a few moments before trying again.',
      });
      return;
    }

    // 6. Persist Enquiry
    const enquiry = await Enquiry.create({
      propertyId: property._id,
      propertyTitle: property.title,
      propertyReferenceId: property.referenceId,
      listingType: property.listingType,
      propertyOwnerWhatsapp: property.contactInfo.whatsappNumber,
      customerName: customerName.trim(),
      customerPhone: normalizedPhone,
      customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : '',
      message: trimmedMessage,
      preferredContactMethod: ['WHATSAPP', 'PHONE', 'EMAIL'].includes(preferredContactMethod)
        ? preferredContactMethod
        : 'WHATSAPP',
      status: 'NEW',
      ipAddress: req.ip || '',
      isSpam: spamCheck.isSpam,
      spamScore: spamCheck.score,
    });

    // If honeypot caught a bot, return success superficially to avoid tipping off spammers
    if (spamCheck.isSpam) {
      console.warn(`[AntiSpam] Enquiry flagged as spam (Score: ${spamCheck.score}, Reasons: ${spamCheck.reasons.join(', ')})`);
      res.status(200).json({
        success: true,
        message: 'Your enquiry has been received. Our team will get back to you shortly.',
      });
      return;
    }

    // 7. Create In-App Admin Notification
    try {
      await Notification.create({
        type: 'ENQUIRY_RECEIVED',
        title: 'New Lead Enquiry Received',
        message: `${customerName.trim()} enquired about "${property.title}" (${normalizedPhone})`,
        propertyId: property._id,
        enquiryId: enquiry._id,
        link: '/admin/enquiries',
        isRead: false,
      });
    } catch (notifErr) {
      console.warn('[Notification] Failed to create in-app notification for enquiry:', notifErr);
    }

    // 8. Record Marketplace Analytics Event
    try {
      await AnalyticsEvent.create({
        eventType: 'ENQUIRY_SUBMIT',
        propertyId: property._id,
        propertySlug: property.slug,
        propertyTitle: property.title,
        listingType: property.listingType,
        propertyType: property.propertyType,
        timestamp: new Date(),
      });
    } catch (analyticsErr) {
      console.warn('[Analytics] Failed to record enquiry submission event:', analyticsErr);
    }

    // 9. Send Optional Email Notification to Admin via SMTP
    notifyAdminNewEnquiry(enquiry).catch((err) =>
      console.warn('[EmailService] Async enquiry email failed:', err)
    );

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been received! The property representative will contact you soon.',
    });
  } catch (error) {
    next(error);
  }
};
