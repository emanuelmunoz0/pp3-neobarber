const express = require("express");
const router = express.Router();
const { registrar, login, validarToken } = require("../controllers/authController");
const { autenticar } = require("../middlewares/auth");
const { validarRegistro, validarLogin } = require("../middlewares/validaciones");

// Registro de usuario (rol "cliente" asignado automáticamente)
router.post("/users", validarRegistro, registrar);

// Login de usuario (devuelve JWT con userId y rol)
router.post("/login", validarLogin, login);

// Endpoint consultado por otras APIs (ej: API Turnos) para validar el token
router.get("/validar-token", autenticar, validarToken);

// Ejemplo de ruta solo para administradores (descomentar cuando exista el controlador):
// const { soloAdmin } = require("../middlewares/auth");
// router.get("/users", autenticar, soloAdmin, listarUsuarios);

module.exports = router;
