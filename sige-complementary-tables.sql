-- ============================================
-- TABLAS COMPLEMENTARIAS PARA DATOS DEL SIGE
-- ============================================
-- Estas tablas almacenan los datos extraídos del portal SIGE
-- sin interferir con las tablas principales del sistema
-- ============================================

-- ============================================
-- TABLA: sige_datos_respaldo
-- Almacena el respaldo completo de los datos del SIGE en formato JSON
-- ============================================
CREATE TABLE IF NOT EXISTS sige_datos_respaldo (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL REFERENCES estudiantes(matricula) ON DELETE CASCADE,

-- Datos en formato JSON para máxima flexibilidad
datos_personales JSONB,
historial_academico JSONB,
calificaciones_actuales JSONB,
adeudos JSONB,

-- Metadatos de la sincronización
fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exitosa BOOLEAN DEFAULT true,
    mensaje_error TEXT,
    phpsessid_usado VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_sige_respaldo_matricula ON sige_datos_respaldo (matricula);

CREATE INDEX IF NOT EXISTS idx_sige_respaldo_fecha ON sige_datos_respaldo (fecha_sincronizacion DESC);

CREATE INDEX IF NOT EXISTS idx_sige_respaldo_exitosa ON sige_datos_respaldo (exitosa);

-- ============================================
-- TABLA: sige_historial_materias
-- Almacena el historial académico del SIGE en formato estructurado
-- ============================================
CREATE TABLE IF NOT EXISTS sige_historial_materias (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL REFERENCES estudiantes(matricula) ON DELETE CASCADE,

-- Información de la materia
nombre_materia VARCHAR(255) NOT NULL,
calificacion_texto VARCHAR(20), -- "9.5", "AC", "NA", etc.
calificacion_numerica DECIMAL(5, 2),
creditos INTEGER,
periodo VARCHAR(100), -- "ENE-ABR 2024", "SEP-DIC 2023", etc.
profesor VARCHAR(255),
cuatrimestre VARCHAR(20), -- "1", "2", "3", etc.
grupo VARCHAR(50),

-- Metadatos
fecha_extraccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sige_historial_matricula ON sige_historial_materias (matricula);

CREATE INDEX IF NOT EXISTS idx_sige_historial_periodo ON sige_historial_materias (periodo);

CREATE INDEX IF NOT EXISTS idx_sige_historial_materia ON sige_historial_materias (nombre_materia);

-- ============================================
-- TABLA: sige_adeudos
-- Almacena los adeudos extraídos del portal SIGE
-- ============================================
CREATE TABLE IF NOT EXISTS sige_adeudos (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL REFERENCES estudiantes(matricula) ON DELETE CASCADE,

-- Información del adeudo
concepto VARCHAR(255) NOT NULL,
descripcion TEXT,
monto_texto VARCHAR(50), -- "$2,500.00", etc.
monto_decimal DECIMAL(10, 2),
recargos_texto VARCHAR(50),
recargos_decimal DECIMAL(10, 2),
fecha_limite_texto VARCHAR(100),
estatus VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADO, VENCIDO

-- Metadatos
fecha_extraccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resuelto BOOLEAN DEFAULT false,
    fecha_resolucion TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sige_adeudos_matricula ON sige_adeudos (matricula);

CREATE INDEX IF NOT EXISTS idx_sige_adeudos_estatus ON sige_adeudos (estatus);

CREATE INDEX IF NOT EXISTS idx_sige_adeudos_resuelto ON sige_adeudos (resuelto);

-- ============================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a las tablas que necesitan updated_at
CREATE TRIGGER update_sige_respaldo_updated_at
    BEFORE UPDATE ON sige_datos_respaldo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sige_adeudos_updated_at
    BEFORE UPDATE ON sige_adeudos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VISTA: Resumen de sincronizaciones por estudiante
-- ============================================
CREATE OR REPLACE VIEW sige_resumen_estudiante AS
SELECT e.matricula, e.nombre, e.apellido_paterno, e.apellido_materno,

-- Última sincronización exitosa
(
    SELECT MAX(fecha_sincronizacion)
    FROM sige_datos_respaldo
    WHERE
        matricula = e.matricula
        AND exitosa = true
) as ultima_sincronizacion,

-- Total de sincronizaciones
(
    SELECT COUNT(*)
    FROM sige_datos_respaldo
    WHERE
        matricula = e.matricula
) as total_sincronizaciones,

-- Materias en historial SIGE
(
    SELECT COUNT(*)
    FROM sige_historial_materias
    WHERE
        matricula = e.matricula
) as total_materias_sige,

-- Adeudos pendientes del SIGE
(
    SELECT COUNT(*)
    FROM sige_adeudos
    WHERE
        matricula = e.matricula
        AND estatus = 'PENDIENTE'
) as adeudos_pendientes,

-- Total de adeudos pendientes (suma decimal)
(
    SELECT COALESCE(
            SUM(
                monto_decimal + COALESCE(recargos_decimal, 0)
            ), 0
        )
    FROM sige_adeudos
    WHERE
        matricula = e.matricula
        AND estatus = 'PENDIENTE'
) as total_adeudo
FROM estudiantes e;

-- ============================================
-- FUNCIÓN: Limpiar sincronizaciones antiguas
-- ============================================
-- Mantiene solo las últimas N sincronizaciones por estudiante
CREATE OR REPLACE FUNCTION limpiar_sincronizaciones_antiguas(
    mantener_ultimas INTEGER DEFAULT 5
)
RETURNS INTEGER AS $$
DECLARE
    filas_eliminadas INTEGER;
BEGIN
    WITH ranked_syncs AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY matricula 
                ORDER BY fecha_sincronizacion DESC
            ) as rn
        FROM sige_datos_respaldo
    )
    DELETE FROM sige_datos_respaldo
    WHERE id IN (
        SELECT id 
        FROM ranked_syncs 
        WHERE rn > mantener_ultimas
    );
    
    GET DIAGNOSTICS filas_eliminadas = ROW_COUNT;
    RETURN filas_eliminadas;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTARIOS EN LAS TABLAS
-- ============================================
COMMENT ON
TABLE sige_datos_respaldo IS 'Respaldo completo de datos extraídos del portal SIGE en formato JSON';

COMMENT ON
TABLE sige_historial_materias IS 'Historial académico del SIGE en formato estructurado';

COMMENT ON
TABLE sige_adeudos IS 'Adeudos y pagos pendientes extraídos del portal SIGE';

COMMENT ON FUNCTION limpiar_sincronizaciones_antiguas IS 'Limpia sincronizaciones antiguas manteniendo solo las últimas N por estudiante';

-- ============================================
-- DATOS DE EJEMPLO / SEEDS (OPCIONAL)
-- ============================================
-- Puedes descomentar esto para pruebas
/*
-- Ejemplo: Agregar una sincronización de prueba
INSERT INTO sige_datos_respaldo (matricula, datos_personales, exitosa) 
VALUES (
'20240001',
'{"nombre": "Juan", "apellidos": "Pérez García", "curp": "JUAP001122HPLXXX01"}'::jsonb,
true
);
*/