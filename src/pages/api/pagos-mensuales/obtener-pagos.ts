/**
 * API: Obtener pagos del estudiante
 *
 * Obtiene el historial de pagos realizados por un estudiante.
 * Query params:
 * - matricula: string (requerido)
 * - meses?: number (cantidad de meses previos a consultar, default=6)
 */

import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  try {
    const matricula = url.searchParams.get("matricula");
    const mesesParam = url.searchParams.get("meses");
    const meses = mesesParam ? parseInt(mesesParam, 10) : 6;

    if (!matricula) {
      return new Response(
        JSON.stringify({
          error: "Matrícula requerida",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log(`🔍 Buscando pagos para ${matricula} (últimos ${meses} meses)`);

    // Calcular fecha límite (hoy menos N meses)
    const hoy = new Date();
    const hace_n_meses = new Date(hoy.getFullYear(), hoy.getMonth() - meses, 1);

    const { data: pagosPersistidos, error: errorQuery } = await supabase
      .from("pagos_mensuales")
      .select("*")
      .eq("matricula", matricula)
      .gte("fecha_pago", hace_n_meses.toISOString())
      .order("mes", { ascending: false });

    if (errorQuery) {
      console.error("❌ Error consultando pagos:", errorQuery);
      // Si la tabla no existe, devolver array vacío (no es error fatal)
      if (errorQuery.code === "PGRST116") {
        console.warn(
          "⚠️ Tabla pagos_mensuales no existe aún. Retornando array vacío.",
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: "No hay tabla de pagos configurada aún",
            pagos: [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      throw errorQuery;
    }

    console.log(
      `✅ ${pagosPersistidos?.length || 0} pagos encontrados para ${matricula}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        matricula,
        totalPagos: pagosPersistidos?.length || 0,
        pagos: pagosPersistidos || [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error en obtener-pagos:", error);
    return new Response(
      JSON.stringify({
        error: "Error al obtener pagos",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
