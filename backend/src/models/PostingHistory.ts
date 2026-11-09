import mongoose, { Document, Schema, Model } from 'mongoose';
import { MarketingCampaignType } from './MarketingDraft.js';

export interface IPostingHistory extends Document {
  draftId: mongoose.Types.ObjectId;
  campaignType: MarketingCampaignType;
  propertyId?: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  groupName: string;
  postedAt: Date;
  facebookPostUrl?: string;
  language: string;
  status: 'CONFIRMED' | 'FLAGGED' | 'REMOVED';
  adminId?: mongoose.Types.ObjectId;
  adminEmail?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostingHistorySchema = new Schema<IPostingHistory>(
  {
    draftId: {
      type: Schema.Types.ObjectId,
      ref: 'MarketingDraft',
      required: true,
      index: true,
    },
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
    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    facebookPostUrl: {
      type: String,
      default: '',
      trim: true,
    },
    language: {
      type: String,
      default: 'ROMAN_URDU',
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'FLAGGED', 'REMOVED'],
      default: 'CONFIRMED',
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    adminEmail: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

PostingHistorySchema.index({ groupId: 1, postedAt: -1 });
PostingHistorySchema.index({ propertyId: 1, postedAt: -1 });

export const PostingHistory: Model<IPostingHistory> =
  mongoose.models.PostingHistory ||
  mongoose.model<IPostingHistory>('PostingHistory', PostingHistorySchema);

export default PostingHistory;
