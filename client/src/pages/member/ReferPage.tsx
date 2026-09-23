import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { referralsApi } from '../../services/referrals.api.js';
import { ReferralStatsCard } from '../../components/member/ReferralStatsCard.js';
import { Gift } from 'lucide-react';

export const ReferPage: React.FC = () => {
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['myReferralData'],
    queryFn: async () => {
      const res = await referralsApi.getMyReferral();
      return res.data || null;
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-lime-400" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Refer & Earn Rewards
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Invite friends to join FitCore. Track conversions and collect gym loyalty rewards.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading referral dashboard...</div>
      ) : referralData ? (
        <ReferralStatsCard data={referralData} />
      ) : (
        <div className="p-8 text-center text-xs text-slate-400">Failed to load referral data.</div>
      )}
    </div>
  );
};
