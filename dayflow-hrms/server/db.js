const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dayflow_hrms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

module.exports = pool;