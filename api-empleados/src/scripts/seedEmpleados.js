/**
 * Carga empleados de ejemplo si la tabla está vacía (útil para la demostración).
 * Uso: npm run seed
 */
require("dotenv").config();
const pool = require("../config/db");

const EJEMPLO = [
  ["Mateo", "Fernández", "Barbero - Fade y degradados"],
  ["Lucas", "Romero", "Barbero - Corte clásico y navaja"],
  ["Tomás", "Acosta", "Barbero - Barba y perfilado"],
];

async function seed() {
  try {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS total FROM empleados");
    if (rows[0].total > 0) {
      console.log("La tabla empleados ya tiene datos. No se cargó nada.");
      process.exit(0);
    }
    for (const [nombre, apellido, cargo] of EJEMPLO) {
      await pool.query("INSERT INTO empleados (nombre, apellido, cargo) VALUES ($1, $2, $3)", [nombre, apellido, cargo]);
    }
    console.log(`Se cargaron ${EJEMPLO.length} empleados de ejemplo.`);
    process.exit(0);
  } catch (error) {
    console.error("Error al cargar empleados de ejemplo:", error);
    process.exit(1);
  }
}

seed();
