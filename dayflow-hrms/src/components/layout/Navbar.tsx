import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  Mail,
  Moon,
  Sun,
  Clock,
  LogOut,
  User as UserIcon,
  Shield,
  Check,
  SlidersHorizontal,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

export const Navbar: React.FC = () => {
  const { currentUser, effectiveUser, isAdminOrHr, logout, allEmployees, masqueradeAs, masqueradingId } = useAuth();
  const { notifications, unreadNotificationCount, unreadEmailCount, setIsEmailModalOpen, markAllNotificationsAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState<boolean>(false); // Default to light

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [showEmployeeSwitcher, setShowEmployeeSwitcher] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/signin');
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  Dayflow
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    HRMS
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                  Every workday, perfectly aligned.
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Clock & Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
              <Clock className="h-3 w-3" />
              <span>{currentTime || '12:00:00 PM'}</span>
            </div>

            {currentUser?.role === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => setShowEmployeeSwitcher(!showEmployeeSwitcher)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Switch View</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>

                {showEmployeeSwitcher && (
                  <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-card-hover py-1.5 z-50">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-50 dark:border-slate-800">
                      Preview as employee
                    </div>
                    <button
                      onClick={() => { masqueradeAs(null); setShowEmployeeSwitcher(false); }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        !masqueradingId ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-slate-400" />
                        <span>Admin Self</span>
                      </div>
                      {!masqueradingId && <Check className="h-3.5 w-3.5 text-slate-600" />}
                    </button>
                    {allEmployees.filter(e => e.id !== 'emp-001').map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => { masqueradeAs(emp.id); setShowEmployeeSwitcher(false); }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          masqueradingId === emp.id ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={emp.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                          <span className="truncate">{emp.fullName}</span>
                        </div>
                        {masqueradingId === emp.id && <Check className="h-3.5 w-3.5 text-slate-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">

            {/* Email */}
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Email"
            >
              <Mail className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} />
              {unreadEmailCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-white">
                  {unreadEmailCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell style={{ width: '18px', height: '18px' }} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-slate-600" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-1.5 w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-card-hover py-1.5 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Notifications ({notifications.length})
                    </span>
                    <button onClick={markAllNotificationsAsRead} className="text-[11px] text-slate-500 hover:text-slate-700 hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No notifications right now.</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800 ${n.read ? 'opacity-60' : ''}`}>
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun style={{ width: '18px', height: '18px' }} className="text-amber-400" /> : <Moon style={{ width: '18px', height: '18px' }} />}
            </button>

            {/* User dropdown */}
            {effectiveUser && (
              <div className="relative ml-1">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-700"
                >
                  <Avatar
                    name={effectiveUser.fullName}
                    avatar={effectiveUser.avatar}
                    size="sm"
                    rounded="md"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-tight">
                      {effectiveUser.fullName}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {effectiveUser.role === 'admin' ? 'Admin' : effectiveUser.designation}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-card-hover py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{effectiveUser.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{effectiveUser.email}</div>
                      <div className="mt-1.5">
                        <Badge status={effectiveUser.status} size="sm" />
                      </div>
                    </div>

                    <Link
                      to={`/profile/${effectiveUser.id}`}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span>My Profile & Documents</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
