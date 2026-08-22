import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { CheckInOutCard } from '../components/dashboard/CheckInOutCard';
import { WeeklyCalendar } from '../components/attendance/WeeklyCalendar';
import { AdminAttendanceTable } from '../components/attendance/AdminAttendanceTable';
import { CalendarCheck } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { effectiveUser, isAdminOrHr } = useAuth();
  const { getEmployeeAttendance } = useHRMS();

  if (!effectiveUser) return null;
  const myAttendance = getEmployeeAttendance(effectiveUser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-brand-600" />
            <span>Attendance &amp; Workday Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Log your daily punches, track working hours, and break durations.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <CheckInOutCard />
        <WeeklyCalendar records={myAttendance} />
      </div>

      {isAdminOrHr && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <AdminAttendanceTable />
        </div>
      )}
    </div>
  );
};
