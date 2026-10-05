import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

BookmarkSchema.index({ user: 1, job: 1 }, { unique: true });
BookmarkSchema.index({ user: 1, createdAt: -1 });

export const Bookmark: Model<IBookmark> = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
