import { useEffect, useState } from "react";
import { obtenerTurnosDeFecha, cancelarTurno } from "../services/turnosService.js";

const aISO = (d) => new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export default function AdminTurnos() {
  const hoy = aISO(new Date());
  const [fecha, setFecha] = useState(hoy);
  const [turnos, setTurnos] = useState([]);
  const [barbero, setBarbero] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = () =>
    obtenerTurnosDeFecha(fecha)
      .then(setTurnos)
      .catch((err) => { setTurnos([]); setError(err.message); })
      .finally(() => setCargando(false));

  useEffect(() => {
    setCargando(true);
    setBarbero("");
    setError("");
    setAviso("");
    cargar();
  }, [fecha]);

  async function cancelar(t) {
    if (!window.confirm(`¿Cancelar el turno de las ${t.hora} con ${t.barberoNombre} (cliente N.º ${t.userId})?`)) return;
    setError("");
    setAviso("");
    try {
      await cancelarTurno(t.id);
      setAviso("Turno cancelado.");
    } catch (err) {
      setError(err.message);
    }
    cargar();
  }

  const barberos = [...new Set(turnos.map((t) => t.barberoNombre))];
  const lista = barbero ? turnos.filter((t) => t.barberoNombre === barbero) : turnos;
  const ahora = new Date().toTimeString().slice(0, 5);
  const proximo = fecha === hoy ? lista.find((t) => t.hora >= ahora) : null;
  // Solo se pueden cancelar turnos que todavía no pasaron
  const cancelable = (t) => fecha > hoy || (fecha === hoy && t.hora > ahora);
  const esDomingo = new Date(`${fecha}T12:00:00`).getDay() === 0;

  return (
    <>
      <h1>Turnos del día</h1>
      <div className="adm-filtros">
        <label>Fecha
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </label>
        <label>Barbero
          <select value={barbero} onChange={(e) => setBarbero(e.target.value)}>
            <option value="">Todos</option>
            {barberos.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
      </div>

      {aviso && <p className="aviso" role="status">{aviso}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {cargando ? (
        <p className="suave">Cargando turnos...</p>
      ) : lista.length ? (
        <>
          <p className="suave">{lista.length} {lista.length === 1 ? "turno" : "turnos"}</p>
          <ul className="adm-agenda">
            {lista.map((t) => (
              <li key={t.id} className={t === proximo ? "adm-proximo" : ""}>
                <span className="adm-hora">{t.hora}</span>
                <div className="adm-datos">
                  <strong>Cliente N.º {t.userId}</strong>
                  <span>con {t.barberoNombre}</span>
                </div>
                {t === proximo && <span className="adm-marca">Próximo</span>}
                {cancelable(t) && (
                  <button className="adm-peligro" onClick={() => cancelar(t)}>Cancelar</button>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="adm-vacio">
          {esDomingo
            ? "La barbería no abre los domingos."
            : "No hay turnos reservados para este día. Los que reserven los clientes aparecen acá."}
        </p>
      )}
    </>
  );
}
