import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { cerrarSesion } from "../auth.js";
import "./admin.css";

export default function AdminLayout() {
  const navegar = useNavigate();

  function salir() {
    cerrarSesion();
    navegar("/");
  }

  return (
    <div className="adm">
      <header className="adm-barra">
        <img className="adm-logo" src="/logo.png" alt="NeoBarber" />
        <nav className="adm-nav" aria-label="Administración">
          <NavLink to="/admin/turnos">Turnos del día</NavLink>
          <NavLink to="/admin/empleados">Empleados</NavLink>
        </nav>
        <button className="secundario" onClick={salir}>Cerrar sesión</button>
      </header>
      <main className="adm-contenido">
        <Outlet />
      </main>
    </div>
  );
}
