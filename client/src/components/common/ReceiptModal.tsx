import React from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Payment } from '../../types/index.js';
import { formatRupees, formatDateTime } from '../../lib/formatters.js';
import { Dumbbell, Printer, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, isOpen, onClose }) => {
  if (!payment) return null;

  const planName = typeof payment.plan === 'object' ? payment.plan.planName : 'Fitness Membership';
  const memberName = typeof payment.user === 'object' ? payment.user.fullName : undefined;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="p-2 space-y-6 print:text-black">
        {/* Receipt Header */}
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-750">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-500 flex items-center justify-center text-charcoal-950 font-black">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100">FitCore Gym & Studio</h2>
              <p className="text-[11px] text-slate-400">Official Membership Receipt</p>
            </div>
          </div>
          <Badge
            variant={
              payment.status === 'success'
                ? 'success'
                : payment.status === 'pending'
                ? 'warning'
                : 'danger'
            }
          >
            {payment.status}
          </Badge>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-4 bg-charcoal-800/80 p-4 rounded-2xl border border-charcoal-700/60 text-xs">
          <div>
            <p className="text-slate-400">Receipt No</p>
            <p className="font-mono font-bold text-slate-200 mt-0.5">{payment.receiptNumber}</p>
          </div>
          <div>
            <p className="text-slate-400">Date & Time</p>
            <p className="font-medium text-slate-200 mt-0.5">{formatDateTime(payment.createdAt)}</p>
          </div>
          <div>
            <p className="text-slate-400">Payment Method</p>
            <p className="font-bold text-slate-200 uppercase mt-0.5">{payment.paymentMethod}</p>
          </div>
          <div>
            <p className="text-slate-400">Order Ref</p>
            <p className="font-mono text-slate-300 truncate mt-0.5" title={payment.gatewayOrderId}>
              {payment.gatewayOrderId || 'N/A'}
            </p>
          </div>
          {memberName && (
            <div className="col-span-2">
              <p className="text-slate-400">Member</p>
              <p className="font-bold text-slate-100 mt-0.5">{memberName}</p>
            </div>
          )}
        </div>

        {/* Itemised Breakdown */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between py-1.5 text-slate-300 font-medium">
            <span>{planName}</span>
            <span>{formatRupees(payment.amountPaise)}</span>
          </div>

          {payment.couponDetails && payment.couponDetails.discountPaise > 0 && (
            <div className="flex justify-between py-1 text-emerald-400 font-medium">
              <span>Coupon ({payment.couponDetails.code})</span>
              <span>- {formatRupees(payment.couponDetails.discountPaise)}</span>
            </div>
          )}

          {payment.referralDetails && payment.referralDetails.discountPaise > 0 && (
            <div className="flex justify-between py-1 text-emerald-400 font-medium">
              <span>Referral Welcome Discount</span>
              <span>- {formatRupees(payment.referralDetails.discountPaise)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-charcoal-700 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-100">Total Paid</span>
            <span className="text-lg font-black text-lime-400">
              {formatRupees(payment.finalAmountPaise)}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button variant="lime" className="flex-1 gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
};
