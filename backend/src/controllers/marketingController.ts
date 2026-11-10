import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { FacebookGroup, IFacebookGroup } from '../models/FacebookGroup.js';
import { MarketingDraft, IMarketingDraft, DraftStatus } from '../models/MarketingDraft.js';
import { PostingHistory } from '../models/PostingHistory.js';
import { MarketingSettings } from '../models/MarketingSettings.js';
import { Property } from '../models/Property.js';
import { AuditLog } from '../models/AuditLog.js';
import { generateDailyWebsiteCampaigns, WEBSITE_THEMES, buildWebsiteMarketingCopy, WebsiteMarketingTheme } from '../services/websiteMarketingEngine.js';
import { processNewApprovedPropertyMarketing, buildPropertyMarketingCopy } from '../services/propertyMarketingEngine.js';
import { reconcileAllPropertyDrafts } from '../services/marketingLifecycleSync.js';
import { publishToOfficialFacebookPage } from '../services/facebookPageService.js';

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

// ==========================================
// 1. FACEBOOK GROUPS CONTROLLERS
// ==========================================

export const getFacebookGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { area, active, allowsWebsite, allowsProperty, page = '1', limit = '50' } = req.query;
    const query: Record<string, unknown> = {};

    if (area && typeof area === 'string') {
      query.area = new RegExp(area.trim(), 'i');
    }
    if (active === 'true' || active === 'false') {
      query.isActive = active === 'true';
    }
    if (allowsWebsite === 'true') {
      query.allowsWebsiteMarketing = true;
    }
    if (allowsProperty === 'true') {
      query.allowsPropertyAdvertising = true;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [groups, total] = await Promise.all([
      FacebookGroup.find(query).sort({ area: 1, name: 1 }).skip(skip).limit(limitNum).lean(),
      FacebookGroup.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: groups,
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

export const getFacebookGroupById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid group ID' });
      return;
    }

    const group = await FacebookGroup.findById(id).lean();
    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    const now = new Date();
    const freqMs = (group.postingFrequencyLimitHours || 24) * 60 * 60 * 1000;

    const nextEligibleWebsite = group.websiteMarketingLastPostedAt
      ? new Date(new Date(group.websiteMarketingLastPostedAt).getTime() + freqMs)
      : null;
    const isWebsiteInCooldown = nextEligibleWebsite ? nextEligibleWebsite > now : false;

    const nextEligibleProperty = group.propertyMarketingLastPostedAt
      ? new Date(new Date(group.propertyMarketingLastPostedAt).getTime() + freqMs)
      : null;
    const isPropertyInCooldown = nextEligibleProperty ? nextEligibleProperty > now : false;

    const [totalCampaigns, totalConfirmed, recentHistory] = await Promise.all([
      MarketingDraft.countDocuments({ groupId: group._id }),
      PostingHistory.countDocuments({ groupId: group._id, status: 'CONFIRMED' }),
      PostingHistory.find({ groupId: group._id }).sort({ postedAt: -1 }).limit(10).lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...group,
        totalCampaigns,
        totalConfirmed,
        recentHistory,
        cooldown: {
          isWebsiteInCooldown,
          nextEligibleWebsite,
          isPropertyInCooldown,
          nextEligibleProperty,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createFacebookGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      groupUrl,
      area,
      subAreaFocus,
      groupRules,
      membershipType,
      acceptedCategories,
      allowsWebsiteMarketing,
      allowsPropertyAdvertising,
      preferredLanguage,
      postingFrequencyLimitHours,
      isActive,
      notes,
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, message: 'Group name is required' });
      return;
    }
    if (!groupUrl || !/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+/i.test(groupUrl)) {
      res.status(400).json({ success: false, message: 'Valid Facebook Group URL is required' });
      return;
    }
    if (!area || typeof area !== 'string' || !area.trim()) {
      res.status(400).json({ success: false, message: 'Target area/society is required' });
      return;
    }

    const group = await FacebookGroup.create({
      name: name.trim(),
      groupUrl: groupUrl.trim(),
      area: area.trim(),
      subAreaFocus: Array.isArray(subAreaFocus) ? subAreaFocus.map(String) : [],
      groupRules: typeof groupRules === 'string' ? groupRules.trim() : '',
      membershipType: ['MEMBER', 'MODERATOR', 'ADMIN'].includes(membershipType)
        ? membershipType
        : 'MEMBER',
      acceptedCategories: Array.isArray(acceptedCategories) && acceptedCategories.length > 0
        ? acceptedCategories.map(String)
        : ['ALL'],
      allowsWebsiteMarketing: allowsWebsiteMarketing !== false,
      allowsPropertyAdvertising: allowsPropertyAdvertising !== false,
      preferredLanguage: ['ENGLISH', 'URDU', 'ROMAN_URDU', 'BILINGUAL'].includes(preferredLanguage)
        ? preferredLanguage
        : 'ROMAN_URDU',
      postingFrequencyLimitHours:
        !isNaN(Number(postingFrequencyLimitHours)) && Number(postingFrequencyLimitHours) >= 1
          ? Number(postingFrequencyLimitHours)
          : 24,
      isActive: isActive !== false,
      notes: typeof notes === 'string' ? notes.trim() : '',
    });

    if (req.admin) {
      await AuditLog.create({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: 'STATUS_CHANGED',
        details: { action: 'FACEBOOK_GROUP_CREATED', groupId: group._id, groupName: group.name },
        ipAddress: req.ip || '',
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Facebook group added successfully',
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFacebookGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid group ID' });
      return;
    }

    const allowedFields = [
      'name',
      'groupUrl',
      'area',
      'subAreaFocus',
      'groupRules',
      'membershipType',
      'acceptedCategories',
      'allowsWebsiteMarketing',
      'allowsPropertyAdvertising',
      'preferredLanguage',
      'postingFrequencyLimitHours',
      'isActive',
      'notes',
    ];

    const updatePayload: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updatePayload[field] = req.body[field];
      }
    }

    if (updatePayload.groupUrl && !/^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+/i.test(String(updatePayload.groupUrl))) {
      res.status(400).json({ success: false, message: 'Invalid Facebook Group URL' });
      return;
    }

    const group = await FacebookGroup.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Facebook group updated successfully',
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFacebookGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid group ID' });
      return;
    }

    const group = await FacebookGroup.findByIdAndDelete(id);
    if (!group) {
      res.status(404).json({ success: false, message: 'Group not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Facebook group deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. MARKETING DRAFTS CONTROLLERS
// ==========================================

export const getMarketingDrafts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Lifecycle reconciliation pass to cancel any draft whose property is no longer APPROVED
    await reconcileAllPropertyDrafts();

    const { campaignType, status, groupId, propertyId, page = '1', limit = '20' } = req.query;
    const query: Record<string, unknown> = {};

    if (campaignType && ['WEBSITE_MARKETING', 'PROPERTY_MARKETING'].includes(String(campaignType))) {
      query.campaignType = campaignType;
    }
    if (status && typeof status === 'string') {
      query.status = status;
    }
    if (groupId && isValidObjectId(String(groupId))) {
      query.groupId = groupId;
    }
    if (propertyId && isValidObjectId(String(propertyId))) {
      query.propertyId = propertyId;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [rawDrafts, total] = await Promise.all([
      MarketingDraft.find(query).populate('groupId', 'groupUrl').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      MarketingDraft.countDocuments(query),
    ]);

    const drafts = rawDrafts.map((d: any) => ({
      ...d,
      groupUrl: d.groupUrl || (d.groupId && typeof d.groupId === 'object' ? d.groupId.groupUrl : '') || 'https://www.facebook.com/groups',
      groupId: d.groupId && typeof d.groupId === 'object' ? d.groupId._id : d.groupId,
    }));

    res.status(200).json({
      success: true,
      data: drafts,
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

export const getMarketingDraftById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid draft ID' });
      return;
    }

    const draft: any = await MarketingDraft.findById(id).populate('groupId', 'groupUrl').lean();
    if (!draft) {
      res.status(404).json({ success: false, message: 'Draft not found' });
      return;
    }

    const cleanGroupUrl = draft.groupUrl || (draft.groupId && typeof draft.groupId === 'object' ? draft.groupId.groupUrl : '') || 'https://www.facebook.com/groups';
    draft.groupUrl = cleanGroupUrl;
    if (draft.groupId && typeof draft.groupId === 'object') {
      draft.groupId = draft.groupId._id;
    }

    // Check current property status if property draft
    let livePropertyStatus: string | null = null;
    if (draft.propertyId) {
      const prop = await Property.findById(draft.propertyId).select('status price title').lean();
      livePropertyStatus = prop ? prop.status : 'DELETED';
    }

    res.status(200).json({
      success: true,
      data: {
        ...draft,
        livePropertyStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approves a generated draft. Moves PENDING_APPROVAL -> APPROVED.
 * Enforces: Property must still be in APPROVED status!
 */
export const approveMarketingDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid draft ID' });
      return;
    }

    const draft = await MarketingDraft.findById(id);
    if (!draft) {
      res.status(404).json({ success: false, message: 'Draft not found' });
      return;
    }

    if (draft.status !== 'PENDING_APPROVAL') {
      res.status(400).json({
        success: false,
        message: `Draft cannot be approved from current status: ${draft.status}`,
      });
      return;
    }

    // If property marketing, verify property is still active and approved
    if (draft.propertyId) {
      const prop = await Property.findById(draft.propertyId);
      if (!prop || prop.status !== 'APPROVED') {
        const reason = !prop ? 'Property was deleted' : `Property is ${prop.status}`;
        draft.status = 'CANCELLED_PROPERTY_UNAVAILABLE';
        draft.cancellationReason = reason;
        await draft.save();

        res.status(400).json({
          success: false,
          message: `Cannot approve draft: ${reason}. Draft has been cancelled.`,
          data: draft,
        });
        return;
      }
    }

    draft.status = 'APPROVED';
    draft.approvedAt = new Date();
    if (req.admin) {
      draft.approvedBy = new mongoose.Types.ObjectId(req.admin.id);
    }
    await draft.save();

    if (req.admin) {
      await AuditLog.create({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: 'STATUS_CHANGED',
        details: { action: 'MARKETING_DRAFT_APPROVED', draftId: draft._id, campaignType: draft.campaignType },
        ipAddress: req.ip || '',
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Draft approved successfully and is now ready for publishing.',
      data: draft,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectMarketingDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid draft ID' });
      return;
    }

    const draft = await MarketingDraft.findById(id);
    if (!draft) {
      res.status(404).json({ success: false, message: 'Draft not found' });
      return;
    }

    draft.status = 'REJECTED';
    draft.rejectedAt = new Date();
    draft.rejectionReason = typeof reason === 'string' ? reason.trim() : 'Rejected by administrator';
    await draft.save();

    res.status(200).json({
      success: true,
      message: 'Draft rejected.',
      data: draft,
    });
  } catch (error) {
    next(error);
  }
};

export const skipMarketingDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid draft ID' });
      return;
    }

    const draft = await MarketingDraft.findById(id);
    if (!draft) {
      res.status(404).json({ success: false, message: 'Draft not found' });
      return;
    }

    draft.status = 'SKIPPED';
    await draft.save();

    res.status(200).json({
      success: true,
      message: 'Draft skipped.',
      data: draft,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMarketingDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { headline, caption, hashtags, imageUrls } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid draft ID' });
      return;
    }

    const draft = await MarketingDraft.findById(id);
    if (!draft) {
      res.status(404).json({ success: false, message: 'Draft not found' });
      return;
    }

    if (draft.status === 'PUBLISHED') {
      res.status(400).json({ success: false, message: 'Cannot edit an already published draft.' });
      return;
    }

    if (headline && typeof headline === 'string') draft.headline = headline.trim();
    if (caption && typeof caption === 'string') draft.caption = caption.trim();
    if (Array.isArray(hashtags)) draft.hashtags = hashtags.map(String);
    if (Array.isArray(imageUrls)) draft.imageUrls = imageUrls.map(String);

    await draft.save();

    res.status(200).json({
      success: true,
      message: 'Draft content updated successfully.',
      data: draft,
    });
  } catch (error) {
    next(error);
  }
};

export const regenerateMarketingDraft = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid draft ID' });
      return;
    }

    const draft = await MarketingDraft.findById(id);
    if (!draft) {
      res.status(404).json({ success: false, message: 'Draft not found' });
      return;
    }

    if (draft.status === 'PUBLISHED') {
      res.status(400).json({ success: false, message: 'Cannot regenerate a published draft.' });
      return;
    }

    const group = await FacebookGroup.findById(draft.groupId);
    if (!group) {
      res.status(404).json({ success: false, message: 'Target group not found.' });
      return;
    }

    const settings = await MarketingSettings.findOne();
    const websiteUrl = settings?.officialWebsiteUrl || 'https://www.propertyinlahore.online';

    if (draft.campaignType === 'WEBSITE_MARKETING') {
      // Pick next rotating theme different from current
      const currentIdx = WEBSITE_THEMES.indexOf((draft.theme as WebsiteMarketingTheme) || 'FREE_PROPERTY_LISTINGS');
      const nextTheme = WEBSITE_THEMES[(currentIdx + 1) % WEBSITE_THEMES.length];
      const copy = buildWebsiteMarketingCopy(nextTheme, draft.language, group, websiteUrl);

      draft.headline = copy.headline;
      draft.caption = copy.caption;
      draft.hashtags = copy.hashtags;
      draft.theme = nextTheme;
    } else {
      // Property Marketing
      if (!draft.propertyId) {
        res.status(400).json({ success: false, message: 'Missing property reference.' });
        return;
      }
      const property = await Property.findById(draft.propertyId);
      if (!property || property.status !== 'APPROVED') {
        res.status(400).json({ success: false, message: 'Property is no longer available or approved.' });
        return;
      }
      const copy = buildPropertyMarketingCopy(property, group, draft.targetUrl);
      draft.headline = copy.headline;
      draft.caption = copy.caption;
      draft.hashtags = copy.hashtags;
    }

    await draft.save();

    res.status(200).json({
      success: true,
      message: 'Draft content regenerated successfully with new creative variations.',
      data: draft,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. CAMPAIGN GENERATOR CONTROLLERS
// ==========================================

export const triggerWebsiteMarketingRun = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await generateDailyWebsiteCampaigns();

    res.status(200).json({
      success: true,
      message: `Engine 1 generated ${result.generatedCount} daily promotional drafts (${result.skippedCooldownCount} groups in cooldown).`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerPropertyMarketingBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { propertyId } = req.body;

    if (propertyId) {
      if (!isValidObjectId(propertyId)) {
        res.status(400).json({ success: false, message: 'Invalid property ID' });
        return;
      }
      const result = await processNewApprovedPropertyMarketing(propertyId);
      res.status(200).json({
        success: true,
        message: `Engine 2 processed property: created ${result.draftsCreated.length} drafts across ${result.matchedGroupCount} matching groups.`,
        data: result,
      });
      return;
    }

    // Batch scan all currently approved properties that don't have drafts yet
    const approvedProps = await Property.find({ status: 'APPROVED' }).sort({ createdAt: -1 }).limit(10);
    let totalDrafts = 0;

    for (const prop of approvedProps) {
      const res = await processNewApprovedPropertyMarketing(prop._id);
      totalDrafts += res.draftsCreated.length;
    }

    res.status(200).json({
      success: true,
      message: `Engine 2 batch processed ${approvedProps.length} approved properties: created ${totalDrafts} new drafts.`,
      data: { scannedProperties: approvedProps.length, totalDraftsCreated: totalDrafts },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. PUBLISHING CONFIRMATION CONTROLLER
// ==========================================

/**
 * User confirms that they have manually copied caption & media and published to Facebook.
 * STRICT ENFORCEMENT:
 * 1. Must be in APPROVED status (never PENDING_APPROVAL, REJECTED, or CANCELLED).
 * 2. Updates draft to PUBLISHED.
 * 3. Sets separate cooldown:
 *    - websiteMarketingLastPostedAt for WEBSITE_MARKETING
 *    - propertyMarketingLastPostedAt for PROPERTY_MARKETING
 * 4. Logs to PostingHistory.
 */
export const confirmPublished = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { facebookPostUrl, notes, publicationDate } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid draft ID' });
      return;
    }

    // Clean optional Facebook post URL (if provided, must be valid http, or fallback to auto-generated group marker)
    let cleanPostUrl = typeof facebookPostUrl === 'string' ? facebookPostUrl.trim() : '';
    if (cleanPostUrl && !/^https?:\/\/.+/i.test(cleanPostUrl)) {
      cleanPostUrl = '';
    }

    const draft = await MarketingDraft.findById(id);
    if (!draft) {
      res.status(404).json({ success: false, message: 'Draft not found' });
      return;
    }

    // STRICT CHECK: Approval is mandatory before manual publishing confirmation
    if (draft.status !== 'APPROVED') {
      res.status(400).json({
        success: false,
        message: `Draft cannot be confirmed as published. It must be in APPROVED status first (current status: ${draft.status}).`,
      });
      return;
    }

    // Verify property is still live and approved if property marketing
    if (draft.propertyId) {
      const prop = await Property.findById(draft.propertyId);
      if (!prop || prop.status !== 'APPROVED') {
        const reason = !prop ? 'Property was deleted' : `Property is ${prop.status}`;
        draft.status = 'CANCELLED_PROPERTY_UNAVAILABLE';
        draft.cancellationReason = reason;
        await draft.save();

        res.status(400).json({
          success: false,
          message: `Cannot publish: ${reason}. Draft has been cancelled.`,
        });
        return;
      }
    }

    const now = publicationDate && !isNaN(new Date(publicationDate).getTime())
      ? new Date(publicationDate)
      : new Date();

    draft.status = 'PUBLISHED';
    draft.publishedAt = now;
    draft.facebookPostUrl = cleanPostUrl || `https://facebook.com/groups/${draft.groupId}`;
    await draft.save();

    // Update separate cooldown on FacebookGroup
    const group = await FacebookGroup.findById(draft.groupId);
    if (group) {
      if (draft.campaignType === 'WEBSITE_MARKETING') {
        group.websiteMarketingLastPostedAt = now;
      } else {
        group.propertyMarketingLastPostedAt = now;
      }
      await group.save();
    }

    // Record in PostingHistory
    const history = await PostingHistory.create({
      draftId: draft._id,
      campaignType: draft.campaignType,
      propertyId: draft.propertyId,
      groupId: draft.groupId,
      groupName: draft.groupName,
      postedAt: now,
      facebookPostUrl: draft.facebookPostUrl,
      language: draft.language,
      status: 'CONFIRMED',
      adminId: req.admin ? new mongoose.Types.ObjectId(req.admin.id) : undefined,
      adminEmail: req.admin?.email || '',
      notes: typeof notes === 'string' ? notes.trim() : '',
    });

    if (req.admin) {
      await AuditLog.create({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: 'STATUS_CHANGED',
        details: { action: 'MARKETING_POST_PUBLISHED', draftId: draft._id, groupName: draft.groupName },
        ipAddress: req.ip || '',
        timestamp: now,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Draft marked as published successfully. Cooldown timer activated.',
      data: {
        draft,
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. HISTORY & SETTINGS CONTROLLERS
// ==========================================

export const getPostingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignType, groupId, page = '1', limit = '20' } = req.query;
    const query: Record<string, unknown> = {};

    if (campaignType && ['WEBSITE_MARKETING', 'PROPERTY_MARKETING'].includes(String(campaignType))) {
      query.campaignType = campaignType;
    }
    if (groupId && isValidObjectId(String(groupId))) {
      query.groupId = groupId;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [history, total] = await Promise.all([
      PostingHistory.find(query).sort({ postedAt: -1 }).skip(skip).limit(limitNum).lean(),
      PostingHistory.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: history,
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

export const getMarketingSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await MarketingSettings.findOne();
    if (!settings) {
      settings = await MarketingSettings.create({
        officialWebsiteUrl: 'https://www.propertyinlahore.online',
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMarketingSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allowed = [
      'officialWebsiteUrl',
      'brandWhatsAppNumber',
      'defaultHashtags',
      'autoEngine2OnApproval',
      'dailyWebsitePostCap',
      'dailyGenerationTime',
      'enableWebsiteMarketing',
      'enablePropertyMarketing',
      'languagePreferences',
      'defaultBannerUrls',
      'preferredAiTone',
    ];

    const payload: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        payload[key] = req.body[key];
      }
    }

    if (req.admin) {
      payload.updatedBy = req.admin.id;
    }

    let settings = await MarketingSettings.findOne();
    if (!settings) {
      settings = await MarketingSettings.create(payload);
    } else {
      Object.assign(settings, payload);
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Marketing settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. DASHBOARD STATISTICS CONTROLLER
// ==========================================

export const getMarketingStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalActiveGroups,
      websiteMarketingGroups,
      propertyMarketingGroups,
      todayWebsiteDrafts,
      newPropertyDrafts,
      pendingApprovals,
      approvedDrafts,
      publishedPosts,
      cancelledDrafts,
      approvedPropertiesCount,
      lastWebsiteDraft,
      lastPropertyDraft,
    ] = await Promise.all([
      FacebookGroup.countDocuments({ isActive: true }),
      FacebookGroup.countDocuments({ isActive: true, allowsWebsiteMarketing: true }),
      FacebookGroup.countDocuments({ isActive: true, allowsPropertyAdvertising: true }),
      MarketingDraft.countDocuments({ campaignType: 'WEBSITE_MARKETING', createdAt: { $gte: startOfToday } }),
      MarketingDraft.countDocuments({ campaignType: 'PROPERTY_MARKETING', createdAt: { $gte: startOfToday } }),
      MarketingDraft.countDocuments({ status: 'PENDING_APPROVAL' }),
      MarketingDraft.countDocuments({ status: 'APPROVED' }),
      MarketingDraft.countDocuments({ status: 'PUBLISHED' }),
      MarketingDraft.countDocuments({ status: 'CANCELLED_PROPERTY_UNAVAILABLE' }),
      Property.countDocuments({ status: 'APPROVED' }),
      MarketingDraft.findOne({ campaignType: 'WEBSITE_MARKETING' }).sort({ createdAt: -1 }).select('createdAt theme').lean(),
      MarketingDraft.findOne({ campaignType: 'PROPERTY_MARKETING' }).sort({ createdAt: -1 }).select('createdAt').lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalActiveGroups,
        websiteMarketingGroups,
        propertyMarketingGroups,
        todayWebsiteDrafts,
        newPropertyDrafts,
        pendingApprovals,
        approvedDrafts,
        publishedPosts,
        cancelledDrafts,
        approvedPropertiesCount,
        engine1: {
          status: 'IDLE',
          todayGenerated: todayWebsiteDrafts,
          eligibleGroups: websiteMarketingGroups,
          lastRunAt: lastWebsiteDraft?.createdAt || null,
          lastTheme: lastWebsiteDraft?.theme || null,
        },
        engine2: {
          status: 'ACTIVE',
          approvedPropertiesDetected: approvedPropertiesCount,
          matchingGroups: propertyMarketingGroups,
          generatedDrafts: newPropertyDrafts,
          pendingApprovals,
          cancelledDrafts,
          lastRunAt: lastPropertyDraft?.createdAt || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const publishDraftToFacebookPage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const draft = await MarketingDraft.findById(id);
    if (!draft) {
      res.status(404).json({ success: false, message: 'Draft not found' });
      return;
    }

    const result = await publishToOfficialFacebookPage(draft, req.admin?.email);
    if (!result.success) {
      res.status(400).json({ success: false, message: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Published to official Facebook Business Page successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
