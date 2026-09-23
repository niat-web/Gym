import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  couponCode: z.string().trim().toUpperCase().optional().or(z.literal('')),
  referralCode: z.string().trim().toUpperCase().optional().or(z.literal('')),
});

export const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().default('mock_signature'),
});

export const manualPaymentSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  amountPaise: z.number().int().min(0, 'Amount must be non-negative'),
  paymentMethod: z.enum(['cash', 'upi']),
  upiRef: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(['pending', 'success', 'failed', 'refunded']).optional(),
  paymentMethod: z.enum(['razorpay', 'cash', 'upi']).optional(),
  memberId: z.string().optional(),
});
