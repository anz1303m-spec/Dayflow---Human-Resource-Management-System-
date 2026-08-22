const fs = require('fs');
const path = require('path');

function saveFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + relPath);
}

// 1. MasqueradeBanner.tsx
saveFile('src/components/layout/MasqueradeBanner.tsx', `
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const MasqueradeBanner: React.FC = () => {
  const { masqueradingId, masqueradeAs, effectiveUser } = useAuth();

  if (!masqueradingId || !effectiveUser) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-sm flex items-center justify-between sticky top-0 z-50 animate-fadeIn">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-100" />
        <span>
          <strong>Admin Preview Active:</strong> Viewing Dayflow as <span className="underline font-bold">{effectiveUser.fullName}</span> ({effectiveUser.designation} &bull; {effectiveUser.department})
        </span>
      </div>
      <button
        onClick={() => masqueradeAs(null)}
        className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-all font-semibold"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Exit Preview</span>
      </button>
    </div>
  );
};
`);

// 2. EmailSimulatorModal.tsx
saveFile('src/components/layout/EmailSimulatorModal.tsx', `
import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Modal } from '../ui/Modal';
import { Mail, Clock, CheckCircle2, AlertCircle, FileText, Lock, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const EmailSimulatorModal: React.FC = () => {
  const { 
    emails, 
    isEmailModalOpen, 
    setIsEmailModalOpen, 
    selectedEmail, 
    setSelectedEmail, 
    markEmailAsRead 
  } = useNotifications();

  const handleSelectEmail = (email: typeof emails[0]) => {
    setSelectedEmail(email);
    markEmailAsRead(email.id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'verification':
        return <Lock className="h-4 w-4 text-purple-500" />;
      case 'leave':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'payroll':
        return <FileText className="h-4 w-4 text-emerald-500" />;
      default:
        return <Mail className="h-4 w-4 text-brand-500" />;
    }
  };

  return (
    <Modal
      isOpen={isEmailModalOpen}
      onClose={() => setIsEmailModalOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white">Dayflow Simulated Email Inbox</span>
            <span className="ml-2 text-xs bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold px-2 py-0.5 rounded-full">
              {emails.length} Messages
            </span>
          </div>
        </div>
      }
      description="Live corporate email triggers dispatched for verification OTPs, leave approval decisions, and salary slips."
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[420px]">
        {/* Email List Sidebar */}
        <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 pr-3 max-h-[460px] overflow-y-auto space-y-2">
          {emails.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No simulated emails dispatched yet.
            </div>
          ) : (
            emails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={\`p-3 rounded-xl cursor-pointer transition-all border text-left \${
                    isSelected
                      ? 'bg-brand-50/80 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 shadow-sm'
                      : email.read
                      ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'bg-brand-50/30 dark:bg-slate-800/60 border-brand-200 dark:border-slate-700 font-semibold'
                  }\`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      {getCategoryIcon(email.category)}
                      <span className="truncate">{email.to}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDate(email.sentAt)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {email.subject}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {email.preview}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Email Detail View */}
        <div className="md:col-span-7 flex flex-col justify-between pl-2">
          {selectedEmail ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Dayflow Automated Notification
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {selectedEmail.subject}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                    {new Date(selectedEmail.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>To:</strong> {selectedEmail.to}</div>
                  <div><strong>From:</strong> Dayflow Cloud Delivery &lt;notifications@dayflow.corp&gt;</div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                {selectedEmail.verificationCode && (
                  <div className="mb-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-center">
                    <span className="text-xs text-purple-700 dark:text-purple-300 uppercase font-semibold">One-Time Verification Passcode</span>
                    <div className="text-3xl font-mono font-black text-purple-900 dark:text-purple-200 tracking-widest my-1">
                      {selectedEmail.verificationCode}
                    </div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">Valid for 15 minutes</span>
                  </div>
                )}

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {selectedEmail.body}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center text-slate-400">
              <Mail className="h-12 w-12 stroke-[1.2] mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">Select an email from the left to read full contents</p>
              <p className="text-xs mt-1 text-slate-400">Any leave applications, payroll disbursals, or account OTPs will appear here in real time.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
`);

