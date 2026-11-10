const service = require('../services/turnos.service');
const AppError = require('../utils/AppError');

exports.crear = async (req, res, next) => {
  try {
    const { barbero_id, fecha, hora } = req.body;
    if (!barbero_id || !fecha || !hora) {
      throw new AppError('barbero_id, fecha y hora son obligatorios', 400);
    }
    const turno = await service.crearTurno({
      barbero_id, fecha, hora, cliente_id: req.usuario.id,
    });
    res.status(201).json({ id: turno.id, estado: turno.estado, turno });
  } catch (err) { next(err); }
};

exports.misTurnos = async (req, res, next) => {
  try {
    res.json(await service.listarPorCliente(req.usuario.id));
  } catch (err) { next(err); }
};

exports.porBarbero = async (req, res, next) => {
  try {
    res.json(await service.listarPorBarbero(req.params.barberoId, {
      estado: req.query.estado,
      fecha: req.query.fecha,
    }));
  } catch (err) { next(err); }
};

exports.cancelar = async (req, res, next) => {
  try {
    res.json(await service.cancelarTurno(req.params.id, req.usuario.id));
  } catch (err) { next(err); }
};
