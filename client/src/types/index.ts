export type UserRole = 'owner' | 'trainer' | 'member';
export type MembershipStatus = 'active' | 'inactive' | 'expired' | 'suspended';
export type PlanCategory = 'basic' | 'standard' | 'premium';
export type PaymentMethod = 'razorpay' | 'cash' | 'upi';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type SubscriptionStatus = 'active' | 'paused' | 'expired' | 'exhausted' | 'cancelled';
export type DiscountType = 'percentage' | 'flat_paise';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
    issues?: Array<{ field: string; message: string }>;
  };
  message?: string;
}

export interface UserProfile {
  dob?: string;
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

export interface GymMeta {
  joinedOn: string;
  membershipStatus: MembershipStatus;
  assignedTrainer?: {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
  } | string;
}

export interface User {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  role: UserRole;
  profile?: UserProfile;
  gymMeta?: GymMeta;
  activeSubscription?: Subscription | string;
  myReferralCode: string;
  referredByCode?: string;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  planName: string;
  description: string;
  category: PlanCategory;
  pricePaise: number;
  calendarDays: number;
  allocatedDays: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceEntry {
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  markedBy?: {
    id: string;
    fullName: string;
  } | string;
}

export interface PlanSnapshot {
  planName: string;
  pricePaise: number;
  allocatedDays: number;
  calendarDays: number;
  features: string[];
}

export interface Subscription {
  id: string;
  user: string | User;
  plan: string | Plan;
  payment?: string | Payment;
  planSnapshot: PlanSnapshot;
  status: SubscriptionStatus;
  allocatedDays: number;
  daysUsed: number;
  daysRemaining: number;
  startsOn: string;
  expiresOn: string;
  attendanceLog: AttendanceEntry[];
  daysUntilExpiry?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  user: string | User;
  plan: string | Plan;
  receiptNumber: string;
  amountPaise: number;
  discountPaise: number;
  finalAmountPaise: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  couponDetails?: {
    code: string;
    discountPaise: number;
  };
  referralDetails?: {
    code: string;
    discountPaise: number;
  };
  note?: string;
  recordedBy?: {
    id: string;
    fullName: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
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
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferredMember {
  fullName: string;
  joinedOn: string;
  hasPurchased: boolean;
  rewardIssued: boolean;
}

export interface ReferralData {
  referralCode: string;
  rewardPointsPerConversion: number;
  refereeDiscountPaise: number;
  totalReferrals: number;
  successfulConversions: number;
  loyaltyPoints: number;
  referredMembers: ReferredMember[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