// 3. Navbar.tsx
saveFile('src/components/layout/Navbar.tsx', `
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Bell, 
  Mail, 
  Moon, 
  Sun, 
  Search, 
  Clock, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  Check, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { currentUser, effectiveUser, isAdminOrHr, logout, allEmployees, masqueradeAs, masqueradingId } = useAuth();
  const { notifications, unreadNotificationCount, unreadEmailCount, setIsEmailModalOpen, markAllNotificationsAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/signin');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand Tagline */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Dayflow
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    HRMS
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  Every workday, perfectly aligned.
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Live Digital Clock & Quick Search */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              <Clock className="h-3.5 w-3.5 text-brand-500 animate-pulse" />
              <span className="font-mono">{currentTime || '12:00:00 PM'}</span>
            </div>

            {/* Quick Switcher (Admin preview feature) */}
            {currentUser?.role === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => setShowEmployeeSwitcher(!showEmployeeSwitcher)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-medium border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Switch Employee View</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {showEmployeeSwitcher && (
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      Preview Portal as Employee:
                    </div>
                    <button
                      onClick={() => { masqueradeAs(null); setShowEmployeeSwitcher(false); }}
                      className={\`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 \${
                        !masqueradingId ? 'font-bold text-brand-600 dark:text-brand-400 bg-brand-50/50' : 'text-slate-700 dark:text-slate-300'
                      }\`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-brand-600" />
                        <span>Eleanor Vance (Admin Self)</span>
                      </div>
                      {!masqueradingId && <Check className="h-3.5 w-3.5 text-brand-600" />}
                    </button>
                    {allEmployees.filter(e => e.id !== 'emp-001').map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => { masqueradeAs(emp.id); setShowEmployeeSwitcher(false); }}
                        className={\`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 \${
                          masqueradingId === emp.id ? 'font-bold text-brand-600 dark:text-brand-400 bg-brand-50/50' : 'text-slate-700 dark:text-slate-300'
                        }\`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={emp.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                          <span className="truncate">{emp.fullName} ({emp.department})</span>
                        </div>
                        {masqueradingId === emp.id && <Check className="h-3.5 w-3.5 text-brand-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2">
            
            {/* Simulated Email Trigger */}
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open Simulated Corporate Email Inbox"
            >
              <Mail className="h-5 w-5" />
              {unreadEmailCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm">
                  {unreadEmailCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500"></span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Notifications ({notifications.length})
                    </span>
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications right now.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className={\`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 \${n.read ? 'opacity-70' : 'bg-brand-50/20'}\`}>
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark / Light Mode"
            >
              {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Profile Avatar & Dropdown */}
            {effectiveUser && (
              <div className="relative ml-1">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-700/60"
                >
                  <img
                    src={effectiveUser.avatar}
                    alt={effectiveUser.fullName}
                    className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {effectiveUser.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                      {effectiveUser.role === 'admin' ? 'HR Director (Admin)' : effectiveUser.designation}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{effectiveUser.fullName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{effectiveUser.email}</div>
                      <div className="mt-1">
                        <Badge status={effectiveUser.status} size="sm" />
                      </div>
                    </div>

                    <Link
                      to={\`/profile/\${effectiveUser.id}\`}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      <span>My Profile &amp; Documents</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="h-4 w-4" />
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
`);

// 4. Sidebar.tsx
saveFile('src/components/layout/Sidebar.tsx', `
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
  CheckCircle,
  Play,
  Square
} from 'lucide-react';
import { Button } from '../ui/Button';

export const Sidebar: React.FC = () => {
  const { effectiveUser, isAdminOrHr, logout } = useAuth();
  const { getTodayAttendance, clockIn, clockOut, leaveRequests } = useHRMS();

  const todayRecord = effectiveUser ? getTodayAttendance(effectiveUser.id) : undefined;
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'pending').length;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Attendance', path: '/attendance', icon: <CalendarCheck className="h-5 w-5" /> },
    { 
      label: 'Leave Management', 
      path: '/leaves', 
      icon: <CalendarClock className="h-5 w-5" />,
      badge: isAdminOrHr && pendingLeavesCount > 0 ? pendingLeavesCount : undefined
    },
    { label: 'Payroll & Slips', path: '/payroll', icon: <CreditCard className="h-5 w-5" /> },
    { label: 'My Profile', path: \`/profile/\${effectiveUser?.id || 'emp-001'}\`, icon: <UserCircle className="h-5 w-5" /> },
  ];

  const adminNavItems = [
    { label: 'Employee Directory', path: '/employees', icon: <Users className="h-5 w-5" /> },
    { label: 'Analytics & Reports', path: '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 transition-colors">
      <div className="space-y-6">
        
        {/* Main Navigation */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => \`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all \${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }\`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[11px] rounded-full font-bold bg-amber-500 text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Admin Management Section */}
        {isAdminOrHr && (
          <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              HR Administration
            </div>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => \`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all \${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }\`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Quick Punch Card & Logout */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        
        {/* Quick Check-in / Check-out Widget */}
        {effectiveUser && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand-500" />
                Workday Status
              </span>
              <span className={\`font-bold \${isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}\`}>
                {isCheckedIn ? 'Checked In' : todayRecord?.checkOut ? 'Checked Out' : 'Not Punched'}
              </span>
            </div>

            {todayRecord?.checkIn && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>In: {todayRecord.checkIn}</span>
                {todayRecord.checkOut && <span>Out: {todayRecord.checkOut}</span>}
              </div>
            )}

            {!isCheckedIn ? (
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs shadow-xs"
                onClick={() => clockIn(effectiveUser.id)}
                leftIcon={<Play className="h-3.5 w-3.5" />}
              >
                Check In Now
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                className="w-full text-xs"
                onClick={() => clockOut(effectiveUser.id)}
                leftIcon={<Square className="h-3.5 w-3.5" />}
              >
                Check Out
              </Button>
            )}
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
`);

console.log('Layout components generated!');