# api-turnos (ms-turnos)

Microservicio de turnos de NeoBarber. Se relaciona con:
- **ms-usuarios**: valida el JWT (`GET /validar-token`) en cada request.
- **ms-empleados**: comprueba que el barbero exista (`GET /api/empleados/:id`) al reservar.
- **ms-empleados** lo consulta a él (`GET /api/turnos/barbero/:id?estado=reservado`) antes de dar de baja a un empleado.

## Puesta en marcha
1. `npm install`
2. Copiar `.env.example` a `.env` y completar.
3. Ejecutar `sql/schema.sql` en el SQL Editor de Supabase.
4. `npm run dev` y probar `http://localhost:3000/health`

## Endpoints (todos requieren `Authorization: Bearer <token>`)
| Ruta | Quién | Respuestas |
|---|---|---|
| `POST /api/turnos` `{barbero_id, fecha, hora}` | cliente | **201** creado · 400 datos faltantes/inválidos o fuera de horario · 401 · 403 no es cliente · 404 el barbero no existe · 409 horario ocupado · 502/504 ms-empleados/ms-usuarios no responde |
| `GET /api/turnos/mis-turnos` | cualquiera | 200 · 401 |
| `GET /api/turnos/barbero/:barberoId?estado=&fecha=` | admin (datos completos) / cliente (solo horarios ocupados) | 200 · 400 id/estado/fecha inválidos · 401 |
| `PATCH /api/turnos/:id/cancelar` | dueño del turno o admin | 200 · 400 · 401 · 403 turno de otro cliente · 404 · 409 ya cancelado o ya pasó |
| `GET /health` | público | 200 |

Cualquier ruta inexistente responde 404 y un JSON mal formado responde 400.

## Reglas de negocio (validadas en la API)
- Lunes a sábado, de 10:00 a 18:30, un turno cada 30 minutos. Domingos cerrado.
- No se puede reservar en el pasado ni con más de 30 días de anticipación (hora de Argentina).
- Un barbero no puede tener dos turnos `reservado` en el mismo día y hora, ni un cliente dos en el mismo momento.
- `estado=reservado` sin `fecha` devuelve solo los turnos pendientes (de ahora en adelante).

## Variables de entorno
Ver `.env.example`. En Vercel se cargan desde el panel del proyecto (el `.env` no se sube).
