-- ============================================
-- SCHEMA COMPLEMENTARIO PARA INTEGRACIÓN SIGE
-- Compatible con el schema existente de SIGE-PLUS
-- ============================================

-- Esta tabla almacena los datos extraídos del portal SIGE
-- como respaldo JSON sin procesar
CREATE TABLE IF NOT EXISTS sige_datos_respaldo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id UUID REFERENCES estudiantes(id) ON DELETE CASCADE,
  matricula VARCHAR(20) NOT NULL,

-- Datos en formato JSON para flexibilidad
datos_personales JSONB,
historial_academico JSONB,
calificaciones_actuales JSONB,
adeudos JSONB,

-- Metadatos
phpsessid_usado VARCHAR(50),
  fecha_sincronizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exitosa BOOLEAN DEFAULT true,
  mensaje_error TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sige_respaldo_estudiante ON sige_datos_respaldo (estudiante_id);

CREATE INDEX IF NOT EXISTS idx_sige_respaldo_matricula ON sige_datos_respaldo (matricula);

CREATE INDEX IF NOT EXISTS idx_sige_respaldo_fecha ON sige_datos_respaldo (fecha_sincronizacion DESC);

-- ============================================
-- Tabla auxiliar para historial de materias del SIGE
-- (complementa la tabla 'calificaciones' existente)
-- ============================================
CREATE TABLE IF NOT EXISTS sige_historial_materias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id UUID REFERENCES estudiantes(id) ON DELETE CASCADE,
  matricula VARCHAR(20) NOT NULL,

-- Datos de la materia
nombre_materia VARCHAR(255) NOT NULL,
calificacion_texto VARCHAR(20), -- "9.5", "AC", "NA", etc.
calificacion_numerica DECIMAL(5, 2),
creditos INTEGER,
periodo VARCHAR(100), -- "ENE-ABR 2024", etc.
profesor VARCHAR(255),
estatus VARCHAR(50), -- "APROBADA", "REPROBADA", "CURSANDO"

-- Metadatos
fecha_extraccion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sige_historial_estudiante ON sige_historial_materias (estudiante_id);

CREATE INDEX IF NOT EXISTS idx_sige_historial_matricula ON sige_historial_materias (matricula);

CREATE INDEX IF NOT EXISTS idx_sige_historial_periodo ON sige_historial_materias (periodo);

-- ============================================
-- Tabla para adeudos extraídos del SIGE
-- (complementa la tabla 'pagos' existente)
-- ============================================
CREATE TABLE IF NOT EXISTS sige_adeudos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id UUID REFERENCES estudiantes(id) ON DELETE CASCADE,
  matricula VARCHAR(20) NOT NULL,

-- Datos del adeudo
concepto VARCHAR(255) NOT NULL,
monto_texto VARCHAR(50), -- "$2,500.00", etc.
monto_decimal DECIMAL(10, 2),
fecha_limite_texto VARCHAR(100),
fecha_limite DATE,
estatus VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADO, VENCIDO

-- Metadatos
fecha_extraccion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resuelto BOOLEAN DEFAULT false,
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sige_adeudos_estudiante ON sige_adeudos (estudiante_id);

CREATE INDEX IF NOT EXISTS idx_sige_adeudos_matricula ON sige_adeudos (matricula);

CREATE INDEX IF NOT EXISTS idx_sige_adeudos_estatus ON sige_adeudos (estatus);

-- ============================================
-- Vista para estadísticas de sincronización
-- ============================================
CREATE OR REPLACE VIEW sige_estadisticas_estudiante AS
SELECT e.id as estudiante_id, e.matricula, e.nombre_completo,

-- Última sincronización
(
    SELECT MAX(fecha_sincronizacion)
    FROM sige_datos_respaldo
    WHERE
        estudiante_id = e.id
) as ultima_sincronizacion,

