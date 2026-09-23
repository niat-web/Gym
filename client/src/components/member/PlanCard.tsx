import React from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Plan } from '../../types/index.js';
import { formatRupees } from '../../lib/formatters.js';
import { Check, Dumbbell, Sparkles, Zap } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isPopular?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isPopular }) => {
  const getCategoryVariant = (cat: string) => {
    if (cat === 'premium') return 'purple';
    if (cat === 'standard') return 'lime';
    return 'info';
  };

  return (
    <Card
      className={cn(
        'relative flex flex-col justify-between transition-all duration-300 hover:border-lime-500/50 hover:shadow-lime-glow-sm',
        isPopular && 'border-lime-500/60 bg-gradient-to-b from-charcoal-800 to-charcoal-850 ring-1 ring-lime-500/40'
      )}
    >
      {/* Most Popular Ribbon */}
      {isPopular && (
        <div className="absolute -top-3 right-6 bg-lime-500 text-charcoal-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Most Popular
        </div>
      )}

      <div className="space-y-4">
        {/* Category & Plan Name */}
        <div className="space-y-1.5">
          <Badge variant={getCategoryVariant(plan.category) as any} size="sm">
            {plan.category} tier
          </Badge>
          <h3 className="text-xl font-black text-white tracking-tight">{plan.planName}</h3>
          <p className="text-xs text-slate-400 min-h-[32px] line-clamp-2">{plan.description}</p>
        </div>

        {/* Pricing & Duration */}
        <div className="py-3 border-y border-charcoal-700/60 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-lime-400">
              {formatRupees(plan.pricePaise)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">
              / {plan.calendarDays} days
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200 bg-charcoal-750 px-2.5 py-1 rounded-lg border border-charcoal-700">
              {plan.allocatedDays} visits
            </span>
          </div>
        </div>

        {/* Features list */}
        <div className="space-y-2 py-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            What's Included:
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-lime-500/10 text-lime-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-6">
        <Button
          variant={isPopular ? 'lime' : 'secondary'}
          className="w-full font-bold text-sm shadow-md"
          onClick={() => onSelect(plan)}
        >
          Select Plan
        </Button>
      </div>
    </Card>
  );
};
