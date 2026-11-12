// Validación de los datos de entrada, antes de llegar al controlador

const INT_MAX = 2147483647; // límite de un INTEGER de PostgreSQL
const MAX_CAMPO = 100;      // largo de las columnas VARCHAR(100)

// Alta de empleado: [Datos válidos] / [Datos incompletos o inválidos -> 400]
function validarEmpleado(req, res, next) {
  const { nombre, apellido, cargo } = req.body || {};
  const completo = [nombre, apellido, cargo].every(
    (campo) => typeof campo === "string" && campo.trim() !== ""
  );

  if (!completo) {
    return res.status(400).json({
      error: "Datos incompletos: nombre, apellido y cargo son obligatorios",
    });
  }
  if ([nombre, apellido, cargo].some((campo) => campo.trim().length > MAX_CAMPO)) {
    return res.status(400).json({
      error: `nombre, apellido y cargo no pueden superar los ${MAX_CAMPO} caracteres`,
    });
  }
  next();
}

// El id de la ruta debe ser un entero positivo
function validarId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0 || id > INT_MAX) {
    return res.status(400).json({ error: "El id debe ser un número entero positivo" });
  }
  next();
}

module.exports = { validarEmpleado, validarId };
