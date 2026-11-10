import { useEffect, useState } from "react";
import { listarEmpleados, crearEmpleado, eliminarEmpleado } from "./services/empleadosService.js";

export default function AdminEmpleados() {
  const [lista, setLista] = useState([]);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [error, setError] = useState("");

  const cargar = () => listarEmpleados().then(setLista).catch((err) => setError(err.message));
  useEffect(() => { cargar(); }, []);

  async function crear(e) {
    e.preventDefault();
    setError("");
    try {
      await crearEmpleado({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        especialidad: especialidad.trim(),
      });
      setNombre("");
      setApellido("");
      setEspecialidad("");
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function eliminar(empleado) {
    if (!window.confirm(`¿Eliminar a ${empleado.nombre} ${empleado.apellido}?`)) return;
    setError("");
    try {
      await eliminarEmpleado(empleado.id);
      cargar();
    } catch (err) {
      // Por ejemplo 409: el empleado tiene turnos pendientes
      setError(err.message);
    }
  }

  return (
    <>
      <h1>Empleados</h1>
      <form className="adm-alta" onSubmit={crear}>
        <label>Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>Apellido
          <input value={apellido} onChange={(e) => setApellido(e.target.value)} required />
        </label>
        <label>Especialidad
          <input value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} placeholder="Ej: Fade y degradados" required />
        </label>
        <button>Agregar empleado</button>
      </form>

      {error && <p className="error" role="alert" style={{ marginBottom: "1rem" }}>{error}</p>}

      {lista.length ? (
        <ul className="adm-empleados">
          {lista.map((emp) => (
            <li key={emp.id}>
              <span className="adm-inicial">{emp.nombre[0]}</span>
              <div className="adm-datos">
                <strong>{emp.nombre} {emp.apellido}</strong>
                <span>{emp.especialidad || "Sin especialidad"}</span>
              </div>
              <button className="adm-peligro" onClick={() => eliminar(emp)}>Eliminar</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="adm-vacio">Todavía no hay empleados cargados.</p>
      )}
    </>
  );
}
