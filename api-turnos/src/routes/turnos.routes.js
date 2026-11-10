const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/turnos.controller');

router.use(auth);

router.post('/', ctrl.crear);                       // POST /api/turnos
router.get('/mis-turnos', ctrl.misTurnos);          // GET  /api/turnos/mis-turnos
router.get('/barbero/:barberoId', ctrl.porBarbero); // GET  /api/turnos/barbero/:id?estado=&fecha= (lo consume ms-empleados)
router.patch('/:id/cancelar', ctrl.cancelar);       // PATCH /api/turnos/:id/cancelar

module.exports = router;
