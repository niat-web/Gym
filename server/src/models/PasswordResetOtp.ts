import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordResetOtp extends Document {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  consumed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Mongo TTL Index - auto-deletes when expiresAt is reached
    },
    attempts: {
      type: Number,
      default: 0,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const PasswordResetOtp: Model<IPasswordResetOtp> = mongoose.model<IPasswordResetOtp>(
  'PasswordResetOtp',
  PasswordResetOtpSchema
);
