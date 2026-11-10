require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  usuariosApiUrl: process.env.USUARIOS_API_URL,
  empleadosApiUrl: process.env.EMPLEADOS_API_URL,
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
};
