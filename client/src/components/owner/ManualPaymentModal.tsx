import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { User, Plan } from '../../types/index.js';
import { usersApi } from '../../services/users.api.js';
import { plansApi } from '../../services/plans.api.js';
import { paymentsApi } from '../../services/payments.api.js';
import { formatRupees } from '../../lib/formatters.js';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ManualPaymentModalProps {
  initialMember?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  initialMember,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [memberId, setMemberId] = useState(initialMember?.id || '');
  const [planId, setPlanId] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [upiRef, setUpiRef] = useState('');
  const [note, setNote] = useState('');

  const [members, setMembers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialMember) {
        setMemberId(initialMember.id);
      }
      // Load active plans
      plansApi.getActivePlans().then((res) => {
        if (res.success && res.data) {
          setPlans(res.data);
          if (res.data.length > 0 && !planId) {
            setPlanId(res.data[0].id);
            setAmountRupees((res.data[0].pricePaise / 100).toString());
          }
        }
      });

      // Load members
      usersApi.listUsers({ pageSize: 100, role: 'member' }).then((res) => {
        if (res.success && res.data) {
          setMembers(res.data.items);
          if (!initialMember && res.data.items.length > 0 && !memberId) {
            setMemberId(res.data.items[0].id);
          }
        }
      });
    }
  }, [isOpen, initialMember]);

  const handlePlanChange = (selectedPlanId: string) => {
    setPlanId(selectedPlanId);
    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (selectedPlan) {
      setAmountRupees((selectedPlan.pricePaise / 100).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !planId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const amountPaise = Math.round(parseFloat(amountRupees || '0') * 100);

    try {
      const res = await paymentsApi.recordManualPayment({
        memberId,
        planId,
        amountPaise,
        paymentMethod,
        upiRef: upiRef.trim() || undefined,
        note: note.trim() || undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error?.message || 'Failed to record manual payment');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Manual Cash / UPI Payment"
      description="Record front desk payment and immediately activate member's plan"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Member Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Member
          </label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            required
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Plan Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Fitness Plan
          </label>
          <select
            value={planId}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            required
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.planName} — {formatRupees(p.pricePaise)} ({p.allocatedDays} visits / {p.calendarDays} days)
              </option>
            ))}
          </select>
        </div>

        {/* Amount & Method */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount Collected (₹)"
            type="number"
            min="0"
            value={amountRupees}
            onChange={(e) => setAmountRupees(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'upi')}
              className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            >
              <option value="cash">Cash Payment</option>
              <option value="upi">UPI / QR Transfer</option>
            </select>
          </div>
        </div>

        {paymentMethod === 'upi' && (
          <Input
            label="UPI Transaction Ref / UTR"
            placeholder="e.g. 409182374982"
            value={upiRef}
            onChange={(e) => setUpiRef(e.target.value)}
          />
        )}

        <Input
          label="Notes / Comments (Optional)"
          placeholder="e.g. Paid in cash at counter"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex gap-3 pt-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="lime" className="flex-1 font-bold" isLoading={isSubmitting}>
            Record & Activate
          </Button>
        </div>
      </form>
    </Modal>
  );
};
