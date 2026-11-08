/**
 * Script para dar de alta al usuario administrador (dueño de la barbería)
 * directamente en la base de datos, sin pasar por el registro público.
 *
 * Uso: npm run seed:admin
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const SALT_ROUNDS = 10;

async function seedAdmin() {
  const nombre = process.env.ADMIN_NOMBRE;
  const email = process.env.ADMIN_EMAIL;
  const telefono = process.env.ADMIN_TELEFONO;
  const password = process.env.ADMIN_PASSWORD;

  if (!nombre || !email || !telefono || !password) {
    console.error(
      "Faltan variables ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_TELEFONO o ADMIN_PASSWORD en el .env"
    );
    process.exit(1);
  }

  try {
    const existente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (existente.rows.length > 0) {
      console.log(`Ya existe un usuario con el email ${email}. No se creó nada.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, nombre, email, rol`,
      [nombre, email, telefono, passwordHash]
    );

    console.log("Usuario admin creado con éxito:", resultado.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("Error creando el usuario admin:", error);
    process.exit(1);
  }
}

seedAdmin();
