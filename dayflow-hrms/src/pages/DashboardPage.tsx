import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { CheckInOutCard } from '../components/dashboard/CheckInOutCard';
import { LeaveBalanceCard } from '../components/dashboard/LeaveBalanceCard';
import { AdminOverviewKPIs } from '../components/dashboard/AdminOverviewKPIs';
import { PendingApprovalsQueue } from '../components/dashboard/PendingApprovalsQueue';
import { WeeklyCalendar } from '../components/attendance/WeeklyCalendar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Bell, Calendar as CalIcon, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { effectiveUser, isAdminOrHr } = useAuth();
  const { getEmployeeAttendance } = useHRMS();

  if (!effectiveUser) return null;
  const myAttendance = getEmployeeAttendance(effectiveUser.id);

  return (
    <div className="space-y-5">

      {/* Greeting — simple, no gradient */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-0.5">
            Welcome back, {effectiveUser.role}
          </p>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {effectiveUser.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {effectiveUser.designation} &bull; {effectiveUser.department}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrHr ? (
            <Link to="/employees">
              <Button variant="outline" size="sm" leftIcon={<UserCheck className="h-3.5 w-3.5" />}>
                Manage Workforce
              </Button>
            </Link>
          ) : (
            <Link to="/leaves">
              <Button variant="outline" size="sm" leftIcon={<Calendar className="h-3.5 w-3.5" />}>
                Request Time-Off
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isAdminOrHr && (
        <div className="space-y-5">
          <AdminOverviewKPIs />
          <PendingApprovalsQueue />
        </div>
      )}

      {/* Employee Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <CheckInOutCard />
          <LeaveBalanceCard />
          <WeeklyCalendar records={myAttendance} />
        </div>

        <div className="space-y-5">
          {/* Upcoming Holidays */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalIcon className="h-3.5 w-3.5 text-slate-400" />
                Upcoming Holidays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Labor Day', date: 'Sep 1, 2025' },
                  { name: 'Thanksgiving Day', date: 'Nov 27, 2025' },
                  { name: 'Christmas Day', date: 'Dec 25, 2025' },
                ].map((holiday) => (
                  <div
                    key={holiday.name}
                    className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-200">{holiday.name}</div>
                      <div className="text-slate-400 text-[10px]">Official holiday</div>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                      {holiday.date}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-slate-400" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="font-medium text-slate-700 dark:text-slate-200 mb-1">Annual Benefits Enrollment</div>
                  <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Open enrollment for FY 2026 health & dental benefits will launch next week.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="font-medium text-slate-700 dark:text-slate-200 mb-1">Q3 Performance Reviews</div>
                  <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Q3 review cycles begin Oct 1. Self-assessments due September 28th.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
