import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'file' | 'system';
  attachment?: {
    url: string;
    name: string;
    type: string;
    size: number;
  };
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
}

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  job?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  unreadCount: Map<string, number>;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'system'],
      default: 'text',
    },
    attachment: {
      url: String,
      name: String,
      type: String,
      size: Number,
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: Date,
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, recipient: 1 });
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export const Message: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);
export const Conversation: Model<IConversation> = mongoose.model<IConversation>('Conversation', ConversationSchema);
