import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { plansApi } from '../../services/plans.api.js';
import { Plan } from '../../types/index.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { PlanEditorModal } from '../../components/owner/PlanEditorModal.js';
import { formatRupees } from '../../lib/formatters.js';
import { ShoppingBag, Plus, Edit2, Power, Check, Sparkles } from 'lucide-react';

export const OwnerPlansPage: React.FC = () => {
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: plans = [], isLoading, refetch } = useQuery({
    queryKey: ['allPlansAdmin'],
    queryFn: async () => {
      const res = await plansApi.getAllPlans();
      return res.data || [];
    },
  });

  const handleCreate = () => {
    setEditingPlan(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsEditorOpen(true);
  };

  const handleToggleActivate = async (plan: Plan) => {
    try {
      if (plan.isActive) {
        await plansApi.deactivatePlan(plan.id);
      } else {
        await plansApi.activatePlan(plan.id);
      }
      refetch();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-lime-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Fitness Plans Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, price, and adjust calendar days and visit limits for all membership packages.
          </p>
        </div>

        <Button variant="lime" className="gap-2 font-bold shadow-lime-glow-sm" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Create New Plan
        </Button>
      </div>

      {/* Plans List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading fitness plans...</div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-charcoal-850 rounded-2xl border border-charcoal-700">
          No plans created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-5 flex flex-col justify-between space-y-4 ${
                !plan.isActive ? 'opacity-60 border-dashed border-charcoal-700' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge
                      variant={
                        plan.category === 'premium'
                          ? 'purple'
                          : plan.category === 'standard'
                          ? 'lime'
                          : 'info'
                      }
                      size="sm"
                    >
                      {plan.category}
                    </Badge>
                    <h3 className="font-black text-lg text-white mt-1.5">{plan.planName}</h3>
                  </div>

                  <Badge variant={plan.isActive ? 'lime' : 'neutral'} size="sm">
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{plan.description}</p>

                <div className="py-2.5 border-y border-charcoal-750 flex items-baseline justify-between text-xs">
                  <div>
                    <span className="text-2xl font-black text-lime-400">
                      {formatRupees(plan.pricePaise)}
                    </span>
                    <span className="text-slate-400 ml-1">/ {plan.calendarDays}d</span>
                  </div>
                  <span className="font-bold text-slate-300 bg-charcoal-750 px-2 py-0.5 rounded">
                    {plan.allocatedDays} visits
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <p className="text-[10px] text-slate-500">
                      +{plan.features.length - 3} more benefits
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-charcoal-750 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs gap-1"
                  onClick={() => handleEdit(plan)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Button>

                <Button
                  variant={plan.isActive ? 'outline' : 'lime'}
                  size="sm"
                  className="text-xs gap-1"
                  onClick={() => handleToggleActivate(plan)}
                >
                  <Power className="w-3.5 h-3.5" />
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Plan Editor Modal */}
      <PlanEditorModal
        plan={editingPlan}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={() => refetch()}
      />
    </div>
  );
};
