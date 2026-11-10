const axios = require("axios");

/**
 * Identidad: ms-empleados no conoce el JWT_SECRET, por lo que le consulta
 * a ms-usuarios (GET /validar-token) reenviando el header Authorization.
 * - Token válido -> deja userId y rol en req.usuario y continúa
 * - Ausente, alterado o vencido -> 401
 * - ms-usuarios no responde -> 502
 */
async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    const respuesta = await axios.get(`${process.env.USUARIOS_API_URL}/validar-token`, {
      headers: { Authorization: authHeader },
      timeout: 10000,
    });
    req.usuario = { userId: respuesta.data.userId, rol: respuesta.data.rol };
    next();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ error: "Sesión expirada o token inválido" });
    }
    console.error("No se pudo contactar con ms-usuarios:", error.message);
    return res.status(502).json({ error: "No se pudo contactar con ms-usuarios" });
  }
}

/**
 * Permisos: debe ejecutarse después de verificarToken.
 * Si el rol no es admin -> 403 Forbidden
 */
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado: se requiere rol administrador" });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };
