import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Link } from 'react-router-dom';

export const LeaveBalanceCard: React.FC = () => {
  const { effectiveUser } = useAuth();
  const { getEmployeeBalance } = useHRMS();

  if (!effectiveUser) return null;
  const balance = getEmployeeBalance(effectiveUser.id);

  const leaveTypes = [
    {
      title: 'Annual Paid',
      remaining: balance.paid.remaining,
      total: balance.paid.total,
      used: balance.paid.used,
    },
    {
      title: 'Sick Leave',
      remaining: balance.sick.remaining,
      total: balance.sick.total,
      used: balance.sick.used,
    },
    {
      title: 'Casual Leave',
      remaining: balance.casual.remaining,
      total: balance.casual.total,
      used: balance.casual.used,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Leave & Time-Off Balance</CardTitle>
          <p className="text-xs text-slate-400 mt-0.5">Available quota for FY 2026</p>
        </div>
        <Link
          to="/leaves"
          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          Apply →
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {leaveTypes.map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
            >
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{item.title}</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{item.remaining}</span>
                <span className="text-xs text-slate-400">/ {item.total} days</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all"
                  style={{ width: `${(item.remaining / item.total) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5 block">{item.used} used</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
