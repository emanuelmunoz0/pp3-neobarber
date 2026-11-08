// SIMULADO (localStorage). Lo comparten el panel admin y la reserva del cliente.
// Cuando exista ms-empleados, se reemplaza el contenido por llamadas reales.
const CLAVE = "empleados";
const INICIALES = [
  { id: 1, nombre: "Mateo", especialidad: "Fade y degradados" },
  { id: 2, nombre: "Lucas", especialidad: "Corte clásico y navaja" },
  { id: 3, nombre: "Tomás", especialidad: "Barba y perfilado" },
];

function leer() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    return Array.isArray(datos) ? datos : INICIALES;
  } catch { return INICIALES; }
}
const guardar = (lista) => localStorage.setItem(CLAVE, JSON.stringify(lista));

export async function listarEmpleados() {
  return leer();
}
export async function crearEmpleado({ nombre, especialidad }) {
  const nuevo = { id: Date.now(), nombre, especialidad };
  guardar([...leer(), nuevo]);
  return nuevo;
}
export async function eliminarEmpleado(id) {
  guardar(leer().filter((e) => e.id !== id));
}
