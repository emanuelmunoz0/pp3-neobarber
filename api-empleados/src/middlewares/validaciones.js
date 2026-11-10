// Validación de los datos de entrada, antes de llegar al controlador

// Alta de empleado: [Datos válidos] / [Datos incompletos o inválidos -> 400]
function validarEmpleado(req, res, next) {
  const { nombre, apellido, cargo } = req.body;
  const completo = [nombre, apellido, cargo].every(
    (campo) => typeof campo === "string" && campo.trim() !== ""
  );

  if (!completo) {
    return res.status(400).json({
      error: "Datos incompletos: nombre, apellido y cargo son obligatorios",
    });
  }
  next();
}

// El id de la ruta debe ser un entero positivo
function validarId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "El id debe ser un número entero positivo" });
  }
  next();
}

module.exports = { validarEmpleado, validarId };
