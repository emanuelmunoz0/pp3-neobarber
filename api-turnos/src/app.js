const express = require('express');
const cors = require('cors');
const { corsOrigins } = require('./config/env');
const turnosRoutes = require('./routes/turnos.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors({ origin: corsOrigins.length ? corsOrigins : true }));
app.use(express.json());

app.get('/', (req, res) => res.json({ servicio: 'ms-turnos', estado: 'ok' }));
app.use('/api/turnos', turnosRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;
