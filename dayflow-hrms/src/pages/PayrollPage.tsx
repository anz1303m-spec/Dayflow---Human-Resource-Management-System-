import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PayslipModal } from '../components/payroll/PayslipModal';
import { PayrollTable } from '../components/payroll/PayrollTable';
import { SalaryStructureTab } from '../components/profile/SalaryStructureTab';
import { CreditCard, FileText } from 'lucide-react';
import { SalarySlip } from '../types/hrms';
import { formatCurrency, formatDate } from '../utils/formatters';

export const PayrollPage: React.FC = () => {
  const { effectiveUser, isAdminOrHr } = useAuth();
  const { getEmployeeSlips } = useHRMS();

  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
  const [activeView, setActiveView] = useState<'slips' | 'structure'>('slips');

  if (!effectiveUser) return null;
  const mySlips = getEmployeeSlips(effectiveUser.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-brand-600" />
            <span>Payroll &amp; Compensation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View your monthly paystubs, tax deductions, and download official PDF salary slips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('slips')}
            className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all ${activeView === 'slips' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            My Salary Slips
          </button>
          <button
            onClick={() => setActiveView('structure')}
            className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all ${activeView === 'structure' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400 border border-brand-200 dark:border-brand-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Salary Structure
          </button>
        </div>
      </div>

      {activeView === 'structure' ? (
        <SalaryStructureTab employee={effectiveUser} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-500" />
              <span>Paystub &amp; Salary Slip History</span>
            </CardTitle>
            <p className="text-xs text-slate-500">Official computer-generated payslips available for viewing and PDF export</p>
          </CardHeader>

          <CardContent>
            {mySlips.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No salary slips generated yet. Ask your HR Admin to run the monthly payroll.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-3">Pay Period</th>
                      <th className="py-3 px-3">Gross Earnings</th>
                      <th className="py-3 px-3">Total Deductions</th>
                      <th className="py-3 px-3">Net Take-Home</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Payment Date</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {mySlips.map((slip) => (
                      <tr key={slip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {slip.month} {slip.year}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(slip.earnings.totalEarnings)}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-rose-600 dark:text-rose-400">
                          -{formatCurrency(slip.deductions.totalDeductions)}
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatCurrency(slip.netPay)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge status={slip.paymentStatus} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {formatDate(slip.paymentDate)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedSlip(slip)}
                            leftIcon={<FileText className="h-3.5 w-3.5" />}
                          >
                            View &amp; Download PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          <PayslipModal
            isOpen={!!selectedSlip}
            onClose={() => setSelectedSlip(null)}
            slip={selectedSlip}
            employee={effectiveUser}
          />
        </Card>
      )}

      {isAdminOrHr && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <PayrollTable />
        </div>
      )}
    </div>
  );
};
