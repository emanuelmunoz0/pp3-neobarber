const axios = require("axios");

/**
 * Consulta a ms-turnos los turnos reservados (pendientes) de un barbero.
 * GET {TURNOS_API_URL}/api/turnos/barbero/{id}?estado=reservado
 * Se espera 200 OK con la lista de turnos (arreglo vacío si no tiene ninguno).
 * Cualquier otra respuesta o falla de red lanza un error: ante la duda no se elimina.
 */
async function obtenerTurnosReservados(barberoId, authHeader) {
  const respuesta = await axios.get(`${process.env.TURNOS_API_URL}/api/turnos/barbero/${barberoId}`, {
    params: { estado: "reservado" },
    headers: authHeader ? { Authorization: authHeader } : {},
    timeout: 10000,
  });

  const datos = respuesta.data;
  if (Array.isArray(datos)) return datos;
  return datos?.data || datos?.turnos || [];
}

module.exports = { obtenerTurnosReservados };
