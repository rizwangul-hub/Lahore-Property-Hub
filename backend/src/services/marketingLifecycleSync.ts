import mongoose from 'mongoose';
import { Property } from '../models/Property.js';
import { MarketingDraft } from '../models/MarketingDraft.js';

/**
 * Cancels all unpublished drafts for a specific property when it becomes unavailable.
 * Unpublished statuses: PENDING_APPROVAL, APPROVED.
 * Historical records (PUBLISHED, SKIPPED, REJECTED) are permanently preserved.
 */
export async function cancelUnpublishedDraftsForProperty(
  propertyId: string | mongoose.Types.ObjectId,
  reason: string
): Promise<number> {
  const result = await MarketingDraft.updateMany(
    {
      propertyId: new mongoose.Types.ObjectId(propertyId),
      status: { $in: ['PENDING_APPROVAL', 'APPROVED'] },
    },
    {
      $set: {
        status: 'CANCELLED_PROPERTY_UNAVAILABLE',
        cancellationReason: reason,
      },
    }
  );

  return result.modifiedCount || 0;
}

/**
 * Scheduled and on-demand reconciliation:
 * Scans all active drafts in PENDING_APPROVAL and APPROVED status.
 * Validates whether the associated property still exists and remains in APPROVED status.
 * If not, auto-cancels the draft to guarantee no stale property is ever posted.
 */
export async function reconcileAllPropertyDrafts(): Promise<{
  checkedCount: number;
  cancelledCount: number;
}> {
  const activeDrafts = await MarketingDraft.find({
    campaignType: 'PROPERTY_MARKETING',
    propertyId: { $exists: true, $ne: null },
    status: { $in: ['PENDING_APPROVAL', 'APPROVED'] },
  }).select('_id propertyId status');

  let cancelledCount = 0;

  for (const draft of activeDrafts) {
    if (!draft.propertyId) continue;

    const property = await Property.findById(draft.propertyId).select('status');

    if (!property || property.status !== 'APPROVED') {
      const reason = !property
        ? 'Property has been deleted from marketplace'
        : `Property status changed to ${property.status}`;

      await MarketingDraft.findByIdAndUpdate(draft._id, {
        status: 'CANCELLED_PROPERTY_UNAVAILABLE',
        cancellationReason: reason,
      });

      cancelledCount++;
    }
  }

  return {
    checkedCount: activeDrafts.length,
    cancelledCount,
  };
}
