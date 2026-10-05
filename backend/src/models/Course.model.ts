import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  provider: string;
  url: string;
  description?: string;
  skills: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  price?: number;
  isFree: boolean;
  rating?: number;
  enrollments?: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true },
    url: { type: String, required: true },
    description: String,
    skills: [String],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    duration: String,
    price: Number,
    isFree: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5 },
    enrollments: Number,
    category: { type: String, required: true },
    imageUrl: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourseSchema.index({ skills: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ title: 'text', description: 'text' });

export const Course: Model<ICourse> = mongoose.model<ICourse>('Course', CourseSchema);
