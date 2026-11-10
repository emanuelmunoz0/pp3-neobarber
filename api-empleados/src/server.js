require("dotenv").config();
const express = require("express");
const cors = require("cors");
const empleadosRoutes = require("./routes/empleadosRoutes");

const app = express();

// CORS: solo los orígenes del frontend listados en CORS_ORIGINS.
// Las llamadas entre servidores (sin cabecera Origin) siempre se permiten.
const origenesPermitidos = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origenesPermitidos.length === 0 || origenesPermitidos.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS"));
    },
  })
);
app.use(express.json());

app.use("/api/empleados", empleadosRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "API Empleados funcionando" });
});

// Manejo de errores (por ejemplo, CORS rechazado o JSON mal formado)
app.use((err, req, res, next) => {
  if (err.message === "Origen no permitido por CORS") {
    return res.status(403).json({ error: err.message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la solicitud no es un JSON válido" });
  }
  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3002;

// En Vercel (serverless) no se escucha un puerto: solo se exporta la app
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Empleados corriendo en el puerto ${PORT}`);
  });
}

module.exports = app;
