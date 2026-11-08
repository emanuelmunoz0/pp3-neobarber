require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Todas las rutas de esta API: /users, /login, /validar-token
app.use("/", authRoutes);

// Ruta simple de estado, útil para verificar que el servicio está arriba
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API Usuarios funcionando" });
});

const PORT = process.env.PORT || 3001;

// En Vercel el servidor no debe quedar "escuchando" un puerto (usa funciones
// serverless), así que solo llamamos a app.listen cuando corremos localmente.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Usuarios corriendo en el puerto ${PORT}`);
  });
}

module.exports = app;
