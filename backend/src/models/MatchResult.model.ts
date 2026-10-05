import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMatchResult extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  resume?: mongoose.Types.ObjectId;
  overallScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  locationMatchScore: number;
  salaryMatchScore?: number;
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  skillGapAnalysis: Array<{
    skill: string;
    userLevel?: string;
    requiredLevel?: string;
    gap: string;
    recommendations: Array<{
      type: 'course' | 'certification' | 'project' | 'book';
      title: string;
      provider?: string;
      url?: string;
      duration?: string;
      difficulty?: string;
    }>;
  }>;
  isApplied: boolean;
  isSaved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MatchResultSchema = new Schema<IMatchResult>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    skillMatchScore: { type: Number, min: 0, max: 100 },
    experienceMatchScore: { type: Number, min: 0, max: 100 },
    educationMatchScore: { type: Number, min: 0, max: 100 },
    locationMatchScore: { type: Number, min: 0, max: 100 },
    salaryMatchScore: { type: Number, min: 0, max: 100 },
    matchedSkills: [String],
    missingSkills: [String],
    extraSkills: [String],
    skillGapAnalysis: [
      {
        skill: String,
        userLevel: String,
        requiredLevel: String,
        gap: String,
        recommendations: [
          {
            type: { type: String, enum: ['course', 'certification', 'project', 'book'] },
            title: String,
            provider: String,
            url: String,
            duration: String,
            difficulty: String,
          },
        ],
      },
    ],
    isApplied: { type: Boolean, default: false },
    isSaved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MatchResultSchema.index({ user: 1, job: 1 }, { unique: true });
MatchResultSchema.index({ user: 1, overallScore: -1 });
MatchResultSchema.index({ job: 1, overallScore: -1 });

export const MatchResult: Model<IMatchResult> = mongoose.model<IMatchResult>('MatchResult', MatchResultSchema);
