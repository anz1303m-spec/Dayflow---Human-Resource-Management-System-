const fs = require('fs');
const path = require('path');

function saveFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + relPath);
}

// 1. Dashboard: CheckInOutCard.tsx
saveFile('src/components/dashboard/CheckInOutCard.tsx', `
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Clock, Play, Square, Coffee, CheckCircle2 } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

export const CheckInOutCard: React.FC = () => {
  const { effectiveUser } = useAuth();
  const { getTodayAttendance, clockIn, clockOut } = useHRMS();

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [onBreak, setOnBreak] = useState<boolean>(false);

  const todayRecord = effectiveUser ? getTodayAttendance(effectiveUser.id) : undefined;
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  // Running timer when checked in
  useEffect(() => {
    let interval: any;
    if (isCheckedIn && !onBreak) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, onBreak]);

  // Initial elapsed calculation
  useEffect(() => {
    if (todayRecord?.checkIn && !todayRecord?.checkOut) {
      setElapsedSeconds(4 * 3600 + 15 * 60); // Demo seeded realistic elapsed
    } else if (todayRecord?.checkOut) {
      setElapsedSeconds(8.5 * 3600);
    } else {
      setElapsedSeconds(0);
    }
  }, [todayRecord]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const formattedDuration = \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;

  const targetHours = 8;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / (targetHours * 3600)) * 100));

  if (!effectiveUser) return null;

  return (
    <Card className="overflow-hidden border-brand-200/60 dark:border-brand-900/40 relative">
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-slate-100 dark:bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
          style={{ width: \`\${progressPercent}%\` }}
        />
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today's Workday
              </span>
              <Badge status={todayRecord?.status || 'absent'} pulse={isCheckedIn} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                {formattedDuration}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 08:00:00 Target</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {todayRecord?.checkIn 
                ? \`Punched in at \${formatTime(todayRecord.checkIn)}\${todayRecord.checkOut ? \` &bull; Punched out at \${formatTime(todayRecord.checkOut)}\` : ''}\`
                : 'You have not punched in yet today.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isCheckedIn ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => clockIn(effectiveUser.id)}
                leftIcon={<Play className="h-4 w-4" />}
                className="shadow-md shadow-brand-500/20"
              >
                {todayRecord?.checkOut ? 'Clock In Again' : 'Clock In Now'}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setOnBreak(!onBreak)}
                  leftIcon={<Coffee className="h-4 w-4 text-amber-500" />}
                >
                  {onBreak ? 'Resume Work' : 'Take Break'}
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => clockOut(effectiveUser.id)}
                  leftIcon={<Square className="h-4 w-4" />}
                >
                  Clock Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
`);

// 2. Dashboard: LeaveBalanceCard.tsx
saveFile('src/components/dashboard/LeaveBalanceCard.tsx', `
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Calendar, HeartPulse, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LeaveBalanceCard: React.FC = () => {
  const { effectiveUser } = useAuth();
  const { getEmployeeBalance } = useHRMS();

  if (!effectiveUser) return null;
  const balance = getEmployeeBalance(effectiveUser.id);

  const leaveTypes = [
    {
      title: 'Annual Paid Leave',
      icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
      remaining: balance.paid.remaining,
      total: balance.paid.total,
      used: balance.paid.used,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      title: 'Sick Leave',
      icon: <HeartPulse className="h-4 w-4 text-rose-500" />,
      remaining: balance.sick.remaining,
      total: balance.sick.total,
      used: balance.sick.used,
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
      text: 'text-rose-700 dark:text-rose-300',
    },
    {
      title: 'Casual Leave',
      icon: <Clock className="h-4 w-4 text-brand-500" />,
      remaining: balance.casual.remaining,
      total: balance.casual.total,
      used: balance.casual.used,
      bg: 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-900',
      text: 'text-brand-700 dark:text-brand-300',
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">Leave &amp; Time-Off Balance</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">Available quota for FY 2026</p>
        </div>
        <Link 
          to="/leaves" 
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Apply Leave &rarr;
        </Link>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {leaveTypes.map((item) => (
            <div 
              key={item.title} 
              className={\`p-4 rounded-2xl border \${item.bg} flex flex-col justify-between transition-all hover:scale-[1.02]\`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.title}</span>
                {item.icon}
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1">
                  <span className={\`text-2xl font-black \${item.text}\`}>{item.remaining}</span>
                  <span className="text-xs text-slate-500 font-medium">days left</span>
                </div>
                <div className="w-full bg-slate-200/70 dark:bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-current h-full rounded-full transition-all"
                    style={{ width: \`\${(item.remaining / item.total) * 100}%\` }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {item.used} of {item.total} used
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
`);

