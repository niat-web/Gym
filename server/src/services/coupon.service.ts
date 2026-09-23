import { Coupon, ICoupon } from '../models/Coupon.js';
import { Plan } from '../models/Plan.js';
import { Payment } from '../models/Payment.js';
import { ValidationError, NotFoundError } from '../utils/AppError.js';
import { formatRupees } from '../utils/formatters.js';

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: ICoupon;
  discountPaise: number;
  finalPricePaise: number;
  reason?: string;
}

export class CouponService {
  /**
   * Validate coupon against business rules and calculate discount
   */
  static async validateCoupon(
    code: string,
    planId: string,
    userId?: string
  ): Promise<CouponValidationResult> {
    const uppercaseCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: uppercaseCode });

    // 1. Exists and active
    if (!coupon || !coupon.isActive) {
      return {
        isValid: false,
        discountPaise: 0,
        finalPricePaise: 0,
        reason: 'Coupon does not exist or is inactive',
      };
    }

    const now = new Date();

    // 2. validFrom
    if (now < new Date(coupon.validFrom)) {
      return {
        isValid: false,
        discountPaise: 0,
        finalPricePaise: 0,
        reason: 'This coupon is not yet active',
      };
    }

    // 3. validUntil
    if (now > new Date(coupon.validUntil)) {
      return {
        isValid: false,
        discountPaise: 0,
        finalPricePaise: 0,
        reason: 'This coupon has expired',
      };
    }

    // 4. maxUses
    if (coupon.currentUses >= coupon.maxUses) {
      return {
        isValid: false,
        discountPaise: 0,
        finalPricePaise: 0,
        reason: 'This coupon has reached its maximum global usage limit',
      };
    }

    // 5. Plan exists
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return {
        isValid: false,
        discountPaise: 0,
        finalPricePaise: 0,
        reason: 'Selected fitness plan is invalid or unavailable',
      };
    }

    // 6. minPlanPricePaise
    if (plan.pricePaise < coupon.minPlanPricePaise) {
      return {
        isValid: false,
        discountPaise: 0,
        finalPricePaise: plan.pricePaise,
        reason: `Plan price must be at least ${formatRupees(coupon.minPlanPricePaise)} to apply this coupon`,
      };
    }

    // 7. applicableTo
    const isApplicable =
      coupon.applicableTo.includes('all') ||
      coupon.applicableTo.includes(planId) ||
      coupon.applicableTo.includes(plan._id.toString());

    if (!isApplicable) {
      return {
        isValid: false,
        discountPaise: 0,
        finalPricePaise: plan.pricePaise,
        reason: 'This coupon is not applicable to the selected plan',
      };
    }

    // 8. perUserLimit
    if (userId) {
      const userUsageCount = await Payment.countDocuments({
        user: userId,
        status: 'success',
        'couponDetails.code': uppercaseCode,
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return {
          isValid: false,
          discountPaise: 0,
          finalPricePaise: plan.pricePaise,
          reason: `You have already used this coupon the maximum allowed number of times (${coupon.perUserLimit})`,
        };
      }
    }

    // Calculate discount amount
    let discountPaise = 0;
    if (coupon.discountType === 'percentage') {
      discountPaise = Math.floor((plan.pricePaise * coupon.discountValue) / 100);
      if (coupon.maxDiscountPaise && coupon.maxDiscountPaise > 0) {
        discountPaise = Math.min(discountPaise, coupon.maxDiscountPaise);
      }
    } else {
      // flat_paise
      discountPaise = Math.min(coupon.discountValue, plan.pricePaise);
    }

    const finalPricePaise = Math.max(0, plan.pricePaise - discountPaise);

    return {
      isValid: true,
      coupon,
      discountPaise,
      finalPricePaise,
    };
  }

  /**
   * Admin lists all coupons
   */
  static async listCoupons() {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return coupons.map((c) => c.toJSON());
  }

  /**
   * Admin creates coupon
   */
  static async createCoupon(data: Partial<ICoupon>) {
    const existing = await Coupon.findOne({ code: data.code?.toUpperCase() });
    if (existing) {
      throw new ValidationError('Coupon code already exists', 'code', 'COUPON_ALREADY_EXISTS');
    }

    const coupon = await Coupon.create({
      ...data,
      code: data.code?.toUpperCase(),
    });
    return coupon.toJSON();
  }

  /**
   * Admin get coupon by ID
   */
  static async getCouponById(couponId: string) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }
    return coupon.toJSON();
  }

  /**
   * Admin update coupon
   */
  static async updateCoupon(couponId: string, data: Partial<ICoupon>) {
    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    const coupon = await Coupon.findByIdAndUpdate(couponId, data, { new: true });
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }
    return coupon.toJSON();
  }

  /**
   * Admin deactivate coupon
   */
  static async deactivateCoupon(couponId: string) {
    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { isActive: false },
      { new: true }
    );
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }
    return coupon.toJSON();
  }
}
