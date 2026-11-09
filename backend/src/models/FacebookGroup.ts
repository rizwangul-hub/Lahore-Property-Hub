import mongoose, { Document, Schema, Model } from 'mongoose';

export type GroupMembershipType = 'MEMBER' | 'MODERATOR' | 'ADMIN';

export type GroupPreferredLanguage = 'ENGLISH' | 'URDU' | 'ROMAN_URDU' | 'BILINGUAL';

export interface IFacebookGroup extends Document {
  name: string;
  groupUrl: string;
  area: string;
  subAreaFocus: string[];
  groupRules: string;
  membershipType: GroupMembershipType;
  acceptedCategories: string[];
  allowsWebsiteMarketing: boolean;
  allowsPropertyAdvertising: boolean;
  preferredLanguage: GroupPreferredLanguage;
  postingFrequencyLimitHours: number;
  websiteMarketingLastPostedAt?: Date;
  propertyMarketingLastPostedAt?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FacebookGroupSchema = new Schema<IFacebookGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [150, 'Group name cannot exceed 150 characters'],
    },
    groupUrl: {
      type: String,
      required: [true, 'Facebook Group URL is required'],
      trim: true,
      validate: {
        validator: (v: string) => /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+/i.test(v),
        message: 'Must be a valid Facebook Group URL',
      },
    },
    area: {
      type: String,
      required: [true, 'Target area or society is required'],
      trim: true,
      index: true,
    },
    subAreaFocus: {
      type: [String],
      default: [],
    },
    groupRules: {
      type: String,
      default: '',
      maxlength: [2000, 'Group rules cannot exceed 2000 characters'],
    },
    membershipType: {
      type: String,
      enum: ['MEMBER', 'MODERATOR', 'ADMIN'],
      default: 'MEMBER',
    },
    acceptedCategories: {
      type: [String],
      default: ['ALL'],
    },
    allowsWebsiteMarketing: {
      type: Boolean,
      default: true,
      index: true,
    },
    allowsPropertyAdvertising: {
      type: Boolean,
      default: true,
      index: true,
    },
    preferredLanguage: {
      type: String,
      enum: ['ENGLISH', 'URDU', 'ROMAN_URDU', 'BILINGUAL'],
      default: 'ROMAN_URDU',
    },
    postingFrequencyLimitHours: {
      type: Number,
      default: 24,
      min: [1, 'Cooldown must be at least 1 hour'],
      max: [720, 'Cooldown cannot exceed 30 days'],
    },
    websiteMarketingLastPostedAt: {
      type: Date,
    },
    propertyMarketingLastPostedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

FacebookGroupSchema.index({ isActive: 1, allowsWebsiteMarketing: 1 });
FacebookGroupSchema.index({ isActive: 1, allowsPropertyAdvertising: 1, area: 1 });

export const FacebookGroup: Model<IFacebookGroup> =
  mongoose.models.FacebookGroup ||
  mongoose.model<IFacebookGroup>('FacebookGroup', FacebookGroupSchema);

export default FacebookGroup;
