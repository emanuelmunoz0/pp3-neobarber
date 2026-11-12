// Reglas de negocio y validaciones de entrada de los turnos.
// Se validan acá (y no solo en el front) porque la API es el que manda.
const AppError = require('./AppError');
const { zonaHoraria } = require('../config/env');

// Lunes a sábado, de 10:00 a 19:00, un turno cada 30 minutos (último: 18:30)
const HORARIOS = Array.from({ length: 18 }, (_, i) => {
  const h = String(10 + Math.floor(i / 2)).padStart(2, '0');
  return `${h}:${i % 2 ? '30' : '00'}`;
});
const DIAS_MAXIMOS_ANTICIPACION = 30;
const ESTADOS = ['reservado', 'cancelado'];
const INT_MAX = 2147483647; // límite de un INTEGER de PostgreSQL

function parseId(valor, nombre = 'id') {
  const texto = String(valor ?? '').trim();
  const n = Number(texto);
  if (!/^\d+$/.test(texto) || n <= 0 || n > INT_MAX) {
    throw new AppError(`${nombre} debe ser un número entero positivo`, 400);
  }
  return n;
}

// Fecha y hora actuales en la zona horaria de la barbería
function ahoraNegocio() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: zonaHoraria,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const v = (tipo) => partes.find((p) => p.type === tipo).value;
  return { fecha: `${v('year')}-${v('month')}-${v('day')}`, hora: `${v('hour')}:${v('minute')}` };
}

function validarFecha(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new AppError('fecha debe tener formato YYYY-MM-DD', 400);
  }
  const [a, m, d] = fecha.split('-').map(Number);
  const f = new Date(Date.UTC(a, m - 1, d));
  if (f.getUTCFullYear() !== a || f.getUTCMonth() !== m - 1 || f.getUTCDate() !== d) {
    throw new AppError('fecha no es una fecha válida', 400);
  }
  return fecha;
}

function normalizarHora(hora) {
  const m = typeof hora === 'string' ? /^(\d{1,2}):(\d{2})(?::00)?$/.exec(hora.trim()) : null;
  if (!m) throw new AppError('hora debe tener formato HH:MM', 400);
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

function diaDeLaSemana(fecha) {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0 = domingo
}

function sumarDias(fecha, dias) {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

// Valida que (fecha, hora) sea un horario reservable. Devuelve la hora normalizada "HH:MM".
function validarHorarioReservable(fecha, hora) {
  validarFecha(fecha);
  const h = normalizarHora(hora);

  if (!HORARIOS.includes(h)) {
    throw new AppError('Horario fuera de atención: turnos de 10:00 a 18:30, cada 30 minutos', 400);
  }
  if (diaDeLaSemana(fecha) === 0) {
    throw new AppError('La barbería no abre los domingos', 400);
  }
  const hoy = ahoraNegocio();
  if (fecha < hoy.fecha || (fecha === hoy.fecha && h <= hoy.hora)) {
    throw new AppError('No se puede reservar un turno en el pasado', 400);
  }
  if (fecha > sumarDias(hoy.fecha, DIAS_MAXIMOS_ANTICIPACION)) {
    throw new AppError(`Solo se puede reservar con hasta ${DIAS_MAXIMOS_ANTICIPACION} días de anticipación`, 400);
  }
  return h;
}

module.exports = {
  HORARIOS, ESTADOS, parseId, ahoraNegocio, validarFecha, normalizarHora,
  diaDeLaSemana, sumarDias, validarHorarioReservable,
};
