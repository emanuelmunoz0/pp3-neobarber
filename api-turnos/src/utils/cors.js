// Permite orígenes exactos o con comodín (ej: https://*.netlify.app).
// Sin lista configurada, se permite cualquier origen.
function aRegex(patron) {
  const escapado = patron
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[a-z0-9-]+');
  return new RegExp(`^${escapado}$`, 'i');
}

function crearVerificadorOrigen(lista) {
  const reglas = lista.map(aRegex);
  return (origin) => !origin || lista.length === 0 || reglas.some((r) => r.test(origin));
}

module.exports = { crearVerificadorOrigen };
