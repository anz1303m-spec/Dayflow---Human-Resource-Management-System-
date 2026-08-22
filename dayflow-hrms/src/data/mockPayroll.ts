import { SalarySlip } from '../types/hrms';
import { INITIAL_EMPLOYEES } from './mockEmployees';

export const generateInitialSalarySlips = (): SalarySlip[] => {
  const slips: SalarySlip[] = [];
  const months = [
    { name: 'July 2026', year: 2026, monthNum: 7, days: 22, date: '2026-07-31', status: 'paid' as const },
    { name: 'June 2026', year: 2026, monthNum: 6, days: 21, date: '2026-06-30', status: 'paid' as const },
    { name: 'May 2026', year: 2026, monthNum: 5, days: 22, date: '2026-05-31', status: 'paid' as const },
  ];

  INITIAL_EMPLOYEES.forEach((emp) => {
    months.forEach((m, idx) => {
      const basic = emp.salaryStructure.basicMonthly;
      const hra = emp.salaryStructure.hra;
      const conveyance = emp.salaryStructure.conveyanceAllowance;
      const special = emp.salaryStructure.specialAllowance;
      const bonus = idx === 0 ? emp.salaryStructure.performanceBonus : 0;
      const totalEarnings = basic + hra + conveyance + special + bonus;

      const pf = emp.salaryStructure.pfEmployee;
      const pt = emp.salaryStructure.professionalTax;
      const tax = emp.salaryStructure.incomeTaxTds;
      const ins = emp.salaryStructure.healthInsurance;
      const totalDeductions = pf + pt + tax + ins;

      const netPay = totalEarnings - totalDeductions;

      slips.push({
        id: `slip-${emp.id}-${m.year}-${m.monthNum}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        designation: emp.designation,
        department: emp.department,
        month: m.name,
        year: m.year,
        monthNumber: m.monthNum,
        workingDays: m.days,
        daysPresent: m.days - (emp.id === 'emp-006' ? 2 : 0),
        paidLeaves: emp.id === 'emp-006' ? 2 : 0,
        lwpDays: 0,
        earnings: {
          basic,
          hra,
          conveyance,
          specialAllowance: special,
          bonus,
          totalEarnings,
        },
        deductions: {
          providentFund: pf,
          professionalTax: pt,
          incomeTax: tax,
          insurance: ins,
          totalDeductions,
        },
        netPay,
        paymentDate: m.date,
        paymentStatus: m.status,
        transactionRef: `ACH-DAYFLOW-${m.year}${String(m.monthNum).padStart(2, '0')}-${emp.employeeId.replace('-', '')}`,
      });
    });
  });

  return slips;
};

export const INITIAL_SALARY_SLIPS = generateInitialSalarySlips();
