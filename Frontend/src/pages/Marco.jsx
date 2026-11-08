import { Link } from "react-router-dom";

// Estructura común de login y registro
export default function Marco({ titulo, children }) {
  return (
    <main className="entrada">
      <Link to="/" className="logo"><img src="/logo.png" alt="NeoBarber" /></Link>
      <section className="tarjeta">
        <h1>{titulo}</h1>
        {children}
      </section>
    </main>
  );
}
