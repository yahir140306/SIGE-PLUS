/**
 * API: Obtener datos académicos del estudiante desde el SIGE
 *
 * Este endpoint recupera los datos del SIGE almacenados en la base de datos,
 * incluyendo el promedio académico real para cálculo de becas.
 */

import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

interface CalificacionUnidad {
  asignatura?: string;
  unidad?: string;
  evaluacion?: string | number;
}

interface UnidadMes {
  asignatura: string;
  unidad: string;
  evaluacion: number;
  fechaSincronizacion: string;
}

const MONTO_MENSUAL = 250;
const RECARGO_DIARIO = 5;
const DIA_LIMITE_PAGO = 12;

function parseEvaluacion(valor: unknown): number | null {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return valor;
  }

  if (typeof valor === "string") {
    const limpia = valor.replace(",", ".").trim();
    const num = Number.parseFloat(limpia);
    if (Number.isFinite(num)) {
      return num;
    }
  }

  return null;
}

function obtenerClaveUnidad(calif: CalificacionUnidad): string | null {
  const asignatura = (calif.asignatura || "").trim();
  const unidad = (calif.unidad || "").trim();

  if (!asignatura || !unidad) {
    return null;
  }

  return `${asignatura.toUpperCase()}::${unidad.toUpperCase()}`;
}

