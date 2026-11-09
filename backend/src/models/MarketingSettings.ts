import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMarketingSettings extends Document {
  officialWebsiteUrl: string;
  brandWhatsAppNumber: string;
  defaultHashtags: string[];
  autoEngine2OnApproval: boolean;
  dailyWebsitePostCap: number;
  dailyGenerationTime: string;
  enableWebsiteMarketing: boolean;
  enablePropertyMarketing: boolean;
  languagePreferences: string[];
  defaultBannerUrls: string[];
  preferredAiTone: 'PERSUASIVE' | 'PROFESSIONAL' | 'URGENT';
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingSettingsSchema = new Schema<IMarketingSettings>(
  {
    officialWebsiteUrl: {
      type: String,
      default: 'https://www.propertyinlahore.online',
      trim: true,
    },
    brandWhatsAppNumber: {
      type: String,
      default: '+923001234567',
      trim: true,
    },
    defaultHashtags: {
      type: [String],
      default: [
        '#LahoreProperty',
        '#PropertyInLahore',
        '#LahoreRealEstate',
        '#DHALahore',
        '#BahriaTownLahore',
      ],
    },
    autoEngine2OnApproval: {
      type: Boolean,
      default: true,
    },
    dailyWebsitePostCap: {
      type: Number,
      default: 6,
      min: 1,
      max: 20,
    },
    dailyGenerationTime: {
      type: String,
      default: '10:00',
      trim: true,
    },
    enableWebsiteMarketing: {
      type: Boolean,
      default: true,
    },
    enablePropertyMarketing: {
      type: Boolean,
      default: true,
    },
    languagePreferences: {
      type: [String],
      default: ['ENGLISH', 'URDU', 'ROMAN_URDU'],
    },
    defaultBannerUrls: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    preferredAiTone: {
      type: String,
      enum: ['PERSUASIVE', 'PROFESSIONAL', 'URGENT'],
      default: 'PERSUASIVE',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

export const MarketingSettings: Model<IMarketingSettings> =
  mongoose.models.MarketingSettings ||
  mongoose.model<IMarketingSettings>('MarketingSettings', MarketingSettingsSchema);

export default MarketingSettings;
