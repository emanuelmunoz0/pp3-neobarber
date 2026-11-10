const pool = require('../config/db');
const AppError = require('../utils/AppError');

async function crearTurno({ barbero_id, fecha, hora, cliente_id }) {
  const existente = await pool.query(
    `SELECT id FROM turnos
     WHERE barbero_id = $1 AND fecha = $2 AND hora = $3 AND estado = 'reservado'`,
    [barbero_id, fecha, hora]
  );
  if (existente.rowCount > 0) throw new AppError('Horario ocupado', 409);

  try {
    const { rows } = await pool.query(
      `INSERT INTO turnos (barbero_id, cliente_id, fecha, hora, estado)
       VALUES ($1, $2, $3, $4, 'reservado') RETURNING *`,
      [barbero_id, cliente_id, fecha, hora]
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

// Usado por el admin y por ms-empleados (baja de empleado).
// Con estado=reservado devuelve solo los turnos pendientes (fecha >= hoy).
async function listarPorBarbero(barbero_id, { estado, fecha } = {}) {
  const params = [barbero_id];
  let sql = 'SELECT * FROM turnos WHERE barbero_id = $1';

  if (estado) {
    params.push(estado);
    sql += ` AND estado = $${params.length}`;
    if (estado === 'reservado') sql += ' AND fecha >= CURRENT_DATE';
  }
  if (fecha) {
    params.push(fecha);
    sql += ` AND fecha = $${params.length}`;
  }

  const { rows } = await pool.query(sql + ' ORDER BY fecha, hora', params);
  return rows;
}

async function cancelarTurno(id, cliente_id) {
  const { rows } = await pool.query(
    `UPDATE turnos SET estado = 'cancelado'
     WHERE id = $1 AND cliente_id = $2 AND estado = 'reservado' RETURNING *`,
    [id, cliente_id]
  );
  if (!rows[0]) throw new AppError('Turno no encontrado', 404);
  return rows[0];
}

module.exports = { crearTurno, listarPorCliente, listarPorBarbero, cancelarTurno };
