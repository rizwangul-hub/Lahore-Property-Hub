import { IMarketingDraft } from '../models/MarketingDraft.js';
import { MarketingSettings } from '../models/MarketingSettings.js';
import { AuditLog } from '../models/AuditLog.js';

export interface FacebookPagePublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  publishedAt?: Date;
}

/**
 * Publishes an approved campaign to the official Facebook Business Page via the Meta Graph API.
 * Strict rules:
 * - Draft must be in APPROVED status.
 * - Requires FB_PAGE_ACCESS_TOKEN and FB_PAGE_ID in environment or MarketingSettings.
 * - This publishes ONLY to the official Page, NOT to Facebook Groups (groups remain strictly manual).
 */
export async function publishToOfficialFacebookPage(
  draft: IMarketingDraft,
  adminEmail?: string
): Promise<FacebookPagePublishResult> {
  if (draft.status !== 'APPROVED') {
    return {
      success: false,
      error: `Cannot publish to Facebook Page. Draft must be in APPROVED status (current: ${draft.status}).`,
    };
  }

  const pageId = process.env.FB_PAGE_ID || '';
  const pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN || '';

  if (!pageId || !pageAccessToken) {
    return {
      success: false,
      error:
        'Official Facebook Page integration is unconfigured. Set FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN to enable official Page publishing.',
    };
  }

  const messageText = `${draft.headline}\n\n${draft.caption}\n\n${(draft.hashtags || []).join(' ')}\n\n🔗 ${draft.targetUrl}`;

  try {
    let graphUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    let bodyPayload: Record<string, any> = {
      message: messageText,
      link: draft.targetUrl,
      access_token: pageAccessToken,
    };

    // If draft has an image, use photo endpoint
    if (draft.imageUrls && draft.imageUrls.length > 0 && draft.imageUrls[0].startsWith('http')) {
      graphUrl = `https://graph.facebook.com/v19.0/${pageId}/photos`;
      bodyPayload = {
        caption: messageText,
        url: draft.imageUrls[0],
        access_token: pageAccessToken,
      };
    }

    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    const json = (await response.json()) as any;

    if (!response.ok || json.error) {
      const errorMsg = json.error?.message || `Meta API Error (${response.status})`;
      console.warn('[Facebook Page API] Publish failed:', errorMsg);

      await AuditLog.create({
        adminEmail: adminEmail || 'SYSTEM_MARKETING',
        action: 'STATUS_CHANGED',
        details: {
          action: 'FACEBOOK_PAGE_PUBLISH_FAILED',
          draftId: draft._id,
          error: errorMsg,
        },
        ipAddress: '127.0.0.1',
        timestamp: new Date(),
      });

      return {
        success: false,
        error: errorMsg,
      };
    }

    const postId = json.id || json.post_id;
    const postUrl = `https://facebook.com/${postId}`;

    await AuditLog.create({
      adminEmail: adminEmail || 'SYSTEM_MARKETING',
      action: 'STATUS_CHANGED',
      details: {
        action: 'FACEBOOK_PAGE_PUBLISH_SUCCESS',
        draftId: draft._id,
        postId,
        postUrl,
      },
      ipAddress: '127.0.0.1',
      timestamp: new Date(),
    });

    return {
      success: true,
      postId,
      postUrl,
      publishedAt: new Date(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error communicating with Meta Graph API',
    };
  }
}
