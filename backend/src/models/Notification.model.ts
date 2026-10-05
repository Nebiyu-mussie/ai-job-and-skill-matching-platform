import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 
    | 'application_received'
    | 'application_status_update'
    | 'new_job_match'
    | 'interview_scheduled'
    | 'message_received'
    | 'job_expired'
    | 'profile_view'
    | 'resume_parsed'
    | 'skill_recommendation'
    | 'employer_verified'
    | 'job_shortlisted'
    | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channel: 'in_app' | 'email' | 'both';
  emailSent?: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'application_received', 'application_status_update', 'new_job_match',
        'interview_scheduled', 'message_received', 'job_expired', 'profile_view',
        'resume_parsed', 'skill_recommendation', 'employer_verified', 'job_shortlisted',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 100 },
    message: { type: String, required: true, maxlength: 500 },
    data: { type: Schema.Types.Mixed },
    link: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'both'],
      default: 'both',
    },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

// Auto-delete notifications older than 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);
