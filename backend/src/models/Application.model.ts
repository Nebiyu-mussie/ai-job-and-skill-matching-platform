import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  employer: mongoose.Types.ObjectId;
  resume: mongoose.Types.ObjectId;
  coverLetter?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
  statusHistory: Array<{
    status: string;
    changedAt: Date;
    changedBy?: mongoose.Types.ObjectId;
    note?: string;
  }>;
  matchScore?: number;
  matchDetails?: {
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
    overallScore: number;
    matchedSkills: string[];
    missingSkills: string[];
  };
  screeningAnswers: Array<{
    questionId: string;
    question: string;
    answer: string;
  }>;
  isRead: boolean;
  isStarred: boolean;
  notes?: string;
  interviewSchedule?: {
    date: Date;
    type: 'phone' | 'video' | 'onsite';
    link?: string;
    location?: string;
    notes?: string;
  };
  rejectionReason?: string;
  withdrawalReason?: string;
  appliedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    resume: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    coverLetter: {
      type: String,
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    matchScore: { type: Number, min: 0, max: 100 },
    matchDetails: {
      skillMatch: Number,
      experienceMatch: Number,
      educationMatch: Number,
      overallScore: Number,
      matchedSkills: [String],
      missingSkills: [String],
    },
    screeningAnswers: [
      {
        questionId: String,
        question: String,
        answer: String,
      },
    ],
    isRead: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    notes: String,
    interviewSchedule: {
      date: Date,
      type: {
        type: String,
        enum: ['phone', 'video', 'onsite'],
      },
      link: String,
      location: String,
      notes: String,
    },
    rejectionReason: String,
    withdrawalReason: String,
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Unique application per user per job
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
ApplicationSchema.index({ employer: 1, status: 1 });
ApplicationSchema.index({ applicant: 1, status: 1 });
ApplicationSchema.index({ appliedAt: -1 });
ApplicationSchema.index({ matchScore: -1 });

export const Application: Model<IApplication> = mongoose.model<IApplication>('Application', ApplicationSchema);
