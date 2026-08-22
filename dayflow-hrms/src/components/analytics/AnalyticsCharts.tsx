import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

export const AnalyticsCharts: React.FC = () => {
  const { allEmployees } = useAuth();

  const attendanceTrendData = [
    { month: 'Mar', presentRate: 94, onTimeRate: 91 },
    { month: 'Apr', presentRate: 95, onTimeRate: 93 },
    { month: 'May', presentRate: 92, onTimeRate: 89 },
    { month: 'Jun', presentRate: 96, onTimeRate: 94 },
    { month: 'Jul', presentRate: 95, onTimeRate: 92 },
    { month: 'Aug', presentRate: 97, onTimeRate: 95 },
  ];

  const deptMap: Record<string, { count: number; totalPayroll: number }> = {};
  allEmployees.forEach((emp) => {
    if (!deptMap[emp.department]) {
      deptMap[emp.department] = { count: 0, totalPayroll: 0 };
    }
    deptMap[emp.department].count += 1;
    deptMap[emp.department].totalPayroll += emp.salaryStructure.grossMonthly;
  });

  const departmentData = Object.keys(deptMap).map((dept) => ({
    name: dept.split(' ')[0], // Shorten labels
    headcount: deptMap[dept].count,
    payroll: deptMap[dept].totalPayroll,
  }));

  const leaveData = [
    { name: 'Paid / Annual', value: 45, color: '#3b82f6' },
    { name: 'Sick Leave', value: 20, color: '#f43f5e' },
    { name: 'Casual Leave', value: 25, color: '#10b981' },
    { name: 'Unpaid / Other', value: 10, color: '#a855f7' },
  ];

  const totalPayroll = allEmployees.reduce(
    (sum, emp) => sum + emp.salaryStructure.grossMonthly,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Attendance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance &amp; Punctuality Trends (%)</CardTitle>
            <p className="text-xs text-slate-500">6-month rolling organization attendance health</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis domain={[80, 100]} fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="presentRate"
                  stroke="#3b82f6"
                  name="Present Rate (%)"
                  fillOpacity={1}
                  fill="url(#colorPresent)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="onTimeRate"
                  stroke="#10b981"
                  name="On-Time Rate (%)"
                  fillOpacity={1}
                  fill="url(#colorOnTime)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Headcount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Headcount &amp; Budget</CardTitle>
            <p className="text-xs text-slate-500">Workforce distribution and monthly payroll allocation</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="headcount" fill="#6366f1" name="Employees" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Distribution Pie */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Time-Off Distribution</CardTitle>
            <p className="text-xs text-slate-500">Leave type breakdown across the organization</p>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leaveData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payroll Summary Cards */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Payroll Summary</CardTitle>
            <p className="text-xs text-slate-500">Total monthly compensation and statutory withholdings</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  label: 'Total Gross Payroll',
                  value: formatCurrency(totalPayroll),
                  colorClass: 'text-slate-900 dark:text-white',
                  bgClass: 'bg-slate-50 dark:bg-slate-800/60',
                },
                {
                  label: 'Total PF Contributions',
                  value: formatCurrency(
                    allEmployees.reduce((s, e) => s + e.salaryStructure.pfEmployee + e.salaryStructure.pfEmployer, 0)
                  ),
                  colorClass: 'text-indigo-700 dark:text-indigo-400',
                  bgClass: 'bg-indigo-50 dark:bg-indigo-950/40',
                },
                {
                  label: 'Total TDS / Income Tax',
                  value: formatCurrency(
                    allEmployees.reduce((s, e) => s + e.salaryStructure.incomeTaxTds, 0)
                  ),
                  colorClass: 'text-amber-700 dark:text-amber-400',
                  bgClass: 'bg-amber-50 dark:bg-amber-950/40',
                },
                {
                  label: 'Total Net Disbursement',
                  value: formatCurrency(
                    allEmployees.reduce((s, e) => s + e.salaryStructure.netMonthly, 0)
                  ),
                  colorClass: 'text-emerald-700 dark:text-emerald-400',
                  bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between p-3 rounded-xl ${item.bgClass}`}
                >
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                  <span className={`text-sm font-black font-mono ${item.colorClass}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};