const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// SSL config for Aiven (production) — ignored in local development
const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: true }
  : false;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_retail_inventory',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  multipleStatements: false,
  dateStrings: true,
  typeCast: true,
  ssl: sslConfig
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('MySQL Database connected successfully ✅');
    connection.release();
  } catch (error) {
    logger.error('MySQL Database connection failed :', error.message);
  }
})();

module.exports = pool;
