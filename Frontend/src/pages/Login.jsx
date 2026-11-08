import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Marco from "./Marco.jsx";
import { iniciarSesion } from "../services/usuariosService.js";
import { guardarSesion } from "../auth.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navegar = useNavigate();
  const { state } = useLocation();

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const sesion = await iniciarSesion(email, password);
      guardarSesion(sesion);
      navegar(sesion.rol === "admin" ? "/admin/turnos" : state?.destino || "/turnos");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Marco titulo="Iniciá sesión">
      {state?.mensaje && <p className="aviso">{state.mensaje}</p>}
      <form onSubmit={enviar}>
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={cargando}>{cargando ? "Ingresando..." : "Ingresar"}</button>
      </form>
      <p className="pie">¿Todavía no tenés cuenta? <Link to="/registro" state={state}>Crear cuenta</Link></p>
    </Marco>
  );
}
