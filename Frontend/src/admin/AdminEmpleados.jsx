import { useEffect, useState } from "react";
import { listarEmpleados, crearEmpleado, eliminarEmpleado } from "./services/empleadosService.js";

export default function AdminEmpleados() {
  const [lista, setLista] = useState([]);
  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");

  const cargar = () => listarEmpleados().then(setLista);
  useEffect(() => { cargar(); }, []);

  async function crear(e) {
    e.preventDefault();
    await crearEmpleado({ nombre: nombre.trim(), especialidad: especialidad.trim() });
    setNombre("");
    setEspecialidad("");
    cargar();
  }

  async function eliminar(empleado) {
    if (!window.confirm(`¿Eliminar a ${empleado.nombre}?`)) return;
    await eliminarEmpleado(empleado.id);
    cargar();
  }

  return (
    <>
      <h1>Empleados</h1>
      <form className="adm-alta" onSubmit={crear}>
        <label>Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>Especialidad
          <input value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} placeholder="Ej: Fade y degradados" />
        </label>
        <button>Agregar empleado</button>
      </form>

      {lista.length ? (
        <ul className="adm-empleados">
          {lista.map((emp) => (
            <li key={emp.id}>
              <span className="adm-inicial">{emp.nombre[0]}</span>
              <div className="adm-datos">
                <strong>{emp.nombre}</strong>
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
