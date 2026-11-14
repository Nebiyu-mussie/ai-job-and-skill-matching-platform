import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  participantModels: string[];
  jobId?: Types.ObjectId;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'participantModels',
    }],
    participantModels: [{
      type: String,
      required: true,
      enum: ['User', 'Employer'],
    }],
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ jobId: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
