import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { usersApi } from '../../services/users.api.js';
import { checkinApi, CheckInResult } from '../../services/checkin.api.js';
import { User } from '../../types/index.js';
import { Search, QrCode, CheckCircle, AlertCircle, Dumbbell, UserCheck, Clock } from 'lucide-react';

interface CheckInSearchProps {
  onCheckInSuccess: (result: CheckInResult) => void;
  onOpenScanner?: () => void;
}

export const CheckInSearch: React.FC<CheckInSearchProps> = ({
  onCheckInSuccess,
  onOpenScanner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCheckInId, setActiveCheckInId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await usersApi.listUsers({
          search: searchTerm.trim(),
          pageSize: 5,
          role: 'member',
        });
        if (res.success && res.data) {
          setUsers(res.data.items);
        }
      } catch (err: any) {
        setErrorMessage('Failed to search members');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleMarkAttendance = async (member: User) => {
    setActiveCheckInId(member.id);
    setErrorMessage(null);

    try {
      const res = await checkinApi.checkIn({ memberId: member.id });
      if (res.success && res.data) {
        onCheckInSuccess(res.data);
      } else {
        setErrorMessage(res.error?.message || 'Check-in refused by system');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || 'Attendance refused: No active subscription or quota exhausted'
      );
    } finally {
      setActiveCheckInId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input & QR Trigger */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search member by Name or Phone (e.g. 9876543212)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            autoFocus
          />
        </div>

        {onOpenScanner && (
          <Button variant="lime" className="gap-2 font-bold shrink-0" onClick={onOpenScanner}>
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Scan QR</span>
          </Button>
        )}
      </div>

      {/* Error / Refusal Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Search Results List */}
      {isLoading ? (
        <div className="p-6 text-center text-xs text-slate-400">Searching members directory...</div>
      ) : users.length > 0 ? (
        <div className="space-y-2.5">
          {users.map((member) => {
            const hasActiveSub = member.activeSubscription;
            const isSuspended = member.gymMeta?.membershipStatus === 'suspended';

            return (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750 hover:border-charcoal-700 transition-all gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-charcoal-750 border border-charcoal-700 flex items-center justify-center text-sm font-black text-lime-400 shrink-0">
                    {member.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{member.fullName}</h4>
                      <Badge
                        variant={
                          isSuspended
                            ? 'danger'
                            : hasActiveSub
                            ? 'lime'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {isSuspended
                          ? 'Suspended'
                          : hasActiveSub
                          ? 'Active Plan'
                          : 'No Active Plan'}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{member.phone}</p>
                  </div>
                </div>

                <Button
                  variant="lime"
                  size="sm"
                  className="font-bold text-xs gap-1.5 self-end sm:self-auto"
                  isLoading={activeCheckInId === member.id}
                  onClick={() => handleMarkAttendance(member)}
                >
                  <UserCheck className="w-4 h-4" />
                  Mark Attendance
                </Button>
              </div>
            );
          })}
        </div>
      ) : searchTerm.trim().length > 1 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-charcoal-850 rounded-2xl border border-charcoal-750">
          No members found matching "{searchTerm}".
        </div>
      ) : null}
    </div>
  );
};
