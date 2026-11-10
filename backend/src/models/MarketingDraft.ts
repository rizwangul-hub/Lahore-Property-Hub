import mongoose, { Document, Schema, Model } from 'mongoose';

export type MarketingCampaignType = 'WEBSITE_MARKETING' | 'PROPERTY_MARKETING';

export type DraftStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'SKIPPED'
  | 'CANCELLED_PROPERTY_UNAVAILABLE';

export type DraftLanguage = 'ENGLISH' | 'URDU' | 'ROMAN_URDU' | 'BILINGUAL';

export interface IMarketingDraft extends Document {
  campaignType: MarketingCampaignType;
  propertyId?: mongoose.Types.ObjectId;
  propertySlug?: string;
  propertyReferenceId?: string;
  groupId: mongoose.Types.ObjectId;
  groupName: string;
  groupUrl?: string;
  targetArea: string;
  language: DraftLanguage;
  theme?: string;
  headline: string;
  caption: string;
  hashtags: string[];
  imageUrls: string[];
  targetUrl: string;
  status: DraftStatus;
  idempotencyKey: string;
  scheduledDate?: Date;
  publishedAt?: Date;
  facebookPostUrl?: string;
  cancellationReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingDraftSchema = new Schema<IMarketingDraft>(
  {
    campaignType: {
      type: String,
      required: true,
      enum: ['WEBSITE_MARKETING', 'PROPERTY_MARKETING'],
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      index: true,
    },
    propertySlug: {
      type: String,
      default: '',
    },
    propertyReferenceId: {
      type: String,
      default: '',
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'FacebookGroup',
      required: true,
      index: true,
    },
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    groupUrl: {
      type: String,
      trim: true,
      default: '',
    },
    targetArea: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      enum: ['ENGLISH', 'URDU', 'ROMAN_URDU', 'BILINGUAL'],
      default: 'ROMAN_URDU',
    },
    theme: {
      type: String,
      default: '',
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      required: true,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING_APPROVAL',
        'APPROVED',
        'REJECTED',
        'PUBLISHED',
        'SKIPPED',
        'CANCELLED_PROPERTY_UNAVAILABLE',
      ],
      default: 'PENDING_APPROVAL',
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    scheduledDate: {
      type: Date,
    },
    publishedAt: {
      type: Date,
    },
    facebookPostUrl: {
      type: String,
      default: '',
      trim: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

MarketingDraftSchema.index({ status: 1, campaignType: 1, createdAt: -1 });
MarketingDraftSchema.index({ propertyId: 1, status: 1 });
MarketingDraftSchema.index({ groupId: 1, status: 1 });

export const MarketingDraft: Model<IMarketingDraft> =
  mongoose.models.MarketingDraft ||
  mongoose.model<IMarketingDraft>('MarketingDraft', MarketingDraftSchema);

export default MarketingDraft;