-- Contadores
(
    SELECT COUNT(*)
    FROM sige_historial_materias
    WHERE
        estudiante_id = e.id
) as total_materias_sige,
(
    SELECT COUNT(*)
    FROM sige_adeudos
    WHERE
        estudiante_id = e.id
        AND estatus = 'PENDIENTE'
) as adeudos_pendientes,

-- Total sincronizaciones
(
    SELECT COUNT(*)
    FROM sige_datos_respaldo
    WHERE
        estudiante_id = e.id
) as total_sincronizaciones
FROM estudiantes e;

-- ============================================
-- Función para limpiar sincronizaciones antiguas
-- ============================================
CREATE OR REPLACE FUNCTION limpiar_sincronizaciones_antiguas(dias_antiguedad INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  filas_eliminadas INTEGER;
BEGIN
  -- Mantener solo las últimas 3 sincronizaciones por estudiante
  -- y eliminar las más antiguas que el parámetro de días
  WITH ranked_syncs AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY estudiante_id ORDER BY fecha_sincronizacion DESC) as rn,
      fecha_sincronizacion
    FROM sige_datos_respaldo
  )
  DELETE FROM sige_datos_respaldo
  WHERE id IN (
    SELECT id FROM ranked_syncs 
    WHERE rn > 3 
    OR fecha_sincronizacion < NOW() - (dias_antiguedad || ' days')::INTERVAL
  );
  
  GET DIAGNOSTICS filas_eliminadas = ROW_COUNT;
  RETURN filas_eliminadas;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a las nuevas tablas
CREATE TRIGGER update_sige_respaldo_updated_at
  BEFORE UPDATE ON sige_datos_respaldo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sige_adeudos_updated_at
  BEFORE UPDATE ON sige_adeudos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Políticas de seguridad (RLS)
-- ============================================
ALTER TABLE sige_datos_respaldo ENABLE ROW LEVEL SECURITY;

ALTER TABLE sige_historial_materias ENABLE ROW LEVEL SECURITY;

ALTER TABLE sige_adeudos ENABLE ROW LEVEL SECURITY;

-- Los estudiantes solo pueden ver sus propios datos
CREATE POLICY sige_respaldo_policy ON sige_datos_respaldo FOR ALL USING (auth.role () = 'service_role');

CREATE POLICY sige_historial_policy ON sige_historial_materias FOR ALL USING (auth.role () = 'service_role');

CREATE POLICY sige_adeudos_policy ON sige_adeudos FOR ALL USING (auth.role () = 'service_role');

-- ============================================
-- Comentarios
-- ============================================
COMMENT ON
TABLE sige_datos_respaldo IS 'Respaldo completo de datos extraídos del portal SIGE en formato JSON';

COMMENT ON
TABLE sige_historial_materias IS 'Historial de materias extraído del portal SIGE';

COMMENT ON
TABLE sige_adeudos IS 'Adeudos y pagos pendientes extraídos del portal SIGE';

COMMENT ON VIEW sige_estadisticas_estudiante IS 'Vista con estadísticas de sincronización por estudiante';

-- ============================================
-- Datos de ejemplo (comentado)
-- ============================================
/*
-- Ejemplo de uso:
INSERT INTO sige_datos_respaldo (matricula, datos_personales, historial_academico)
VALUES (
'2021004562',
'{"nombre": "Juan", "apPaterno": "Vahir"}'::jsonb,
'{"materias": [], "promedio": "9.2"}'::jsonb
);
*/

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================
-- 1. Ejecuta este script en Supabase SQL Editor
-- 2. Las tablas se crearán sin afectar tu schema existente
-- 3. La API guardará los datos del SIGE en estas nuevas tablas
-- 4. Puedes hacer queries JOIN con tus tablas existentes usando el campo 'matricula'

-- Ejemplo de query combinado:
-- SELECT e.nombre_completo, s.ultima_sincronizacion, s.total_materias_sige
-- FROM estudiantes e
-- LEFT JOIN sige_estadisticas_estudiante s ON e.id = s.estudiante_id;