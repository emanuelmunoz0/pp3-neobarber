// Llamadas reales a la API Usuarios
import { pedirApi } from "../api.js";

const URL_BASE = import.meta.env.VITE_API_USUARIOS_URL;

const enviar = (ruta, cuerpo) =>
  pedirApi(URL_BASE, ruta, { method: "POST", body: JSON.stringify(cuerpo), conToken: false });

export const registrar = (datos) => enviar("/users", datos);
export const iniciarSesion = (email, password) => enviar("/login", { email, password });
