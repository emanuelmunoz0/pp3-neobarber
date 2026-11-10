const express = require("express");
const router = express.Router();
const { listar, obtener, crear, eliminar } = require("../controllers/empleadosController");
const { verificarToken, soloAdmin } = require("../middlewares/auth");
const { validarEmpleado, validarId } = require("../middlewares/validaciones");

// Públicas
router.get("/", listar);
router.get("/:id", validarId, obtener);

// Privadas (JWT + rol admin)
router.post("/", verificarToken, soloAdmin, validarEmpleado, crear);
router.delete("/:id", verificarToken, soloAdmin, validarId, eliminar);

module.exports = router;
