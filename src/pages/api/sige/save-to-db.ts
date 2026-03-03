/**
 * API: Guardar datos del estudiante en Supabase
 *
 * Esta API recibe los datos extraídos del SIGE y los guarda en la base de datos
 * como respaldo. Compatible con el schema existente de SIGE-PLUS.
 */

import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { data, matricula } = await request.json();

    if (!data || !matricula) {
      return new Response(
        JSON.stringify({ error: "Datos y matrícula son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("💾 Guardando datos del SIGE en base de datos...");
    console.log("📋 Matrícula:", matricula);

    const {
      datosPersonales,
      historialAcademico,
      calificacionesActuales,
      adeudos,
      timestamp,
    } = data;

    // 1. Buscar el estudiante por matrícula en la tabla existente
    const { data: estudianteExistente, error: errorBusqueda } = await supabase
      .from("estudiantes")
      .select("id, matricula, nombre_completo")
      .eq("matricula", matricula)
      .single();

    if (errorBusqueda && errorBusqueda.code !== "PGRST116") {
      // PGRST116 = not found (ok), otros errores son problemas
      console.error("❌ Error buscando estudiante:", errorBusqueda);
      throw errorBusqueda;
    }

    let estudianteId = estudianteExistente?.id;

    if (!estudianteExistente) {
      console.log("ℹ️ Estudiante no encontrado en la BD");
      console.log(
        "⚠️ NOTA: No se creará automáticamente porque faltan campos obligatorios",
      );
      console.log(
        "   Guárdalo en la tabla estudiantes manualmente si es necesario",
      );
    } else {
      console.log(
        `✅ Estudiante encontrado: ${estudianteExistente.nombre_completo}`,
      );
    }

    // 2. Guardar respaldo completo en formato JSON
    const { data: respaldo, error: errorRespaldo } = await supabase
      .from("sige_datos_respaldo")
      .insert({
        estudiante_id: estudianteId || null,
        matricula: matricula,
        datos_personales: datosPersonales,
        historial_academico: historialAcademico,
        calificaciones_actuales: calificacionesActuales,
        adeudos: adeudos,
        fecha_sincronizacion: timestamp,
        exitosa: true,
      })
      .select()
      .single();

    if (errorRespaldo) {
      console.error("❌ Error guardando respaldo:", errorRespaldo);
      throw errorRespaldo;
    }

    console.log("✅ Respaldo completo guardado en sige_datos_respaldo");

    let materiasGuardadas = 0;
    let adeudosGuardados = 0;

    // 3. Guardar historial de materias en tabla estructurada (solo si el estudiante existe)
    if (
      estudianteId &&
      historialAcademico.materias &&
      historialAcademico.materias.length > 0
    ) {
      // Eliminar materias antiguas del SIGE
      await supabase
        .from("sige_historial_materias")
        .delete()
        .eq("estudiante_id", estudianteId);

      // Preparar materias para insertar
      const materiasParaGuardar = historialAcademico.materias.map(
        (materia: any) => {
          // Intentar convertir calificación a número
          let calificacionNum = null;
          try {
            const cal = parseFloat(materia.calificacion);
            if (!isNaN(cal)) calificacionNum = cal;
          } catch (e) {
            // Ignorar conversión fallida
          }

          return {
            estudiante_id: estudianteId,
            matricula: matricula,
            nombre_materia: materia.nombre,
            calificacion_texto: materia.calificacion,
            calificacion_numerica: calificacionNum,
            creditos: materia.creditos ? parseInt(materia.creditos) : null,
            periodo: materia.periodo,
            profesor: materia.profesor,
          };
        },
      );

      const { error: errorMaterias } = await supabase
        .from("sige_historial_materias")
        .insert(materiasParaGuardar);

      if (errorMaterias) {
        console.error(
          "⚠️ Error guardando materias en tabla estructurada:",
          errorMaterias,
        );
      } else {
        materiasGuardadas = materiasParaGuardar.length;
        console.log(
          `✅ ${materiasGuardadas} materias guardadas en sige_historial_materias`,
        );
      }
    }

    // 4. Guardar adeudos en tabla estructurada (solo si el estudiante existe)
    if (estudianteId && adeudos && adeudos.length > 0) {
      // Eliminar adeudos anteriores del SIGE
      await supabase
        .from("sige_adeudos")
        .delete()
        .eq("estudiante_id", estudianteId)
        .eq("resuelto", false);

      // Preparar adeudos para insertar
      const adeudosParaGuardar = adeudos.map((adeudo: any) => {
        // Intentar convertir monto a número
        let montoNum = null;
        try {
          // Limpiar el string: quitar $, comas, etc
          const montoLimpio = adeudo.monto.replace(/[$,]/g, "");
          const monto = parseFloat(montoLimpio);
          if (!isNaN(monto)) montoNum = monto;
        } catch (e) {
          // Ignorar conversión fallida
        }

        return {
          estudiante_id: estudianteId,
          matricula: matricula,
          concepto: adeudo.concepto,
          monto_texto: adeudo.monto,
          monto_decimal: montoNum,
          fecha_limite_texto: adeudo.fecha_limite,
          estatus: adeudo.estado || "PENDIENTE",
        };
      });

      const { error: errorAdeudos } = await supabase
        .from("sige_adeudos")
        .insert(adeudosParaGuardar);

      if (errorAdeudos) {
        console.error(
          "⚠️ Error guardando adeudos en tabla estructurada:",
          errorAdeudos,
        );
      } else {
        adeudosGuardados = adeudosParaGuardar.length;
        console.log(`✅ ${adeudosGuardados} adeudos guardados en sige_adeudos`);
      }
    }

    console.log("🎉 Sincronización completada exitosamente");

    // Preparar respuesta con resumen
    const nombreCompleto =
      estudianteExistente?.nombre_completo ||
      `${datosPersonales.nombre} ${datosPersonales.apPaterno} ${datosPersonales.apMaterno}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Datos del SIGE guardados exitosamente",
        estudiante: {
          id: estudianteId || null,
          matricula: matricula,
          nombre: nombreCompleto,
          existeEnBD: !!estudianteExistente,
        },
        resumen: {
          respaldo_completo: true,
          materias_historial: materiasGuardadas,
          calificaciones_actuales: calificacionesActuales?.length || 0,
          adeudos: adeudosGuardados,
        },
        nota: !estudianteExistente
          ? "El estudiante no existe en la BD. Datos guardados en respaldo JSON."
          : null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error guardando en base de datos:", error);

    // Guardar registro de error en sige_datos_respaldo si es posible
    try {
      await supabase.from("sige_datos_respaldo").insert({
        matricula: matricula,
        datos_personales: data?.datosPersonales || null,
        exitosa: false,
        mensaje_error:
          error instanceof Error ? error.message : "Error desconocido",
      });
    } catch (e) {
      console.error("No se pudo registrar el error:", e);
    }

    return new Response(
      JSON.stringify({
        error: "Error al guardar datos en la base de datos",
        details: error instanceof Error ? error.message : "Error desconocido",
        hint: "Verifica que el schema complementario (supabase-sige-complementary.sql) esté ejecutado",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
