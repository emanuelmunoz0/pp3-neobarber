const axios = require("axios");

/**
 * Consulta a ms-turnos los turnos reservados (pendientes) de un barbero.
 * GET {TURNOS_API_URL}/api/turnos/barbero/{id}?estado=reservado
 * Se espera 200 OK con la lista de turnos (arreglo vacío si no tiene ninguno).
 * Cualquier otra respuesta, formato inesperado o falla de red lanza un error:
 * ante la duda NO se elimina el empleado.
 */
async function obtenerTurnosReservados(barberoId, authHeader) {
  const respuesta = await axios.get(`${process.env.TURNOS_API_URL}/api/turnos/barbero/${barberoId}`, {
    params: { estado: "reservado" },
    headers: authHeader ? { Authorization: authHeader } : {},
    timeout: 10000,
  });

  const datos = respuesta.data;
  if (Array.isArray(datos)) return datos;
  if (datos && Array.isArray(datos.turnos)) return datos.turnos;
  if (datos && Array.isArray(datos.data)) return datos.data;
  throw new Error("Respuesta inesperada de ms-turnos (se esperaba una lista de turnos)");
}

module.exports = { obtenerTurnosReservados };
