#!/usr/bin/env node

/**
 * Script para crear la tabla pagos_mensuales en Supabase
 * Uso: node scripts/setup-pagos-db.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ADMIN_KEY) {
  console.error(
    "❌ Error: Variables de entorno no encontradas.\nAsegúrate de tener PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY);

const SQL_SCRIPT = `
-- Crear tabla pagos_mensuales
CREATE TABLE IF NOT EXISTS pagos_mensuales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricula TEXT NOT NULL REFERENCES estudiantes(matricula) ON DELETE CASCADE,
  mes TEXT NOT NULL,
  monto_base NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
  recargo_aplicado NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_pagado NUMERIC(10, 2) NOT NULL,
  concepto TEXT DEFAULT 'Pago de mensualidad',
  folio_recibo TEXT UNIQUE,
  estado TEXT DEFAULT 'pagado' CHECK (estado IN ('pagado', 'pendiente', 'proximo')),
  fecha_pago TIMESTAMP WITH TIME ZONE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_pago_per_month UNIQUE(matricula, mes),
  CONSTRAINT valid_monto CHECK (total_pagado >= 0),
  CONSTRAINT valid_recargo CHECK (recargo_aplicado >= 0)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_pagos_matricula ON pagos_mensuales(matricula);
CREATE INDEX IF NOT EXISTS idx_pagos_mes ON pagos_mensuales(mes);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos_mensuales(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON pagos_mensuales(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_matricula_meses ON pagos_mensuales(matricula, mes);

-- Crear trigger
CREATE OR REPLACE FUNCTION actualizar_pagos_mensuales()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_pagos_mensuales ON pagos_mensuales;
CREATE TRIGGER trigger_actualizar_pagos_mensuales
BEFORE UPDATE ON pagos_mensuales
FOR EACH ROW
EXECUTE FUNCTION actualizar_pagos_mensuales();
`;

async function setupDatabase() {
  try {
    console.log("🚀 Iniciando configuración de tabla pagos_mensuales...\n");

    console.log("📋 Ejecutando SQL script...");

    // Ejecutar el script SQL
    const { error } = await supabase.rpc("exec", {
      sql: SQL_SCRIPT,
    });

    if (error) {
      console.error("❌ Error ejecutando SQL:", error);
      process.exit(1);
    }

    console.log("✅ Script SQL ejecutado exitosamente\n");

    // Verificar que la tabla se creó
    console.log("✔️  Verificando tabla...");
    const { data: tables, error: tableError } = await supabase
      .from("pagos_mensuales")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Error verificando tabla:", tableError);
      process.exit(1);
    }

    console.log("✅ Tabla pagos_mensuales creada correctamente\n");

    // Mostrar resumen
    console.log("═══════════════════════════════════════════════════════");
    console.log("✨ CONFIGURACIÓN COMPLETADA EXITOSAMENTE ✨");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("📊 Tabla creada: pagos_mensuales");
    console.log("   Columnas:");
    console.log("   - id (UUID)");
    console.log("   - matricula (TEXT, FK)");
    console.log("   - mes (TEXT)");
    console.log("   - monto_base (NUMERIC)");
    console.log("   - recargo_aplicado (NUMERIC)");
    console.log("   - total_pagado (NUMERIC)");
    console.log("   - concepto (TEXT)");
    console.log("   - folio_recibo (TEXT)");
    console.log("   - estado (TEXT)");
    console.log("   - fecha_pago (TIMESTAMP)");
    console.log("   - fecha_creacion (TIMESTAMP)");
    console.log("   - fecha_actualizacion (TIMESTAMP)\n");

    console.log("🔗 Endpoints listos:");
    console.log("   POST  /api/pagos-mensuales/registrar-pago - Guardar pago");
    console.log("   GET   /api/pagos-mensuales/obtener-pagos - Cargar pagos\n");

    console.log("✅ Próximo paso: Prueba la funcionalidad en:");
    console.log("   http://localhost:3000/pagos-mensuales/paso-2\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error inesperado:", error);
    process.exit(1);
  }
}

// Ejecutar setup
setupDatabase();
