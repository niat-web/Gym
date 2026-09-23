import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { Plan, PlanCategory } from '../../types/index.js';
import { plansApi } from '../../services/plans.api.js';
import { Plus, X, AlertCircle } from 'lucide-react';

interface PlanEditorModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const PlanEditorModal: React.FC<PlanEditorModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isEditing = !!plan;

  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlanCategory>('standard');
  const [priceRupees, setPriceRupees] = useState('1500');
  const [calendarDays, setCalendarDays] = useState('30');
  const [allocatedDays, setAllocatedDays] = useState('26');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setPlanName(plan.planName);
      setDescription(plan.description);
      setCategory(plan.category);
      setPriceRupees((plan.pricePaise / 100).toString());
      setCalendarDays(plan.calendarDays.toString());
      setAllocatedDays(plan.allocatedDays.toString());
      setFeatures(plan.features || []);
    } else {
      setPlanName('');
      setDescription('');
      setCategory('standard');
      setPriceRupees('1500');
      setCalendarDays('30');
      setAllocatedDays('26');
      setFeatures(['General Gym Floor Access', 'Locker Room Access']);
    }
    setErrorMsg(null);
  }, [plan, isOpen]);

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const pricePaise = Math.round(parseFloat(priceRupees || '0') * 100);
    const calDays = parseInt(calendarDays || '30', 10);
    const allocDays = parseInt(allocatedDays || '26', 10);

    const payload = {
      planName: planName.trim(),
      description: description.trim(),
      category,
      pricePaise,
      calendarDays: calDays,
      allocatedDays: allocDays,
      features,
    };

    try {
      if (isEditing && plan) {
        await plansApi.updatePlan(plan.id, payload);
      } else {
        await plansApi.createPlan(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to save fitness plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Fitness Plan' : 'Create New Fitness Plan'}
      description="Configure membership tier, price in ₹, visit quota and benefits"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Input
          label="Plan Name"
          placeholder="e.g. Quarterly Pro Conditioning"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Category Tier
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PlanCategory)}
            className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
          >
            <option value="basic">Basic Tier</option>
            <option value="standard">Standard Tier</option>
            <option value="premium">Premium VIP Tier</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 placeholder:text-slate-500 rounded-xl p-3 text-sm outline-none focus:border-lime-500"
            placeholder="Short overview of what this plan is best suited for..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Price (₹)"
            type="number"
            min="0"
            placeholder="1500"
            value={priceRupees}
            onChange={(e) => setPriceRupees(e.target.value)}
            required
          />
          <Input
            label="Calendar Days"
            type="number"
            min="1"
            placeholder="30"
            value={calendarDays}
            onChange={(e) => setCalendarDays(e.target.value)}
            required
          />
          <Input
            label="Visits Quota"
            type="number"
            min="1"
            placeholder="26"
            value={allocatedDays}
            onChange={(e) => setAllocatedDays(e.target.value)}
            required
          />
        </div>

        {/* Feature List Builder */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Plan Features & Benefits
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Free Diet Consultation"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
            />
            <Button type="button" variant="secondary" size="md" onClick={handleAddFeature}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {features.map((feat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-charcoal-750 border border-charcoal-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg"
              >
                <span>{feat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(i)}
                  className="text-slate-400 hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="lime" className="flex-1 font-bold" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
