import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Property, IProperty } from '../models/Property.js';
import { AuditLog } from '../models/AuditLog.js';
import { Enquiry } from '../models/Enquiry.js';
import { Notification } from '../models/Notification.js';
import { cleanupUploadedImages } from '../services/cloudinaryService.js';
import { notifySubmitterModerationDecision } from '../services/emailService.js';
import { processNewApprovedPropertyMarketing } from '../services/propertyMarketingEngine.js';
import { cancelUnpublishedDraftsForProperty } from '../services/marketingLifecycleSync.js';

/**
 * Helper to validate MongoDB ObjectId
 */
const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/admin/dashboard/stats
 * Real database statistics & activity metrics from actual MongoDB records.
 */
export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      total,
      pending,
      approved,
      rejected,
      sold,
      rented,
      expired,
      wanted,
      recentSubmissions,
      awaitingApproval,
      recentActivity,
      totalEnquiries,
      newEnquiries,
      contactedEnquiries,
      followUpEnquiries,
      convertedEnquiries,
      closedEnquiries,
      recentEnquiries,
      unreadNotificationsCount,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'PENDING' }),
      Property.countDocuments({ status: 'APPROVED' }),
      Property.countDocuments({ status: 'REJECTED' }),
      Property.countDocuments({ status: 'SOLD' }),
      Property.countDocuments({ status: 'RENTED' }),
      Property.countDocuments({ status: 'EXPIRED' }),
      Property.countDocuments({ listingType: 'WANTED' }),
      Property.find().sort({ createdAt: -1 }).limit(5).lean(),
      Property.find({ status: 'PENDING' }).sort({ createdAt: -1 }).limit(5).lean(),
      AuditLog.find().sort({ timestamp: -1 }).limit(8).lean(),
      Enquiry.countDocuments({ isSpam: false }),
      Enquiry.countDocuments({ status: 'NEW', isSpam: false }),
      Enquiry.countDocuments({ status: 'CONTACTED', isSpam: false }),
      Enquiry.countDocuments({ status: 'FOLLOW_UP', isSpam: false }),
      Enquiry.countDocuments({ status: 'CONVERTED', isSpam: false }),
      Enquiry.countDocuments({ status: 'CLOSED', isSpam: false }),
      Enquiry.find({ isSpam: false }).sort({ createdAt: -1 }).limit(5).lean(),
      Notification.countDocuments({ isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          pending,
          approved,
          rejected,
          sold,
          rented,
          expired,
          wanted,
        },
        enquiryStats: {
          total: totalEnquiries,
          new: newEnquiries,
          contacted: contactedEnquiries,
          followUp: followUpEnquiries,
          converted: convertedEnquiries,
          closed: closedEnquiries,
        },
        recentSubmissions,
        awaitingApproval,
        recentActivity,
        recentEnquiries,
        unreadNotificationsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/properties
 * Returns paginated, searchable, filterable list of all properties for admin table.
 */
export const getAdminProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      status,
      listingType,
      propertyType,
      search,
      page = '1',
      limit = '15',
      sort = 'newest',
    } = req.query;

    const query: Record<string, unknown> = {};

    // Filter by Status (unless 'ALL')
    if (status && typeof status === 'string' && status.toUpperCase() !== 'ALL') {
      query.status = status.toUpperCase();
    }

    // Filter by Listing Type
    if (listingType && typeof listingType === 'string' && listingType.toUpperCase() !== 'ALL') {
      query.listingType = listingType.toUpperCase();
    }

    // Filter by Property Type
    if (propertyType && typeof propertyType === 'string' && propertyType.toUpperCase() !== 'ALL') {
      query.propertyType = propertyType.toUpperCase();
    }

    // Search query (title, referenceId, contactName, whatsappNumber, area)
    if (search && typeof search === 'string' && search.trim()) {
      const s = search.trim();
      const sRegex = new RegExp(s, 'i');
      query.$or = [
        { title: sRegex },
        { referenceId: sRegex },
        { 'contactInfo.contactName': sRegex },
        { 'contactInfo.whatsappNumber': sRegex },
        { 'location.area': sRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'price_asc') {
      sortOptions = { price: 1, createdAt: -1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1, createdAt: -1 };
    }

    const [properties, total] = await Promise.all([
      Property.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/properties/:id
 * Get complete property details for inspection.
 */
export const getAdminPropertyById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid property ID' });
      return;
    }

    const property = await Property.findById(id).lean();
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/properties/:id/approve
 * Approves a property, making it publicly visible.
 */
export const approveProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid property ID' });
      return;
    }

    const property = await Property.findById(id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    const previousStatus = property.status;
    property.status = 'APPROVED';
    property.rejectionReason = '';
    await property.save();

    // Audit Log
    if (req.admin) {
      await AuditLog.create({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: 'PROPERTY_APPROVED',
        propertyId: property._id,
        propertyTitle: property.title,
        propertyReferenceId: property.referenceId,
        details: { previousStatus, newStatus: 'APPROVED' },
        ipAddress: req.ip || '',
        timestamp: new Date(),
      });
    }

    // Notify submitter via email if email was provided
    notifySubmitterModerationDecision(property, 'APPROVED').catch((err) =>
      console.warn('[EmailService] Async approval notification failed:', err)
    );

    // Trigger Marketing AI Engine 2 (New Approved Property Marketing)
    processNewApprovedPropertyMarketing(property._id).catch((err) =>
      console.warn('[MarketingAI] Async property marketing generation failed:', err)
    );

    res.status(200).json({
      success: true,
      message: `Property ${property.referenceId} has been approved and is now publicly live.`,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/properties/:id/reject
 * Rejects a property with required reason.
 */
export const rejectProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid property ID' });
      return;
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'A detailed rejection reason is required (minimum 3 characters)',
      });
      return;
    }

    const property = await Property.findById(id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    const previousStatus = property.status;
    property.status = 'REJECTED';
    property.rejectionReason = reason.trim();
    await property.save();

    // Audit Log
    if (req.admin) {
      await AuditLog.create({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: 'PROPERTY_REJECTED',
        propertyId: property._id,
        propertyTitle: property.title,
        propertyReferenceId: property.referenceId,
        details: { previousStatus, newStatus: 'REJECTED', rejectionReason: reason.trim() },
        ipAddress: req.ip || '',
        timestamp: new Date(),
      });
    }

    // Notify submitter via email if email was provided
    notifySubmitterModerationDecision(property, 'REJECTED', reason.trim()).catch((err) =>
      console.warn('[EmailService] Async rejection notification failed:', err)
    );

    // Cancel any unpublished marketing drafts for this rejected property
    cancelUnpublishedDraftsForProperty(property._id, `Property rejected by admin: ${reason.trim()}`).catch((err) =>
      console.warn('[MarketingAI] Lifecycle cancellation failed on reject:', err)
    );

    res.status(200).json({
      success: true,
      message: `Property ${property.referenceId} has been rejected.`,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/properties/:id/status
 * Manually changes status to SOLD, RENTED, EXPIRED, etc.
 */
export const changePropertyStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid property ID' });
      return;
    }

    const allowed = ['PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'RENTED', 'EXPIRED'];
    if (!status || !allowed.includes(String(status).toUpperCase())) {
      res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`,
      });
      return;
    }

    const property = await Property.findById(id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    const previousStatus = property.status;
    property.status = String(status).toUpperCase() as IProperty['status'];
    await property.save();

    if (req.admin) {
      await AuditLog.create({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: 'STATUS_CHANGED',
        propertyId: property._id,
        propertyTitle: property.title,
        propertyReferenceId: property.referenceId,
        details: { previousStatus, newStatus: property.status },
        ipAddress: req.ip || '',
        timestamp: new Date(),
      });
    }

    // Lifecycle Synchronization with Marketing AI
    if (property.status === 'APPROVED') {
      processNewApprovedPropertyMarketing(property._id).catch((err) =>
        console.warn('[MarketingAI] Async property marketing generation failed on status change:', err)
      );
    } else {
      cancelUnpublishedDraftsForProperty(property._id, `Property status changed to ${property.status}`).catch((err) =>
        console.warn('[MarketingAI] Lifecycle cancellation failed on status change:', err)
      );
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${property.status}`,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/properties/:id/feature
 * Toggles featured status. Only approved properties can be featured.
 */
export const toggleFeatureProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid property ID' });
      return;
    }

    const property = await Property.findById(id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (isFeatured && property.status !== 'APPROVED') {
      res.status(400).json({
        success: false,
        message: 'Only approved properties can be marked as Featured',
      });
      return;
    }

    property.isFeatured = Boolean(isFeatured);
    await property.save();

    if (req.admin) {
      await AuditLog.create({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: property.isFeatured ? 'PROPERTY_FEATURED' : 'PROPERTY_UNFEATURED',
        propertyId: property._id,
        propertyTitle: property.title,
        propertyReferenceId: property.referenceId,
        ipAddress: req.ip || '',
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: `Property ${property.isFeatured ? 'featured' : 'unfeatured'} successfully.`,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/properties/:id
 * Admin edit property details.
 */
export const updateAdminProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid property ID' });
      return;
    }

    const property = await Property.findById(id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    const {
      title,
      description,
      price,
      priceType,
      areaSize,
      areaUnit,
      location,
      contactInfo,
      facilities,
      details,
    } = req.body;

    if (title) property.title = String(title).trim();
    if (description) property.description = String(description).trim();
    if (price !== undefined) property.price = Number(price) || 0;
    if (priceType) property.priceType = priceType;
    if (areaSize !== undefined) property.areaSize = Number(areaSize) || property.areaSize;
    if (areaUnit) property.areaUnit = areaUnit;

    if (location && typeof location === 'object') {
      property.location = { ...property.location, ...location };
    }
    if (contactInfo && typeof contactInfo === 'object') {
      property.contactInfo = { ...property.contactInfo, ...contactInfo };
    }
    if (Array.isArray(facilities)) {
      property.facilities = facilities;
    }
    if (details && typeof details === 'object') {
      property.details = { ...property.details, ...details };
    }

    await property.save();

    if (req.admin) {
      await AuditLog.create({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: 'PROPERTY_EDITED',
        propertyId: property._id,
        propertyTitle: property.title,
        propertyReferenceId: property.referenceId,
        ipAddress: req.ip || '',
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/properties/:id
 * Deletes property and cleans up Cloudinary images safely.
 */
export const deleteAdminProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid property ID' });
      return;
    }

    const property = await Property.findById(id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Clean up associated Cloudinary images
    if (property.images && property.images.length > 0) {
      try {
        await cleanupUploadedImages(property.images);
      } catch (cloudErr) {
        console.warn('[Cloudinary] Image cleanup warning during deletion:', cloudErr);
      }
    }

    const title = property.title;
    const refId = property.referenceId;

    // Cancel unpublished marketing drafts
    cancelUnpublishedDraftsForProperty(property._id, 'Property deleted by administrator').catch((err) =>
      console.warn('[MarketingAI] Lifecycle cancellation failed on delete:', err)
    );

    await property.deleteOne();

    if (req.admin) {
      await AuditLog.create({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: 'PROPERTY_DELETED',
        propertyTitle: title,
        propertyReferenceId: refId,
        ipAddress: req.ip || '',
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: `Property ${refId} and associated assets have been deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/audit-logs
 * Paginated audit log retrieval.
 */
export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ timestamp: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
