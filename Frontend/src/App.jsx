import { Routes, Route, Navigate } from "react-router-dom";
import { obtenerSesion } from "./auth.js";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import Inicio from "./pages/Inicio.jsx";
import Reserva from "./pages/Reserva.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminTurnos from "./admin/AdminTurnos.jsx";
import AdminEmpleados from "./admin/AdminEmpleados.jsx";

// Áreas protegidas: es comodidad visual, la seguridad real la verifican las APIs
function SoloCliente({ children }) {
  const sesion = obtenerSesion();
  if (!sesion) return <Navigate to="/login" replace />;
  if (sesion.rol === "admin") return <Navigate to="/admin/turnos" replace />;
  return children;
}

function SoloAdmin({ children }) {
  return obtenerSesion()?.rol === "admin" ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/turnos" element={<SoloCliente><Inicio /></SoloCliente>} />
      <Route path="/reservar" element={<SoloCliente><Reserva /></SoloCliente>} />

      <Route path="/admin" element={<SoloAdmin><AdminLayout /></SoloAdmin>}>
        <Route index element={<Navigate to="turnos" replace />} />
        <Route path="turnos" element={<AdminTurnos />} />
        <Route path="empleados" element={<AdminEmpleados />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
