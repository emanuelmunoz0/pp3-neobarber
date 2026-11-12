const express = require('express');
const cors = require('cors');
const { corsOrigins } = require('./config/env');
const { crearVerificadorOrigen } = require('./utils/cors');
const turnosRoutes = require('./routes/turnos.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Orígenes permitidos (CORS_ORIGINS, admite comodines como https://*.netlify.app).
// Las llamadas entre servidores no envían Origin y siempre se permiten.
const origenPermitido = crearVerificadorOrigen(corsOrigins);
app.use(cors({ origin: (origin, callback) => callback(null, origenPermitido(origin)) }));
app.use(express.json());

app.get('/', (req, res) => res.status(200).json({ servicio: 'ms-turnos', estado: 'ok' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'API Turnos funcionando' }));
app.use('/api/turnos', turnosRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;
