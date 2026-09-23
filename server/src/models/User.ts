import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'owner' | 'trainer' | 'member';
export type MembershipStatus = 'active' | 'inactive' | 'expired' | 'suspended';

export interface IUserProfile {
  dob?: Date;
  bloodGroup?: string;
  gender?: string;
  avatarUrl?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface IGymMeta {
  joinedOn: Date;
  membershipStatus: MembershipStatus;
  assignedTrainer?: mongoose.Types.ObjectId;
}

export interface IUser extends Document {
  phone: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  email?: string;
  profile: IUserProfile;
  gymMeta: IGymMeta;
  activeSubscription?: mongoose.Types.ObjectId;
  myReferralCode: string;
  referredByCode?: string;
  loyaltyPoints: number;
  tokenVersion: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['owner', 'trainer', 'member'],
      default: 'member',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      index: true,
    },
    profile: {
      dob: { type: Date },
      bloodGroup: { type: String, trim: true },
      gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say', ''] },
      avatarUrl: { type: String, trim: true },
      address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
      },
    },
    gymMeta: {
      joinedOn: {
        type: Date,
        default: Date.now,
      },
      membershipStatus: {
        type: String,
        enum: ['active', 'inactive', 'expired', 'suspended'],
        default: 'inactive',
        index: true,
      },
      assignedTrainer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    activeSubscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    myReferralCode: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    referredByCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    tokenVersion: {
      type: Number,
      default: 0,
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
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
