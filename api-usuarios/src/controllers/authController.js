const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { generarToken } = require("../utils/token");

const SALT_ROUNDS = 10;

/**
 * POST /users
 * Diagrama: Registro de Usuario
 * - (validarRegistro ya comprobó los campos obligatorios)
 * - Verifica si el email ya existe
 * - Hashea el password
 * - Asigna rol = "cliente" por defecto
 * - Inserta el usuario y devuelve 201
 */
async function registrar(req, res) {
  const { nombre, email, telefono, password } = req.body;

  try {
    // SELECT id FROM usuarios WHERE email = ?
    const existente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1", [email] // el signo $ es un marcador que usa postGreSQL para proteger contra inyecciones SQL
    );

    if (existente.rows.length > 0) {
      // Email ya registrado -> 409 Conflict
      return res.status(409).json({
        error: "El email ya está registrado",
      });
    }

    // Email disponible -> hashear password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Asigna rol = "cliente" por defecto (nunca se elige desde el formulario)
    const rol = "cliente";

    // INSERT INTO usuarios (nombre, email, telefono, password_hash, rol)
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, telefono, rol`,
      [nombre, email, telefono, passwordHash, rol]
    );

    const usuarioCreado = resultado.rows[0];

    // 201 Created -> {id, nombre, email, telefono, rol}
    return res.status(201).json(usuarioCreado);
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * POST /login
 * Diagrama: Login de Usuario
 * - (validarLogin ya comprobó los campos obligatorios)
 * - Busca el usuario por email
 * - Si no existe -> 401
 * - Si existe, compara password con bcrypt.compare
 * - Si es correcto -> genera JWT (userId, rol) y responde 200
 * - Si es incorrecto -> 401
 */
async function login(req, res) {
  const { email, password } = req.body;

  try {
    // SELECT * FROM usuarios WHERE email = ?
    const resultado = await pool.query(
      "SELECT id, password_hash, rol FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      // Usuario no existe -> 401 Unauthorized
      return res.status(401).json({ error: "Datos incorrectos" });
    }

    const usuario = resultado.rows[0];

    // Compara password con bcrypt.compare(password, password_hash)
    const passwordCorrecto = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordCorrecto) {
      // Password incorrecto -> 401 Unauthorized
      return res.status(401).json({ error: "Datos incorrectos" });
    }

    // Password correcto -> Genera token JWT (incluye userId, rol)
    const token = generarToken(usuario);

    // 200 OK -> {token, userId, rol}
    return res.status(200).json({
      token,
      userId: usuario.id,
      rol: usuario.rol,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * GET /validar-token
 * Diagrama: Validación de Token entre APIs (Turnos -> Usuarios)
 * - El middleware autenticar ya verificó el token y dejó los datos en req.usuario
 * - Responde 200 {userId, rol, valido: true}
 * - Si el token es inválido o expiró, autenticar responde 401 {valido: false}
 */
function validarToken(req, res) {
  return res.status(200).json({
    userId: req.usuario.userId,
    rol: req.usuario.rol,
    valido: true,
  });
}

module.exports = { registrar, login, validarToken };
