const { Pool, types } = require('pg');
const { databaseUrl } = require('./env');

// Devuelve las columnas DATE como texto ("2026-11-20") en vez de objeto Date
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  // En serverless cada instancia abre su propio pool: pocas conexiones por instancia
  max: Number(process.env.DB_POOL_MAX) || 3,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err.message);
});

module.exports = pool;
