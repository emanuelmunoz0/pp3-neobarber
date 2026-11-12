// Cliente HTTP común a las tres APIs: manejo uniforme de errores y de sesión vencida
import { obtenerSesion, cerrarSesion } from "./auth.js";

export class ErrorApi extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}

/**
 * pedirApi(base, ruta, { conToken, ...opcionesDeFetch })
 * - Agrega el Bearer token si hay sesión (salvo conToken: false)
 * - Sin conexión -> ErrorApi con status 0
 * - 401 con sesión iniciada -> el token venció: limpia la sesión y vuelve al login
 * - Otro error HTTP -> ErrorApi con el mensaje que mandó la API
 */
export async function pedirApi(base, ruta, { conToken = true, ...opciones } = {}) {
  const token = obtenerSesion()?.token;

  let res;
  try {
    res = await fetch(`${base}${ruta}`, {
      ...opciones,
      headers: {
        ...(opciones.body ? { "Content-Type": "application/json" } : {}),
        ...(conToken && token ? { Authorization: `Bearer ${token}` } : {}),
        ...opciones.headers,
      },
    });
  } catch {
    throw new ErrorApi("No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.", 0);
  }

  const datos = await res.json().catch(() => ({}));

  if (res.status === 401 && conToken && token) {
    cerrarSesion();
    sessionStorage.setItem("avisoSesion", "Tu sesión expiró. Iniciá sesión de nuevo.");
    window.location.replace("/login");
    throw new ErrorApi("Tu sesión expiró. Iniciá sesión de nuevo.", 401);
  }
  if (!res.ok) {
    throw new ErrorApi(datos.error || "Error al comunicarse con el servidor", res.status);
  }
  return datos;
}
