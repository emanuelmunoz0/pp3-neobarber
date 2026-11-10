// Servicio de empleados conectado a api-empleados (ms-empleados).
// Lo comparten el panel admin y la reserva del cliente (vía turnosService).
import { obtenerSesion } from "../../auth.js";

const API = import.meta.env.VITE_API_EMPLEADOS_URL;

const token = () => obtenerSesion()?.token;

async function pedir(ruta, opciones = {}) {
  const res = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...opciones.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al comunicarse con el servidor");
  return data;
}

// La API guarda "cargo"; el resto del front (reserva) sigue usando "especialidad"
const aFront = (e) => ({
  id: e.id,
  nombre: e.nombre,
  apellido: e.apellido,
  especialidad: e.cargo,
});

export async function listarEmpleados() {
  const lista = await pedir("/api/empleados");
  return lista.map(aFront);
}

export async function crearEmpleado({ nombre, apellido, especialidad }) {
  const nuevo = await pedir("/api/empleados", {
    method: "POST",
    body: JSON.stringify({ nombre, apellido, cargo: especialidad }),
  });
  return aFront(nuevo);
}

export async function eliminarEmpleado(id) {
  await pedir(`/api/empleados/${id}`, { method: "DELETE" });
}