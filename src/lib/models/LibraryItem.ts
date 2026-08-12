import mongoose, { Schema, models, model } from 'mongoose';

export interface ILibraryItemDoc extends mongoose.Document {
  userId: string;
  title: string;
  content: string;
  type: 'prompt' | 'response' | 'research' | 'document' | 'conversation';
  folder?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LibraryItemSchema = new Schema<ILibraryItemDoc>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['prompt', 'response', 'research', 'document', 'conversation'],
      required: true,
    },
    folder: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

LibraryItemSchema.index({ userId: 1, type: 1, createdAt: -1 });
LibraryItemSchema.index({ userId: 1, folder: 1 });

export const LibraryItem = models.LibraryItem || model<ILibraryItemDoc>('LibraryItem', LibraryItemSchema);
