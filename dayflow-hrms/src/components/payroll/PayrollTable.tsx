import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PayslipModal } from './PayslipModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DollarSign, FileText, Play, Download } from 'lucide-react';
import { SalarySlip } from '../../types/hrms';
import { exportToCsv } from '../../utils/pdfGenerator';

export const PayrollTable: React.FC = () => {
  const { allEmployees } = useAuth();
  const { salarySlips, processMonthlyPayroll } = useHRMS();

  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('August 2026');

  const handleRunPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const [monthName, yearStr] = selectedMonth.split(' ');
      const res = processMonthlyPayroll(monthName + ' ' + yearStr, Number(yearStr));
      setIsProcessing(false);
      if (res.success) {
        alert(`Success! Payroll processed and disbursed for ${res.count} employees.`);
      } else {
        alert(`Payroll for ${selectedMonth} has already been processed.`);
      }
    }, 800);
  };

  const handleExportCsv = () => {
    const data = salarySlips.filter((s) => s.month === selectedMonth).map((s) => ({
      Month: s.month,
      EmployeeID: s.employeeId,
      Name: s.employeeName,
      Department: s.department,
      Gross: s.earnings.totalEarnings,
      Deductions: s.deductions.totalDeductions,
      NetPay: s.netPay,
      Status: s.paymentStatus,
      TxRef: s.transactionRef,
    }));
    exportToCsv(data, `Dayflow_Payroll_${selectedMonth.replace(/\s+/g, '_')}`);
  };

  const currentMonthSlips = salarySlips.filter((s) => s.month === selectedMonth);

  const totalGross = currentMonthSlips.reduce((sum, s) => sum + s.earnings.totalEarnings, 0);
  const totalNet = currentMonthSlips.reduce((sum, s) => sum + s.netPay, 0);
  const totalDeductions = currentMonthSlips.reduce((sum, s) => sum + s.deductions.totalDeductions, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <span>Company Payroll Master &amp; Salary Register</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage monthly compensation, tax withholding, and one-click direct deposit runs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
              <option value="May 2026">May 2026</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export CSV
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleRunPayroll}
              isLoading={isProcessing}
              leftIcon={<Play className="h-3.5 w-3.5" />}
            >
              Run Payroll
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Summary Strip */}
          {currentMonthSlips.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Total Gross', value: formatCurrency(totalGross), color: 'text-slate-900 dark:text-white' },
                { label: 'Total Deductions', value: formatCurrency(totalDeductions), color: 'text-rose-600 dark:text-rose-400' },
                { label: 'Net Disbursement', value: formatCurrency(totalNet), color: 'text-emerald-600 dark:text-emerald-400' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{item.label}</div>
                  <div className={`font-black font-mono text-sm mt-0.5 ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {currentMonthSlips.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-slate-400 text-xs mb-3">
                No payroll records found for <strong>{selectedMonth}</strong>.
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunPayroll}
                isLoading={isProcessing}
                leftIcon={<Play className="h-3.5 w-3.5" />}
              >
                Process {selectedMonth} Payroll Now
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Gross</th>
                    <th className="py-3 px-3">Deductions</th>
                    <th className="py-3 px-3">Net Pay</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Pay Date</th>
                    <th className="py-3 px-3 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {currentMonthSlips.map((slip) => {
                    const emp = allEmployees.find((e) => e.id === slip.employeeId);
                    return (
                      <tr key={slip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {emp && (
                              <img
                                src={emp.avatar}
                                alt={slip.employeeName}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{slip.employeeName}</div>
                              <div className="text-[10px] text-slate-400">{slip.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{slip.department}</td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(slip.earnings.totalEarnings)}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-rose-600 dark:text-rose-400">
                          -{formatCurrency(slip.deductions.totalDeductions)}
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(slip.netPay)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge status={slip.paymentStatus} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-500">{formatDate(slip.paymentDate)}</td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSlip(slip)}
                            leftIcon={<FileText className="h-3.5 w-3.5" />}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSlip && (
        <PayslipModal
          isOpen={!!selectedSlip}
          onClose={() => setSelectedSlip(null)}
          slip={selectedSlip}
          employee={allEmployees.find((e) => e.id === selectedSlip.employeeId)}
        />
      )}
    </>
  );
};
