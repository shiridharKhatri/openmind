import mongoose, { Schema, models, model } from 'mongoose';

export interface IUserDoc extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider: 'credentials' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export const User = models.User || model<IUserDoc>('User', UserSchema);
