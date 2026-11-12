const { Pool } = require("pg");
require("dotenv").config();

// Supabase requiere SSL para conexiones externas
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // En serverless cada instancia abre su propio pool: pocas conexiones por instancia
  max: Number(process.env.DB_POOL_MAX) || 3,
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});

module.exports = pool;
