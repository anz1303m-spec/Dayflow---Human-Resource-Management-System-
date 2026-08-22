-- Dayflow HRMS — PostgreSQL Schema
-- Run: psql -U postgres -d dayflow_db -f schema.sql

-- ─── Extensions ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Employees ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id                  TEXT PRIMARY KEY,               -- e.g. emp-001
  employee_code       TEXT UNIQUE NOT NULL,           -- e.g. DF-1001
  email               TEXT UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL DEFAULT 'password123',
  full_name           TEXT NOT NULL,
  role                TEXT NOT NULL DEFAULT 'employee', -- admin | hr | employee
  avatar              TEXT,
  department          TEXT,
  designation         TEXT,
  phone               TEXT,
  address             TEXT,
  reporting_manager   TEXT,
  work_location       TEXT,
  employment_type     TEXT DEFAULT 'full_time',
  joining_date        DATE,
  dob                 DATE,
  gender              TEXT,
  blood_group         TEXT,
  status              TEXT DEFAULT 'active',          -- active | inactive | on_leave
  is_email_verified   BOOLEAN DEFAULT FALSE,

  -- Emergency contact (denormalized for simplicity)
  emergency_name      TEXT,
  emergency_relation  TEXT,
  emergency_phone     TEXT,

  -- Salary structure (denormalized)
  ctc                       NUMERIC DEFAULT 0,
  basic_monthly             NUMERIC DEFAULT 0,
  hra                       NUMERIC DEFAULT 0,
  conveyance_allowance      NUMERIC DEFAULT 0,
  special_allowance         NUMERIC DEFAULT 0,
  performance_bonus         NUMERIC DEFAULT 0,
  pf_employee               NUMERIC DEFAULT 0,
  pf_employer               NUMERIC DEFAULT 0,
  professional_tax          NUMERIC DEFAULT 0,
  income_tax_tds            NUMERIC DEFAULT 0,
  health_insurance          NUMERIC DEFAULT 0,
  gross_monthly             NUMERIC DEFAULT 0,
  net_monthly               NUMERIC DEFAULT 0,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Attendance ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id            TEXT PRIMARY KEY,
  employee_id   TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  check_in      TEXT,   -- stored as time string e.g. "09:15 AM"
  check_out     TEXT,
  total_hours   NUMERIC DEFAULT 0,
  status        TEXT DEFAULT 'absent',  -- present | absent | late | leave | holiday
  is_regularized BOOLEAN DEFAULT FALSE,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ─── Leave Requests ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_requests (
  id              TEXT PRIMARY KEY,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name   TEXT NOT NULL,
  leave_type      TEXT NOT NULL,  -- paid | sick | casual | unpaid
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_days      INTEGER NOT NULL,
  reason          TEXT,
  status          TEXT DEFAULT 'pending',  -- pending | approved | rejected | cancelled
  applied_on      DATE DEFAULT CURRENT_DATE,
  approver_name   TEXT,
  approver_comments TEXT,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Leave Balances ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_balances (
  employee_id   TEXT PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  paid_total    INTEGER DEFAULT 18,
  paid_used     INTEGER DEFAULT 0,
  sick_total    INTEGER DEFAULT 10,
  sick_used     INTEGER DEFAULT 0,
  casual_total  INTEGER DEFAULT 7,
  casual_used   INTEGER DEFAULT 0,
  unpaid_used   INTEGER DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Salary Slips ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_slips (
  id              TEXT PRIMARY KEY,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name   TEXT NOT NULL,
  designation     TEXT,
  department      TEXT,
  month           TEXT NOT NULL,
  year            INTEGER NOT NULL,
  month_number    INTEGER,
  working_days    INTEGER DEFAULT 22,
  days_present    INTEGER DEFAULT 22,
  paid_leaves     INTEGER DEFAULT 0,
  lwp_days        INTEGER DEFAULT 0,

  -- Earnings
  earning_basic         NUMERIC DEFAULT 0,
  earning_hra           NUMERIC DEFAULT 0,
  earning_conveyance    NUMERIC DEFAULT 0,
  earning_special       NUMERIC DEFAULT 0,
  earning_bonus         NUMERIC DEFAULT 0,
  total_earnings        NUMERIC DEFAULT 0,

  -- Deductions
  deduction_pf          NUMERIC DEFAULT 0,
  deduction_pt          NUMERIC DEFAULT 0,
  deduction_tax         NUMERIC DEFAULT 0,
  deduction_insurance   NUMERIC DEFAULT 0,
  total_deductions      NUMERIC DEFAULT 0,

  net_pay         NUMERIC DEFAULT 0,
  payment_date    DATE,
  payment_status  TEXT DEFAULT 'paid',
  transaction_ref TEXT,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- ─── Employee Documents ───────────────────────────────────
CREATE TABLE IF NOT EXISTS employee_documents (
  id            TEXT PRIMARY KEY,
  employee_id   TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  category      TEXT,  -- contract | id_proof | tax | other
  file_name     TEXT,
  file_size     TEXT,
  upload_date   DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Seed: Default Admin ──────────────────────────────────
INSERT INTO employees (
  id, employee_code, email, password_hash, full_name, role,
  avatar, department, designation, phone, address,
  reporting_manager, work_location, employment_type,
  joining_date, dob, gender, blood_group, status, is_email_verified,
  emergency_name, emergency_relation, emergency_phone,
  ctc, basic_monthly, hra, conveyance_allowance, special_allowance, performance_bonus,
  pf_employee, pf_employer, professional_tax, income_tax_tds, health_insurance,
  gross_monthly, net_monthly
) VALUES (
  'emp-001', 'DF-1001', 'eleanor.vance@dayflow.corp', 'password123', 'Eleanor Vance', 'admin',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'Human Resources', 'Head of People & HR Ops', '+1 (555) 234-5678',
  '450 Mission St, San Francisco, CA',
  'Board of Directors', 'San Francisco HQ (Hybrid)', 'full_time',
  '2021-03-15', '1988-06-22', 'Female', 'O+', 'active', TRUE,
  'Thomas Vance', 'Spouse', '+1 (555) 987-6543',
  165000, 7000, 3500, 600, 2150, 500,
  840, 840, 200, 1800, 150,
  13750, 10760
) ON CONFLICT (id) DO NOTHING;

-- Seed leave balance for admin
INSERT INTO leave_balances (employee_id) VALUES ('emp-001') ON CONFLICT DO NOTHING;
