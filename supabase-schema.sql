-- ============================================
-- SCHEMA DE BASE DE DATOS PARA SIGE-PLUS
-- ============================================
-- Este script crea todas las tablas necesarias para
-- almacenar los datos extraídos del portal SIGE
-- ============================================

-- ============================================
-- TABLA: estudiantes
-- Almacena la información personal de cada estudiante
-- ============================================
CREATE TABLE IF NOT EXISTS estudiantes (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    curp VARCHAR(18) UNIQUE,
    email VARCHAR(255),
    celular VARCHAR(15),
    carrera VARCHAR(255),
    cuatrimestre VARCHAR(10),
    promedio VARCHAR(10),
    creditos_cursados VARCHAR(10),
    creditos_totales VARCHAR(10),
    ultima_actualizacion TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_estudiantes_matricula ON estudiantes (matricula);

CREATE INDEX IF NOT EXISTS idx_estudiantes_curp ON estudiantes (curp);

CREATE INDEX IF NOT EXISTS idx_estudiantes_email ON estudiantes (email);

-- ============================================
-- TABLA: materias_historial
-- Almacena todo el historial académico del estudiante
-- ============================================
CREATE TABLE IF NOT EXISTS materias_historial (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    estudiante_matricula VARCHAR(20) NOT NULL REFERENCES estudiantes (matricula) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    calificacion VARCHAR(10),
    creditos VARCHAR(10),
    periodo VARCHAR(50),
    profesor VARCHAR(255),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_materias_historial_estudiante ON materias_historial (estudiante_matricula);

CREATE INDEX IF NOT EXISTS idx_materias_historial_periodo ON materias_historial (periodo);

-- ============================================
-- TABLA: calificaciones_actuales
-- Almacena las calificaciones del cuatrimestre actual
-- ============================================
CREATE TABLE IF NOT EXISTS calificaciones_actuales (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    estudiante_matricula VARCHAR(20) NOT NULL REFERENCES estudiantes (matricula) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    calificacion VARCHAR(10),
    creditos VARCHAR(10),
    periodo VARCHAR(50),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_calificaciones_actuales_estudiante ON calificaciones_actuales (estudiante_matricula);

-- ============================================
-- TABLA: adeudos
-- Almacena los adeudos/pagos pendientes del estudiante
-- ============================================
CREATE TABLE IF NOT EXISTS adeudos (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    estudiante_matricula VARCHAR(20) NOT NULL REFERENCES estudiantes (matricula) ON DELETE CASCADE,
    concepto VARCHAR(255) NOT NULL,
    monto VARCHAR(50),
    fecha_limite VARCHAR(50),
    estado VARCHAR(50) DEFAULT 'Pendiente',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_adeudos_estudiante ON adeudos (estudiante_matricula);

CREATE INDEX IF NOT EXISTS idx_adeudos_estado ON adeudos (estado);

-- ============================================
-- TABLA: sincronizaciones
-- Registra cada vez que se sincronizan datos del portal
-- ============================================
CREATE TABLE IF NOT EXISTS sincronizaciones (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    estudiante_matricula VARCHAR(20) NOT NULL REFERENCES estudiantes (matricula) ON DELETE CASCADE,
    fecha TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        exitoso BOOLEAN DEFAULT true,
        mensaje TEXT,
        datos_extraidos JSONB,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sincronizaciones_estudiante ON sincronizaciones (estudiante_matricula);

CREATE INDEX IF NOT EXISTS idx_sincronizaciones_fecha ON sincronizaciones (fecha DESC);

-- ============================================
-- TRIGGERS: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a las tablas que tienen updated_at
CREATE TRIGGER update_estudiantes_updated_at
  BEFORE UPDATE ON estudiantes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calificaciones_actuales_updated_at
  BEFORE UPDATE ON calificaciones_actuales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adeudos_updated_at
  BEFORE UPDATE ON adeudos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;

ALTER TABLE materias_historial ENABLE ROW LEVEL SECURITY;

ALTER TABLE calificaciones_actuales ENABLE ROW LEVEL SECURITY;

ALTER TABLE adeudos ENABLE ROW LEVEL SECURITY;

ALTER TABLE sincronizaciones ENABLE ROW LEVEL SECURITY;

-- Política: Los estudiantes solo pueden ver sus propios datos
CREATE POLICY estudiantes_policy ON estudiantes
  FOR ALL
  USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

CREATE POLICY materias_historial_policy ON materias_historial
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM estudiantes 
      WHERE estudiantes.matricula = materias_historial.estudiante_matricula
      AND (auth.uid()::text = estudiantes.id::text OR auth.role() = 'service_role')
    )
  );

CREATE POLICY calificaciones_actuales_policy ON calificaciones_actuales
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM estudiantes 
      WHERE estudiantes.matricula = calificaciones_actuales.estudiante_matricula
      AND (auth.uid()::text = estudiantes.id::text OR auth.role() = 'service_role')
    )
  );

CREATE POLICY adeudos_policy ON adeudos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM estudiantes 
      WHERE estudiantes.matricula = adeudos.estudiante_matricula
      AND (auth.uid()::text = estudiantes.id::text OR auth.role() = 'service_role')
    )
  );

