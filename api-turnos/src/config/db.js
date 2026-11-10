const { Pool, types } = require('pg');
const { databaseUrl } = require('./env');

// Devuelve las columnas DATE como texto ("2026-11-20") en vez de objeto Date
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;