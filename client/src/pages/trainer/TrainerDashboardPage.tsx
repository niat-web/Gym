import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/dashboard.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { TodayCheckInList } from '../../components/trainer/TodayCheckInList.js';
import { QRScannerModal } from '../../components/trainer/QRScannerModal.js';
import { CheckInConfirmation } from '../../components/trainer/CheckInConfirmation.js';
import { CheckInResult } from '../../services/checkin.api.js';
import { formatDate } from '../../lib/formatters.js';
import {
  Users,
  QrCode,
  Clock,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export const TrainerDashboardPage: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [confirmedCheckIn, setConfirmedCheckIn] = useState<CheckInResult | null>(null);

  const { data: dashData, isLoading, refetch } = useQuery({
    queryKey: ['trainerDashboard'],
    queryFn: async () => {
      const res = await dashboardApi.getTrainerDashboard();
      return res.data || null;
    },
    refetchInterval: 15000, // Auto-refresh every 15s for front-desk activity
  });

  const handleCheckInSuccess = (result: CheckInResult) => {
    setConfirmedCheckIn(result);
    refetch();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Front Desk & Trainer Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time check-in stream, members expiring soon, and assigned client rosters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="gap-2 font-bold"
            onClick={() => setIsScannerOpen(true)}
          >
            <QrCode className="w-4 h-4 text-lime-400" />
            Scan QR
          </Button>

          <Link to="/trainer/checkin">
            <Button variant="lime" className="gap-2 font-bold shadow-lime-glow-sm">
              <UserCheck className="w-4 h-4" />
              Mark Attendance
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-charcoal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Check-Ins Today</p>
              <p className="text-3xl font-black text-lime-400 mt-1">
                {dashData?.todayCheckInCount ?? 0}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-charcoal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Expiring (7 Days)</p>
              <p className="text-3xl font-black text-amber-400 mt-1">
                {dashData?.expiringSoon?.length ?? 0}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-charcoal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Assigned Members</p>
              <p className="text-3xl font-black text-white mt-1">
                {dashData?.assignedMembers?.length ?? 0}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-charcoal-750 border border-charcoal-700 flex items-center justify-center text-slate-300">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Grid: Live Check-Ins feed (2 cols) & Expiring Soon Watchlist (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayCheckInList items={dashData?.todayCheckIns || []} isLoading={isLoading} />
        </div>

        {/* Expiring Soon Watchlist */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <CardHeader className="mb-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <CardTitle className="text-base">Expiring Soon Watchlist</CardTitle>
              </div>
            </CardHeader>

            {!dashData?.expiringSoon || dashData.expiringSoon.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No active memberships expiring in the next 7 days.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {dashData.expiringSoon.map((sub: any) => {
                  const user = sub.user;
                  return (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{user?.fullName}</span>
                        <Badge variant="warning" size="sm">
                          {sub.daysUntilExpiry} days left
                        </Badge>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{user?.phone}</span>
                        <span>Expires: {formatDate(sub.expiresOn)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={handleCheckInSuccess}
      />

      {/* Attendance Verification Modal */}
      <CheckInConfirmation
        result={confirmedCheckIn}
        isOpen={!!confirmedCheckIn}
        onClose={() => setConfirmedCheckIn(null)}
      />
    </div>
  );
};
