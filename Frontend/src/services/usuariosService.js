// Llamadas reales a la API Usuarios
const URL_BASE = import.meta.env.VITE_API_USUARIOS_URL;

async function pedir(ruta, cuerpo) {
  const respuesta = await fetch(URL_BASE + ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || "No se pudo completar la acción");
  return datos;
}

export const registrar = (datos) => pedir("/users", datos);
export const iniciarSesion = (email, password) => pedir("/login", { email, password });
