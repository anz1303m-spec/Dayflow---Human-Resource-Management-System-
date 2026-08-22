import React from 'react';
import { AttendanceRecord } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatTime, formatDate } from '../../utils/formatters';
import { Calendar } from 'lucide-react';

export const WeeklyCalendar: React.FC<{ records: AttendanceRecord[] }> = ({ records }) => {
  const recentRecords = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 14);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-500" />
            <span>Recent Attendance Timeline</span>
          </CardTitle>
          <p className="text-xs text-slate-500">Daily punch logs, working hours, and status breakdown</p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Check In</th>
                <th className="pb-3 px-3">Check Out</th>
                <th className="pb-3 px-3">Working Hours</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(r.date)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {formatTime(r.checkIn)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {formatTime(r.checkOut)}
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">
                    {r.totalHours ? `${r.totalHours.toFixed(1)} hrs` : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <Badge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 italic">
                    {r.note || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
