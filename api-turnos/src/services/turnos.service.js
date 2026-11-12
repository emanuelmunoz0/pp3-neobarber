const pool = require('../config/db');
const AppError = require('../utils/AppError');
const { empleadosClient, errorServicioExterno } = require('../utils/httpClient');
const {
  ESTADOS, parseId, ahoraNegocio, validarFecha, validarHorarioReservable,
} = require('../utils/negocio');

const hhmm = (hora) => String(hora).slice(0, 5);

// Consulta a ms-empleados que el barbero exista (GET /api/empleados/:id es público)
async function verificarBarbero(barberoId) {
  try {
    await empleadosClient.get(`/api/empleados/${barberoId}`);
  } catch (err) {
    if (err.response?.status === 404) throw new AppError('El barbero no existe', 404);
    throw errorServicioExterno(err, 'ms-empleados');
  }
}

async function crearTurno({ barbero_id, fecha, hora, usuario }) {
  if (usuario.rol !== 'cliente') {
    throw new AppError('Solo los clientes pueden reservar turnos', 403);
  }

  const barberoId = parseId(barbero_id, 'barbero_id');
  const horaNorm = validarHorarioReservable(fecha, hora);
  await verificarBarbero(barberoId);

  const ocupado = await pool.query(
    `SELECT 1 FROM turnos
     WHERE barbero_id = $1 AND fecha = $2 AND hora = $3 AND estado = 'reservado'`,
    [barberoId, fecha, horaNorm]
  );
  if (ocupado.rowCount > 0) throw new AppError('Horario ocupado', 409);

  // El cliente no puede tener dos turnos en el mismo momento con barberos distintos
  const solapado = await pool.query(
    `SELECT 1 FROM turnos
     WHERE cliente_id = $1 AND fecha = $2 AND hora = $3 AND estado = 'reservado'`,
    [usuario.id, fecha, horaNorm]
  );
  if (solapado.rowCount > 0) throw new AppError('Ya tenés un turno reservado en ese horario', 409);

  try {
    const { rows } = await pool.query(
      `INSERT INTO turnos (barbero_id, cliente_id, fecha, hora, estado)
       VALUES ($1, $2, $3, $4, 'reservado') RETURNING *`,
      [barberoId, usuario.id, fecha, horaNorm]
    );
    return rows[0];
  } catch (err) {
    // 23505 = unique_violation (carrera entre dos reservas simultáneas)
    if (err.code === '23505') throw new AppError('Horario ocupado', 409);
    throw err;
  }
}

async function listarPorCliente(cliente_id) {
  const { rows } = await pool.query(
    'SELECT * FROM turnos WHERE cliente_id = $1 ORDER BY fecha, hora',
    [cliente_id]
  );
  return rows;
}

// Lo usan el panel admin, ms-empleados (baja de empleado) y la pantalla de reserva.
//  - Admin: ve todos los datos de los turnos (incluido el cliente).
//  - Cliente: solo ve qué horarios están ocupados (sin datos de otros clientes).
//  - estado=reservado SIN fecha: solo turnos pendientes (de ahora en adelante).
//  - con fecha: todos los turnos de ese día.
async function listarPorBarbero(barberoIdParam, { estado, fecha } = {}, usuario) {
  const barberoId = parseId(barberoIdParam, 'barberoId');
  const esAdmin = usuario.rol === 'admin';

  if (estado !== undefined && (typeof estado !== 'string' || !ESTADOS.includes(estado))) {
    throw new AppError(`estado debe ser uno de: ${ESTADOS.join(', ')}`, 400);
  }
  if (fecha !== undefined) validarFecha(fecha);

  const estadoFiltro = esAdmin ? estado : 'reservado';
  const params = [barberoId];
  let sql = `SELECT ${esAdmin ? '*' : 'barbero_id, fecha, hora, estado'} FROM turnos WHERE barbero_id = $1`;

  if (estadoFiltro) {
    params.push(estadoFiltro);
    sql += ` AND estado = $${params.length}`;
  }
  if (fecha) {
    params.push(fecha);
    sql += ` AND fecha = $${params.length}`;
  } else if (estadoFiltro === 'reservado') {
    // Pendientes: de hoy en adelante, según la hora de la barbería (no la del servidor)
    const hoy = ahoraNegocio();
    params.push(hoy.fecha, hoy.hora);
    sql += ` AND (fecha > $${params.length - 1} OR (fecha = $${params.length - 1} AND hora > $${params.length}))`;
  }

  const { rows } = await pool.query(`${sql} ORDER BY fecha, hora`, params);
  return rows;
}

// Cancela un turno: el dueño del turno o un admin.
//  404 no existe · 403 es de otro cliente · 409 ya cancelado o ya pasó
async function cancelarTurno(idParam, usuario) {
  const id = parseId(idParam, 'id');

  const { rows: [turno] } = await pool.query('SELECT * FROM turnos WHERE id = $1', [id]);
  if (!turno) throw new AppError('Turno no encontrado', 404);

  if (usuario.rol !== 'admin' && Number(turno.cliente_id) !== usuario.id) {
    throw new AppError('No podés cancelar un turno que no es tuyo', 403);
  }
  if (turno.estado === 'cancelado') throw new AppError('El turno ya estaba cancelado', 409);

  const hoy = ahoraNegocio();
  if (turno.fecha < hoy.fecha || (turno.fecha === hoy.fecha && hhmm(turno.hora) <= hoy.hora)) {
    throw new AppError('No se puede cancelar un turno que ya pasó', 409);
  }

  const { rows } = await pool.query(
    `UPDATE turnos SET estado = 'cancelado'
     WHERE id = $1 AND estado = 'reservado' RETURNING *`,
    [id]
  );
  if (!rows[0]) throw new AppError('El turno ya estaba cancelado', 409);
  return rows[0];
}

module.exports = { crearTurno, listarPorCliente, listarPorBarbero, cancelarTurno };
