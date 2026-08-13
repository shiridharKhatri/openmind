import mongoose, { Schema, models, model } from 'mongoose';

export interface IConversationDoc extends mongoose.Document {
  userId: string;
  title: string;
  modelId: string;
  archived: boolean;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversationDoc>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'New conversation' },
    modelId: { type: String, default: 'openmind:latest' },
    archived: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });
ConversationSchema.index({ userId: 1, pinned: -1, updatedAt: -1 });

export const Conversation = models.Conversation || model<IConversationDoc>('Conversation', ConversationSchema);
