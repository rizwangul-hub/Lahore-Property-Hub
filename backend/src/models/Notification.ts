import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType =
  | 'PROPERTY_SUBMITTED'
  | 'ENQUIRY_RECEIVED'
  | 'MODERATION_ACTION'
  | 'SYSTEM_ALERT';

export interface INotification extends Document {
  type: NotificationType;
  title: string;
  message: string;
  propertyId?: mongoose.Types.ObjectId;
  enquiryId?: mongoose.Types.ObjectId;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ['PROPERTY_SUBMITTED', 'ENQUIRY_RECEIVED', 'MODERATION_ACTION', 'SYSTEM_ALERT'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
    },
    enquiryId: {
      type: Schema.Types.ObjectId,
      ref: 'Enquiry',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying unread and recent notifications efficiently
NotificationSchema.index({ isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
