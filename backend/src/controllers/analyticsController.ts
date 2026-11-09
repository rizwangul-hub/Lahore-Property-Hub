import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AnalyticsEvent, AnalyticsEventType } from '../models/AnalyticsEvent.js';
import { Property } from '../models/Property.js';
import { Enquiry } from '../models/Enquiry.js';

/**
 * POST /api/analytics/event
 * Privacy-preserving public endpoint to record interaction events.
 */
export const recordAnalyticsEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventType, propertyId, propertySlug, visitorSessionId, referrer, deviceType } = req.body;

    const validTypes: AnalyticsEventType[] = ['PAGE_VIEW', 'WHATSAPP_CLICK', 'ENQUIRY_SUBMIT'];
    if (!eventType || !validTypes.includes(eventType)) {
      res.status(400).json({ success: false, message: 'Invalid analytics event type' });
      return;
    }

    let propertyDoc: any = null;
    if (propertyId && mongoose.Types.ObjectId.isValid(propertyId)) {
      propertyDoc = await Property.findById(propertyId).select('title slug listingType propertyType views');
    } else if (propertySlug) {
      propertyDoc = await Property.findOne({ slug: propertySlug }).select('title slug listingType propertyType views');
    }

    // Deduplication check for page views to avoid spamming view counts
    if (eventType === 'PAGE_VIEW' && propertyDoc && visitorSessionId) {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const recentView = await AnalyticsEvent.findOne({
        eventType: 'PAGE_VIEW',
        propertyId: propertyDoc._id,
        visitorSessionId,
        timestamp: { $gte: twelveHoursAgo },
      });

      if (!recentView) {
        // Increment real property view counter atomically
        await Property.findByIdAndUpdate(propertyDoc._id, { $inc: { views: 1 } });
      }
    }

    // Persist event
    await AnalyticsEvent.create({
      eventType,
      propertyId: propertyDoc ? propertyDoc._id : undefined,
      propertySlug: propertyDoc ? propertyDoc.slug : propertySlug || '',
      propertyTitle: propertyDoc ? propertyDoc.title : '',
      listingType: propertyDoc ? propertyDoc.listingType : '',
      propertyType: propertyDoc ? propertyDoc.propertyType : '',
      visitorSessionId: visitorSessionId ? String(visitorSessionId).substring(0, 64) : '',
      referrer: referrer ? String(referrer).substring(0, 200) : '',
      deviceType: ['MOBILE', 'DESKTOP', 'TABLET'].includes(deviceType) ? deviceType : 'UNKNOWN',
      timestamp: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/analytics
 * Comprehensive marketplace analytics for administrators.
 */
export const getAdminAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [
      totalViewsCount,
      totalWhatsAppClicks,
      totalEnquiriesSubmitted,
      topViewedProperties,
      enquiriesByListingType,
      dailyTrends,
      uniqueConvertedSessions,
      totalUniqueSessions,
    ] = await Promise.all([
      // Total Page Views
      AnalyticsEvent.countDocuments({ eventType: 'PAGE_VIEW' }),

      // Total WhatsApp Clicks
      AnalyticsEvent.countDocuments({ eventType: 'WHATSAPP_CLICK' }),

      // Total Lead Enquiries
      Enquiry.countDocuments({ isSpam: false }),

      // Top viewed approved properties
      Property.find({ status: 'APPROVED' })
        .sort({ views: -1, createdAt: -1 })
        .limit(6)
        .select('title slug referenceId price location propertyType listingType views images')
        .lean(),

      // Enquiries grouped by listing type
      Enquiry.aggregate([
        { $match: { isSpam: false } },
        {
          $group: {
            _id: '$listingType',
            count: { $sum: 1 },
          },
        },
      ]),

      // Daily trends for the last 14 days
      AnalyticsEvent.aggregate([
        { $match: { timestamp: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              type: '$eventType',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),

      // Distinct converted sessions (WhatsApp clicks or enquiries)
      AnalyticsEvent.distinct('visitorSessionId', {
        eventType: { $in: ['WHATSAPP_CLICK', 'ENQUIRY_SUBMIT'] },
        visitorSessionId: { $ne: '' },
      }),

      // Distinct total visitor sessions
      AnalyticsEvent.distinct('visitorSessionId', {
        visitorSessionId: { $ne: '' },
      }),
    ]);

    // Calculate accurate conversion rate (guaranteed <= 100%)
    let conversionRate = 0;
    if (totalUniqueSessions.length > 0) {
      conversionRate = Number(
        Math.min(100, (uniqueConvertedSessions.length / totalUniqueSessions.length) * 100).toFixed(1)
      );
    } else if (totalViewsCount > 0) {
      const totalActions = totalWhatsAppClicks + totalEnquiriesSubmitted;
      conversionRate = Number(
        Math.min(100, (totalActions / totalViewsCount) * 100).toFixed(1)
      );
    }

    // Format daily trends
    const trendMap: Record<string, { date: string; views: number; whatsappClicks: number; enquiries: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      trendMap[dateKey] = { date: dateKey, views: 0, whatsappClicks: 0, enquiries: 0 };
    }

    dailyTrends.forEach((item) => {
      const dateKey = item._id.date;
      if (trendMap[dateKey]) {
        if (item._id.type === 'PAGE_VIEW') trendMap[dateKey].views = item.count;
        if (item._id.type === 'WHATSAPP_CLICK') trendMap[dateKey].whatsappClicks = item.count;
        if (item._id.type === 'ENQUIRY_SUBMIT') trendMap[dateKey].enquiries = item.count;
      }
    });

    const trendsArray = Object.values(trendMap);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalViews: totalViewsCount,
          totalWhatsAppClicks,
          totalEnquiries: totalEnquiriesSubmitted,
          conversionRate,
        },
        topViewedProperties,
        enquiriesByListingType: enquiriesByListingType.map((g) => ({
          type: g._id || 'OTHER',
          count: g.count,
        })),
        trends: trendsArray,
      },
    });
  } catch (error) {
    next(error);
  }
};
