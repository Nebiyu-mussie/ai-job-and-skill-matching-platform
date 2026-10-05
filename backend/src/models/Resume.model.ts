import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IResume extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  originalName: string;
  fileUrl: string;
  filePublicId: string;
  fileType: 'pdf' | 'doc' | 'docx';
  fileSize: number;
  isDefault: boolean;
  isParsed: boolean;
  parsedData?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    skills: Array<{
      name: string;
      category?: string;
      level?: string;
    }>;
    experience: Array<{
      title: string;
      company: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      isCurrent?: boolean;
      description?: string;
      duration?: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      fieldOfStudy?: string;
      startDate?: string;
      endDate?: string;
      grade?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer?: string;
      date?: string;
    }>;
    languages: Array<{
      name: string;
      proficiency?: string;
    }>;
    projects: Array<{
      name: string;
      description?: string;
      technologies?: string[];
      url?: string;
    }>;
    totalExperienceYears?: number;
    extractedText?: string;
    confidence?: number;
  };
  embeddingVector?: number[];
  parsingError?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'docx'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isParsed: {
      type: Boolean,
      default: false,
    },
    parsedData: {
      name: String,
      email: String,
      phone: String,
      location: String,
      summary: String,
      skills: [
        {
          name: String,
          category: String,
          level: String,
        },
      ],
      experience: [
        {
          title: String,
          company: String,
          location: String,
          startDate: String,
          endDate: String,
          isCurrent: Boolean,
          description: String,
          duration: String,
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          fieldOfStudy: String,
          startDate: String,
          endDate: String,
          grade: String,
        },
      ],
      certifications: [
        {
          name: String,
          issuer: String,
          date: String,
        },
      ],
      languages: [
        {
          name: String,
          proficiency: String,
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          url: String,
        },
      ],
      totalExperienceYears: Number,
      extractedText: String,
      confidence: Number,
    },
    embeddingVector: [Number],
    parsingError: String,
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ResumeSchema.index({ user: 1 });
ResumeSchema.index({ user: 1, isDefault: 1 });
ResumeSchema.index({ isParsed: 1 });

export const Resume: Model<IResume> = mongoose.model<IResume>('Resume', ResumeSchema);
