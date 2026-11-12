const AppError = require('../utils/AppError');
const { usuariosClient, errorServicioExterno } = require('../utils/httpClient');

// Valida el JWT contra ms-usuarios (GET /validar-token)
//  - sin token                      -> 401
//  - token inválido o vencido       -> 401
//  - ms-usuarios caído / con error  -> 502 (504 si tarda demasiado)
module.exports = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado', 401);
    }

    const { data } = await usuariosClient.get('/validar-token', {
      headers: { Authorization: authorization },
    });

    if (!data || data.userId === undefined || !data.rol) {
      throw new AppError('Respuesta inválida de ms-usuarios', 502);
    }

    // ms-usuarios devuelve { userId, rol, valido }
    req.usuario = { id: Number(data.userId), userId: Number(data.userId), rol: data.rol };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    if (err.response?.status === 401) {
      return next(new AppError('Token inválido o vencido', 401));
    }
    next(errorServicioExterno(err, 'ms-usuarios'));
  }
};
