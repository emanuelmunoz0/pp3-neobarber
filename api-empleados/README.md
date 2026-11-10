# api-empleados (ms-empleados)

Microservicio de empleados (barberos) de NeoBarber Gentleman's Club.
Implementa los diagramas de secuencia **Alta de Empleado** y **Baja de Empleado**.

## Puesta en marcha
1. `npm install`
2. Copiar `.env.example` a `.env` y completar los valores.
3. Crear la tabla: ejecutar `schema.sql` en el SQL Editor de Supabase (base api-empleados-barberia).
4. (Opcional) cargar empleados de ejemplo: `npm run seed`
5. `npm run dev` y probar `http://localhost:3002/health`

## Variables de entorno
| Variable | Descripción |
|---|---|
| `PORT` | Puerto local (3002) |
| `DATABASE_URL` | Cadena de conexión de Supabase (Transaction pooler) |
| `USUARIOS_API_URL` | URL de ms-usuarios (validación del token) |
| `TURNOS_API_URL` | URL de ms-turnos (turnos pendientes antes de la baja) |
| `CORS_ORIGINS` | Orígenes del frontend permitidos, separados por coma |

No requiere `JWT_SECRET`: el token se valida consultando a ms-usuarios.

## Endpoints
| Método y ruta | Acceso | Respuestas |
|---|---|---|
| `GET /api/empleados` | Público | 200 lista `[{id, nombre, apellido, cargo}]` |
| `GET /api/empleados/:id` | Público | 200 empleado; 400 id inválido; 404 no existe |
| `POST /api/empleados` | JWT + rol admin | 201 `{id, nombre, apellido, cargo}`; 400 datos incompletos; 401; 403 |
| `DELETE /api/empleados/:id` | JWT + rol admin | 200 `{mensaje, id}`; 404; 409 con turnos pendientes; 401; 403; 502 si ms-turnos no responde |
| `GET /health` | Público | 200 |

Cuerpo del alta: `{ "nombre": "...", "apellido": "...", "cargo": "..." }`.

## Lo que ms-empleados necesita de ms-turnos
`GET {TURNOS_API_URL}/api/turnos/barbero/{id}?estado=reservado`
- Debe responder **200** con la lista de turnos reservados de ese barbero a partir de hoy (arreglo vacío si no tiene ninguno).
- Se reenvía el header `Authorization` recibido.
- Si responde otra cosa o no responde, la baja se rechaza con 502 (no se elimina sin poder verificar).

## Estructura
- `src/routes/` rutas · `src/controllers/` lógica · `src/middlewares/` auth y validaciones
- `src/services/` llamadas a otros microservicios · `src/config/` base de datos · `src/scripts/` seed
