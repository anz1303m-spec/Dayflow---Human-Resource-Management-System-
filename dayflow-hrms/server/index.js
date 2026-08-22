require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./db');

const authRoutes       = require('./routes/auth');
const employeeRoutes   = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leavesRoutes     = require('./routes/leaves');
const payrollRoutes    = require('./routes/payroll');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── Health ───────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/employees',  employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves',     leavesRoutes);
app.use('/api/payroll',    payrollRoutes);

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✦ Dayflow API Server  →  http://localhost:${PORT}`);
  console.log(`  ✦ Health check        →  http://localhost:${PORT}/api/health\n`);
});
