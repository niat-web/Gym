import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service.js';

export class CouponController {
  static listCoupons = async (req: Request, res: Response) => {
    const coupons = await CouponService.listCoupons();
    res.status(200).json({
      success: true,
      data: coupons,
    });
  };

  static createCoupon = async (req: Request, res: Response) => {
    const coupon = await CouponService.createCoupon(req.body);
    res.status(201).json({
      success: true,
      data: coupon,
      message: 'Coupon created successfully',
    });
  };

  static getCouponById = async (req: Request, res: Response) => {
    const coupon = await CouponService.getCouponById(req.params.id);
    res.status(200).json({
      success: true,
      data: coupon,
    });
  };

  static updateCoupon = async (req: Request, res: Response) => {
    const coupon = await CouponService.updateCoupon(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: coupon,
      message: 'Coupon updated successfully',
    });
  };

  static deactivateCoupon = async (req: Request, res: Response) => {
    const coupon = await CouponService.deactivateCoupon(req.params.id);
    res.status(200).json({
      success: true,
      data: coupon,
      message: 'Coupon deactivated successfully',
    });
  };

  static validateCoupon = async (req: Request, res: Response) => {
    const planId = req.query.planId as string;
    const code = req.params.code;
    const result = await CouponService.validateCoupon(code, planId, req.userId);

    res.status(200).json({
      success: true,
      data: {
        isValid: result.isValid,
        discountPaise: result.discountPaise,
        finalPricePaise: result.finalPricePaise,
        reason: result.reason,
        coupon: result.coupon
          ? {
              code: result.coupon.code,
              name: result.coupon.name,
              discountType: result.coupon.discountType,
              discountValue: result.coupon.discountValue,
            }
          : undefined,
      },
    });
  };
}
