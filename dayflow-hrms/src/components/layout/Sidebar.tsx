import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarClock,
  CreditCard,
  BarChart3,
  UserCircle,
  LogOut,
  Clock,
  Play,
  Square,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const Sidebar: React.FC = () => {
  const { effectiveUser, isAdminOrHr, logout } = useAuth();
  const { getTodayAttendance, clockIn, clockOut, leaveRequests } = useHRMS();

  const todayRecord = effectiveUser ? getTodayAttendance(effectiveUser.id) : undefined;
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'pending').length;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Attendance', path: '/attendance', icon: <CalendarCheck className="h-4 w-4" /> },
    {
      label: 'Leave Management',
      path: '/leaves',
      icon: <CalendarClock className="h-4 w-4" />,
      badge: isAdminOrHr && pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
    },
    { label: 'Payroll & Slips', path: '/payroll', icon: <CreditCard className="h-4 w-4" /> },
    { label: 'My Profile', path: `/profile/${effectiveUser?.id || 'emp-001'}`, icon: <UserCircle className="h-4 w-4" /> },
  ];

  const adminNavItems = [
    { label: 'Employee Directory', path: '/employees', icon: <Users className="h-4 w-4" /> },
    { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <aside className="w-56 shrink-0 hidden lg:flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-[calc(100vh-3.5rem)] py-5 px-3 transition-colors">
      <div className="space-y-5">

        {/* Main Navigation */}
        <div className="space-y-0.5">
          <div className="px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Main Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span className="text-[13px]">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Admin Section */}
        {isAdminOrHr && (
          <div className="space-y-0.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              HR Admin
            </div>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                {item.icon}
                <span className="text-[13px]">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">

        {/* Quick punch widget */}
        {effectiveUser && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-400" />
                Workday
              </span>
              <span className={`text-[11px] font-semibold ${isCheckedIn ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isCheckedIn ? 'Active' : todayRecord?.checkOut ? 'Done' : 'Not started'}
              </span>
            </div>

            {todayRecord?.checkIn && (
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>In: {todayRecord.checkIn}</span>
                {todayRecord.checkOut && <span>Out: {todayRecord.checkOut}</span>}
              </div>
            )}

            {!isCheckedIn ? (
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs"
                onClick={() => clockIn(effectiveUser.id)}
                leftIcon={<Play className="h-3 w-3" />}
              >
                Check In
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => clockOut(effectiveUser.id)}
                leftIcon={<Square className="h-3 w-3" />}
              >
                Check Out
              </Button>
            )}
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-[13px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
