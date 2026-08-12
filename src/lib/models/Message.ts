import mongoose, { Schema, models, model } from 'mongoose';

export interface IMessageDoc extends mongoose.Document {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: {
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  modelId?: string;
  liked?: boolean | null;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  createdAt: Date;
}

const MessageSchema = new Schema<IMessageDoc>(
  {
    conversationId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    attachments: [
      {
        name: String,
        type: String,
        url: String,
        size: Number,
      },
    ],
    modelId: { type: String },
    liked: { type: Schema.Types.Mixed, default: null },
    tokenUsage: {
      prompt: Number,
      completion: Number,
      total: Number,
    },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = models.Message || model<IMessageDoc>('Message', MessageSchema);
