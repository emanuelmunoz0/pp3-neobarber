CREATE TABLE IF NOT EXISTS turnos (
  id          SERIAL PRIMARY KEY,
  barbero_id  INTEGER NOT NULL,
  cliente_id  INTEGER NOT NULL,
  fecha       DATE    NOT NULL,
  hora        TIME    NOT NULL,
  estado      VARCHAR(20) NOT NULL DEFAULT 'reservado',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evita doble reserva aunque lleguen dos requests a la vez
CREATE UNIQUE INDEX IF NOT EXISTS uq_turno_reservado
  ON turnos (barbero_id, fecha, hora)
  WHERE estado = 'reservado';
