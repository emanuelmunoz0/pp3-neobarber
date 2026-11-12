// Servicio de empleados conectado a api-empleados (ms-empleados).
// Lo comparten el panel admin y la reserva del cliente (vía turnosService).
import { pedirApi } from "../../api.js";

const API = import.meta.env.VITE_API_EMPLEADOS_URL;

// La API guarda "cargo"; el resto del front (reserva) sigue usando "especialidad"
const aFront = (e) => ({
  id: e.id,
  nombre: e.nombre,
  apellido: e.apellido,
  especialidad: e.cargo,
});

export async function listarEmpleados() {
  const lista = await pedirApi(API, "/api/empleados", { conToken: false });
  return lista.map(aFront);
}

export async function crearEmpleado({ nombre, apellido, especialidad }) {
  const nuevo = await pedirApi(API, "/api/empleados", {
    method: "POST",
    body: JSON.stringify({ nombre, apellido, cargo: especialidad }),
  });
  return aFront(nuevo);
}

export async function eliminarEmpleado(id) {
  await pedirApi(API, `/api/empleados/${id}`, { method: "DELETE" });
}

