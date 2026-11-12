# api-usuarios (ms-usuarios)

Registro, login y validación de token (JWT) de NeoBarber.

| Ruta | Respuestas |
|---|---|
| `POST /users` `{nombre, email, telefono, password}` | **201** `{id, nombre, email, telefono, rol}` · 400 datos faltantes o inválidos · 409 email ya registrado |
| `POST /login` `{email, password}` | **200** `{token, userId, rol}` · 400 datos faltantes · 401 datos incorrectos |
| `GET /validar-token` (Bearer) | **200** `{userId, rol, valido: true}` · 401 `{valido: false}` (lo usan ms-turnos y ms-empleados) |
| `GET /health` | 200 |

Ruta inexistente: 404. JSON mal formado: 400. El rol de un registro público es siempre `cliente`; el admin se crea con `npm run seed:admin`.
El email se guarda en minúsculas y no distingue mayúsculas al iniciar sesión.
