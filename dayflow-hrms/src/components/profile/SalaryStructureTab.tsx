import React from 'react';
import { User } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, ShieldAlert, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';

export const SalaryStructureTab: React.FC<{ employee: User }> = ({ employee }) => {
  const sal = employee.salaryStructure;

  return (
    <div className="space-y-6">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">Annual CTC Package</span>
          <div className="text-3xl font-black mt-1">{formatCurrency(sal.ctc)}</div>
          <span className="text-[11px] text-brand-100 mt-1 block">Cost to Company (Annual)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Gross</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(sal.grossMonthly)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Before Statutory Deductions</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Monthly Net Pay</span>
          <div className="text-3xl font-black text-emerald-900 dark:text-emerald-300 mt-1">{formatCurrency(sal.netMonthly)}</div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 block">Estimated Take-Home</span>
        </div>
      </div>

      {/* Earnings vs Deductions Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-400">Monthly Earnings</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(sal.grossMonthly)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Basic Pay</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.basicMonthly)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">House Rent Allowance (HRA)</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.hra)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Conveyance Allowance</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.conveyanceAllowance)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Special Allowance</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.specialAllowance)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Performance Bonus</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.performanceBonus)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="text-rose-600 dark:text-rose-400">Monthly Deductions</span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(sal.pfEmployee + sal.professionalTax + sal.incomeTaxTds + sal.healthInsurance)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Provident Fund (Employee PF)</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(sal.pfEmployee)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Professional Tax</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(sal.professionalTax)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Income Tax (TDS Slab)</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(sal.incomeTaxTds)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Corporate Health Insurance</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(sal.healthInsurance)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
