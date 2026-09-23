import mongoose, { Schema, Document, Model } from 'mongoose';

export type DiscountType = 'percentage' | 'flat_paise';

export interface ICoupon extends Document {
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minPlanPricePaise: number;
  maxDiscountPaise?: number;
  maxUses: number;
  currentUses: number;
  perUserLimit: number;
  applicableTo: string[];
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat_paise'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [1, 'Discount value must be at least 1'],
    },
    minPlanPricePaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountPaise: {
      type: Number,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: 100,
      min: 1,
    },
    currentUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    applicableTo: {
      type: [String],
      default: ['all'],
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', CouponSchema);
