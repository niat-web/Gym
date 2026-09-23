import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { referralsApi } from '../../services/referrals.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Gift, Users, CheckCircle2, Trophy, Coins } from 'lucide-react';

export const OwnerReferralsPage: React.FC = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['adminReferralSummary'],
    queryFn: async () => {
      const res = await referralsApi.getAdminSummary();
      return res.data || null;
    },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-lime-400" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Referrals & Loyalty Program
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Performance metrics for member-driven viral referral invitations and conversions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-charcoal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Invitations Sent</p>
              <p className="text-3xl font-black text-white mt-1">
                {summary?.totalReferralsInvited ?? 0}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-charcoal-750 flex items-center justify-center text-slate-300">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-charcoal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Successful Conversions</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">
                {summary?.totalConversions ?? 0}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-charcoal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Conversion Rate</p>
              <p className="text-3xl font-black text-lime-400 mt-1">
                {summary?.totalReferralsInvited
                  ? Math.round((summary.totalConversions / summary.totalReferralsInvited) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Referrers Leaderboard */}
      <Card className="space-y-4">
        <CardHeader className="mb-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <CardTitle>Top Referrers Leaderboard</CardTitle>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading leaderboard...</div>
        ) : !summary?.topReferrers || summary.topReferrers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No referral conversions recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {summary.topReferrers.map((refDoc: any, idx: number) => {
              const referrer = refDoc.referrer;
              return (
                <div
                  key={refDoc.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750/80 text-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-lime-500/20 text-lime-400 flex items-center justify-center font-black text-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{referrer?.fullName}</h4>
                      <p className="font-mono text-[11px] text-slate-400">
                        Code: {refDoc.referralCode} • {referrer?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-extrabold text-lime-400 text-sm">
                        {refDoc.successfulConversions} Conversions
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {referrer?.loyaltyPoints || 0} loyalty points
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
