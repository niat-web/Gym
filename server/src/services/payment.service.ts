import crypto from 'crypto';
import mongoose from 'mongoose';
import { Payment, IPayment, PaymentMethod, PaymentStatus } from '../models/Payment.js';
import { Plan } from '../models/Plan.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { Referral } from '../models/Referral.js';
import { CouponService } from './coupon.service.js';
import { SubscriptionService } from './subscription.service.js';
import { ReferralService } from './referral.service.js';
import { env } from '../config/env.js';
import {
  NotFoundError,
  ValidationError,
  PaymentError,
  ForbiddenError,
} from '../utils/AppError.js';
import { generateReceiptNumber } from '../utils/generators.js';
import { logger } from '../utils/logger.js';

export class PaymentService {
  /**
   * Check if running in mock payment mode
   */
  static isMockMode(): boolean {
    return (
      env.PAYMENTS_MODE === 'mock' ||
      !env.RAZORPAY_KEY_ID ||
      env.RAZORPAY_KEY_ID.startsWith('rzp_test_mock')
    );
  }

  /**
   * Initiate a new checkout order
   */
  static async initiatePayment(
    userId: string,
    planId: string,
    couponCode?: string,
    referralCode?: string
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      throw new ValidationError('Selected plan is invalid or inactive', 'planId');
    }

    const originalPaise = plan.pricePaise;
    let couponDiscountPaise = 0;
    let validatedCoupon = null;

    // 1. Coupon validation
    if (couponCode && couponCode.trim()) {
      const validation = await CouponService.validateCoupon(couponCode, planId, userId);
      if (!validation.isValid) {
        throw new ValidationError(
          validation.reason || 'Invalid coupon code',
          'couponCode',
          'INVALID_COUPON'
        );
      }
      couponDiscountPaise = validation.discountPaise;
      validatedCoupon = validation.coupon;
    }

    // 2. Referral discount validation (First-time purchase only)
    let referralDiscountPaise = 0;
    let validReferralCode: string | undefined = undefined;

    const effectiveReferralCode = referralCode || user.referredByCode;
    if (effectiveReferralCode) {
      const priorSuccessCount = await Payment.countDocuments({
        user: userId,
        status: 'success',
      });

      if (priorSuccessCount === 0) {
        const refDoc = await Referral.findOne({
          referralCode: effectiveReferralCode.toUpperCase(),
          isActive: true,
        });

        if (refDoc && refDoc.referrer.toString() !== userId) {
          const remainingPrice = originalPaise - couponDiscountPaise;
          referralDiscountPaise = Math.min(refDoc.refereeDiscountValue, Math.max(0, remainingPrice));
          validReferralCode = refDoc.referralCode;
        }
      }
    }

    const finalPaise = Math.max(0, originalPaise - couponDiscountPaise - referralDiscountPaise);
    const receiptNumber = generateReceiptNumber();

