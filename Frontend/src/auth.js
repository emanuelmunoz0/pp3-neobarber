// Guarda y lee la sesión (token, userId, rol) en el navegador
const CLAVE = "sesion";

export function guardarSesion(sesion) {
  localStorage.setItem(CLAVE, JSON.stringify(sesion));
}
export function obtenerSesion() {
  try { return JSON.parse(localStorage.getItem(CLAVE)); } catch { return null; }
}
export function cerrarSesion() {
  localStorage.removeItem(CLAVE);
}
