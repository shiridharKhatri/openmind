import mongoose, { Schema, models, model } from 'mongoose';

export interface IFileDoc extends mongoose.Document {
  userId: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  mimeType: string;
  path: string;
  createdAt: Date;
}

const FileSchema = new Schema<IFileDoc>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

FileSchema.index({ userId: 1, createdAt: -1 });

export const FileModel = models.File || model<IFileDoc>('File', FileSchema);
