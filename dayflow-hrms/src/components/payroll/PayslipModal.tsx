import React, { useState } from 'react';
import { SalarySlip, User } from '../../types/hrms';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency, numberToWords, formatDate } from '../../utils/formatters';
import { exportElementToPdf } from '../../utils/pdfGenerator';
import { Download, Printer, ShieldCheck } from 'lucide-react';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  slip: SalarySlip | null;
  employee?: User;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  slip,
  employee,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!slip) return null;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    await exportElementToPdf(
      'printable-payslip',
      `Payslip_${slip.employeeName.replace(/\s+/g, '_')}_${slip.month.replace(/\s+/g, '_')}`
    );
    setIsExporting(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span>Official Salary Slip &bull; {slip.month}</span>
        </div>
      }
      description="Official corporate paystub with full earnings breakdown, tax deductions, and authorization."
      maxWidth="4xl"
    >
      <div className="space-y-4">

        <div className="flex justify-end gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            isLoading={isExporting}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Download PDF
          </Button>
        </div>

        <div
          id="printable-payslip"
          className="p-8 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs font-sans"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-300 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-xl">
                DF
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">DAYFLOW CORPORATION</h1>
                <p className="text-[11px] text-slate-500 font-medium">Every workday, perfectly aligned. &bull; HR &amp; Payroll Operations</p>
                <p className="text-[10px] text-slate-400">500 Howard Street, Suite 1200, San Francisco, CA 94105</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded">
                PAYSLIP FOR {slip.month.toUpperCase()}
              </span>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Ref: {slip.transactionRef}</div>
              <div className="text-[11px] text-slate-500">Pay Date: {formatDate(slip.paymentDate)}</div>
            </div>
          </div>

          {/* Employee Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Employee Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{slip.employeeName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Designation</span>
              <p className="font-semibold text-slate-800 mt-0.5">{slip.designation}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Department</span>
              <p className="font-semibold text-slate-800 mt-0.5">{slip.department}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Working / Present</span>
              <p className="font-semibold text-slate-800 mt-0.5">{slip.workingDays} Days / {slip.daysPresent} Days</p>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                <span>EARNINGS</span>
                <span>AMOUNT (₹)</span>
              </div>
              <div className="divide-y divide-slate-100 p-2 space-y-1">
                <div className="flex justify-between py-1.5 px-2">
                  <span>Basic Pay</span>
                  <span className="font-mono font-semibold">{formatCurrency(slip.earnings.basic)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold">{formatCurrency(slip.earnings.hra)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2">
                  <span>Conveyance Allowance</span>
                  <span className="font-mono font-semibold">{formatCurrency(slip.earnings.conveyance)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2">
                  <span>Special Allowance</span>
                  <span className="font-mono font-semibold">{formatCurrency(slip.earnings.specialAllowance)}</span>
                </div>
                {slip.earnings.bonus > 0 && (
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Performance Incentive</span>
                    <span className="font-mono font-semibold">{formatCurrency(slip.earnings.bonus)}</span>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 px-4 py-2.5 font-black text-slate-900 border-t border-slate-200 flex justify-between">
                <span>TOTAL GROSS EARNINGS</span>
                <span className="font-mono">{formatCurrency(slip.earnings.totalEarnings)}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                <span>STATUTORY DEDUCTIONS</span>
                <span>AMOUNT (₹)</span>
              </div>
              <div className="divide-y divide-slate-100 p-2 space-y-1">
                <div className="flex justify-between py-1.5 px-2">
                  <span>Provident Fund (Employee PF)</span>
                  <span className="font-mono font-semibold text-rose-600">-{formatCurrency(slip.deductions.providentFund)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2">
                  <span>Professional Tax</span>
                  <span className="font-mono font-semibold text-rose-600">-{formatCurrency(slip.deductions.professionalTax)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2">
                  <span>Income Tax (TDS)</span>
                  <span className="font-mono font-semibold text-rose-600">-{formatCurrency(slip.deductions.incomeTax)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2">
                  <span>Group Health Insurance</span>
                  <span className="font-mono font-semibold text-rose-600">-{formatCurrency(slip.deductions.insurance)}</span>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-2.5 font-black text-rose-700 border-t border-slate-200 flex justify-between">
                <span>TOTAL DEDUCTIONS</span>
                <span className="font-mono">-{formatCurrency(slip.deductions.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-emerald-800 uppercase font-bold">NET TAKE-HOME PAY</span>
              <div className="text-2xl font-black text-emerald-900 font-mono mt-0.5">{formatCurrency(slip.netPay)}</div>
              <p className="text-[11px] text-emerald-700 italic mt-0.5">
                Amount in words: {numberToWords(slip.netPay)}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white font-bold rounded-full text-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                DISBURSED &amp; PAID
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-[10px] text-slate-400">
            <div>
              <p>This is a computer-generated official payslip — no signature required.</p>
              <p>Dayflow HRMS &sdot; Corporate Finance &sdot; Confidential</p>
            </div>
            <div className="text-center">
              <div className="h-8 font-serif italic text-slate-700 text-base">Ananya Sharma</div>
              <div className="border-t border-slate-300 pt-1 font-bold text-slate-600">Authorized HR Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
