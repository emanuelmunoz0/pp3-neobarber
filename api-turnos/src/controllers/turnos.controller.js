const service = require('../services/turnos.service');
const AppError = require('../utils/AppError');

// POST /api/turnos -> 201 | 400 | 401 | 403 | 404 (barbero) | 409 (horario ocupado) | 502/504
exports.crear = async (req, res, next) => {
  try {
    const { barbero_id, fecha, hora } = req.body || {};
    if (barbero_id === undefined || barbero_id === null || !fecha || !hora) {
      throw new AppError('barbero_id, fecha y hora son obligatorios', 400);
    }
    const turno = await service.crearTurno({ barbero_id, fecha, hora, usuario: req.usuario });
    res.status(201).json({ id: turno.id, estado: turno.estado, turno });
  } catch (err) { next(err); }
};

// GET /api/turnos/mis-turnos -> 200
exports.misTurnos = async (req, res, next) => {
  try {
    res.status(200).json(await service.listarPorCliente(req.usuario.id));
  } catch (err) { next(err); }
};

// GET /api/turnos/barbero/:barberoId?estado=&fecha= -> 200 | 400 | 401
exports.porBarbero = async (req, res, next) => {
  try {
    const turnos = await service.listarPorBarbero(
      req.params.barberoId,
      { estado: req.query.estado, fecha: req.query.fecha },
      req.usuario
    );
    res.status(200).json(turnos);
  } catch (err) { next(err); }
};

// PATCH /api/turnos/:id/cancelar -> 200 | 400 | 401 | 403 | 404 | 409
exports.cancelar = async (req, res, next) => {
  try {
    res.status(200).json(await service.cancelarTurno(req.params.id, req.usuario));
  } catch (err) { next(err); }
};
