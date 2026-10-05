import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  level: 'info' | 'warn' | 'error' | 'critical';
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    details: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: Number,
    duration: Number,
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'critical'],
      default: 'info',
    },
  },
  { timestamps: true }
);

AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ resource: 1 });
AuditLogSchema.index({ level: 1 });
AuditLogSchema.index({ createdAt: -1 });

// Auto-delete after 1 year
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
