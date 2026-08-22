import React from 'react';
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts';
import { BarChart3, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useHRMS } from '../context/HRMSContext';
import { exportToCsv } from '../utils/pdfGenerator';

export const AnalyticsPage: React.FC = () => {
  const { leaveRequests, attendanceRecords } = useHRMS();

  const handleExportLeavesCsv = () => {
    const data = leaveRequests.map(r => ({
      ID: r.id,
      Name: r.employeeName,
      Department: r.department,
      Type: r.leaveType,
      Start: r.startDate,
      End: r.endDate,
      Days: r.totalDays,
      Status: r.status,
      Reason: r.reason,
      Approver: r.approverName || '-',
    }));
    exportToCsv(data, 'Dayflow_Leave_Logs');
  };

  const handleExportAttendanceCsv = () => {
    const data = attendanceRecords.map(r => ({
      EmployeeID: r.employeeId,
      Date: r.date,
      CheckIn: r.checkIn || '-',
      CheckOut: r.checkOut || '-',
      TotalHours: r.totalHours,
      Status: r.status,
      Note: r.note || '',
    }));
    exportToCsv(data, 'Dayflow_Attendance_Logs');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-brand-600" />
            <span>Company Analytics &amp; Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Executive overview of workforce attendance trends, department allocations, and payroll expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAttendanceCsv}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export Attendance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportLeavesCsv}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export Leaves
          </Button>
        </div>
      </div>

      <AnalyticsCharts />
    </div>
  );
};
