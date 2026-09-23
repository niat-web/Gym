import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { Badge } from '../ui/Badge.js';
import { Plan, Payment } from '../../types/index.js';
import { couponsApi, CouponValidationResponse } from '../../services/coupons.api.js';
import { paymentsApi, InitiatePaymentResponse } from '../../services/payments.api.js';
import { formatRupees } from '../../lib/formatters.js';
import {
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  ArrowRight,
  Dumbbell,
} from 'lucide-react';

interface CheckoutDrawerProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  plan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!plan) return null;

  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponResult, setCouponResult] = useState<CouponValidationResponse | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [isInitiating, setIsInitiating] = useState(false);
  const [orderData, setOrderData] = useState<InitiatePaymentResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Apply & Validate Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await couponsApi.validateCoupon(couponCode, plan.id);
      if (res.success && res.data) {
        if (res.data.isValid) {
          setCouponResult(res.data);
          setCouponError(null);
        } else {
          setCouponResult(null);
          setCouponError(res.data.reason || 'Coupon is not valid for this plan');
        }
      }
    } catch (err: any) {
      setCouponResult(null);
      setCouponError(err.response?.data?.error?.message || 'Error validating coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponResult(null);
    setCouponError(null);
  };

  // Step 1: Initiate Payment Order
  const handleProceedToPayment = async () => {
    setIsInitiating(true);
    setErrorMsg(null);

    try {
      const res = await paymentsApi.initiate({
        planId: plan.id,
        couponCode: couponResult?.isValid ? couponCode : undefined,
      });

      if (res.success && res.data) {
        setOrderData(res.data);
      } else {
        setErrorMsg(res.error?.message || 'Failed to initiate order');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to create checkout order');
    } finally {
      setIsInitiating(false);
    }
  };

  // Step 2: Complete Payment (Mock / Real)
  const handleCompleteMockPayment = async (status: 'success' | 'fail') => {
    if (!orderData) return;

    if (status === 'fail') {
      setErrorMsg('Payment simulation failed or was cancelled by user.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await paymentsApi.verify({
        paymentId: orderData.paymentId,
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpaySignature: 'mock_signature',
      });

      if (res.success && res.data) {
        setPaymentCompleted(true);
        // Fire confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#CCFF00', '#D4FF33', '#10B981', '#3B82F6'],
          });
        } catch (e) {}

        onSuccess(res.data.payment);
      } else {
        setErrorMsg(res.error?.message || 'Payment verification failed');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Payment verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetAndClose = () => {
    setOrderData(null);
    setPaymentCompleted(false);
    setCouponCode('');
    setCouponResult(null);
    setCouponError(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetAndClose} maxWidth="md">
      {paymentCompleted ? (
        /* Celebration Success View */
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 rounded-full bg-lime-500/20 border-2 border-lime-500 flex items-center justify-center mx-auto text-lime-400 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-white tracking-tight">Membership Activated!</h2>
            <p className="text-xs text-slate-300">
              Welcome aboard! Your <strong>{plan.planName}</strong> is now active with{' '}
              <strong>{plan.allocatedDays} gym visits</strong> for the next {plan.calendarDays} days.
            </p>
          </div>

          <div className="bg-charcoal-800 p-4 rounded-2xl border border-charcoal-700 text-xs text-slate-300">
            <p className="font-semibold text-slate-200">Front Desk Access Ready</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Open your digital QR pass from the Home screen anytime to check in at the gym.
            </p>
          </div>

          <Button variant="lime" className="w-full font-bold" onClick={handleResetAndClose}>
            Go to My Membership
          </Button>
        </div>
      ) : orderData ? (
        /* Mock Payment Processing Sheet */
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-charcoal-750">
            <div className="w-9 h-9 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Payment Gateway</h2>
              <p className="text-[11px] text-slate-400 font-mono">Order: {orderData.orderId}</p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-charcoal-800 p-4 rounded-2xl border border-charcoal-700 text-center space-y-1">
            <p className="text-xs text-slate-400 uppercase font-semibold">Amount to Pay</p>
            <p className="text-3xl font-black text-lime-400">
              {formatRupees(orderData.amountPaise)}
            </p>
            <p className="text-[11px] text-slate-400">
              Plan: {orderData.plan.name} ({orderData.plan.calendarDays} Days / {orderData.plan.allocatedDays} Visits)
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mock Interactive Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              variant="lime"
              className="w-full py-3.5 text-base font-bold shadow-lime-glow"
              isLoading={isVerifying}
              onClick={() => handleCompleteMockPayment('success')}
            >
              Simulate Successful Payment (₹{orderData.amountPaise / 100})
            </Button>

            <Button
              variant="outline"
              className="w-full text-xs text-slate-400 hover:text-rose-400 hover:border-rose-500/40"
              disabled={isVerifying}
              onClick={() => handleCompleteMockPayment('fail')}
            >
              Simulate Cancel / Failure
            </Button>
          </div>
        </div>
      ) : (
        /* Order Review & Coupon Input */
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-750">
            <div>
              <h2 className="text-lg font-black text-white">Checkout Review</h2>
              <p className="text-xs text-slate-400">Complete your gym membership subscription</p>
            </div>
            <Badge variant="lime" size="sm">
              {plan.category}
            </Badge>
          </div>

          {/* Plan Info */}
          <div className="p-4 bg-charcoal-800 rounded-2xl border border-charcoal-700 space-y-1.5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-100">{plan.planName}</h3>
              <span className="text-base font-extrabold text-lime-400">
                {formatRupees(plan.pricePaise)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {plan.allocatedDays} visits quota • {plan.calendarDays} calendar days validity
            </p>
          </div>

          {/* Coupon Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Apply Promo Code / Coupon
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. FIT50 or FITTED500"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!couponResult}
                leftIcon={<Tag className="w-4 h-4" />}
              />
              {couponResult ? (
                <Button variant="secondary" size="md" onClick={handleRemoveCoupon}>
                  Remove
                </Button>
              ) : (
                <Button
                  variant="lime"
                  size="md"
                  isLoading={isValidatingCoupon}
                  onClick={handleApplyCoupon}
                >
                  Apply
                </Button>
              )}
            </div>

            {/* Coupon Success */}
            {couponResult && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Coupon <strong>{couponResult.coupon?.code}</strong> applied!
                  </span>
                </div>
                <span className="font-bold">- {formatRupees(couponResult.discountPaise)}</span>
              </div>
            )}

            {/* Coupon Error */}
            {couponError && (
              <p className="text-xs font-medium text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {couponError}
              </p>
            )}
          </div>

          {/* Itemised Breakdown */}
          <div className="space-y-2 text-xs pt-2 border-t border-charcoal-750">
            <div className="flex justify-between text-slate-300">
              <span>Original Price</span>
              <span>{formatRupees(plan.pricePaise)}</span>
            </div>

            {couponResult && couponResult.discountPaise > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Coupon Discount</span>
                <span>- {formatRupees(couponResult.discountPaise)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-charcoal-700 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-100">Final Total</span>
              <span className="text-2xl font-black text-lime-400">
                {formatRupees(
                  couponResult ? couponResult.finalPricePaise : plan.pricePaise
                )}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={handleResetAndClose}>
              Cancel
            </Button>
            <Button
              variant="lime"
              className="flex-1 gap-2 font-bold"
              isLoading={isInitiating}
              onClick={handleProceedToPayment}
            >
              Proceed to Pay
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
