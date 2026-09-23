import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore.js';
import { subscriptionsApi } from '../../services/subscriptions.api.js';
import { usersApi } from '../../services/users.api.js';
import { ActivePlanCard } from '../../components/member/ActivePlanCard.js';
import { AttendanceCalendar } from '../../components/member/AttendanceCalendar.js';
import { DigitalPassModal } from '../../components/common/DigitalPassModal.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { QrCode, Sparkles, Gift, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MemberHomePage: React.FC = () => {
  const { user } = useAuthStore();
  const [isOpenPass, setIsOpenPass] = useState(false);

  // Fetch active subscription
  const { data: subData, isLoading: isSubLoading, refetch } = useQuery({
    queryKey: ['myActiveSubscription'],
    queryFn: async () => {
      const res = await subscriptionsApi.getMyActive();
      return res.data || null;
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Welcome & QR Pass Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Hi, {user?.fullName ? user.fullName.split(' ')[0] : 'Member'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Welcome to your FitCore dashboard. Track your gym visits and active membership.
          </p>
        </div>

        <Button
          variant="lime"
          className="gap-2 font-bold shadow-lime-glow-sm shrink-0"
          onClick={() => setIsOpenPass(true)}
        >
          <QrCode className="w-4 h-4" />
          Digital Member Pass
        </Button>
      </div>

      {/* Active Membership Plan Card */}
      <ActivePlanCard subscription={subData || null} onOpenPass={() => setIsOpenPass(true)} />

      {/* Grid: Attendance History & Quick Promos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Calendar (2 cols) */}
        <div className="lg:col-span-2">
          <AttendanceCalendar
            attendanceLog={subData?.attendanceLog || []}
            startsOn={subData?.startsOn}
            expiresOn={subData?.expiresOn}
          />
        </div>

        {/* Side widgets: Refer & Earn + Plan Upgrade */}
        <div className="space-y-6">
          {/* Refer and Earn Banner */}
          <Card className="p-5 bg-gradient-to-br from-charcoal-800 to-charcoal-850 border-lime-500/30 space-y-3">
            <div className="flex items-center gap-2 text-lime-400">
              <Gift className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Refer & Earn Rewards</h3>
            </div>
            <p className="text-xs text-slate-300">
              Invite your workout buddies! They get ₹200 off and you earn 500 loyalty points on their first purchase.
            </p>
            <Link to="/member/refer">
              <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5 font-bold mt-1">
                View Referral Code
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>

          {/* Browse Store Banner */}
          <Card className="p-5 bg-charcoal-800 space-y-3">
            <div className="flex items-center gap-2 text-sky-400">
              <ShoppingBag className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Explore Plans</h3>
            </div>
            <p className="text-xs text-slate-400">
              Need personal training sessions or unlimited sauna access? Check out our Standard and Premium packages.
            </p>
            <Link to="/member/plans">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                Visit Plans Store
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Digital Pass Modal */}
      <DigitalPassModal
        user={user}
        subscription={subData || null}
        isOpen={isOpenPass}
        onClose={() => setIsOpenPass(false)}
      />
    </div>
  );
};
