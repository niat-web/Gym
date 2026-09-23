import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkinApi, CheckInResult } from '../../services/checkin.api.js';
import { CheckInSearch } from '../../components/trainer/CheckInSearch.js';
import { CheckInConfirmation } from '../../components/trainer/CheckInConfirmation.js';
import { TodayCheckInList } from '../../components/trainer/TodayCheckInList.js';
import { QRScannerModal } from '../../components/trainer/QRScannerModal.js';
import { Card } from '../../components/ui/Card.js';
import { QrCode, UserCheck } from 'lucide-react';

export const TrainerCheckInPage: React.FC = () => {
  const [confirmedCheckIn, setConfirmedCheckIn] = useState<CheckInResult | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Fetch today's check-ins
  const { data: todayItems = [], refetch, isLoading } = useQuery({
    queryKey: ['todayCheckIns'],
    queryFn: async () => {
      const res = await checkinApi.getToday();
      return res.data || [];
    },
    refetchInterval: 10000,
  });

  const handleCheckInSuccess = (result: CheckInResult) => {
    setConfirmedCheckIn(result);
    refetch();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-lime-400" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Front Desk Attendance Terminal
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Search member by name/phone or use the camera QR scanner to record attendance in 2 taps.
        </p>
      </div>

      {/* Main Terminal Card */}
      <Card className="p-6 space-y-6 border-lime-500/40 bg-gradient-to-b from-charcoal-800 to-charcoal-850">
        <CheckInSearch
          onCheckInSuccess={handleCheckInSuccess}
          onOpenScanner={() => setIsScannerOpen(true)}
        />
      </Card>

      {/* Today's Live Check-Ins Stream */}
      <TodayCheckInList items={todayItems} isLoading={isLoading} />

      {/* Camera QR Scanner */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={handleCheckInSuccess}
      />

      {/* Instant Success Modal */}
      <CheckInConfirmation
        result={confirmedCheckIn}
        isOpen={!!confirmedCheckIn}
        onClose={() => setConfirmedCheckIn(null)}
      />
    </div>
  );
};
