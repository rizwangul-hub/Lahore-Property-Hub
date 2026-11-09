import mongoose, { Document, Schema, Model } from 'mongoose';

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'FOLLOW_UP' | 'CONVERTED' | 'CLOSED';
export type PreferredContactMethod = 'WHATSAPP' | 'PHONE' | 'EMAIL';

export interface IEnquiry extends Document {
  propertyId: mongoose.Types.ObjectId;
  propertyTitle: string;
  propertyReferenceId?: string;
  listingType: string;
  propertyOwnerWhatsapp: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  preferredContactMethod: PreferredContactMethod;
  status: EnquiryStatus;
  adminNotes?: string;
  ipAddress?: string;
  isSpam: boolean;
  spamScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property ID is required'],
      index: true,
    },
    propertyTitle: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
    },
    propertyReferenceId: {
      type: String,
      default: '',
      trim: true,
    },
    listingType: {
      type: String,
      default: 'SALE',
      trim: true,
    },
    propertyOwnerWhatsapp: {
      type: String,
      default: '',
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters'],
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
      index: true,
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: [true, 'Enquiry message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    preferredContactMethod: {
      type: String,
      enum: ['WHATSAPP', 'PHONE', 'EMAIL'],
      default: 'WHATSAPP',
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'],
      default: 'NEW',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      maxlength: [3000, 'Admin notes cannot exceed 3000 characters'],
    },
    ipAddress: {
      type: String,
      default: '',
    },
    isSpam: {
      type: Boolean,
      default: false,
      index: true,
    },
    spamScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for search, filtering, and moderation
EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ propertyId: 1, createdAt: -1 });
EnquirySchema.index({ customerPhone: 1, createdAt: -1 });
EnquirySchema.index({ customerName: 'text', customerPhone: 'text', message: 'text' });

export const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);

export default Enquiry;
