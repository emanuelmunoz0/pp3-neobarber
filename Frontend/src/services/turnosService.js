// Servicio de turnos SIMULADO: guarda en el navegador (localStorage).
// Cuando estén las APIs de Turnos y Empleados, se reemplaza el contenido de
// estas funciones por llamadas reales y las pantallas no cambian.
import { listarEmpleados } from "../admin/services/empleadosService.js";

const CLAVE = "turnos";

// Lunes a sábado, de 10:00 a 19:00, un turno cada 30 minutos
const HORARIOS = Array.from({ length: 18 }, (_, i) => {
  const h = 10 + Math.floor(i / 2);
  return `${h}:${i % 2 ? "30" : "00"}`;
});

const leer = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; }
};

export const formatearFecha = (fecha) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

// Los barberos son los empleados que carga el administrador
export async function obtenerBarberos() {
  return listarEmpleados();
}

export async function obtenerHorariosLibres(barberoId, fecha) {
  const ocupados = leer()
    .filter((t) => t.barberoId === barberoId && t.fecha === fecha)
    .map((t) => t.hora);
  return HORARIOS.map((hora) => ({ hora, libre: !ocupados.includes(hora) }));
}

export async function crearTurno(turno) {
  const todos = leer();
  const repetido = todos.some(
    (t) => t.barberoId === turno.barberoId && t.fecha === turno.fecha && t.hora === turno.hora
  );
  if (repetido) throw new Error("Ese horario ya fue reservado. Elegí otro.");
  todos.push({ id: Date.now(), ...turno });
  localStorage.setItem(CLAVE, JSON.stringify(todos));
  return turno;
}

export async function obtenerProximoTurno(userId) {
  const ahora = new Date();
  const futuros = leer()
    .filter((t) => t.userId === userId && new Date(`${t.fecha}T${t.hora}`) >= ahora)
    .sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));
  return futuros[0] || null;
}

// El cliente cancela uno de sus propios turnos
export async function cancelarTurno(id, userId) {
  const restantes = leer().filter((t) => !(t.id === id && t.userId === userId));
  localStorage.setItem(CLAVE, JSON.stringify(restantes));
}

// Para el panel admin: todos los turnos de una fecha, ordenados por hora
export async function obtenerTurnosDeFecha(fecha) {
  return leer()
    .filter((t) => t.fecha === fecha)
    .sort((a, b) => a.hora.localeCompare(b.hora));
}
