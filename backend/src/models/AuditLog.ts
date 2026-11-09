import mongoose, { Document, Schema, Model } from 'mongoose';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PROPERTY_APPROVED'
  | 'PROPERTY_REJECTED'
  | 'PROPERTY_EDITED'
  | 'PROPERTY_DELETED'
  | 'PROPERTY_FEATURED'
  | 'PROPERTY_UNFEATURED'
  | 'STATUS_CHANGED';

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminEmail: string;
  action: AuditAction;
  propertyId?: mongoose.Types.ObjectId;
  propertyTitle?: string;
  propertyReferenceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
    },
    propertyTitle: {
      type: String,
      default: '',
    },
    propertyReferenceId: {
      type: String,
      default: '',
    },
    details: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    ipAddress: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

AuditLogSchema.index({ timestamp: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
