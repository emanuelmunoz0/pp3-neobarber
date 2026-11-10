const AppError = require('../utils/AppError');
const { usuariosClient } = require('../utils/httpClient');

// Valida el JWT contra ms-usuarios (GET /validar-token)
module.exports = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado', 401);
    }

    const { data } = await usuariosClient.get('/validar-token', {
      headers: { Authorization: authorization },
    });

    // ms-usuarios devuelve { userId, rol, valido }
    req.usuario = { id: data.userId, userId: data.userId, rol: data.rol };
    next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }
    if (err.response) {
      const status = err.response.status === 401 ? 401 : 502;
      const msg = status === 401
        ? 'Token inválido o vencido'
        : 'No se pudo validar el token con ms-usuarios';
      return next(new AppError(msg, status));
    }
    console.error('Error llamando a ms-usuarios:', err.code, err.message);
    next(new AppError('ms-usuarios no responde', 503));
  }
};