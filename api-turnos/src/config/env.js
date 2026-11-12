require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  usuariosApiUrl: process.env.USUARIOS_API_URL,
  empleadosApiUrl: process.env.EMPLEADOS_API_URL,
  // Admite comodines: https://*.netlify.app
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean),
  // Zona horaria de la barbería (el servidor en Vercel corre en UTC)
  zonaHoraria: process.env.TZ_NEGOCIO || 'America/Argentina/Buenos_Aires',
};
