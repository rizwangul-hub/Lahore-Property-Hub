import { Request, Response, NextFunction } from 'express';
import { MarketingDraft } from '../models/MarketingDraft.js';
import { PostingHistory } from '../models/PostingHistory.js';
import { FacebookGroup } from '../models/FacebookGroup.js';

export const getMarketingAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalDrafts,
      draftsByStatus,
      draftsByCampaign,
      publicationsByGroup,
      campaignsByArea,
      campaignsByLanguage,
      totalPostingHistory,
      activeGroupsCount,
    ] = await Promise.all([
      MarketingDraft.countDocuments(),
      MarketingDraft.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      MarketingDraft.aggregate([
        { $group: { _id: '$campaignType', count: { $sum: 1 } } },
      ]),
      PostingHistory.aggregate([
        { $group: { _id: '$groupName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      MarketingDraft.aggregate([
        { $group: { _id: '$targetArea', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      MarketingDraft.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } },
      ]),
      PostingHistory.countDocuments({ status: 'CONFIRMED' }),
      FacebookGroup.countDocuments({ isActive: true }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const item of draftsByStatus) {
      statusMap[item._id] = item.count;
    }

    const campaignMap: Record<string, number> = {};
    for (const item of draftsByCampaign) {
      campaignMap[item._id] = item.count;
    }

    const languageMap: Record<string, number> = {};
    for (const item of campaignsByLanguage) {
      languageMap[item._id] = item.count;
    }

    // Publication breakdown by campaign type
    const [websitePublications, propertyPublications] = await Promise.all([
      PostingHistory.countDocuments({ campaignType: 'WEBSITE_MARKETING', status: 'CONFIRMED' }),
      PostingHistory.countDocuments({ campaignType: 'PROPERTY_MARKETING', status: 'CONFIRMED' }),
    ]);

    // UTM Campaign tracking breakdown from targetUrl
    const utmCampaigns = await MarketingDraft.aggregate([
      { $match: { targetUrl: { $regex: 'utm_campaign=' } } },
      { $group: { _id: '$theme', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDrafts,
          totalApproved: statusMap['APPROVED'] || 0,
          totalPending: statusMap['PENDING_APPROVAL'] || 0,
          totalPublished: totalPostingHistory,
          totalRejected: statusMap['REJECTED'] || 0,
          totalCancelled: statusMap['CANCELLED_PROPERTY_UNAVAILABLE'] || 0,
          totalSkipped: statusMap['SKIPPED'] || 0,
          activeGroupsCount,
        },
        publications: {
          total: totalPostingHistory,
          websiteMarketing: websitePublications,
          propertyMarketing: propertyPublications,
        },
        byCampaignType: {
          websiteMarketing: campaignMap['WEBSITE_MARKETING'] || 0,
          propertyMarketing: campaignMap['PROPERTY_MARKETING'] || 0,
        },
        byLanguage: languageMap,
        topAreas: campaignsByArea.map((item) => ({
          area: item._id || 'Unknown',
          count: item.count,
        })),
        topGroups: publicationsByGroup.map((item) => ({
          groupName: item._id || 'Unknown',
          count: item.count,
        })),
        utmThemes: utmCampaigns.map((item) => ({
          theme: item._id || 'General',
          count: item.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
