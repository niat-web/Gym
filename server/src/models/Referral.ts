import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferredMember {
  user: mongoose.Types.ObjectId;
  fullName: string;
  joinedOn: Date;
  hasPurchased: boolean;
  rewardIssued: boolean;
}

export interface IReferral extends Document {
  referrer: mongoose.Types.ObjectId;
  referralCode: string;
  referrerRewardType: 'loyalty_points';
  referrerRewardValue: number;
  refereeDiscountType: 'flat_paise';
  refereeDiscountValue: number;
  totalReferrals: number;
  successfulConversions: number;
  referredMembers: IReferredMember[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReferredMemberSchema = new Schema<IReferredMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    joinedOn: {
      type: Date,
      default: Date.now,
    },
    hasPurchased: {
      type: Boolean,
      default: false,
    },
    rewardIssued: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const ReferralSchema = new Schema<IReferral>(
  {
    referrer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    referrerRewardType: {
      type: String,
      enum: ['loyalty_points'],
      default: 'loyalty_points',
    },
    referrerRewardValue: {
      type: Number,
      default: 500,
    },
    refereeDiscountType: {
      type: String,
      enum: ['flat_paise'],
      default: 'flat_paise',
    },
    refereeDiscountValue: {
      type: Number,
      default: 20000, // ₹200 off first plan
    },
    totalReferrals: {
      type: Number,
      default: 0,
      min: 0,
    },
    successfulConversions: {
      type: Number,
      default: 0,
      min: 0,
    },
    referredMembers: {
      type: [ReferredMemberSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index on referredMembers.user
ReferralSchema.index({ 'referredMembers.user': 1 });

export const Referral: Model<IReferral> = mongoose.model<IReferral>('Referral', ReferralSchema);