// 3. Dashboard: AdminOverviewKPIs.tsx
saveFile('src/components/dashboard/AdminOverviewKPIs.tsx', `
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Card, CardContent } from '../ui/Card';
import { Users, UserCheck, Clock, AlertCircle, DollarSign, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AdminOverviewKPIs: React.FC = () => {
  const { allEmployees } = useAuth();
  const { attendanceRecords, leaveRequests } = useHRMS();

  const totalEmployees = allEmployees.length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(r => r.date === todayStr);
  const presentToday = todayAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
  const onLeaveToday = todayAttendance.filter(r => r.status === 'leave').length || 1;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;

  const monthlyPayrollTotal = allEmployees.reduce((sum, emp) => sum + emp.salaryStructure.grossMonthly, 0);

  const kpiData = [
    {
      title: 'Total Headcount',
      value: totalEmployees,
      subtext: '+2 joined this quarter',
      icon: <Users className="h-5 w-5 text-brand-600 dark:text-brand-400" />,
      color: 'bg-brand-50 dark:bg-brand-950/60 border-brand-200/80 dark:border-brand-900',
    },
    {
      title: 'Present Today',
      value: \`\${presentToday || totalEmployees - onLeaveToday} / \${totalEmployees}\`,
      subtext: '92% attendance rate',
      icon: <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-900',
    },
    {
      title: 'On Leave Today',
      value: onLeaveToday,
      subtext: 'Approved time-offs',
      icon: <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      color: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-900',
    },
    {
      title: 'Pending Approvals',
      value: pendingLeaves,
      subtext: 'Requires HR action',
      icon: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      color: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-900',
      badge: pendingLeaves > 0 ? 'Action Needed' : undefined,
    },
    {
      title: 'Monthly Payroll',
      value: formatCurrency(monthlyPayrollTotal),
      subtext: 'Gross workforce budget',
      icon: <DollarSign className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
      color: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiData.map((kpi) => (
        <Card key={kpi.title} hoverEffect className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={\`p-2.5 rounded-xl border \${kpi.color}\`}>
                {kpi.icon}
              </div>
              {kpi.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                  {kpi.badge}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {kpi.title}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {kpi.value}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <span>{kpi.subtext}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
`);

// 4. Dashboard: PendingApprovalsQueue.tsx
saveFile('src/components/dashboard/PendingApprovalsQueue.tsx', `
import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { CheckCircle2, XCircle, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export const PendingApprovalsQueue: React.FC = () => {
  const { leaveRequests, reviewLeaveRequest } = useHRMS();
  const pending = leaveRequests.filter(l => l.status === 'pending');

  const [selectedRequest, setSelectedRequest] = useState<typeof leaveRequests[0] | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [comment, setComment] = useState<string>('');

  const handleOpenReview = (req: typeof leaveRequests[0], action: 'approved' | 'rejected') => {
    setSelectedRequest(req);
    setDecision(action);
    setComment(action === 'approved' ? 'Approved by HR Operations.' : 'Request could not be accommodated due to schedule constraints.');
  };

  const handleSubmitReview = () => {
    if (!selectedRequest) return;
    reviewLeaveRequest(selectedRequest.id, decision, comment);
    setSelectedRequest(null);
    setComment('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle className="text-base">Pending Leave Approvals</CardTitle>
            <p className="text-xs text-slate-500">Fast 1-click HR review queue</p>
          </div>
        </div>
        <Link to="/leaves" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
          <span>Full Inbox</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent>
        {pending.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All clear!</p>
            <p className="text-xs text-slate-400 mt-0.5">No pending employee leave requests right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pending.map((req) => (
              <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={req.employeeAvatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{req.employeeName}</span>
                      <span className="text-xs text-slate-400">&bull; {req.department}</span>
                      <Badge variant="purple" size="sm">{req.leaveType} leave</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <strong>{formatDate(req.startDate)}</strong> to <strong>{formatDate(req.endDate)}</strong> ({req.totalDays} days) &bull; <em>"{req.reason}"</em>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleOpenReview(req, 'approved')}
                    leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOpenReview(req, 'rejected')}
                    leftIcon={<XCircle className="h-3.5 w-3.5" />}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Review Modal with Comment Box */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={decision === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
        description="Provide optional comments to record in employee log and include in the simulated decision email."
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div><strong>Employee:</strong> {selectedRequest.employeeName} ({selectedRequest.department})</div>
              <div><strong>Dates:</strong> {formatDate(selectedRequest.startDate)} to {formatDate(selectedRequest.endDate)} ({selectedRequest.totalDays} days)</div>
              <div><strong>Type:</strong> {selectedRequest.leaveType.toUpperCase()}</div>
              <div><strong>Reason:</strong> {selectedRequest.reason}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Approver Comments &amp; Notes
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="Enter feedback for employee..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button
                variant={decision === 'approved' ? 'success' : 'danger'}
                size="sm"
                onClick={handleSubmitReview}
              >
                Confirm {decision === 'approved' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};
`);

console.log('Dashboard feature components generated!');