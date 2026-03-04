/**
 * API: Obtener datos académicos del estudiante desde el SIGE
 * 
 * Este endpoint recupera los datos del SIGE almacenados en la base de datos,
 * incluyendo el promedio académico real para cálculo de becas.
 */

import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const matricula = url.searchParams.get("matricula");

    if (!matricula) {
      return new Response(
        JSON.stringify({ error: "Matrícula es requerida" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("📊 Obteniendo datos académicos del SIGE para:", matricula);

    // 1. Obtener datos del estudiante
    const { data: estudiante, error: errorEstudiante } = await supabase
      .from("estudiantes")
      .select("matricula, nombre, apellido_paterno, apellido_materno")
      .eq("matricula", matricula)
      .single();

    if (errorEstudiante || !estudiante) {
      return new Response(
        JSON.stringify({ error: "Estudiante no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. Obtener el historial académico del SIGE
    const { data: materias, error: errorMaterias } = await supabase
      .from("sige_historial_materias")
      .select("*")
      .eq("matricula", matricula)
      .order("fecha_extraccion", { ascending: false });

    // 3. Calcular promedio general
    let promedioGeneral = 0;
    let totalMaterias = 0;
    let sumaCalificaciones = 0;

    if (materias && materias.length > 0) {
      for (const materia of materias) {
        if (materia.calificacion_numerica && materia.calificacion_numerica > 0) {
          sumaCalificaciones += materia.calificacion_numerica;
          totalMaterias++;
        }
      }

      if (totalMaterias > 0) {
        promedioGeneral = sumaCalificaciones / totalMaterias;
      }

      console.log(`📈 Promedio calculado: ${promedioGeneral.toFixed(2)} (${totalMaterias} materias)`);
    }

    // 4. Obtener adeudos pendientes del SIGE
    const { data: adeudos, error: errorAdeudos } = await supabase
      .from("sige_adeudos")
      .select("*")
      .eq("matricula", matricula)
      .eq("estatus", "PENDIENTE")
      .order("fecha_extraccion", { ascending: false });

    // 5. Calcular total de adeudos
    let totalAdeudos = 0;
    if (adeudos && adeudos.length > 0) {
      totalAdeudos = adeudos.reduce((sum, adeudo) => {
        const monto = adeudo.monto_decimal || 0;
        const recargos = adeudo.recargos_decimal || 0;
        return sum + monto + recargos;
      }, 0);
    }

    // 6. Obtener última sincronización
    const { data: ultimaSync, error: errorSync } = await supabase
      .from("sige_datos_respaldo")
      .select("fecha_sincronizacion, exitosa")
      .eq("matricula", matricula)
      .eq("exitosa", true)
      .order("fecha_sincronizacion", { ascending: false })
      .limit(1)
      .single();

    // 7. Determinar si tiene beca académica
    const tieneBecaAcademica = promedioGeneral >= 9.0;
    const porcentajeBeca = tieneBecaAcademica ? 100 : 0; // 100% si tiene >= 9.0

    console.log(`✅ Datos académicos obtenidos exitosamente`);
    console.log(`   📊 Promedio: ${promedioGeneral.toFixed(2)}`);
    console.log(`   🎓 Beca académica: ${tieneBecaAcademica ? "SÍ" : "NO"}`);
    console.log(`   💰 Adeudos pendientes: $${totalAdeudos.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        success: true,
        estudiante: {
          matricula: estudiante.matricula,
          nombreCompleto: `${estudiante.nombre} ${estudiante.apellido_paterno} ${estudiante.apellido_materno || ""}`.trim(),
        },
        academico: {
          promedioGeneral: parseFloat(promedioGeneral.toFixed(2)),
          totalMaterias: totalMaterias,
          materiasAprobadas: materias?.filter(m => 
            m.calificacion_numerica && m.calificacion_numerica >= 7
          ).length || 0,
          tieneBecaAcademica: tieneBecaAcademica,
          porcentajeBeca: porcentajeBeca,
        },
        adeudos: {
          total: parseFloat(totalAdeudos.toFixed(2)),
          cantidad: adeudos?.length || 0,
          detalles: adeudos || [],
        },
        sincronizacion: {
          ultimaFecha: ultimaSync?.fecha_sincronizacion || null,
          tieneDatos: (materias?.length || 0) > 0,
        },
        dataSource: "sige", // Indica que los datos vienen del SIGE
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error obteniendo datos académicos:", error);
    return new Response(
      JSON.stringify({
        error: "Error al obtener datos académicos",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
