import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponQuerySchema,
  couponCodeParamSchema,
} from '../validators/coupon.validator.js';

const router = Router();

// Member live coupon validation
router.get(
  '/validate/:code',
  requireAuth,
  validate({ params: couponCodeParamSchema, query: validateCouponQuerySchema }),
  asyncHandler(CouponController.validateCoupon)
);

// Admin Coupon management
router.get('/', requireAuth, requireRole('owner'), asyncHandler(CouponController.listCoupons));
router.post('/', requireAuth, requireRole('owner'), validate(createCouponSchema), asyncHandler(CouponController.createCoupon));
router.get('/:id', requireAuth, requireRole('owner'), asyncHandler(CouponController.getCouponById));
router.patch('/:id', requireAuth, requireRole('owner'), validate(updateCouponSchema), asyncHandler(CouponController.updateCoupon));
router.patch('/:id/deactivate', requireAuth, requireRole('owner'), asyncHandler(CouponController.deactivateCoupon));

export default router;
