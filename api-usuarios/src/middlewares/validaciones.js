// Validación de los datos de entrada, antes de llegar al controlador.
// Además normaliza: recorta espacios y pasa el email a minúsculas.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_RE = /^\+?[0-9\s()-]{6,20}$/;

const esTexto = (v) => typeof v === "string" && v.trim() !== "";

function validarRegistro(req, res, next) {
  const { nombre, email, password } = req.body || {};
  let { telefono } = req.body || {};
  if (typeof telefono === "number") telefono = String(telefono);

  // telefono es NOT NULL en la tabla, así que también se valida acá
  if (![nombre, email, telefono, password].every(esTexto)) {
    return res.status(400).json({
      error: "Los campos nombre, email, telefono y password son obligatorios",
    });
  }
  if (nombre.trim().length > 100) {
    return res.status(400).json({ error: "El nombre no puede superar los 100 caracteres" });
  }
  if (email.trim().length > 255 || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: "El email no tiene un formato válido" });
  }
  if (!TELEFONO_RE.test(telefono.trim())) {
    return res.status(400).json({ error: "El teléfono no tiene un formato válido" });
  }
  // bcrypt solo considera los primeros 72 bytes: se rechaza más largo en vez de truncar en silencio
  if (password.length < 6 || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ error: "La contraseña debe tener entre 6 y 72 caracteres" });
  }

  req.body = {
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    telefono: telefono.trim(),
    password,
  };
  next();
}

function validarLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!esTexto(email) || !esTexto(password)) {
    return res.status(400).json({
      error: "Los campos email y password son obligatorios",
    });
  }

  req.body = { email: email.trim().toLowerCase(), password };
  next();
}

module.exports = { validarRegistro, validarLogin };
