import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { Coupon, DiscountType, Plan } from '../../types/index.js';
import { couponsApi } from '../../services/coupons.api.js';
import { plansApi } from '../../services/plans.api.js';
import { AlertCircle } from 'lucide-react';

interface CouponEditorModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const CouponEditorModal: React.FC<CouponEditorModalProps> = ({
  coupon,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isEditing = !!coupon;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minPlanPriceRupees, setMinPlanPriceRupees] = useState('1000');
  const [maxDiscountRupees, setMaxDiscountRupees] = useState('500');
  const [maxUses, setMaxUses] = useState('100');
  const [perUserLimit, setPerUserLimit] = useState('1');
  const [applicableTo, setApplicableTo] = useState<string>('all');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Load plans for applicableTo selector
    plansApi.getActivePlans().then((res) => {
      if (res.success && res.data) {
        setAvailablePlans(res.data);
      }
    });
  }, []);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setName(coupon.name);
      setDescription(coupon.description);
      setDiscountType(coupon.discountType);
      setDiscountValue(
        coupon.discountType === 'percentage'
          ? coupon.discountValue.toString()
          : (coupon.discountValue / 100).toString()
      );
      setMinPlanPriceRupees((coupon.minPlanPricePaise / 100).toString());
      setMaxDiscountRupees(
        coupon.maxDiscountPaise ? (coupon.maxDiscountPaise / 100).toString() : ''
      );
      setMaxUses(coupon.maxUses.toString());
      setPerUserLimit(coupon.perUserLimit.toString());
      setApplicableTo(coupon.applicableTo?.[0] || 'all');
      setValidFrom(coupon.validFrom.slice(0, 10));
      setValidUntil(coupon.validUntil.slice(0, 10));
    } else {
      setCode('');
      setName('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue('20');
      setMinPlanPriceRupees('1000');
      setMaxDiscountRupees('500');
      setMaxUses('100');
      setPerUserLimit('1');
      setApplicableTo('all');

      const today = new Date();
      const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      setValidFrom(today.toISOString().slice(0, 10));
      setValidUntil(in30Days.toISOString().slice(0, 10));
    }
    setErrorMsg(null);
  }, [coupon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const val = parseFloat(discountValue || '0');
    const calculatedDiscountValue = discountType === 'percentage' ? val : Math.round(val * 100);

    const payload: Partial<Coupon> = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      discountType,
      discountValue: calculatedDiscountValue,
      minPlanPricePaise: Math.round(parseFloat(minPlanPriceRupees || '0') * 100),
      maxDiscountPaise: maxDiscountRupees ? Math.round(parseFloat(maxDiscountRupees) * 100) : undefined,
      maxUses: parseInt(maxUses || '100', 10),
      perUserLimit: parseInt(perUserLimit || '1', 10),
      applicableTo: [applicableTo],
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
    };

    try {
      if (isEditing && coupon) {
        await couponsApi.updateCoupon(coupon.id, payload);
      } else {
        await couponsApi.createCoupon(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Coupon' : 'Create New Coupon'}
      description="Configure discount percentages, rupee caps, and validity windows"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Coupon Code"
            placeholder="e.g. FIT50"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <Input
            label="Campaign Name"
            placeholder="e.g. Summer Fitness Blast"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Description"
          placeholder="e.g. 50% discount up to ₹1,000 on standard plans"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat_paise">Flat Rupee Amount (₹)</option>
            </select>
          </div>

          <Input
            label={discountType === 'percentage' ? 'Discount Percentage (%)' : 'Flat Discount (₹)'}
            type="number"
            min="1"
            placeholder={discountType === 'percentage' ? '20' : '500'}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min Plan Price (₹)"
            type="number"
            min="0"
            placeholder="1000"
            value={minPlanPriceRupees}
            onChange={(e) => setMinPlanPriceRupees(e.target.value)}
          />

          {discountType === 'percentage' ? (
            <Input
              label="Max Discount Cap (₹)"
              type="number"
              min="0"
              placeholder="500"
              value={maxDiscountRupees}
              onChange={(e) => setMaxDiscountRupees(e.target.value)}
            />
          ) : (
            <Input
              label="Per User Limit"
              type="number"
              min="1"
              value={perUserLimit}
              onChange={(e) => setPerUserLimit(e.target.value)}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Global Max Uses"
            type="number"
            min="1"
            placeholder="100"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Applicable Plans
            </label>
            <select
              value={applicableTo}
              onChange={(e) => setApplicableTo(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            >
              <option value="all">All Plans</option>
              {availablePlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.planName} (₹{p.pricePaise / 100})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Valid From"
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            required
          />
          <Input
            label="Valid Until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-3 pt-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="lime" className="flex-1 font-bold" isLoading={isSubmitting}>
            {isEditing ? 'Update Coupon' : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
