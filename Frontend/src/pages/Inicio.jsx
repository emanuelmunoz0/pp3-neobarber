import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerSesion, cerrarSesion } from "../auth.js";
import { obtenerProximoTurno, cancelarTurno, formatearFecha } from "../services/turnosService.js";

export default function Inicio() {
  const navegar = useNavigate();
  const sesion = obtenerSesion();
  const esCliente = sesion.rol === "cliente";
  const [turno, setTurno] = useState(null);
  const [cargando, setCargando] = useState(esCliente);
  const [aviso, setAviso] = useState("");

  const cargar = () =>
    obtenerProximoTurno(sesion.userId).then(setTurno).finally(() => setCargando(false));

  useEffect(() => {
    if (esCliente) cargar();
  }, []);

  async function cancelar() {
    const detalle = `${formatearFecha(turno.fecha)} a las ${turno.hora} con ${turno.barberoNombre}`;
    if (!window.confirm(`¿Cancelar tu turno del ${detalle}?`)) return;
    await cancelarTurno(turno.id, sesion.userId);
    setAviso("Tu turno fue cancelado.");
    cargar();
  }

  function salir() {
    cerrarSesion();
    navegar("/");
  }

  return (
    <div className="app">
      <header className="barra">
        <Link to="/" className="logo"><img src="/logo.png" alt="NeoBarber" /></Link>
        <div className="barra-acciones">
          <Link to="/" className="enlace">Ir al inicio</Link>
          <button className="secundario" onClick={salir}>Cerrar sesión</button>
        </div>
      </header>
      <main className="contenido">
        {esCliente ? (
          <>
            {aviso && <p className="aviso" role="status">{aviso}</p>}
            <section className="proximo">
              <h1>Tu próximo turno</h1>
              {cargando ? (
                <p className="suave">Buscando tu turno...</p>
              ) : turno ? (
                <>
                  <div className="ficha">
                    <p className="hora">{turno.hora}</p>
                    <p className="detalle">
                      <span className="fecha">{formatearFecha(turno.fecha)}</span><br />
                      con {turno.barberoNombre}
                    </p>
                  </div>
                  <div className="acciones-turno">
                    <button className="peligro" onClick={cancelar}>Cancelar turno</button>
                  </div>
                </>
              ) : (
                <p className="suave">No tenés turnos agendados. Elegí barbero, día y horario en un minuto.</p>
              )}
            </section>
            <button onClick={() => navegar("/reservar")}>Reservar turno</button>
          </>
        ) : (
          <p className="aviso">Esta pantalla es para clientes. La gestión de turnos del administrador tiene su propio panel.</p>
        )}
      </main>
      <footer className="pie-local">Lunes a sábado, de 10:00 a 19:00</footer>
    </div>
  );
}