    let orderId = `order_mock_${receiptNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // If live mode is enabled, integrate with Razorpay SDK
    if (!this.isMockMode()) {
      try {
        const Razorpay = (await import('razorpay')).default;
        const instance = new Razorpay({
          key_id: env.RAZORPAY_KEY_ID,
          key_secret: env.RAZORPAY_KEY_SECRET,
        });

        const rzpOrder = await instance.orders.create({
          amount: finalPaise,
          currency: 'INR',
          receipt: receiptNumber,
          notes: {
            userId,
            planId,
            planName: plan.planName,
          },
        });
        orderId = rzpOrder.id;
      } catch (err: any) {
        logger.error({ err }, 'Razorpay Order Creation Failed, falling back to mock order');
        orderId = `order_mock_${receiptNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;
      }
    }

    // Create pending payment record
    const payment = await Payment.create({
      user: user._id,
      plan: plan._id,
      receiptNumber,
      amountPaise: originalPaise,
      discountPaise: couponDiscountPaise + referralDiscountPaise,
      finalAmountPaise: finalPaise,
      paymentMethod: 'razorpay',
      status: 'pending',
      gatewayOrderId: orderId,
      couponDetails: validatedCoupon
        ? {
            code: validatedCoupon.code,
            discountPaise: couponDiscountPaise,
          }
        : undefined,
      referralDetails: validReferralCode
        ? {
            code: validReferralCode,
            discountPaise: referralDiscountPaise,
          }
        : undefined,
    });

    return {
      paymentId: payment._id.toString(),
      orderId,
      keyId: env.RAZORPAY_KEY_ID,
      amountPaise: finalPaise,
      currency: 'INR',
      isMock: this.isMockMode(),
      discountBreakdown: {
        originalPaise,
        couponDiscountPaise,
        referralDiscountPaise,
        finalPaise,
      },
      plan: {
        id: plan._id.toString(),
        name: plan.planName,
        calendarDays: plan.calendarDays,
        allocatedDays: plan.allocatedDays,
      },
      prefill: {
        name: user.fullName,
        contact: user.phone,
        email: user.email || '',
      },
    };
  }

  /**
   * Verify checkout payment and activate subscription (Idempotent)
   */
  static async verifyPayment(
    userId: string,
    data: {
      paymentId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature?: string;
    }
  ) {
    const payment = await Payment.findById(data.paymentId);
    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    if (payment.user.toString() !== userId) {
      throw new ForbiddenError('Payment does not belong to the current user');
    }

    // Idempotency: If already success, return immediately
    if (payment.status === 'success') {
      const existingSub = await SubscriptionService.getMyActiveSubscription(userId);
      return {
        payment: payment.toJSON(),
        subscription: existingSub,
        message: 'Payment already processed successfully',
      };
    }

    // Live Signature Verification
    if (!this.isMockMode() && data.razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(data.razorpaySignature)
      );

      if (!isSignatureValid) {
        payment.status = 'failed';
        await payment.save();
        throw new PaymentError('Payment signature verification failed', 'SIGNATURE_MISMATCH');
      }
    }

    // Atomic update from pending to success
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: 'pending' },
      {
        status: 'success',
        gatewayOrderId: data.razorpayOrderId,
        gatewayPaymentId: data.razorpayPaymentId,
        gatewaySignature: data.razorpaySignature || 'mock_signature',
      },
      { new: true }
    );

    if (!updatedPayment) {
      // Another concurrent worker finished it first
      const current = await Payment.findById(payment._id);
      return { payment: current?.toJSON() };
    }

    // Load Plan
    const plan = await Plan.findById(updatedPayment.plan);
    if (!plan) {
      throw new NotFoundError('Plan associated with payment not found');
    }

    // 1. Create Subscription
    const subscription = await SubscriptionService.createSubscription(
      userId,
      plan,
      updatedPayment._id
    );

    // 2. Increment Coupon uses if coupon applied
    if (updatedPayment.couponDetails?.code) {
      await Coupon.findOneAndUpdate(
        { code: updatedPayment.couponDetails.code },
        { $inc: { currentUses: 1 } }
      );
    }

    // 3. Trigger Referral Reward (if applicable)
    await ReferralService.processReferralRewardOnFirstPurchase(userId);

    logger.info(
      { paymentId: updatedPayment._id, receipt: updatedPayment.receiptNumber, userId },
      'Payment verified and completed successfully'
    );

    return {
      payment: updatedPayment.toJSON(),
      subscription: subscription.toJSON(),
      message: 'Payment verified and membership activated!',
    };
  }

  /**
   * Admin records manual cash or UPI payment
   */
  static async recordManualPayment(
    adminId: string,
    data: {
      memberId: string;
      planId: string;
      amountPaise: number;
      paymentMethod: 'cash' | 'upi';
      upiRef?: string;
      note?: string;
    }
  ) {
    const member = await User.findById(data.memberId);
    if (!member) {
      throw new NotFoundError('Member not found');
    }

    const plan = await Plan.findById(data.planId);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    const receiptNumber = generateReceiptNumber();
    const discountPaise = Math.max(0, plan.pricePaise - data.amountPaise);

    const payment = await Payment.create({
      user: member._id,
      plan: plan._id,
      receiptNumber,
      amountPaise: plan.pricePaise,
      discountPaise,
      finalAmountPaise: data.amountPaise,
      paymentMethod: data.paymentMethod,
      status: 'success',
      gatewayOrderId: data.upiRef || `manual_${Date.now()}`,
      note: data.note,
      recordedBy: adminId,
    });

    // Create and activate subscription
    const subscription = await SubscriptionService.createSubscription(
      member._id,
      plan,
      payment._id
    );

    // Trigger Referral Reward check
    await ReferralService.processReferralRewardOnFirstPurchase(member._id.toString());

    return {
      payment: payment.toJSON(),
      subscription: subscription.toJSON(),
    };
  }

  /**
   * Get payments for current member
   */
  static async getMyPayments(userId: string) {
    const payments = await Payment.find({ user: userId })
      .populate('plan', 'planName category')
      .sort({ createdAt: -1 });

    return payments.map((p) => p.toJSON());
  }

  /**
   * Admin list all payments with filters
   */
  static async listPayments(query: {
    page?: number;
    pageSize?: number;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    memberId?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const filter: any = {};

    if (query.status) filter.status = query.status;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.memberId) filter.user = query.memberId;

    const total = await Payment.countDocuments(filter);
    const items = await Payment.find(filter)
      .populate('user', 'fullName phone email')
      .populate('plan', 'planName category pricePaise')
      .populate('recordedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return {
      items: items.map((p) => p.toJSON()),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
