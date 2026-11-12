// Servicio de turnos conectado a api-turnos (ms-turnos).
import { listarEmpleados } from "../admin/services/empleadosService.js";
import { pedirApi } from "../api.js";

const API = import.meta.env.VITE_API_TURNOS_URL;

// Lunes a sábado, de 10:00 a 19:00, un turno cada 30 minutos
const HORARIOS = Array.from({ length: 18 }, (_, i) => {
  const h = 10 + Math.floor(i / 2);
  return `${h}:${i % 2 ? "30" : "00"}`;
});

// El backend devuelve la hora como "15:00:00"; el front trabaja con "15:00"
const normHora = (h) => String(h).slice(0, 5);
const normFecha = (f) => String(f).slice(0, 10);

const pedir = (ruta, opciones) => pedirApi(API, ruta, opciones);

export const formatearFecha = (fecha) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

// Los barberos son los empleados cargados por el administrador (ms-empleados)
export async function obtenerBarberos() {
  return listarEmpleados();
}

// Turnos activos de un barbero (ignora los cancelados)
async function turnosDeBarbero(barberoId, fecha) {
  const lista = await pedir(`/api/turnos/barbero/${barberoId}?fecha=${fecha}`);
  return (Array.isArray(lista) ? lista : lista.turnos || [])
    .filter((t) => t.estado !== "cancelado")
    .filter((t) => normFecha(t.fecha) === fecha);
}

export async function obtenerHorariosLibres(barberoId, fecha) {
  const ocupados = (await turnosDeBarbero(barberoId, fecha)).map((t) => normHora(t.hora));
  return HORARIOS.map((hora) => ({
    hora,
    libre: !ocupados.includes(hora.padStart(5, "0")) && !ocupados.includes(hora),
  }));
}

export async function crearTurno({ barberoId, barberoNombre, fecha, hora, userId }) {
  // El backend saca al cliente del token: no se envía userId
  await pedir("/api/turnos", {
    method: "POST",
    body: JSON.stringify({ barbero_id: barberoId, fecha, hora }),
  });
  return { barberoId, barberoNombre, fecha, hora, userId };
}

export async function obtenerProximoTurno() {
  const [mios, barberos] = await Promise.all([
    pedir("/api/turnos/mis-turnos"),
    obtenerBarberos(),
  ]);
  const ahora = new Date();
  const futuros = mios
    .filter((t) => t.estado !== "cancelado")
    .map((t) => ({
      id: t.id,
      barberoId: t.barbero_id,
      barberoNombre: barberos.find((b) => b.id === t.barbero_id)?.nombre ?? `Barbero ${t.barbero_id}`,
      fecha: normFecha(t.fecha),
      hora: normHora(t.hora),
    }))
    .filter((t) => new Date(`${t.fecha}T${t.hora}`) >= ahora)
    .sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));
  return futuros[0] || null;
}

// El cliente cancela uno de sus propios turnos (el admin puede cancelar cualquiera)
export async function cancelarTurno(id) {
  await pedir(`/api/turnos/${id}/cancelar`, { method: "PATCH" });
}

// Panel admin: no hay un endpoint "todos los turnos de una fecha",
// así que se consulta barbero por barbero y se unen los resultados
export async function obtenerTurnosDeFecha(fecha) {
  const barberos = await obtenerBarberos();
  const porBarbero = await Promise.all(
    barberos.map(async (b) => {
      const ts = await turnosDeBarbero(b.id, fecha);
      return ts.map((t) => ({
        id: t.id,
        barberoId: b.id,
        barberoNombre: b.nombre,
        userId: t.cliente_id,
        fecha,
        hora: normHora(t.hora),
      }));
    })
  );
  return porBarbero.flat().sort((a, b) => a.hora.localeCompare(b.hora));
}