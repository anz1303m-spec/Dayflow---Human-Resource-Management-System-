import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Card, CardContent } from '../ui/Card';
import { Users, UserCheck, Clock, AlertCircle, DollarSign } from 'lucide-react';
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
      subtext: '+2 this quarter',
      icon: <Users className="h-4 w-4 text-slate-500" />,
    },
    {
      title: 'Present Today',
      value: `${presentToday || totalEmployees - onLeaveToday} / ${totalEmployees}`,
      subtext: '92% attendance',
      icon: <UserCheck className="h-4 w-4 text-slate-500" />,
    },
    {
      title: 'On Leave Today',
      value: onLeaveToday,
      subtext: 'Approved time-offs',
      icon: <Clock className="h-4 w-4 text-slate-500" />,
    },
    {
      title: 'Pending Approvals',
      value: pendingLeaves,
      subtext: pendingLeaves > 0 ? 'Requires action' : 'All clear',
      icon: <AlertCircle className="h-4 w-4 text-slate-500" />,
      urgent: pendingLeaves > 0,
    },
    {
      title: 'Monthly Payroll',
      value: formatCurrency(monthlyPayrollTotal),
      subtext: 'Gross budget',
      icon: <DollarSign className="h-4 w-4 text-slate-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {kpiData.map((kpi) => (
        <Card key={kpi.title} hoverEffect>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                {kpi.icon}
              </div>
              {kpi.urgent && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
                  Action needed
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {kpi.title}
              </span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {kpi.value}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{kpi.subtext}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
