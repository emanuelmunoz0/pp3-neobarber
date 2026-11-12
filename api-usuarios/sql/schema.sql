-- Tabla usuarios (referencia: correr en el SQL Editor de Supabase si la base está vacía)
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  telefono      VARCHAR(30)  NOT NULL,
  password_hash TEXT         NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'cliente',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Un email no puede repetirse (sin distinguir mayúsculas). Si ya hay duplicados, este índice falla:
-- borrá o unificá los duplicados antes de crearlo.
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email ON usuarios (LOWER(email));
