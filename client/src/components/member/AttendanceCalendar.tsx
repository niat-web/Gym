import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card.js';
import { AttendanceEntry } from '../../types/index.js';
import { formatDate, formatTime } from '../../lib/formatters.js';
import { CalendarCheck, CheckCircle2, Clock } from 'lucide-react';

interface AttendanceCalendarProps {
  attendanceLog: AttendanceEntry[];
  startsOn?: string;
  expiresOn?: string;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendanceLog = [],
  startsOn,
  expiresOn,
}) => {
  // Sort descending
  const sortedLogs = [...attendanceLog].sort(
    (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
  );

  return (
    <Card className="space-y-4">
      <CardHeader className="mb-0">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-lime-500" />
          <CardTitle>Attendance Log</CardTitle>
        </div>
        <span className="text-xs font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/20">
          {attendanceLog.length} Check-ins
        </span>
      </CardHeader>

      {attendanceLog.length === 0 ? (
        <div className="text-center py-8 text-slate-400 space-y-2">
          <Clock className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs">No check-ins recorded for this subscription yet.</p>
          <p className="text-[11px] text-slate-500">
            Show your QR pass to the trainer at the front desk when you visit!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {sortedLogs.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-charcoal-850 border border-charcoal-750/80 hover:border-charcoal-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-lime-500/15 flex items-center justify-center text-lime-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{formatDate(entry.checkInTime)}</p>
                  <p className="text-[10px] text-slate-400">
                    Checked in at {formatTime(entry.checkInTime)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 bg-charcoal-800 px-2 py-0.5 rounded border border-charcoal-700">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
