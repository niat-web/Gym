import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { plansApi } from '../../services/plans.api.js';
import { Plan, PlanCategory, Payment } from '../../types/index.js';
import { PlanCard } from '../../components/member/PlanCard.js';
import { CheckoutDrawer } from '../../components/member/CheckoutDrawer.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { ShoppingBag, Sparkles, Filter } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const StorePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['activePlans'],
    queryFn: async () => {
      const res = await plansApi.getActivePlans();
      return res.data || [];
    },
  });

  const filteredPlans =
    selectedCategory === 'all'
      ? plans
      : plans.filter((p) => p.category === selectedCategory);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (_payment: Payment) => {
    queryClient.invalidateQueries({ queryKey: ['myActiveSubscription'] });
    queryClient.invalidateQueries({ queryKey: ['myPayments'] });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-lime-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Membership Plans
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose the membership tier that fits your fitness schedule and goals.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-charcoal-850 p-1.5 rounded-2xl border border-charcoal-700 shrink-0 self-start sm:self-auto overflow-x-auto">
          {['all', 'basic', 'standard', 'premium'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-200',
                selectedCategory === cat
                  ? 'bg-lime-500 text-charcoal-950 shadow-lime-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {cat === 'all' ? 'All Plans' : `${cat} Tier`}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-charcoal-800/60 animate-pulse border border-charcoal-700" />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-charcoal-850 rounded-2xl border border-charcoal-700">
          No fitness plans available in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredPlans.map((plan, idx) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              isPopular={plan.category === 'standard' || idx === 1}
            />
          ))}
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      <CheckoutDrawer
        plan={selectedPlan}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
