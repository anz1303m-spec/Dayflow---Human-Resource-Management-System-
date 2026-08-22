import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Search, Download, Edit2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { exportToCsv } from '../../utils/pdfGenerator';
import { AttendanceStatus } from '../../types/hrms';

export const AdminAttendanceTable: React.FC = () => {
  const { allEmployees } = useAuth();
  const { attendanceRecords, markAttendanceOverride } = useHRMS();

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const [overrideModalOpen, setOverrideModalOpen] = useState<boolean>(false);
  const [targetEmpId, setTargetEmpId] = useState<string>('');
  const [targetEmpName, setTargetEmpName] = useState<string>('');
  const [overrideStatus, setOverrideStatus] = useState<AttendanceStatus>('present');
  const [overrideIn, setOverrideIn] = useState<string>('09:00 AM');
  const [overrideOut, setOverrideOut] = useState<string>('06:00 PM');
  const [overrideNote, setOverrideNote] = useState<string>('Manual HR Override');

  const departments = Array.from(new Set(allEmployees.map((e) => e.department)));

  const filteredEmployees = allEmployees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenOverride = (empId: string, empName: string) => {
    const existing = attendanceRecords.find(
      (r) => r.employeeId === empId && r.date === selectedDate
    );
    setTargetEmpId(empId);
    setTargetEmpName(empName);
    setOverrideStatus((existing?.status as AttendanceStatus) || 'present');
    setOverrideIn(existing?.checkIn || '09:00 AM');
    setOverrideOut(existing?.checkOut || '06:00 PM');
    setOverrideNote('Manual HR Override');
    setOverrideModalOpen(true);
  };

  const handleSaveOverride = () => {
    markAttendanceOverride({
      employeeId: targetEmpId,
      date: selectedDate,
      status: overrideStatus,
      checkIn: overrideStatus !== 'absent' && overrideStatus !== 'leave' ? overrideIn : null,
      checkOut: overrideStatus !== 'absent' && overrideStatus !== 'leave' ? overrideOut : null,
      totalHours: overrideStatus === 'half_day' ? 4.5 : (overrideStatus === 'present' || overrideStatus === 'late' ? 8.0 : 0),
      note: overrideNote,
    });
    setOverrideModalOpen(false);
  };

  const handleExportCsv = () => {
    const exportData = filteredEmployees.map((emp) => {
      const rec = attendanceRecords.find(
        (r) => r.employeeId === emp.id && r.date === selectedDate
      );
      return {
        Date: selectedDate,
        EmployeeID: emp.employeeId,
        Name: emp.fullName,
        Department: emp.department,
        Status: rec?.status || 'absent',
        CheckIn: rec?.checkIn || '--',
        CheckOut: rec?.checkOut || '--',
        Hours: rec?.totalHours || 0,
      };
    });
    exportToCsv(exportData, `Dayflow_Attendance_${selectedDate}`);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg">Company-Wide Attendance Log</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor live workforce attendance, clock logs, and apply HR overrides
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Check In</th>
                  <th className="py-3 px-3">Check Out</th>
                  <th className="py-3 px-3">Hours</th>
                  <th className="py-3 px-3 text-right">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredEmployees.map((emp) => {
                  const rec = attendanceRecords.find(
                    (r) => r.employeeId === emp.id && r.date === selectedDate
                  );
                  const status = rec?.status || 'absent';

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={emp.avatar}
                            alt={emp.fullName}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{emp.fullName}</div>
                            <div className="text-[10px] text-slate-400">{emp.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                      <td className="py-3 px-3">
                        <Badge status={status} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {rec?.checkIn || '--'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {rec?.checkOut || '--'}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                        {rec?.totalHours ? `${rec.totalHours}h` : '--'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenOverride(emp.id, emp.fullName)}
                          leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                        >
                          Override
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredEmployees.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs">
                No employees match the current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title={`Override Attendance — ${targetEmpName}`}
        description={`Manually adjust attendance record for ${selectedDate}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Attendance Status
            </label>
            <select
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value as AttendanceStatus)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late Arrival</option>
              <option value="half_day">Half Day</option>
              <option value="leave">On Leave</option>
            </select>
          </div>

          {(overrideStatus === 'present' || overrideStatus === 'late' || overrideStatus === 'half_day') && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Check In Time"
                value={overrideIn}
                onChange={(e) => setOverrideIn(e.target.value)}
                placeholder="09:00 AM"
              />
              <Input
                label="Check Out Time"
                value={overrideOut}
                onChange={(e) => setOverrideOut(e.target.value)}
                placeholder="06:00 PM"
              />
            </div>
          )}

          <Input
            label="Override Note / Reason"
            value={overrideNote}
            onChange={(e) => setOverrideNote(e.target.value)}
            placeholder="Reason for override..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveOverride}>
              Save Override
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};