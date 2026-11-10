const axios = require('axios');
const { usuariosApiUrl, empleadosApiUrl } = require('../config/env');

const usuariosClient = axios.create({ baseURL: usuariosApiUrl, timeout: 8000 });
const empleadosClient = axios.create({ baseURL: empleadosApiUrl, timeout: 8000 });

module.exports = { usuariosClient, empleadosClient };
