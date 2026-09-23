import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../services/users.api.js';
import { checkinApi, CheckInResult } from '../../services/checkin.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { CheckInConfirmation } from '../../components/trainer/CheckInConfirmation.js';
import { formatDate, formatTime } from '../../lib/formatters.js';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Dumbbell,
  CheckCircle2,
  ArrowLeft,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export const TrainerMemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [confirmedCheckIn, setConfirmedCheckIn] = useState<CheckInResult | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Member Details
  const {
    data: member,
    isLoading: isMemberLoading,
    refetch: refetchMember,
  } = useQuery({
    queryKey: ['trainerMemberDetail', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await usersApi.getUserById(id);
      return res.data || null;
    },
  });

  // Fetch Member Attendance
  const { data: attendanceLogs = [], refetch: refetchAttendance } = useQuery({
    queryKey: ['trainerMemberAttendance', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await checkinApi.getHistory({ memberId: id });
      return res.data || [];
    },
  });

  const handleMarkAttendance = async () => {
    if (!id) return;
    setIsMarking(true);
    setErrorMsg(null);

    try {
      const res = await checkinApi.checkIn({ memberId: id });
      if (res.success && res.data) {
        setConfirmedCheckIn(res.data);
        refetchMember();
        refetchAttendance();
      } else {
        setErrorMsg(res.error?.message || 'Check-in refused');
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error?.message || 'Attendance refused: No active plan or quota exhausted'
      );
    } finally {
      setIsMarking(false);
    }
  };

  if (isMemberLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading member profile...</div>;
  }

  if (!member) {
    return <div className="p-12 text-center text-xs text-slate-400">Member not found.</div>;
  }

  const status = member.gymMeta?.membershipStatus || 'inactive';
  const sub: any = member.activeSubscription;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/trainer/members">
            <Button variant="secondary" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{member.fullName}</h1>
              <Badge
                variant={
                  status === 'active'
                    ? 'lime'
                    : status === 'expired'
                    ? 'warning'
                    : status === 'suspended'
                    ? 'danger'
                    : 'neutral'
                }
              >
                {status}
              </Badge>
            </div>
            <p className="text-xs font-mono text-slate-400">{member.phone}</p>
          </div>
        </div>

        <Button
          variant="lime"
          className="gap-2 font-bold shadow-lime-glow-sm"
          isLoading={isMarking}
          onClick={handleMarkAttendance}
        >
          <UserCheck className="w-4 h-4" />
          Mark Attendance Now
        </Button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Member Info & Active Subscription Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="space-y-4">
          <CardHeader className="mb-0">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-lime-400" />
              <CardTitle className="text-base">Profile Information</CardTitle>
            </div>
          </CardHeader>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-charcoal-750">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-200">{member.email || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-charcoal-750">
              <span className="text-slate-400">Joined On</span>
              <span className="text-slate-200">{formatDate(member.gymMeta?.joinedOn)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-charcoal-750">
              <span className="text-slate-400">Referral Code</span>
              <span className="font-mono text-lime-400 font-bold">{member.myReferralCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-charcoal-750">
              <span className="text-slate-400">Loyalty Points</span>
              <span className="font-bold text-slate-200">{member.loyaltyPoints} pts</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Assigned Trainer</span>
              <span className="text-slate-200">
                {(member.gymMeta?.assignedTrainer as any)?.fullName || 'None Assigned'}
              </span>
            </div>
          </div>
        </Card>

        {/* Current Subscription Card */}
        <Card className="space-y-4">
          <CardHeader className="mb-0">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-lime-400" />
              <CardTitle className="text-base">Active Membership Plan</CardTitle>
            </div>
          </CardHeader>

          {sub ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-charcoal-850 p-3 rounded-xl border border-charcoal-750">
                <span className="font-bold text-white text-sm">
                  {sub.planSnapshot?.planName || sub.plan?.planName}
                </span>
                <Badge variant="lime" size="sm">
                  {sub.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="bg-charcoal-850 p-2.5 rounded-xl border border-charcoal-750">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Visits Remaining
                  </span>
                  <p className="text-base font-extrabold text-lime-400 mt-0.5">
                    {sub.daysRemaining} / {sub.allocatedDays}
                  </p>
                </div>

                <div className="bg-charcoal-850 p-2.5 rounded-xl border border-charcoal-750">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Expires On
                  </span>
                  <p className="text-xs font-bold text-slate-200 mt-1">
                    {formatDate(sub.expiresOn)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No active subscription found for this member.
            </div>
          )}
        </Card>
      </div>

      {/* Attendance Log Table */}
      <Card className="space-y-4">
        <CardHeader className="mb-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-lime-400" />
            <CardTitle className="text-base">Attendance History</CardTitle>
          </div>
          <span className="text-xs text-slate-400">{attendanceLogs.length} total visits</span>
        </CardHeader>

        {attendanceLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No attendance records found for this member.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {attendanceLogs.map((log: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-lime-400" />
                  <span className="font-bold text-slate-200">{formatDate(log.checkInTime)}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    ({formatTime(log.checkInTime)})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Marked by {log.markedBy}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Check In Confirmation Modal */}
      <CheckInConfirmation
        result={confirmedCheckIn}
        isOpen={!!confirmedCheckIn}
        onClose={() => setConfirmedCheckIn(null)}
      />
    </div>
  );
};
