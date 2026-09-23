import mongoose, { Schema, Document, Model } from 'mongoose';
import { calculateDaysUntil } from '../utils/date.js';

export type SubscriptionStatus = 'active' | 'paused' | 'expired' | 'exhausted' | 'cancelled';

export interface IPlanSnapshot {
  planName: string;
  pricePaise: number;
  allocatedDays: number;
  calendarDays: number;
  features: string[];
}

export interface IAttendanceEntry {
  date: string; // YYYY-MM-DD in IST
  checkInTime: Date;
  checkOutTime?: Date;
  markedBy: mongoose.Types.ObjectId;
}

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  payment?: mongoose.Types.ObjectId;
  planSnapshot: IPlanSnapshot;
  status: SubscriptionStatus;
  allocatedDays: number;
  daysUsed: number;
  daysRemaining: number;
  startsOn: Date;
  expiresOn: Date;
  attendanceLog: IAttendanceEntry[];
  daysUntilExpiry?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceEntrySchema = new Schema<IAttendanceEntry>(
  {
    date: {
      type: String,
      required: true,
      index: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    checkOutTime: {
      type: Date,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { _id: false }
);

const PlanSnapshotSchema = new Schema<IPlanSnapshot>(
  {
    planName: { type: String, required: true },
    pricePaise: { type: Number, required: true },
    allocatedDays: { type: Number, required: true },
    calendarDays: { type: Number, required: true },
    features: { type: [String], default: [] },
  },
  { _id: false }
);

const SubscriptionSchema = new Schema<ISubscription>(
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
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    planSnapshot: {
      type: PlanSnapshotSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'expired', 'exhausted', 'cancelled'],
      default: 'active',
      required: true,
      index: true,
    },
    allocatedDays: {
      type: Number,
      required: true,
      min: 1,
    },
    daysUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    daysRemaining: {
      type: Number,
      required: true,
      min: 0,
    },
    startsOn: {
      type: Date,
      required: true,
    },
    expiresOn: {
      type: Date,
      required: true,
      index: true,
    },
    attendanceLog: {
      type: [AttendanceEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

SubscriptionSchema.virtual('daysUntilExpiry').get(function (this: ISubscription) {
  if (!this.expiresOn) return 0;
  return calculateDaysUntil(this.expiresOn);
});

// Compound index on user and status
SubscriptionSchema.index({ user: 1, status: 1 });

export const Subscription: Model<ISubscription> = mongoose.model<ISubscription>(
  'Subscription',
  SubscriptionSchema
);
