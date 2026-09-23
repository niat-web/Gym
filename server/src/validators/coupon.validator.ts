import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().trim().min(3).max(20).toUpperCase(),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(300),
  discountType: z.enum(['percentage', 'flat_paise']),
  discountValue: z.number().int().min(1, 'Discount value must be at least 1'),
  minPlanPricePaise: z.number().int().min(0).default(0),
  maxDiscountPaise: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(1).default(100),
  perUserLimit: z.number().int().min(1).default(1),
  applicableTo: z.array(z.string()).default(['all']),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponQuerySchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
});

export const couponCodeParamSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase(),
});
