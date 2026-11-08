import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Marco from "./Marco.jsx";
import { registrar } from "../services/usuariosService.js";

export default function Registro() {
  const [datos, setDatos] = useState({ nombre: "", email: "", telefono: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navegar = useNavigate();
  const { state } = useLocation();

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await registrar(datos);
      navegar("/login", {
        state: { mensaje: "Cuenta creada. Ya podés iniciar sesión.", destino: state?.destino },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Marco titulo="Creá tu cuenta">
      <form onSubmit={enviar}>
        <label>Nombre
          <input value={datos.nombre} onChange={cambiar("nombre")} required />
        </label>
        <label>Email
          <input type="email" value={datos.email} onChange={cambiar("email")} required />
        </label>
        <label>Teléfono
          <input type="tel" value={datos.telefono} onChange={cambiar("telefono")} required />
        </label>
        <label>Contraseña
          <input type="password" value={datos.password} onChange={cambiar("password")} required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={cargando}>{cargando ? "Creando..." : "Crear cuenta"}</button>
      </form>
      <p className="pie">¿Ya tenés cuenta? <Link to="/login" state={state}>Iniciar sesión</Link></p>
    </Marco>
  );
}
