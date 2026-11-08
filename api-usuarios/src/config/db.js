const { Pool } = require("pg");
require("dotenv").config(); // Cargar variables de entorno desde el archivo .env

// Supabase requiere SSL para conexiones externas
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});

module.exports = pool;
