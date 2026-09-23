import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { ReferralData } from '../../types/index.js';
import { formatDate, formatRupees } from '../../lib/formatters.js';
import {
  Gift,
  Copy,
  Share2,
  Check,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Coins,
} from 'lucide-react';

interface ReferralStatsCardProps {
  data: ReferralData;
}

export const ReferralStatsCard: React.FC<ReferralStatsCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/register?ref=${data.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join FitCore Gym & Get ₹200 Off!',
          text: `Join me at FitCore Gym! Use my referral code ${data.referralCode} to get ₹200 off your first gym plan.`,
          url: shareUrl,
        });
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Code Banner */}
      <Card className="bg-gradient-to-br from-charcoal-800 via-charcoal-850 to-charcoal-900 border-lime-500/40 p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-lime-400" />
              <Badge variant="lime">Refer & Earn 500 Points</Badge>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Give ₹200, Get 500 Loyalty Points
            </h2>
            <p className="text-xs text-slate-300 max-w-lg">
              Share your referral code with friends. When they buy their first gym plan, they get ₹200 off instantly and you receive 500 loyalty points!
            </p>
          </div>

          {/* Code Box & Actions */}
          <div className="bg-charcoal-950 p-4 rounded-2xl border border-charcoal-700/80 space-y-3 shrink-0 sm:min-w-[280px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Your Referral Code
            </p>
            <div className="text-center font-mono font-black text-2xl tracking-widest text-lime-400 select-all">
              {data.referralCode}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 text-xs gap-1.5" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="lime" size="sm" className="flex-1 text-xs gap-1.5 font-bold" onClick={handleShare}>
                <Share2 className="w-3.5 h-3.5" />
                Share Link
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-charcoal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Friends Invited</p>
              <p className="text-2xl font-black text-white mt-1">{data.totalReferrals}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-charcoal-750 flex items-center justify-center text-slate-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-charcoal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Joined & Subscribed</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {data.successfulConversions}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-charcoal-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Loyalty Points Balance</p>
              <p className="text-2xl font-black text-lime-400 mt-1">{data.loyaltyPoints} pts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Referred Members List */}
      <Card className="space-y-4">
        <CardHeader className="mb-0">
          <CardTitle>Referred Friends</CardTitle>
          <span className="text-xs text-slate-400">
            {data.referredMembers.length} {data.referredMembers.length === 1 ? 'friend' : 'friends'}
          </span>
        </CardHeader>

        {data.referredMembers.length === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <Gift className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs">No referrals yet. Share your code to start earning reward points!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {data.referredMembers.map((member, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750/80"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-charcoal-750 flex items-center justify-center text-xs font-bold text-slate-300">
                    {member.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{member.fullName}</p>
                    <p className="text-[10px] text-slate-400">Joined on {formatDate(member.joinedOn)}</p>
                  </div>
                </div>

                <Badge variant={member.hasPurchased ? 'lime' : 'neutral'} size="sm">
                  {member.hasPurchased ? 'Plan Active (+500 pts)' : 'Registered'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
