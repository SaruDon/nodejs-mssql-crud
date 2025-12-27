const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

const getConnection = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('Connected to MSSQL database');
    }
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
};


module.exports = {
  getConnection,
  sql
};
