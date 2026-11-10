-- Tabla empleados (correr en el SQL Editor de Supabase, base api-empleados-barberia)
CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    fecha_alta TIMESTAMP NOT NULL DEFAULT NOW()
);