function obtenerRangoMes(fecha: Date = new Date()) {
  const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1, 0, 0, 0, 0);
  const fin = new Date(
    fecha.getFullYear(),
    fecha.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return { inicio, fin };
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const matricula = url.searchParams.get("matricula");

    if (!matricula) {
      return new Response(JSON.stringify({ error: "Matrícula es requerida" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
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

    // 3. Calcular promedio general histórico
    let promedioGeneral = 0;
    let totalMaterias = 0;
    let sumaCalificaciones = 0;

    if (materias && materias.length > 0) {
      for (const materia of materias) {
        if (
          materia.calificacion_numerica &&
          materia.calificacion_numerica > 0
        ) {
          sumaCalificaciones += materia.calificacion_numerica;
          totalMaterias++;
        }
      }

      if (totalMaterias > 0) {
        promedioGeneral = sumaCalificaciones / totalMaterias;
      }

      console.log(
        `📈 Promedio calculado: ${promedioGeneral.toFixed(2)} (${totalMaterias} materias)`,
      );
    }

    // 3.1 Detectar calificaciones de unidad subidas durante el mes actual
    const { inicio: inicioMes, fin: finMes } = obtenerRangoMes(new Date());

    const { data: respaldoBase } = await supabase
      .from("sige_datos_respaldo")
      .select("fecha_sincronizacion, calificaciones_actuales")
      .eq("matricula", matricula)
      .eq("exitosa", true)
      .lt("fecha_sincronizacion", inicioMes.toISOString())
      .order("fecha_sincronizacion", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: respaldosMes, error: errorRespaldosMes } = await supabase
      .from("sige_datos_respaldo")
      .select("fecha_sincronizacion, calificaciones_actuales")
      .eq("matricula", matricula)
      .eq("exitosa", true)
      .gte("fecha_sincronizacion", inicioMes.toISOString())
      .lte("fecha_sincronizacion", finMes.toISOString())
      .order("fecha_sincronizacion", { ascending: true });

    if (errorRespaldosMes) {
      console.warn(
        "⚠️ No se pudieron obtener respaldos mensuales:",
        errorRespaldosMes,
      );
    }

    const estadoActualUnidades = new Map<string, number>();
    const unidadesSubidasMes = new Map<string, UnidadMes>();

    const baselineCalificaciones = (respaldoBase?.calificaciones_actuales ||
      []) as CalificacionUnidad[];

    for (const calif of baselineCalificaciones) {
      const clave = obtenerClaveUnidad(calif);
      const evaluacion = parseEvaluacion(calif.evaluacion);

      if (!clave || evaluacion === null || evaluacion <= 0) {
        continue;
      }

      estadoActualUnidades.set(clave, evaluacion);
    }

    const snapshotsMes = (respaldosMes || []) as Array<{
      fecha_sincronizacion: string;
      calificaciones_actuales: CalificacionUnidad[];
    }>;

    for (const snapshot of snapshotsMes) {
      const calificaciones = (snapshot.calificaciones_actuales ||
        []) as CalificacionUnidad[];

      for (const calif of calificaciones) {
        const clave = obtenerClaveUnidad(calif);
        const evaluacion = parseEvaluacion(calif.evaluacion);

        if (!clave || evaluacion === null || evaluacion <= 0) {
          continue;
        }

        const evaluacionAnterior = estadoActualUnidades.get(clave);
        const esNuevaCalificacion =
          evaluacionAnterior === undefined || evaluacionAnterior !== evaluacion;

        if (esNuevaCalificacion) {
          unidadesSubidasMes.set(clave, {
            asignatura: (calif.asignatura || "Sin asignatura").trim(),
            unidad: (calif.unidad || "-").trim(),
            evaluacion,
            fechaSincronizacion: snapshot.fecha_sincronizacion,
          });
        }

        estadoActualUnidades.set(clave, evaluacion);
      }
    }

    const unidadesMes = Array.from(unidadesSubidasMes.values());
    const promedioUnidadesMes =
      unidadesMes.length > 0
        ? unidadesMes.reduce((sum, unidad) => sum + unidad.evaluacion, 0) /
          unidadesMes.length
        : 0;

    console.log(
      `📆 Unidades subidas este mes: ${unidadesMes.length} | Promedio mensual: ${promedioUnidadesMes.toFixed(2)}`,
    );

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

    // 7. Determinar si tiene beca académica mensual (basada en unidades subidas en el mes)
    const tieneBecaAcademicaMensual =
      unidadesMes.length > 0 && promedioUnidadesMes >= 9.0;
    const porcentajeBecaMensual = tieneBecaAcademicaMensual ? 100 : 0;
    const montoMensualConBeca = tieneBecaAcademicaMensual ? 0 : MONTO_MENSUAL;

    console.log(`✅ Datos académicos obtenidos exitosamente`);
    console.log(`   📊 Promedio histórico: ${promedioGeneral.toFixed(2)}`);
    console.log(`   📆 Promedio del mes: ${promedioUnidadesMes.toFixed(2)}`);
    console.log(
      `   🎓 Beca académica mensual: ${tieneBecaAcademicaMensual ? "SÍ" : "NO"}`,
    );
    console.log(`   💰 Adeudos pendientes: $${totalAdeudos.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        success: true,
        estudiante: {
          matricula: estudiante.matricula,
          nombreCompleto:
            `${estudiante.nombre} ${estudiante.apellido_paterno} ${estudiante.apellido_materno || ""}`.trim(),
        },
        academico: {
          promedioGeneral: parseFloat(promedioGeneral.toFixed(2)),
          promedioGeneralHistorico: parseFloat(promedioGeneral.toFixed(2)),
          promedioUnidadesMes: parseFloat(promedioUnidadesMes.toFixed(2)),
          totalMaterias: totalMaterias,
          totalMateriasHistorico: totalMaterias,
          totalUnidadesMes: unidadesMes.length,
          unidadesEvaluadasMes: unidadesMes,
          materiasAprobadas:
            materias?.filter(
              (m) => m.calificacion_numerica && m.calificacion_numerica >= 7,
            ).length || 0,
          tieneBecaAcademica: tieneBecaAcademicaMensual,
          tieneBecaAcademicaMensual: tieneBecaAcademicaMensual,
          porcentajeBeca: porcentajeBecaMensual,
          porcentajeBecaMensual: porcentajeBecaMensual,
          periodoBeca: {
            inicio: inicioMes.toISOString(),
            fin: finMes.toISOString(),
          },
        },
        pagoMensual: {
          montoBase: MONTO_MENSUAL,
          montoConBeca: montoMensualConBeca,
          requierePago: !tieneBecaAcademicaMensual,
          recargoDiario: RECARGO_DIARIO,
          diaLimitePago: DIA_LIMITE_PAGO,
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
