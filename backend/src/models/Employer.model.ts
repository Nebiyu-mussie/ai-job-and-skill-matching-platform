import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEmployer extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  companyName: string;
  slug: string;
  industry: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  founded?: number;
  website?: string;
  logo?: string;
  logoPublicId?: string;
  coverImage?: string;
  description?: string;
  mission?: string;
  benefits: string[];
  culture?: string;
  location: {
    address?: string;
    city: string;
    region?: string;
    country: string;
  };
  socialLinks?: {
    linkedIn?: string;
    twitter?: string;
    facebook?: string;
  };
  contactEmail: string;
  contactPhone?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDocuments: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  isActive: boolean;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  jobPostLimit: number;
  activeJobCount: number;
  totalJobsPosted: number;
  totalHires: number;
  rating?: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EmployerSchema = new Schema<IEmployer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
    },
    companySize: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
      default: 'small',
    },
    founded: Number,
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL'],
    },
    logo: String,
    logoPublicId: String,
    coverImage: String,
    description: {
      type: String,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    mission: { type: String, maxlength: 1000 },
    benefits: [String],
    culture: String,
    location: {
      address: String,
      city: { type: String, required: true },
      region: String,
      country: { type: String, default: 'Ethiopia' },
    },
    socialLinks: {
      linkedIn: String,
      twitter: String,
      facebook: String,
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    contactPhone: String,
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verificationDocuments: [
      {
        type: { type: String },
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    jobPostLimit: { type: Number, default: 3 },
    activeJobCount: { type: Number, default: 0 },
    totalJobsPosted: { type: Number, default: 0 },
    totalHires: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
EmployerSchema.index({ companyName: 'text', description: 'text' });
EmployerSchema.index({ industry: 1 });
EmployerSchema.index({ 'location.city': 1 });
EmployerSchema.index({ isVerified: 1 });
EmployerSchema.index({ slug: 1 });

// Pre-save: generate slug
EmployerSchema.pre('save', function (next) {
  if (this.isModified('companyName')) {
    this.slug = this.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export const Employer: Model<IEmployer> = mongoose.model<IEmployer>('Employer', EmployerSchema);
