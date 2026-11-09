import mongoose, { Document, Schema, Model } from 'mongoose';

export type AnalyticsEventType = 'PAGE_VIEW' | 'WHATSAPP_CLICK' | 'ENQUIRY_SUBMIT';

export interface IAnalyticsEvent extends Document {
  eventType: AnalyticsEventType;
  propertyId?: mongoose.Types.ObjectId;
  propertySlug?: string;
  propertyTitle?: string;
  listingType?: string;
  propertyType?: string;
  visitorSessionId?: string;
  referrer?: string;
  deviceType?: 'MOBILE' | 'DESKTOP' | 'TABLET' | 'UNKNOWN';
  timestamp: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    eventType: {
      type: String,
      enum: ['PAGE_VIEW', 'WHATSAPP_CLICK', 'ENQUIRY_SUBMIT'],
      required: true,
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
      trim: true,
    },
    propertyTitle: {
      type: String,
      default: '',
      trim: true,
    },
    listingType: {
      type: String,
      default: '',
    },
    propertyType: {
      type: String,
      default: '',
    },
    visitorSessionId: {
      type: String,
      default: '',
      index: true,
    },
    referrer: {
      type: String,
      default: '',
    },
    deviceType: {
      type: String,
      enum: ['MOBILE', 'DESKTOP', 'TABLET', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// High-speed aggregation indexes
AnalyticsEventSchema.index({ eventType: 1, propertyId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ propertyId: 1, eventType: 1 });
AnalyticsEventSchema.index({ visitorSessionId: 1, propertyId: 1, timestamp: -1 });

export const AnalyticsEvent: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);

export default AnalyticsEvent;
