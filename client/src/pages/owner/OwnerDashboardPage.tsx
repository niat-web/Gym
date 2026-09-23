import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../services/dashboard.api.js';
import { RevenueChart } from '../../components/owner/RevenueChart.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { formatRupees, formatDate, formatTime } from '../../lib/formatters.js';
import {
  Users,
  CreditCard,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Receipt,
  Play,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const [jobFeedback, setJobFeedback] = useState<string | null>(null);
  const [isRunningJob, setIsRunningJob] = useState(false);

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['ownerDashboard'],
    queryFn: async () => {
      const res = await dashboardApi.getOwnerDashboard();
      return res.data || null;
    },
    refetchInterval: 20000,
  });

  const handleRunDevJob = async (jobName: string) => {
    setIsRunningJob(true);
    setJobFeedback(null);
    try {
      const res = await dashboardApi.triggerDevJob(jobName);
      if (res.success) {
        setJobFeedback(`Successfully ran cron job '${jobName}'!`);
        refetch();
      }
    } catch (err: any) {
      setJobFeedback(err.response?.data?.error?.message || 'Error executing dev job');
    } finally {
      setIsRunningJob(false);
    }
  };

  const kpis = dashboardData?.kpis;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-lime-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Executive Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            FitCore studio financial analytics, membership lifecycles, and front-desk attendance.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-4 bg-charcoal-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Members</p>
          <p className="text-2xl font-black text-white mt-1">{kpis?.totalMembers ?? 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Registered accounts</p>
        </Card>

        <Card className="p-4 bg-charcoal-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Active Plans</p>
          <p className="text-2xl font-black text-lime-400 mt-1">{kpis?.activeSubscriptions ?? 0}</p>
          <p className="text-[10px] text-lime-500/80 mt-1">Current members</p>
        </Card>

        <Card className="p-4 bg-charcoal-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Check-Ins Today</p>
          <p className="text-2xl font-black text-sky-400 mt-1">{kpis?.checkInsToday ?? 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">Front desk visits</p>
        </Card>

        <Card className="p-4 bg-charcoal-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Expiring in 7 Days</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{kpis?.expiringIn7Days ?? 0}</p>
          <p className="text-[10px] text-amber-500/80 mt-1">Renewal targets</p>
        </Card>

        <Card className="p-4 bg-charcoal-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Expired Plans</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{kpis?.expiredSubscriptions ?? 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Pending renewal</p>
        </Card>

        <Card className="p-4 bg-charcoal-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Monthly Revenue</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {formatRupees(kpis?.revenueThisMonthPaise)}
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">
            {kpis?.revenueGrowthPct ?? 0}% vs last mo.
          </p>
        </Card>
      </div>

      {/* Revenue Area Chart */}
      <RevenueChart
        data={dashboardData?.revenueSeries || []}
        currentMonthPaise={kpis?.revenueThisMonthPaise || 0}
        growthPct={kpis?.revenueGrowthPct || 0}
      />

      {/* Grid: Popular Plan & Recent Payments & Expiring Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Plan & Quick Stats (1 Col) */}
        <div className="space-y-6">
          <Card className="p-5 bg-gradient-to-br from-charcoal-800 to-charcoal-850 border-lime-500/30 space-y-3">
            <div className="flex items-center gap-2 text-lime-400">
              <Sparkles className="w-5 h-5" />
              <CardTitle className="text-base text-white">Top Performing Plan</CardTitle>
            </div>

            {dashboardData?.popularPlan ? (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-black text-white">
                    {dashboardData.popularPlan.name}
                  </h4>
                  <Badge variant="lime" size="sm">
                    {dashboardData.popularPlan.category}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300">
                  Leading tier with{' '}
                  <strong className="text-lime-400 font-bold">
                    {dashboardData.popularPlan.activeCount} active subscriptions
                  </strong>
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active subscriptions data yet.</p>
            )}
          </Card>

          {/* Dev Cron Testing Controls */}
          <Card className="p-5 space-y-3 bg-charcoal-850 border-charcoal-700">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-lime-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Dev Background Job Triggers
              </h4>
            </div>
            <p className="text-[11px] text-slate-400">
              Manually trigger background cron tasks in development to verify their immediate effects.
            </p>

            {jobFeedback && (
              <div className="p-2.5 rounded-xl bg-lime-500/15 border border-lime-500/30 text-lime-400 text-xs">
                {jobFeedback}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs gap-1.5 justify-start"
                disabled={isRunningJob}
                onClick={() => handleRunDevJob('expire-subscriptions')}
              >
                <Play className="w-3.5 h-3.5 text-lime-400" />
                Run Midnight Subscriptions Expiry Job
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs gap-1.5 justify-start"
                disabled={isRunningJob}
                onClick={() => handleRunDevJob('deactivate-coupons')}
              >
                <Play className="w-3.5 h-3.5 text-lime-400" />
                Run Expired Coupons Deactivator Job
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs gap-1.5 justify-start"
                disabled={isRunningJob}
                onClick={() => handleRunDevJob('renewal-alerts')}
              >
                <Play className="w-3.5 h-3.5 text-lime-400" />
                Run 7-Day Renewal Alerts Job
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Successful Payments (2 Cols) */}
        <div className="lg:col-span-2">
          <Card className="space-y-4">
            <CardHeader className="mb-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-lime-400" />
                <CardTitle>Recent Payments Ledger</CardTitle>
              </div>
            </CardHeader>

            {!dashboardData?.recentPayments || dashboardData.recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No recent payments recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {dashboardData.recentPayments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750/80 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center font-bold text-lime-400">
                        {payment.user?.fullName?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">
                          {payment.user?.fullName || 'Member'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {payment.plan?.planName || 'Plan'} • {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-lime-400">
                        {formatRupees(payment.finalAmountPaise)}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {payment.paymentMethod}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
