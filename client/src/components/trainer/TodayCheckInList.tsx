import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card.js';
import { TodayCheckInItem } from '../../services/checkin.api.js';
import { formatTime } from '../../lib/formatters.js';
import { CheckCircle2, Clock, User, Dumbbell } from 'lucide-react';

interface TodayCheckInListProps {
  items: TodayCheckInItem[];
  isLoading?: boolean;
}

export const TodayCheckInList: React.FC<TodayCheckInListProps> = ({ items = [], isLoading }) => {
  return (
    <Card className="space-y-4">
      <CardHeader className="mb-0">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-lime-500" />
          <CardTitle>Today's Check-Ins</CardTitle>
        </div>
        <span className="text-xs font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/20">
          {items.length} {items.length === 1 ? 'member' : 'members'}
        </span>
      </CardHeader>

      {isLoading ? (
        <div className="text-center py-8 text-xs text-slate-400">Loading today's feed...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-slate-400 space-y-2">
          <Clock className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs">No check-ins recorded yet today.</p>
          <p className="text-[11px] text-slate-500">
            Use the search bar above or camera QR scanner to mark attendance.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750/80 hover:border-charcoal-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-xs font-bold text-lime-400 shrink-0">
                  {item.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{item.fullName}</h4>
                  <p className="text-[10px] text-slate-400">
                    {item.planName || 'Gym Plan'} • {item.phone}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-slate-200">{formatTime(item.checkInTime)}</p>
                <p className="text-[10px] text-lime-400/90 font-medium">
                  {item.daysRemaining} visits left
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
