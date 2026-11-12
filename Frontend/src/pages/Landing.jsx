import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { obtenerSesion } from "../auth.js";
import { obtenerBarberos } from "../services/turnosService.js";

// Completá estos datos con los de tu barbería. Los precios son de ejemplo.
const DATOS = { direccion: "Completar dirección, Ciudad", telefono: "Completar teléfono" };
const SERVICIOS = [
  { nombre: "Corte de cabello", detalle: "Lavado, corte a tijera o máquina y terminación a navaja.", duracion: "40 min", precio: "$12.000" },
  { nombre: "Corte y barba", detalle: "Corte completo más arreglo de barba con toalla caliente.", duracion: "1 h 10 min", precio: "$17.000" },
  { nombre: "Arreglo de barba", detalle: "Perfilado a navaja y cuidado de la piel.", duracion: "30 min", precio: "$8.000" },
  { nombre: "Afeitado a navaja", detalle: "Afeitado clásico con toallas calientes y frías.", duracion: "40 min", precio: "$9.000" },
];
const CINTA = ["Corte clásico", "Barba", "Afeitado a navaja", "Lunes a sábado, 10:00 a 19:00", "Domingo cerrado"];

export default function Landing() {
  const sesion = obtenerSesion();
  const esAdmin = sesion?.rol === "admin";
  // Sin cuenta, "Reservar turno" lleva a registrarse y después a la reserva
  const reservar = sesion
    ? { to: "/reservar" }
    : { to: "/registro", state: { destino: "/reservar" } };

  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);
  const [equipo, setEquipo] = useState([]);
  useEffect(() => { obtenerBarberos().then(setEquipo).catch(() => setEquipo([])); }, []);

  return (
    <div className="sitio">
      <header className="cabecera">
        <Link to="/" className="logo" onClick={cerrar}>
          <img src="/logo.png" alt="NeoBarber" />
        </Link>

        <button
          type="button"
          className="hamburguesa"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto(!abierto)}
        >
          <span /><span /><span />
        </button>

        <div id="menu-principal" className={"menu" + (abierto ? " menu--abierto" : "")}>
          <nav aria-label="Principal">
            <a href="#casa" onClick={cerrar}>Nosotros</a>
            <a href="#servicios" onClick={cerrar}>Servicios</a>
            <a href="#equipo" onClick={cerrar}>Equipo</a>
            <a href="#contacto" onClick={cerrar}>Contacto</a>
          </nav>
          <div className="cabecera-acciones">
            <Link to={sesion ? "/turnos" : "/login"} className="enlace" onClick={cerrar}>
              {sesion ? (esAdmin ? "Panel" : "Mis turnos") : "Ingresar"}
            </Link>
            <Link {...reservar} className="boton" onClick={cerrar}>Reservar turno</Link>
          </div>
        </div>
      </header>

      <section className="hero" id="casa">
        <h1>Un corte se construye <em>despacio.</em></h1>
        <p>Corte, barba y afeitado a navaja. Elegí barbero, día, horario y reservá en un minuto.
          Cada corte incluye café de cortesía.
        </p>
        <div className="hero-acciones">
          <Link {...reservar} className="boton">Reservar turno</Link>
          <a href="#servicios" className="boton boton--borde">Ver servicios</a>
        </div>
      </section>

      <div className="cinta" aria-hidden="true">
        <div className="cinta-pista">
          {[...CINTA, ...CINTA, ...CINTA, ...CINTA].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      <section className="seccion" id="servicios">
        <p className="etiqueta">— Servicios</p>
        <h2>Hecho a mano, <em>con dedicación.</em></h2>
        <ul className="servicios">
          {SERVICIOS.map((s) => (
            <li key={s.nombre}>
              <div><h3>{s.nombre}</h3><p>{s.detalle}</p></div>
              <div className="precio"><strong>{s.precio}</strong><span>{s.duracion}</span></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="seccion" id="equipo">
        <p className="etiqueta">— El equipo</p>
        <h2>Las manos detrás del oficio.</h2>
        <ul className="equipo">
          {equipo.map((b) => (
            <li key={b.id}>
              <span className="inicial">{b.nombre[0]}</span>
              <h3>{b.nombre}</h3>
              <p>{b.especialidad}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="seccion contacto" id="contacto">
        <p className="etiqueta">— Pasá por la casa</p>
        <h2>Te esperamos de lunes a sábado.</h2>
        <dl>
          <div><dt>Horarios</dt><dd>Lunes a sábado, 10:00 a 19:00<br />Domingo cerrado</dd></div>
          <div><dt>Dirección</dt><dd>{DATOS.direccion}</dd></div>
          <div><dt>Teléfono</dt><dd>{DATOS.telefono}</dd></div>
        </dl>
        <Link {...reservar} className="boton">Reservar turno</Link>
      </section>

      <footer className="pie-sitio">© NeoBarber Gentleman's Club. Todos los derechos reservados.</footer>
    </div>
  );
}
