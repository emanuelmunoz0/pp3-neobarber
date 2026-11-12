const axios = require("axios");

/**
 * Identidad: ms-empleados no conoce el JWT_SECRET, por lo que le consulta
 * a ms-usuarios (GET /validar-token) reenviando el header Authorization.
 * - Token válido -> deja userId y rol en req.usuario y continúa
 * - Ausente, alterado o vencido -> 401
 * - ms-usuarios no responde o falla -> 502 (504 si tarda demasiado)
 */
async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    const respuesta = await axios.get(`${process.env.USUARIOS_API_URL}/validar-token`, {
      headers: { Authorization: authHeader },
      timeout: 10000,
    });
    if (!respuesta.data || respuesta.data.userId === undefined || !respuesta.data.rol) {
      return res.status(502).json({ error: "Respuesta inválida de ms-usuarios" });
    }
    req.usuario = { userId: respuesta.data.userId, rol: respuesta.data.rol };
    next();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ error: "Sesión expirada o token inválido" });
    }
    console.error("No se pudo contactar con ms-usuarios:", error.message);
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({ error: "ms-usuarios no respondió a tiempo" });
    }
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
