import React from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { CheckInResult } from '../../services/checkin.api.js';
import { formatTime } from '../../lib/formatters.js';
import { CheckCircle2, AlertCircle, Sparkles, UserCheck, Clock } from 'lucide-react';

interface CheckInConfirmationProps {
  result: CheckInResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CheckInConfirmation: React.FC<CheckInConfirmationProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  if (!result) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center p-3 space-y-5">
        {/* Animated Check icon */}
        <div className="w-16 h-16 rounded-full bg-lime-500/20 border-2 border-lime-500 flex items-center justify-center mx-auto text-lime-400">
          <CheckCircle2 className="w-9 h-9 animate-pulse-subtle" />
        </div>

        {/* Member Name & Status */}
        <div className="space-y-1.5">
          <Badge variant={result.isFirstToday ? 'lime' : 'info'} size="sm">
            {result.isFirstToday ? '1st Check-In Today' : 'Re-Entry (Same Day)'}
          </Badge>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {result.member.fullName}
          </h2>
          <p className="text-xs font-mono text-slate-400">{result.member.phone}</p>
        </div>

        {/* Quota breakdown */}
        <div className="bg-charcoal-800 p-4 rounded-2xl border border-charcoal-700/80 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Check-in Timestamp</span>
            <span className="font-bold text-white">{formatTime(result.checkInTime)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Visits Used</span>
            <span className="font-bold text-slate-200">{result.daysUsed} visits</span>
          </div>

          <div className="pt-2 border-t border-charcoal-700 flex justify-between items-baseline">
            <span className="font-semibold text-slate-200">Visits Remaining</span>
            <span className="text-xl font-black text-lime-400">
              {result.daysRemaining} <span className="text-xs text-slate-400">/ {result.allocatedDays}</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400">{result.message}</p>

        <Button variant="lime" className="w-full font-bold" onClick={onClose}>
          Ready for Next Member
        </Button>
      </div>
    </Modal>
  );
};
