const { verificarJwt } = require("../utils/token");

/**
 * Identidad: lee el header Authorization: Bearer <token> y lo verifica.
 * - Token válido -> deja los datos en req.usuario y continúa
 * - Ausente, alterado o vencido -> 401 (mantiene valido: false para quienes consumen /validar-token)
 */
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ valido: false, error: "Token requerido" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ valido: false, error: "Token requerido" });
  }

  try {
    const payload = verificarJwt(token);
    req.usuario = { userId: payload.userId, rol: payload.rol };
    next();
  } catch (error) {
    return res.status(401).json({ valido: false, error: "Token inválido o vencido" });
  }
}

/**
 * Permisos: debe ejecutarse después de autenticar.
 * Si el rol no es admin -> 403 Forbidden
 */
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado: se requiere rol administrador" });
  }
  next();
}

module.exports = { autenticar, soloAdmin };
