// Arranque local: npm run dev / npm start
const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`ms-turnos escuchando en http://localhost:${port}`);
});
