import mongoose, { Schema, Document, Model } from 'mongoose';

export type PlanCategory = 'basic' | 'standard' | 'premium';

export interface IPlan extends Document {
  planName: string;
  description: string;
  category: PlanCategory;
  pricePaise: number;
  calendarDays: number;
  allocatedDays: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'standard',
      required: true,
      index: true,
    },
    pricePaise: {
      type: Number,
      required: [true, 'Price in paise is required'],
      min: [0, 'Price cannot be negative'],
    },
    calendarDays: {
      type: Number,
      required: [true, 'Calendar validity days is required'],
      min: [1, 'Calendar days must be at least 1'],
    },
    allocatedDays: {
      type: Number,
      required: [true, 'Allocated gym visit days is required'],
      min: [1, 'Allocated days must be at least 1'],
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    collection: 'fitness_plans',
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

export const Plan: Model<IPlan> = mongoose.model<IPlan>('Plan', PlanSchema);
