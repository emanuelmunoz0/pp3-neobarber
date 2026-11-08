# NeoBarber - Web (cliente + administrador)

Una sola aplicación React (Vite) con dos áreas:
- **Sitio y área del cliente:** portada, registro, login, reserva de turnos.
- **Panel de administración (`/admin`):** turnos del día y alta/baja de empleados.

El login es único: según el rol que devuelve la API Usuarios, el usuario va a su área.

## Cómo correrlo
1. `npm install`
2. Revisá que exista `.env` con la URL de la API Usuarios (`VITE_API_USUARIOS_URL`).
3. Copiá la imagen de portada `barberia-shop.png` a la carpeta `public/`.
4. `npm run dev` y abrí la dirección que muestra la terminal.

## Datos pendientes
- `src/pages/Landing.jsx`: completar dirección y teléfono (`DATOS`) y revisar precios.
- Turnos y empleados están simulados (localStorage) hasta que estén ms-turnos y ms-empleados:
  se reemplaza el contenido de `src/services/turnosService.js` y
  `src/admin/services/empleadosService.js` por llamadas reales.

## Admin
Entrá con el usuario admin cargado en la base (`npm run seed:admin` en la API Usuarios).
