// Validación de los datos de entrada, antes de llegar al controlador

function validarRegistro(req, res, next) {
  const { nombre, email, telefono, password } = req.body;

  // telefono es NOT NULL en la tabla, así que también se valida acá
  if (!nombre || !email || !telefono || !password) {
    return res.status(400).json({
      error: "Los campos nombre, email, telefono y password son obligatorios",
    });
  }
  next();
}

function validarLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Los campos email y password son obligatorios",
    });
  }
  next();
}

module.exports = { validarRegistro, validarLogin };
