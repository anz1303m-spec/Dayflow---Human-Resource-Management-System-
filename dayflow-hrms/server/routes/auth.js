const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM employees WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email address or user not found.' });
    }

    const user = rows[0];

    if (!user.is_email_verified) {
      return res.status(403).json({
        success: false,
        requireVerification: true,
        message: 'Email address is pending verification.',
      });
    }

    // Simple password check (no hashing for now — Option A)
    if (password.length < 6) {
      return res.status(401).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Return safe user object (no password)
    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, user: mapDbToUser(safeUser) });
  } catch (err) {
    console.error('[auth/login]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, fullName, department, designation, phone, role } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ success: false, message: 'Email and full name are required.' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM employees WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const newId = 'emp-' + Date.now().toString().slice(-6);
    const empCode = 'DF-' + Math.floor(1000 + Math.random() * 9000);
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));

    await pool.query(
      `INSERT INTO employees
        (id, employee_code, email, password_hash, full_name, role, department, designation, phone,
         joining_date, status, is_email_verified,
         ctc, basic_monthly, hra, conveyance_allowance, special_allowance, performance_bonus,
         pf_employee, pf_employer, professional_tax, income_tax_tds, health_insurance,
         gross_monthly, net_monthly)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE,'active',FALSE,
               90000,3750,1875,300,1575,300,450,450,200,800,150,7500,5900)`,
      [newId, empCode, email.trim().toLowerCase(), 'password123',
       fullName, role || 'employee', department || 'Engineering',
       designation || 'Associate Specialist', phone || '']
    );

    // Seed leave balance for new user
    await pool.query(
      'INSERT INTO leave_balances (employee_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [newId]
    );

    return res.json({
      success: true,
      userId: newId,
      verificationCode,
      message: 'Account created. Check your email for the OTP.',
    });
  } catch (err) {
    console.error('[auth/register]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;
  // In a real app, store & match the OTP. For now accept any 6-digit code.
  if (!code || code.length !== 6) {
    return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP.' });
  }

  try {
    await pool.query(
      'UPDATE employees SET is_email_verified = TRUE WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    const { rows } = await pool.query(
      'SELECT * FROM employees WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    if (rows.length === 0) return res.status(404).json({ success: false });
    const { password_hash, ...safeUser } = rows[0];
    return res.json({ success: true, user: mapDbToUser(safeUser) });
  } catch (err) {
    console.error('[auth/verify]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── Helper ───────────────────────────────────────────────
function mapDbToUser(row) {
  return {
    id: row.id,
    employeeId: row.employee_code,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    department: row.department,
    designation: row.designation,
    phone: row.phone,
    address: row.address,
    reportingManager: row.reporting_manager,
    workLocation: row.work_location,
    employmentType: row.employment_type,
    joiningDate: row.joining_date,
    dob: row.dob,
    gender: row.gender,
    bloodGroup: row.blood_group,
    status: row.status,
    isEmailVerified: row.is_email_verified,
    emergencyContact: {
      name: row.emergency_name,
      relation: row.emergency_relation,
      phone: row.emergency_phone,
    },
    salaryStructure: {
      ctc: +row.ctc,
      basicMonthly: +row.basic_monthly,
      hra: +row.hra,
      conveyanceAllowance: +row.conveyance_allowance,
      specialAllowance: +row.special_allowance,
      performanceBonus: +row.performance_bonus,
      pfEmployee: +row.pf_employee,
      pfEmployer: +row.pf_employer,
      professionalTax: +row.professional_tax,
      incomeTaxTds: +row.income_tax_tds,
      healthInsurance: +row.health_insurance,
      grossMonthly: +row.gross_monthly,
      netMonthly: +row.net_monthly,
    },
    documents: [],
  };
}

module.exports = router;
module.exports.mapDbToUser = mapDbToUser;