CREATE POLICY sincronizaciones_policy ON sincronizaciones
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM estudiantes 
      WHERE estudiantes.matricula = sincronizaciones.estudiante_matricula
      AND (auth.uid()::text = estudiantes.id::text OR auth.role() = 'service_role')
    )
  );

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Resumen completo de cada estudiante
CREATE OR REPLACE VIEW estudiantes_resumen AS
SELECT
    e.matricula,
    e.nombre,
    e.apellido_paterno,
    e.apellido_materno,
    e.email,
    e.carrera,
    e.cuatrimestre,
    e.promedio,
    COUNT(DISTINCT mh.id) as total_materias_historial,
    COUNT(DISTINCT ca.id) as total_calificaciones_actuales,
    COUNT(
        DISTINCT CASE
            WHEN ad.estado = 'Pendiente' THEN ad.id
        END
    ) as adeudos_pendientes,
    e.ultima_actualizacion
FROM
    estudiantes e
    LEFT JOIN materias_historial mh ON e.matricula = mh.estudiante_matricula
    LEFT JOIN calificaciones_actuales ca ON e.matricula = ca.estudiante_matricula
    LEFT JOIN adeudos ad ON e.matricula = ad.estudiante_matricula
GROUP BY
    e.matricula,
    e.nombre,
    e.apellido_paterno,
    e.apellido_materno,
    e.email,
    e.carrera,
    e.cuatrimestre,
    e.promedio,
    e.ultima_actualizacion;

-- Vista: Últimas sincronizaciones
CREATE OR REPLACE VIEW ultimas_sincronizaciones AS
SELECT s.estudiante_matricula, e.nombre, e.apellido_paterno, s.fecha, s.exitoso, s.mensaje
FROM
    sincronizaciones s
    JOIN estudiantes e ON s.estudiante_matricula = e.matricula
ORDER BY s.fecha DESC
LIMIT 100;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función: Obtener estadísticas del estudiante
CREATE OR REPLACE FUNCTION get_estudiante_stats(p_matricula VARCHAR)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'matricula', e.matricula,
    'nombre_completo', CONCAT(e.nombre, ' ', e.apellido_paterno, ' ', e.apellido_materno),
    'promedio', e.promedio,
    'total_materias', COUNT(DISTINCT mh.id),
    'materias_aprobadas', COUNT(DISTINCT CASE WHEN CAST(mh.calificacion AS FLOAT) >= 6 THEN mh.id END),
    'materias_reprobadas', COUNT(DISTINCT CASE WHEN CAST(mh.calificacion AS FLOAT) < 6 THEN mh.id END),
    'adeudos_pendientes', (
      SELECT COUNT(*) FROM adeudos 
      WHERE estudiante_matricula = p_matricula AND estado = 'Pendiente'
    ),
    'ultima_sincronizacion', (
      SELECT MAX(fecha) FROM sincronizaciones 
      WHERE estudiante_matricula = p_matricula AND exitoso = true
    )
  )
  INTO result
  FROM estudiantes e
  LEFT JOIN materias_historial mh ON e.matricula = mh.estudiante_matricula
  WHERE e.matricula = p_matricula
  GROUP BY e.matricula, e.nombre, e.apellido_paterno, e.apellido_materno, e.promedio;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- ============================================
/*
-- Insertar un estudiante de ejemplo
INSERT INTO estudiantes (
matricula, nombre, apellido_paterno, apellido_materno, 
curp, email, celular, carrera, cuatrimestre, promedio
) VALUES (
'2021004562', 
'Juan', 
'Vahir', 
'Pérez',
'VAPJ001234HDFXXX00',
'juan.vahir@ejemplo.com',
'7751234567',
'Ingeniería en Sistemas Computacionales',
'8°',
'9.2'
);

-- Insertar materias de ejemplo
INSERT INTO materias_historial (estudiante_matricula, nombre, calificacion, creditos, periodo) VALUES
('2021004562', 'Programación Web', '9.5', '6', 'ENE-ABR 2024'),
('2021004562', 'Base de Datos', '9.0', '6', 'ENE-ABR 2024'),
('2021004562', 'Desarrollo Móvil', '8.8', '6', 'SEP-DIC 2023');

-- Insertar calificaciones actuales
INSERT INTO calificaciones_actuales (estudiante_matricula, nombre, calificacion, creditos, periodo) VALUES
('2021004562', 'Seguridad Informática', '9.2', '6', 'ACTUAL'),
('2021004562', 'Inteligencia Artificial', '8.9', '6', 'ACTUAL');

-- Insertar adeudos
INSERT INTO adeudos (estudiante_matricula, concepto, monto, fecha_limite, estado) VALUES
('2021004562', 'Colegiatura Enero 2024', '$2,500.00', '2024-01-31', 'Pendiente');
*/

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
COMMENT ON
TABLE estudiantes IS 'Información personal y académica de los estudiantes';

COMMENT ON
TABLE materias_historial IS 'Historial completo de materias cursadas';

COMMENT ON
TABLE calificaciones_actuales IS 'Calificaciones del cuatrimestre en curso';

COMMENT ON TABLE adeudos IS 'Pagos y adeudos de los estudiantes';

COMMENT ON
TABLE sincronizaciones IS 'Registro de sincronizaciones con el portal SIGE';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Para ejecutar este script en Supabase:
-- 1. Ve a tu proyecto en https://supabase.com
-- 2. Abre el SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
-- 5. Verifica que las tablas se hayan creado correctamente en la sección "Table Editor"