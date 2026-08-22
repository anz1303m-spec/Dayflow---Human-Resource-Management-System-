const express = require('express');
const router = express.Router();
const pool = require('../db');
const { mapDbToUser } = require('./auth');

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM employees ORDER BY full_name'
    );
    const docs = await pool.query('SELECT * FROM employee_documents');
    const docMap = {};
    docs.rows.forEach(d => {
      if (!docMap[d.employee_id]) docMap[d.employee_id] = [];
      docMap[d.employee_id].push({
        id: d.id, title: d.title, category: d.category,
        fileName: d.file_name, fileSize: d.file_size, uploadDate: d.upload_date,
      });
    });
    const employees = rows.map(r => ({ ...mapDbToUser(r), documents: docMap[r.id] || [] }));
    res.json(employees);
  } catch (err) {
    console.error('[employees/GET]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found.' });
    const docs = await pool.query('SELECT * FROM employee_documents WHERE employee_id = $1', [req.params.id]);
    const employee = {
      ...mapDbToUser(rows[0]),
      documents: docs.rows.map(d => ({
        id: d.id, title: d.title, category: d.category,
        fileName: d.file_name, fileSize: d.file_size, uploadDate: d.upload_date,
      })),
    };
    res.json(employee);
  } catch (err) {
    console.error('[employees/GET/:id]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/employees
router.post('/', async (req, res) => {
  const d = req.body;
  const newId = 'emp-' + Date.now().toString().slice(-6);
  const empCode = d.employeeId || 'DF-' + Math.floor(1000 + Math.random() * 9000);
  try {
    await pool.query(
      `INSERT INTO employees
        (id, employee_code, email, password_hash, full_name, role, avatar,
         department, designation, phone, address,
         reporting_manager, work_location, employment_type,
         joining_date, dob, gender, blood_group, status, is_email_verified,
         emergency_name, emergency_relation, emergency_phone,
         ctc, basic_monthly, hra, conveyance_allowance, special_allowance, performance_bonus,
         pf_employee, pf_employer, professional_tax, income_tax_tds, health_insurance,
         gross_monthly, net_monthly)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36)`,
      [
        newId, empCode, d.email, 'password123', d.fullName, d.role || 'employee', d.avatar || null,
        d.department, d.designation, d.phone, d.address,
        d.reportingManager, d.workLocation, d.employmentType || 'full_time',
        d.joiningDate || new Date().toISOString().split('T')[0],
        d.dob || '1995-01-01', d.gender || 'Other', d.bloodGroup || 'O+',
        d.status || 'active', true,
        d.emergencyContact?.name, d.emergencyContact?.relation, d.emergencyContact?.phone,
        d.salaryStructure?.ctc || 90000,
        d.salaryStructure?.basicMonthly || 3750,
        d.salaryStructure?.hra || 1875,
        d.salaryStructure?.conveyanceAllowance || 300,
        d.salaryStructure?.specialAllowance || 1575,
        d.salaryStructure?.performanceBonus || 300,
        d.salaryStructure?.pfEmployee || 450,
        d.salaryStructure?.pfEmployer || 450,
        d.salaryStructure?.professionalTax || 200,
        d.salaryStructure?.incomeTaxTds || 800,
        d.salaryStructure?.healthInsurance || 150,
        d.salaryStructure?.grossMonthly || 7500,
        d.salaryStructure?.netMonthly || 5900,
      ]
    );
    await pool.query('INSERT INTO leave_balances (employee_id) VALUES ($1) ON CONFLICT DO NOTHING', [newId]);
    res.status(201).json({ success: true, id: newId });
  } catch (err) {
    console.error('[employees/POST]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res) => {
  const d = req.body;
  try {
    await pool.query(
      `UPDATE employees SET
        full_name=$1, department=$2, designation=$3, phone=$4, address=$5,
        role=$6, status=$7, work_location=$8, reporting_manager=$9,
        basic_monthly=$10, hra=$11, gross_monthly=$12, net_monthly=$13, ctc=$14,
        updated_at=NOW()
       WHERE id=$15`,
      [
        d.fullName, d.department, d.designation, d.phone, d.address,
        d.role, d.status, d.workLocation, d.reportingManager,
        d.salaryStructure?.basicMonthly, d.salaryStructure?.hra,
        d.salaryStructure?.grossMonthly, d.salaryStructure?.netMonthly, d.salaryStructure?.ctc,
        req.params.id,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[employees/PUT]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[employees/DELETE]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
