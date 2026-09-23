import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Progress } from '../ui/Progress.js';
import { Subscription } from '../../types/index.js';
import { formatDate } from '../../lib/formatters.js';
import {
  Calendar,
  Clock,
  Dumbbell,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ActivePlanCardProps {
  subscription: Subscription | null;
  onOpenPass?: () => void;
}

export const ActivePlanCard: React.FC<ActivePlanCardProps> = ({ subscription, onOpenPass }) => {
  if (!subscription) {
    return (
      <Card className="border-lime-500/30 bg-gradient-to-br from-charcoal-800 via-charcoal-850 to-charcoal-900 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Badge variant="warning" size="sm">
              No Active Membership
            </Badge>
            <h3 className="text-xl font-extrabold text-white">Start Your Fitness Journey</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Choose from our flexible starter, quarterly, or annual plans to unlock studio access and trainer sessions.
            </p>
          </div>
          <Link to="/member/plans">
            <Button variant="lime" className="gap-2 shrink-0">
              Browse Plans
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const { planSnapshot, allocatedDays, daysUsed, daysRemaining, expiresOn, daysUntilExpiry, status } =
    subscription;

  const isExpiringSoon = daysUntilExpiry !== undefined && daysUntilExpiry <= 7;
  const isExhausted = daysRemaining <= 0;

  return (
    <Card className="border-charcoal-700 bg-gradient-to-br from-charcoal-800 to-charcoal-900 relative overflow-hidden shadow-xl">
      {/* Accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400" />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{planSnapshot.planName}</h3>
              <p className="text-xs text-slate-400 font-medium">
                Valid for {planSnapshot.calendarDays} calendar days
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                status === 'active'
                  ? 'lime'
                  : status === 'paused'
                  ? 'warning'
                  : 'danger'
              }
            >
              {status}
            </Badge>
            {onOpenPass && (
              <Button size="sm" variant="secondary" onClick={onOpenPass} className="text-xs">
                QR Pass
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar & Quota */}
        <div className="space-y-2 bg-charcoal-850/80 p-4 rounded-2xl border border-charcoal-700/50">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-300 font-semibold">Gym Visits Quota</span>
            <span className="font-extrabold text-lime-400 text-sm">
              {daysRemaining} <span className="text-xs text-slate-400 font-normal">/ {allocatedDays} visits left</span>
            </span>
          </div>

          <Progress value={daysUsed} max={allocatedDays} barClassName="bg-lime-400" />

          <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
            <span>Used: {daysUsed} visits</span>
            <span>Allocated: {allocatedDays} visits</span>
          </div>
        </div>

        {/* Expiry Details & Renew Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-charcoal-750 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-lime-500 shrink-0" />
            <span>
              Expires on <strong className="text-white">{formatDate(expiresOn)}</strong>
              {daysUntilExpiry !== undefined && (
                <span className="text-slate-400 ml-1">
                  ({daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'})
                </span>
              )}
            </span>
          </div>

          {(isExpiringSoon || isExhausted) && (
            <Link to="/member/plans">
              <Button variant="lime" size="sm" className="w-full sm:w-auto gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Renew Plan
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};
