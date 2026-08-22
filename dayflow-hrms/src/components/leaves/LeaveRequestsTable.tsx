import React, { useState } from 'react';
import { LeaveRequest } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';
import { CalendarClock, Trash2 } from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext';

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  canCancel?: boolean;
}

export const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  requests,
  canCancel = true,
}) => {
  const { cancelLeaveRequest } = useHRMS();
  const [filterStatus, setFilterStatus] = useState<string>('all');


  const filtered = requests.filter(r => filterStatus === 'all' || r.status === filterStatus);


  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-brand-500" />
            <span>Leave Applications &amp; History</span>
          </CardTitle>
          <p className="text-xs text-slate-500">Track application statuses and approver feedback</p>
        </div>


        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="all">All Statuses ({requests.length})</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </CardHeader>


      <CardContent>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No leave applications found for this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 px-3">Applicant</th>
                  <th className="pb-3 px-3">Leave Type</th>
                  <th className="pb-3 px-3">Dates</th>
                  <th className="pb-3 px-3">Duration</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Approver Notes</th>
                  {canCancel && <th className="pb-3 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{req.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{req.department}</div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="purple" size="sm">{req.leaveType}</Badge>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      {req.totalDays} day{req.totalDays > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                      {req.reason}
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={req.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500 italic max-w-[180px] truncate">
                      {req.approverComments ? `"${req.approverComments}"` : '-'}
                    </td>
                    {canCancel && (
                      <td className="py-3 px-3 text-right">
                        {req.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelLeaveRequest(req.id)}
                            leftIcon={<Trash2 className="h-3.5 ws-3.5 text-rose-500" />}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
