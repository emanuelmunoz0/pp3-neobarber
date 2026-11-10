const pool = require("../config/db");
const { obtenerTurnosReservados } = require("../services/turnosService");

const ERROR_INTERNO = { error: "Error interno del servidor" };

/**
 * GET /api/empleados
 * Público: lo usan la portada (equipo) y la reserva de turnos
 */
async function listar(req, res) {
  try {
    const resultado = await pool.query(
      "SELECT id, nombre, apellido, cargo FROM empleados ORDER BY id"
    );
    return res.status(200).json(resultado.rows);
  } catch (error) {
    console.error("Error al listar empleados:", error);
    return res.status(500).json(ERROR_INTERNO);
  }
}

/**
 * GET /api/empleados/:id
 * Público: lo usa ms-turnos para comprobar que el barbero existe
 */
async function obtener(req, res) {
  try {
    const resultado = await pool.query(
      "SELECT id, nombre, apellido, cargo FROM empleados WHERE id = $1",
      [Number(req.params.id)]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    return res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    return res.status(500).json(ERROR_INTERNO);
  }
}

/**
 * POST /api/empleados
 * Diagrama: Alta de Empleado
 * - (verificarToken, soloAdmin y validarEmpleado ya se ejecutaron)
 * - INSERT INTO empleados (nombre, apellido, cargo) VALUES (?, ?, ?)
 * - 201 Created {id, nombre, apellido, cargo}
 */
async function crear(req, res) {
  const nombre = req.body.nombre.trim();
  const apellido = req.body.apellido.trim();
  const cargo = req.body.cargo.trim();

  try {
    const resultado = await pool.query(
      `INSERT INTO empleados (nombre, apellido, cargo)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, apellido, cargo`,
      [nombre, apellido, cargo]
    );
    return res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al crear empleado:", error);
    return res.status(500).json(ERROR_INTERNO);
  }
}

/**
 * DELETE /api/empleados/:id
 * Diagrama: Baja de Empleado
 * - SELECT del empleado (si no existe -> 404)
 * - GET /api/turnos/barbero/{id}?estado=reservado a ms-turnos
 * - Sin turnos pendientes -> DELETE FROM empleados y 200 OK
 * - Con turnos pendientes -> 409 Conflict
 * - Si ms-turnos no responde -> 502 (no se elimina sin poder verificar)
 */
async function eliminar(req, res) {
  const id = Number(req.params.id);

  try {
    // SELECT id, nombre, apellido, cargo FROM empleados WHERE id = ?
    const empleado = await pool.query(
      "SELECT id, nombre, apellido, cargo FROM empleados WHERE id = $1",
      [id]
    );
    if (empleado.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    // Turnos pendientes del barbero en ms-turnos
    let turnos;
    try {
      turnos = await obtenerTurnosReservados(id, req.headers.authorization);
    } catch (error) {
      console.error("No se pudo consultar ms-turnos:", error.message);
      return res.status(502).json({
        error: "No se pudo verificar los turnos del empleado. Intente nuevamente.",
      });
    }

    if (turnos.length > 0) {
      // Tiene turnos pendientes (caso fallido) -> 409 Conflict
      return res.status(409).json({
        error: "Empleado con turnos pendientes: reasigne o cancele sus turnos",
      });
    }

    // No tiene turnos pendientes -> DELETE FROM empleados WHERE id = ?
    await pool.query("DELETE FROM empleados WHERE id = $1", [id]);
    return res.status(200).json({ mensaje: "Empleado eliminado", id });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    return res.status(500).json(ERROR_INTERNO);
  }
}

module.exports = { listar, obtener, crear, eliminar };
