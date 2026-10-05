import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'jobseeker' | 'employer' | 'admin';
  profileImage?: string;
  profileImagePublicId?: string;
  phone?: string;
  location?: {
    city: string;
    country: string;
    region?: string;
  };
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  lastLogin?: Date;
  loginCount: number;
  refreshTokens: Array<{
    token: string;
    createdAt: Date;
    expiresAt: Date;
    device?: string;
  }>;
  // Job seeker specific
  headline?: string;
  bio?: string;
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience?: number;
  }>;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
    description?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    grade?: string;
    description?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  languages: Array<{
    name: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  }>;
  portfolio?: string;
  linkedIn?: string;
  github?: string;
  jobPreferences?: {
    jobTypes: string[];
    expectedSalary?: { min: number; max: number; currency: string };
    preferredLocations: string[];
    remotePreference: 'remote' | 'onsite' | 'hybrid' | 'flexible';
    availableFrom?: Date;
  };
  profileCompleteness: number;
  // Employer ref
  employer?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  createEmailVerificationToken(): string;
  calculateProfileCompleteness(): number;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['jobseeker', 'employer', 'admin'],
      default: 'jobseeker',
    },
    profileImage: String,
    profileImagePublicId: String,
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number'],
    },
    location: {
      city: String,
      country: { type: String, default: 'Ethiopia' },
      region: String,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    refreshTokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        device: String,
      },
    ],
    headline: { type: String, maxlength: 120 },
    bio: { type: String, maxlength: 2000 },
    skills: [
      {
        name: { type: String, required: true },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate',
        },
        yearsOfExperience: Number,
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: String,
        startDate: { type: Date, required: true },
        endDate: Date,
        isCurrent: { type: Boolean, default: false },
        description: String,
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        fieldOfStudy: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: Date,
        grade: String,
        description: String,
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        issueDate: { type: Date, required: true },
        expiryDate: Date,
        credentialId: String,
        credentialUrl: String,
      },
    ],
    languages: [
      {
        name: { type: String, required: true },
        proficiency: {
          type: String,
          enum: ['basic', 'conversational', 'fluent', 'native'],
          default: 'conversational',
        },
      },
    ],
    portfolio: String,
    linkedIn: String,
    github: String,
    jobPreferences: {
      jobTypes: [String],
      expectedSalary: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'ETB' },
      },
      preferredLocations: [String],
      remotePreference: {
        type: String,
        enum: ['remote', 'onsite', 'hybrid', 'flexible'],
        default: 'flexible',
      },
      availableFrom: Date,
    },
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
    employer: { type: Schema.Types.ObjectId, ref: 'Employer' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ 'skills.name': 1 });
UserSchema.index({ 'location.city': 1, 'location.country': 1 });
UserSchema.index({ createdAt: -1 });

// Virtual: full name
UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save: hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Pre-save: calculate profile completeness
UserSchema.pre('save', function (next) {
  this.profileCompleteness = this.calculateProfileCompleteness();
  next();
});

// Methods
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  return resetToken;
};

UserSchema.methods.createEmailVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return verificationToken;
};

UserSchema.methods.calculateProfileCompleteness = function (): number {
  let score = 0;
  const weights = {
    name: 10,
    email: 5,
    phone: 5,
    location: 5,
    headline: 5,
    bio: 10,
    profileImage: 5,
    skills: 15,
    experience: 15,
    education: 10,
    certifications: 5,
    languages: 5,
    portfolio: 5,
  };

  if (this.firstName && this.lastName) score += weights.name;
  if (this.email) score += weights.email;
  if (this.phone) score += weights.phone;
  if (this.location?.city) score += weights.location;
  if (this.headline) score += weights.headline;
  if (this.bio) score += weights.bio;
  if (this.profileImage) score += weights.profileImage;
  if (this.skills?.length > 0) score += weights.skills;
  if (this.experience?.length > 0) score += weights.experience;
  if (this.education?.length > 0) score += weights.education;
  if (this.certifications?.length > 0) score += weights.certifications;
  if (this.languages?.length > 0) score += weights.languages;
  if (this.portfolio || this.linkedIn || this.github) score += weights.portfolio;

  return Math.min(score, 100);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
