const AppError = require('../utils/AppError');

// Códigos de PostgreSQL que indican datos de entrada inválidos (no un fallo del servidor)
const PG_DATOS_INVALIDOS = ['22P02', '22003', '22007', '22008', '22001'];

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la solicitud es demasiado grande' });
  }
  if (PG_DATOS_INVALIDOS.includes(err.code)) {
    return res.status(400).json({ error: 'Datos inválidos en la solicitud' });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
};
