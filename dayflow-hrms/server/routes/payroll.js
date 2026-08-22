const express = require('express');
const router = express.Router();
const pool = require('../db');

function mapSlip(r) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    designation: r.designation,
    department: r.department,
    month: r.month,
    year: r.year,
    monthNumber: r.month_number,
    workingDays: r.working_days,
    daysPresent: r.days_present,
    paidLeaves: r.paid_leaves,
    lwpDays: r.lwp_days,
    earnings: {
      basic: +r.earning_basic,
      hra: +r.earning_hra,
      conveyance: +r.earning_conveyance,
      specialAllowance: +r.earning_special,
      bonus: +r.earning_bonus,
      totalEarnings: +r.total_earnings,
    },
    deductions: {
      providentFund: +r.deduction_pf,
      professionalTax: +r.deduction_pt,
      incomeTax: +r.deduction_tax,
      insurance: +r.deduction_insurance,
      totalDeductions: +r.total_deductions,
    },
    netPay: +r.net_pay,
    paymentDate: r.payment_date,
    paymentStatus: r.payment_status,
    transactionRef: r.transaction_ref,
  };
}

// GET /api/payroll?employeeId=
router.get('/', async (req, res) => {
  const { employeeId } = req.query;
  let query = 'SELECT * FROM salary_slips WHERE 1=1';
  const params = [];
  if (employeeId) { params.push(employeeId); query += ` AND employee_id = $${params.length}`; }
  query += ' ORDER BY year DESC, month_number DESC';
  try {
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapSlip));
  } catch (err) {
    console.error('[payroll/GET]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/payroll/process — generate slips for all employees for a month
router.post('/process', async (req, res) => {
  const { month, year } = req.body;
  if (!month || !year) return res.status(400).json({ error: 'month and year required.' });

  try {
    const { rows: employees } = await pool.query('SELECT * FROM employees');
    const monthNum = new Date(`${month} 1, ${year}`).getMonth() + 1;
    let count = 0;

    for (const emp of employees) {
      const basic = +emp.basic_monthly;
      const hra   = +emp.hra;
      const conv  = +emp.conveyance_allowance;
      const spec  = +emp.special_allowance;
      const bonus = +emp.performance_bonus;
      const totalEarnings = basic + hra + conv + spec + bonus;
      const pf   = +emp.pf_employee;
      const pt   = +emp.professional_tax;
      const tax  = +emp.income_tax_tds;
      const ins  = +emp.health_insurance;
      const totalDeductions = pf + pt + tax + ins;
      const netPay = totalEarnings - totalDeductions;

      const id = `slip-${emp.id}-${year}-${monthNum}`;
      const ref = `ACH-DAYFLOW-${year}${String(monthNum).padStart(2,'0')}-${emp.employee_code.replace('-','')}`;

      await pool.query(
        `INSERT INTO salary_slips
          (id, employee_id, employee_name, designation, department, month, year, month_number,
           working_days, days_present,
           earning_basic, earning_hra, earning_conveyance, earning_special, earning_bonus, total_earnings,
           deduction_pf, deduction_pt, deduction_tax, deduction_insurance, total_deductions,
           net_pay, payment_date, payment_status, transaction_ref)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,22,22,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,CURRENT_DATE,'paid',$21)
         ON CONFLICT (employee_id, month, year) DO NOTHING`,
        [id, emp.id, emp.full_name, emp.designation, emp.department, month, year, monthNum,
         basic, hra, conv, spec, bonus, totalEarnings,
         pf, pt, tax, ins, totalDeductions, netPay, ref]
      );
      count++;
    }

    res.json({ success: true, count });
  } catch (err) {
    console.error('[payroll/process]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
