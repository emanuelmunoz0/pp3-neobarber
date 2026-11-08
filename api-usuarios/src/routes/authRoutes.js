const express = require("express");
const router = express.Router();
const { registrar, login, validarToken } = require("../controllers/authController");

// Registro de usuario (rol "cliente" asignado automáticamente)
router.post("/users", registrar);

// Login de usuario (devuelve JWT con userId y rol)
router.post("/login", login);

// Endpoint consultado por otras APIs (ej: API Turnos) para validar el token
router.get("/validar-token", validarToken);

module.exports = router;
