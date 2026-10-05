import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISkill extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  aliases: string[];
  description?: string;
  demandScore: number;
  growthRate?: number;
  averageSalary?: number;
  relatedSkills: mongoose.Types.ObjectId[];
  isActive: boolean;
  jobCount: number;
  userCount: number;
  createdAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    category: { type: String, required: true },
    subcategory: String,
    aliases: [String],
    description: String,
    demandScore: { type: Number, default: 0, min: 0, max: 100 },
    growthRate: Number,
    averageSalary: Number,
    relatedSkills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    isActive: { type: Boolean, default: true },
    jobCount: { type: Number, default: 0 },
    userCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SkillSchema.index({ name: 'text', aliases: 'text' });
SkillSchema.index({ category: 1 });
SkillSchema.index({ demandScore: -1 });
SkillSchema.index({ slug: 1 });

SkillSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

export const Skill: Model<ISkill> = mongoose.model<ISkill>('Skill', SkillSchema);
