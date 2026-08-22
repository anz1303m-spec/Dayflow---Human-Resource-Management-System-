const express = require('express');
const router = express.Router();
const pool = require('../db');

function mapLeave(r) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    leaveType: r.leave_type,
    startDate: r.start_date,
    endDate: r.end_date,
    totalDays: r.total_days,
    reason: r.reason,
    status: r.status,
    appliedOn: r.applied_on,
    approverName: r.approver_name,
    approverComments: r.approver_comments,
    approvedAt: r.approved_at,
  };
}

function mapBalance(r) {
  return {
    paid:   { total: r.paid_total,   used: r.paid_used,   remaining: r.paid_total   - r.paid_used },
    sick:   { total: r.sick_total,   used: r.sick_used,   remaining: r.sick_total   - r.sick_used },
    casual: { total: r.casual_total, used: r.casual_used, remaining: r.casual_total - r.casual_used },
    unpaid: { used: r.unpaid_used },
  };
}

// GET /api/leaves?employeeId=
router.get('/', async (req, res) => {
  const { employeeId } = req.query;
  let query = 'SELECT * FROM leave_requests WHERE 1=1';
  const params = [];
  if (employeeId) { params.push(employeeId); query += ` AND employee_id = $${params.length}`; }
  query += ' ORDER BY applied_on DESC';
  try {
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapLeave));
  } catch (err) {
    console.error('[leaves/GET]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/leaves/balance/:employeeId
router.get('/balance/:employeeId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM leave_balances WHERE employee_id = $1',
      [req.params.employeeId]
    );
    if (!rows.length) {
      return res.json({ paid: {total:18,used:0,remaining:18}, sick: {total:10,used:0,remaining:10}, casual: {total:7,used:0,remaining:7}, unpaid: {used:0} });
    }
    res.json(mapBalance(rows[0]));
  } catch (err) {
    console.error('[leaves/balance]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/leaves — apply for leave
router.post('/', async (req, res) => {
  const { employeeId, employeeName, leaveType, startDate, endDate, totalDays, reason } = req.body;
  const id = 'lr-' + Date.now();
  try {
    await pool.query(
      `INSERT INTO leave_requests (id, employee_id, employee_name, leave_type, start_date, end_date, total_days, reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, employeeId, employeeName, leaveType, startDate, endDate, totalDays, reason]
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('[leaves/POST]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/leaves/:id/review — approve or reject
router.put('/:id/review', async (req, res) => {
  const { status, approverName, comments } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM leave_requests WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found.' });
    const target = rows[0];

    await pool.query(
      `UPDATE leave_requests SET status=$1, approver_name=$2, approver_comments=$3, approved_at=NOW()
       WHERE id=$4`,
      [status, approverName, comments, req.params.id]
    );

    // Update balance if approved
    if (status === 'approved') {
      const colMap = { paid: 'paid_used', sick: 'sick_used', casual: 'casual_used', unpaid: 'unpaid_used' };
      const col = colMap[target.leave_type];
      if (col) {
        await pool.query(
          `UPDATE leave_balances SET ${col} = ${col} + $1, updated_at=NOW() WHERE employee_id=$2`,
          [target.total_days, target.employee_id]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[leaves/review]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/leaves/:id — cancel
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM leave_requests WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[leaves/DELETE]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
