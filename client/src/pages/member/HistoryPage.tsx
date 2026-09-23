import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../../services/subscriptions.api.js';
import { checkinApi } from '../../services/checkin.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { formatDate, formatTime, formatRupees } from '../../lib/formatters.js';
import { CalendarCheck, History, CheckCircle2, Dumbbell } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'subscriptions'>('attendance');

  // Subscriptions history
  const { data: subHistory = [], isLoading: isSubLoading } = useQuery({
    queryKey: ['mySubscriptionHistory'],
    queryFn: async () => {
      const res = await subscriptionsApi.getMyHistory();
      return res.data || [];
    },
  });

  // Attendance history
  const { data: attendanceLogs = [], isLoading: isAttLoading } = useQuery({
    queryKey: ['myAttendanceHistory'],
    queryFn: async () => {
      const res = await checkinApi.getHistory();
      return res.data || [];
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-lime-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Activity & History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review past subscriptions and attendance records over time.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-charcoal-850 p-1.5 rounded-2xl border border-charcoal-700 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('attendance')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5',
              activeTab === 'attendance'
                ? 'bg-lime-500 text-charcoal-950 shadow-lime-glow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <CalendarCheck className="w-4 h-4" />
            Attendance ({attendanceLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5',
              activeTab === 'subscriptions'
                ? 'bg-lime-500 text-charcoal-950 shadow-lime-glow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Dumbbell className="w-4 h-4" />
            Plans ({subHistory.length})
          </button>
        </div>
      </div>

      {activeTab === 'attendance' ? (
        /* Attendance History List */
        <Card className="space-y-4">
          <CardHeader className="mb-0">
            <CardTitle>Attendance Log</CardTitle>
            <span className="text-xs text-slate-400">Total Check-Ins: {attendanceLogs.length}</span>
          </CardHeader>

          {isAttLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading attendance...</div>
          ) : attendanceLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CalendarCheck className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">No gym attendance logs found.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {attendanceLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{formatDate(log.checkInTime)}</p>
                      <p className="text-[10px] text-slate-400">
                        {formatTime(log.checkInTime)} • {log.planName || 'Plan'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 bg-charcoal-800 px-2 py-0.5 rounded border border-charcoal-700">
                      Marked by {log.markedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        /* Subscriptions History List */
        <Card className="space-y-4">
          <CardHeader className="mb-0">
            <CardTitle>Subscriptions History</CardTitle>
            <span className="text-xs text-slate-400">Total Plans: {subHistory.length}</span>
          </CardHeader>

          {isSubLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading subscriptions...</div>
          ) : subHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Dumbbell className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">No past subscriptions found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subHistory.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750 space-y-2.5"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">
                        {sub.planSnapshot.planName}
                      </h4>
                      <Badge
                        variant={
                          sub.status === 'active'
                            ? 'lime'
                            : sub.status === 'paused'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <span className="text-xs font-bold text-lime-400">
                      {formatRupees(sub.planSnapshot.pricePaise)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 bg-charcoal-800 p-2.5 rounded-xl border border-charcoal-700/60">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Started</span>
                      <span className="font-medium text-slate-200">{formatDate(sub.startsOn)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Expired</span>
                      <span className="font-medium text-slate-200">{formatDate(sub.expiresOn)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Visits Used</span>
                      <span className="font-medium text-slate-200">
                        {sub.daysUsed} / {sub.allocatedDays}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Visits Left</span>
                      <span className="font-bold text-lime-400">{sub.daysRemaining}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
