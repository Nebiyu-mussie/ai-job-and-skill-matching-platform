import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  employer: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  requiredSkills: Array<{
    name: string;
    level?: string;
    isRequired: boolean;
  }>;
  niceToHaveSkills: string[];
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance' | 'temporary';
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'director' | 'executive';
  experienceYears?: { min: number; max?: number };
  educationLevel?: string;
  location: {
    city: string;
    region?: string;
    country: string;
    isRemote: boolean;
    remoteType?: 'fully-remote' | 'hybrid' | 'optional';
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'annual';
    isNegotiable: boolean;
    isVisible: boolean;
  };
  benefits: string[];
  category: string;
  tags: string[];
  applicationDeadline?: Date;
  status: 'draft' | 'active' | 'paused' | 'closed' | 'expired';
  applicationCount: number;
  viewCount: number;
  shortlistCount: number;
  featuredUntil?: Date;
  isFeatured: boolean;
  applicationInstructions?: string;
  externalApplicationUrl?: string;
  screeningQuestions: Array<{
    question: string;
    type: 'text' | 'yes_no' | 'multiple_choice';
    options?: string[];
    isRequired: boolean;
  }>;
  // AI fields
  embeddingVector?: number[];
  skillEmbedding?: number[];
  aiAnalysis?: {
    extractedSkills: string[];
    difficulty: string;
    estimatedApplicants: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    employer: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [100, 'Description must be at least 100 characters'],
    },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    requiredSkills: [
      {
        name: { type: String, required: true },
        level: String,
        isRequired: { type: Boolean, default: true },
      },
    ],
    niceToHaveSkills: [String],
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'temporary'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'director', 'executive'],
      required: true,
    },
    experienceYears: {
      min: { type: Number, default: 0 },
      max: Number,
    },
    educationLevel: String,
    location: {
      city: { type: String, required: true },
      region: String,
      country: { type: String, default: 'Ethiopia' },
      isRemote: { type: Boolean, default: false },
      remoteType: {
        type: String,
        enum: ['fully-remote', 'hybrid', 'optional'],
      },
    },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'ETB' },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'annual'],
        default: 'monthly',
      },
      isNegotiable: { type: Boolean, default: false },
      isVisible: { type: Boolean, default: true },
    },
    benefits: [String],
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    applicationDeadline: Date,
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'closed', 'expired'],
      default: 'draft',
    },
    applicationCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    shortlistCount: { type: Number, default: 0 },
    featuredUntil: Date,
    isFeatured: { type: Boolean, default: false },
    applicationInstructions: String,
    externalApplicationUrl: String,
    screeningQuestions: [
      {
        question: { type: String, required: true },
        type: {
          type: String,
          enum: ['text', 'yes_no', 'multiple_choice'],
          default: 'text',
        },
        options: [String],
        isRequired: { type: Boolean, default: false },
      },
    ],
    embeddingVector: [Number],
    skillEmbedding: [Number],
    aiAnalysis: {
      extractedSkills: [String],
      difficulty: String,
      estimatedApplicants: Number,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
JobSchema.index({ title: 'text', description: 'text', 'requiredSkills.name': 'text' });
JobSchema.index({ employer: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ category: 1 });
JobSchema.index({ jobType: 1 });
JobSchema.index({ experienceLevel: 1 });
JobSchema.index({ 'location.city': 1, 'location.country': 1 });
JobSchema.index({ applicationDeadline: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ isFeatured: 1, featuredUntil: 1 });

// Pre-save: generate slug
JobSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = `${this.title}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual: isExpired
JobSchema.virtual('isExpired').get(function (this: IJob) {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
});

export const Job: Model<IJob> = mongoose.model<IJob>('Job', JobSchema);
