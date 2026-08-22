const fs = require('fs');
const path = require('path');

function saveFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + relPath);
}

// 1. WeeklyCalendar.tsx
saveFile('src/components/attendance/WeeklyCalendar.tsx', `
import React from 'react';
import { AttendanceRecord } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatTime, formatDate } from '../../utils/formatters';
import { Calendar } from 'lucide-react';

export const WeeklyCalendar: React.FC<{ records: AttendanceRecord[] }> = ({ records }) => {
  const recentRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 14);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-500" />
            <span>Recent Attendance Timeline</span>
          </CardTitle>
          <p className="text-xs text-slate-500">Daily punch logs, working hours, and status breakdown</p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Check In</th>
                <th className="pb-3 px-3">Check Out</th>
                <th className="pb-3 px-3">Working Hours</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(r.date)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {formatTime(r.checkIn)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {formatTime(r.checkOut)}
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">
                    {r.totalHours ? `${r.totalHours.toFixed(1)} hrs` : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <Badge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 italic">
                    {r.note || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
`);

// 2. AdminAttendanceTable.tsx
saveFile('src/components/attendance/AdminAttendanceTable.tsx', `
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Search, Download, Edit } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';
import { exportToCsv } from '../../utils/pdfGenerator';
import { AttendanceStatus } from '../../types/hrms';

export const AdminAttendanceTable: React.FC = () => {
  const { allEmployees } = useAuth();
  const { attendanceRecords, markAttendanceOverride } = useHRMS();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [overrideModalOpen, setOverrideModalOpen] = useState<boolean>(false);
  const [targetEmpId, setTargetEmpId] = useState<string>('');
  const [overrideStatus, setOverrideStatus] = useState<AttendanceStatus>('present');
  const [overrideIn, setOverrideIn] = useState<string>('09:00 AM');
  const [overrideOut, setOverrideOut] = useState<string>('06:00 PM');
  const [overrideNote, setOverrideNote] = useState<string>('Manual HR Override');

  const filteredEmployees = allEmployees.filter((emp) => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenOverride = (empId: string) => {
    const existing = attendanceRecords.find(r => r.employeeId === empId && r.date === selectedDate);
    setTargetEmpId(empId);
    setOverrideStatus(existing?.status || 'present');
    setOverrideIn(existing?.checkIn || '09:00 AM');
    setOverrideOut(existing?.checkOut || '06:00 PM');
    setOverrideModalOpen(true);
  };

  const handleSaveOverride = () => {
    markAttendanceOverride({
      employeeId: targetEmpId,
      date: selectedDate,
      status: overrideStatus,
      checkIn: overrideIn,
      checkOut: overrideOut,
      totalHours: 8.0,
      note: overrideNote,
    });
    setOverrideModalOpen(false);
  };

  const handleExportCsv = () => {
    const exportData = filteredEmployees.map(emp => {
      const rec = attendanceRecords.find(r => r.employeeId === emp.id && r.date === selectedDate);
      return {
        Date: selectedDate,
        EmployeeID: emp.employeeId,
        Name: emp.fullName,
        Department: emp.department,
        Status: rec?.status || 'Absent',
        CheckIn: rec?.checkIn || '--',
        CheckOut: rec?.checkOut || '--',
        Hours: rec?.totalHours || 0,
      };
    });
    exportToCsv(exportData, `Dayflow_Attendance_${selectedDate}`);
  };

  const departments = Array.from(new Set(allEmployees.map(e => e.department)));

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg">Company-Wide Attendance Log</CardTitle>
          <p className="text-xs text-slate-500">Monitor live workforce attendance, clock logs, and punch overrides</p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Input
            placeholder="Search employee by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="py-1.5 text-xs"
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="half_day">Half Day</option>
            <option value="leave">On Leave</option>
            <option value="late">Late</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 px-3">Employee</th>
                <th className="pb-3 px-3">Department</th>
                <th className="pb-3 px-3">Check In</th>
                <th className="pb-3 px-3">Check Out</th>
                <th className="pb-3 px-3">Working Hours</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredEmployees.map((emp) => {
                const rec = attendanceRecords.find(r => r.employeeId === emp.id && r.date === selectedDate);
                const status = rec?.status || 'absent';

                if (statusFilter !== 'all' && status !== statusFilter) {
                  return null;
                }

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img src={emp.avatar} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{emp.fullName}</div>
                          <div className="text-[10px] text-slate-400">{emp.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {emp.department}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {formatTime(rec?.checkIn || null)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {formatTime(rec?.checkOut || null)}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">
                      {rec?.totalHours ? `${rec.totalHours.toFixed(1)} hrs` : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenOverride(emp.id)}
                        leftIcon={<Edit className="h-3.5 w-3.5 text-slate-500" />}
                      >
                        Override
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title="Override Employee Attendance"
        description={`Manually adjust punch times or status for ${selectedDate}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Attendance Status
            </label>
            <select
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value as AttendanceStatus)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="half_day">Half Day</option>
              <option value="leave">On Leave</option>
              <option value="late">Late</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Check In Time"
              value={overrideIn}
              onChange={(e) => setOverrideIn(e.target.value)}
            />
            <Input
              label="Check Out Time"
              value={overrideOut}
              onChange={(e) => setOverrideOut(e.target.value)}
            />
          </div>

          <Input
            label="HR Note / Reason"
            value={overrideNote}
            onChange={(e) => setOverrideNote(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveOverride}>
              Save Override
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
`);

console.log('Attendance components created!');