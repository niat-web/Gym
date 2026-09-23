import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentMethod = 'razorpay' | 'cash' | 'upi';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  receiptNumber: string;
  amountPaise: number;
  discountPaise: number;
  finalAmountPaise: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  couponDetails?: {
    code: string;
    discountPaise: number;
  };
  referralDetails?: {
    code: string;
    discountPaise: number;
  };
  note?: string;
  recordedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cash', 'upi'],
      default: 'razorpay',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
      required: true,
      index: true,
    },
    gatewayOrderId: {
      type: String,
      index: true,
    },
    gatewayPaymentId: {
      type: String,
    },
    gatewaySignature: {
      type: String,
    },
    couponDetails: {
      code: { type: String, uppercase: true },
      discountPaise: { type: Number },
    },
    referralDetails: {
      code: { type: String, uppercase: true },
      discountPaise: { type: Number },
    },
    note: {
      type: String,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', PaymentSchema);
