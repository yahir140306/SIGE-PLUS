import { s as supabase } from '../../../chunks/supabase_DVVtauOl.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  let matricula;
  let data;
  try {
    ({ data, matricula } = await request.json());
    if (!data || !matricula) {
      return new Response(
        JSON.stringify({ error: "Datos y matrícula son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("💾 Guardando datos del SIGE en base de datos...");
    console.log("📋 Matrícula:", matricula);
    const {
      datosPersonales,
      historialAcademico,
      calificacionesActuales,
      adeudos,
      timestamp
    } = data;
    const { data: estudianteExistente, error: errorBusqueda } = await supabase.from("estudiantes").select("matricula, nombre, apellido_paterno, apellido_materno").eq("matricula", matricula).single();
    if (errorBusqueda && errorBusqueda.code !== "PGRST116") {
      console.error("❌ Error buscando estudiante:", errorBusqueda);
      throw errorBusqueda;
    }
    if (!estudianteExistente) {
      console.log("ℹ️ Estudiante no encontrado en la BD");
      console.log(
        "⚠️ NOTA: No se creará automáticamente porque faltan campos obligatorios"
      );
      console.log(
        "   Guárdalo en la tabla estudiantes manualmente si es necesario"
      );
    } else {
      const nombreCompleto2 = `${estudianteExistente.nombre} ${estudianteExistente.apellido_paterno} ${estudianteExistente.apellido_materno || ""}`.trim();
      console.log(`✅ Estudiante encontrado: ${nombreCompleto2}`);
    }
    const { data: respaldo, error: errorRespaldo } = await supabase.from("sige_datos_respaldo").insert({
      matricula,
      datos_personales: datosPersonales,
      historial_academico: historialAcademico,
      calificaciones_actuales: calificacionesActuales,
      adeudos,
      fecha_sincronizacion: timestamp,
      exitosa: true
    }).select().single();
    if (errorRespaldo) {
      console.error("❌ Error guardando respaldo:", errorRespaldo);
      throw errorRespaldo;
    }
    console.log("✅ Respaldo completo guardado en sige_datos_respaldo");
    let materiasGuardadas = 0;
    let adeudosGuardados = 0;
    if (estudianteExistente && historialAcademico.materias && historialAcademico.materias.length > 0) {
      await supabase.from("sige_historial_materias").delete().eq("matricula", matricula);
      const materiasParaGuardar = historialAcademico.materias.map(
        (materia) => {
          let calificacionNum = null;
          try {
            const cal = parseFloat(materia.calificacion);
            if (!isNaN(cal)) calificacionNum = cal;
          } catch (e) {
          }
          return {
            matricula,
            nombre_materia: materia.asignatura || materia.nombre || "",
            calificacion_texto: materia.calificacion,
            calificacion_numerica: calificacionNum,
            creditos: null,
            // El SIGE no proporciona créditos en el historial
            periodo: datosPersonales?.periodoActivo || null,
            profesor: null,
            // El SIGE no proporciona profesor en el historial
            cuatrimestre: materia.cuatrimestre || null,
            grupo: materia.grupo || null
          };
        }
      );
      const { error: errorMaterias } = await supabase.from("sige_historial_materias").insert(materiasParaGuardar);
      if (errorMaterias) {
        console.error(
          "⚠️ Error guardando materias en tabla estructurada:",
          errorMaterias
        );
      } else {
        materiasGuardadas = materiasParaGuardar.length;
        console.log(
          `✅ ${materiasGuardadas} materias guardadas en sige_historial_materias`
        );
      }
    }
    if (estudianteExistente && adeudos && adeudos.length > 0) {
      await supabase.from("sige_adeudos").delete().eq("matricula", matricula).eq("resuelto", false);
      const adeudosParaGuardar = adeudos.map((adeudo) => {
        let importeNum = null;
        try {
          const importeLimpio = (adeudo.importe || "").replace(/[$,]/g, "");
          const imp = parseFloat(importeLimpio);
          if (!isNaN(imp)) importeNum = imp;
        } catch (e) {
        }
        let recargosNum = null;
        try {
          const recargosLimpio = (adeudo.recargos || "").replace(/[$,]/g, "");
          const rec = parseFloat(recargosLimpio);
          if (!isNaN(rec)) recargosNum = rec;
        } catch (e) {
        }
        return {
          matricula,
          concepto: adeudo.concepto || "",
          descripcion: adeudo.descripcion || null,
          monto_texto: adeudo.importe || null,
          monto_decimal: importeNum,
          recargos_texto: adeudo.recargos || null,
          recargos_decimal: recargosNum,
          fecha_limite_texto: null,
          // El SIGE no proporciona fecha límite
          estatus: "PENDIENTE"
        };
      });
      const { error: errorAdeudos } = await supabase.from("sige_adeudos").insert(adeudosParaGuardar);
      if (errorAdeudos) {
        console.error(
          "⚠️ Error guardando adeudos en tabla estructurada:",
          errorAdeudos
        );
      } else {
        adeudosGuardados = adeudosParaGuardar.length;
        console.log(`✅ ${adeudosGuardados} adeudos guardados en sige_adeudos`);
      }
    }
    console.log("🎉 Sincronización completada exitosamente");
    const nombreCompleto = estudianteExistente ? `${estudianteExistente.nombre} ${estudianteExistente.apellido_paterno} ${estudianteExistente.apellido_materno || ""}`.trim() : datosPersonales?.nombreCompleto || "Nombre no disponible";
    return new Response(
      JSON.stringify({
        success: true,
        message: "Datos del SIGE guardados exitosamente",
        estudiante: {
          matricula,
          nombre: nombreCompleto,
          existeEnBD: !!estudianteExistente
        },
        resumen: {
          respaldo_completo: true,
          materias_historial: materiasGuardadas,
          calificaciones_actuales: calificacionesActuales?.length || 0,
          adeudos: adeudosGuardados
        },
        nota: !estudianteExistente ? "El estudiante no existe en la BD. Datos guardados en respaldo JSON." : null
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Error guardando en base de datos:", error);
    try {
      await supabase.from("sige_datos_respaldo").insert({
        matricula,
        datos_personales: data?.datosPersonales || null,
        exitosa: false,
        mensaje_error: error instanceof Error ? error.message : "Error desconocido"
      });
    } catch (e) {
      console.error("No se pudo registrar el error:", e);
    }
    return new Response(
      JSON.stringify({
        error: "Error al guardar datos en la base de datos",
        details: error instanceof Error ? error.message : "Error desconocido",
        hint: "Verifica que el schema complementario (supabase-sige-complementary.sql) esté ejecutado"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
