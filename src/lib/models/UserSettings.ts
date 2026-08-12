import mongoose, { Schema, models, model } from 'mongoose';

export interface IUserSettingsDoc extends mongoose.Document {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  systemInstructions: string;
  notifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettingsDoc>(
  {
    userId: { type: String, required: true, unique: true },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    defaultModel: { type: String, default: 'qwen3:1.7b' },
    temperature: { type: Number, default: 0.7, min: 0, max: 2 },
    maxTokens: { type: Number, default: 4096 },
    systemInstructions: { type: String, default: '' },
    notifications: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserSettings = models.UserSettings || model<IUserSettingsDoc>('UserSettings', UserSettingsSchema);
