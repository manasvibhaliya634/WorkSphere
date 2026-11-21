const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const mockStore = require('./mockStore');

dotenv.config();

let pool = null;
let isMockMode = false;

// TiDB Cloud requires SSL configuration
const sslConfig = process.env.TIDB_ENABLE_SSL === 'true' 
  ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  : undefined;

const initDb = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'worksphere',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: sslConfig
    });

    const connection = await pool.getConnection();
    console.log(`✅ [Database] Successfully connected to MySQL database: "${process.env.DB_NAME || 'worksphere'}" at ${process.env.DB_HOST || '127.0.0.1'}`);
    connection.release();
    isMockMode = false;
  } catch (err) {
    console.warn(`⚠️ [Database] Could not connect to MySQL server (${err.code || err.message}).`);
    console.warn(`ℹ️ [Database] Running in Fallback In-Memory Demo Mode with pre-populated enterprise data.`);
    console.warn(`💡 [Database Tip] Once your MySQL service is started and database/worksphere.sql is imported, restart the backend to use MySQL.`);
    isMockMode = true;
  }
};

// Initial connection test
initDb();

const query = async (sql, params = []) => {
  if (!isMockMode && pool) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (err) {
      console.error('[Database Error]', err.message);
      throw err;
    }
  }

  // Fallback handler if MySQL is offline or not installed yet
  return null;
};

module.exports = {
  pool,
  query,
  isMockMode: () => isMockMode,
  getMockStore: () => mockStore
};
