// Configuración del JWT en un solo lugar
const jwt = require("jsonwebtoken");

// Genera el token del login (payload: userId y rol)
function generarToken(usuario) {
  return jwt.sign(
    { userId: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

// Verifica firma y vencimiento; lanza un error si el token no es válido
function verificarJwt(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generarToken, verificarJwt };
