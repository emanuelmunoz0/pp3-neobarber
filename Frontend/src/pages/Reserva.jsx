import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { obtenerSesion } from "../auth.js";
import {
  obtenerBarberos, obtenerHorariosLibres, crearTurno, formatearFecha,
} from "../services/turnosService.js";

const aISO = (d) => new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export default function Reserva() {
  const navegar = useNavigate();
  const sesion = obtenerSesion();
  const hoy = new Date();
  const maximo = new Date();
  maximo.setDate(maximo.getDate() + 30);

  const [barberos, setBarberos] = useState([]);
  const [barbero, setBarbero] = useState(null);
  const [fecha, setFecha] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [hora, setHora] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmado, setConfirmado] = useState(null);

  const esDomingo = fecha && new Date(`${fecha}T12:00:00`).getDay() === 0;

  useEffect(() => { obtenerBarberos().then(setBarberos); }, []);
  useEffect(() => {
    setHora("");
    if (barbero && fecha && !esDomingo) obtenerHorariosLibres(barbero.id, fecha).then(setHorarios);
    else setHorarios([]);
  }, [barbero, fecha]);

  if (sesion.rol !== "cliente") return <Navigate to="/turnos" replace />;

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const turno = { userId: sesion.userId, barberoId: barbero.id, barberoNombre: barbero.nombre, fecha, hora };
      await crearTurno(turno);
      setConfirmado(turno);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="app">
      <header className="barra"><Link to="/" className="logo"><img src="/logo.png" alt="NeoBarber" /></Link></header>
      <main className="contenido">
        <form className="reserva" onSubmit={enviar}>
          <h1>Reservar turno</h1>

          <fieldset>
            <legend>Seleccionar barbero</legend>
            <div className="opciones">
              {barberos.map((b) => (
                <button type="button" key={b.id} className="opcion"
                  aria-pressed={barbero?.id === b.id} onClick={() => setBarbero(b)}>
                  {b.nombre}<small>{b.especialidad}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <label>Seleccionar fecha
            <input type="date" value={fecha} min={aISO(hoy)} max={aISO(maximo)}
              onChange={(e) => setFecha(e.target.value)} required />
          </label>
          {esDomingo && <p className="error" role="alert">La barbería no abre los domingos. Elegí otro día.</p>}

          <fieldset>
            <legend>Seleccionar horario</legend>
            {horarios.length ? (
              <div className="opciones">
                {horarios.map(({ hora: h, libre }) => {
                  const pasado = fecha === aISO(hoy) && new Date(`${fecha}T${h}`) < hoy;
                  return (
                    <button type="button" key={h} className="opcion" disabled={!libre || pasado}
                      aria-pressed={hora === h} onClick={() => setHora(h)}>{h}</button>
                  );
                })}
              </div>
            ) : (
              <p className="suave">Elegí barbero y fecha para ver los horarios libres.</p>
            )}
          </fieldset>

          {error && <p className="error" role="alert">{error}</p>}
          <div className="acciones">
            <button type="button" className="secundario" onClick={() => navegar("/turnos")}>Cancelar</button>
            <button disabled={!barbero || !fecha || !hora || enviando}>{enviando ? "Enviando..." : "Enviar"}</button>
          </div>
        </form>
      </main>

      {confirmado && (
        <div className="velo">
          <div className="dialogo" role="dialog" aria-modal="true" aria-labelledby="t-ok">
            <h2 id="t-ok">¡Turno agendado con éxito!</h2>
            <p>{formatearFecha(confirmado.fecha)} a las {confirmado.hora} con {confirmado.barberoNombre}.</p>
            <button autoFocus onClick={() => navegar("/turnos")}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
