const express = require('express');
const router = express.Router();
const pool = require('../db');

function mapRow(r) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    checkIn: r.check_in,
    checkOut: r.check_out,
    totalHours: +r.total_hours,
    status: r.status,
    isRegularized: r.is_regularized,
    note: r.note,
  };
}

// GET /api/attendance?employeeId=&date=
router.get('/', async (req, res) => {
  const { employeeId, date } = req.query;
  let query = 'SELECT * FROM attendance WHERE 1=1';
  const params = [];
  if (employeeId) { params.push(employeeId); query += ` AND employee_id = $${params.length}`; }
  if (date)       { params.push(date);       query += ` AND date = $${params.length}`; }
  query += ' ORDER BY date DESC';
  try {
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error('[attendance/GET]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/attendance/clockin
router.post('/clockin', async (req, res) => {
  const { employeeId } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const id = `att-${employeeId}-${date}`;
  try {
    await pool.query(
      `INSERT INTO attendance (id, employee_id, date, check_in, status)
       VALUES ($1, $2, $3, $4, 'present')
       ON CONFLICT (employee_id, date) DO UPDATE SET check_in = $4, status = 'present'`,
      [id, employeeId, date, timeStr]
    );
    res.json({ success: true, checkIn: timeStr });
  } catch (err) {
    console.error('[attendance/clockin]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/attendance/clockout
router.post('/clockout', async (req, res) => {
  const { employeeId } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  try {
    await pool.query(
      `UPDATE attendance SET check_out = $1, total_hours = 8.5
       WHERE employee_id = $2 AND date = $3`,
      [timeStr, employeeId, date]
    );
    res.json({ success: true, checkOut: timeStr });
  } catch (err) {
    console.error('[attendance/clockout]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/attendance/override
router.post('/override', async (req, res) => {
  const { employeeId, date, checkIn, checkOut, totalHours, status, note, isRegularized } = req.body;
  const id = `att-${employeeId}-${date}`;
  try {
    await pool.query(
      `INSERT INTO attendance (id, employee_id, date, check_in, check_out, total_hours, status, note, is_regularized)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (employee_id, date) DO UPDATE SET
         check_in=$4, check_out=$5, total_hours=$6, status=$7, note=$8, is_regularized=$9`,
      [id, employeeId, date, checkIn, checkOut, totalHours || 8.0, status || 'present', note, isRegularized || false]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[attendance/override]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
