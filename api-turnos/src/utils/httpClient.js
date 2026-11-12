const axios = require('axios');
const AppError = require('./AppError');
const { usuariosApiUrl, empleadosApiUrl } = require('../config/env');

const usuariosClient = axios.create({ baseURL: usuariosApiUrl, timeout: 8000 });
const empleadosClient = axios.create({ baseURL: empleadosApiUrl, timeout: 8000 });

// Traduce una falla al llamar a otro microservicio:
// timeout -> 504 Gateway Timeout, cualquier otra falla -> 502 Bad Gateway
function errorServicioExterno(err, servicio) {
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return new AppError(`${servicio} no respondió a tiempo`, 504);
  }
  console.error(`Error llamando a ${servicio}:`, err.code || err.response?.status, err.message);
  return new AppError(`No se pudo comunicar con ${servicio}`, 502);
}

module.exports = { usuariosClient, empleadosClient, errorServicioExterno };
