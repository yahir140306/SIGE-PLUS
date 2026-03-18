/**
 * API: Registrar pago mensual
 *
 * Guarda un pago mensual realizado por el estudiante en la base de datos.
 */

import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { matricula, mes, montoBase, recargo, totalPagar, concepto, folio } =
      await request.json();

    if (!matricula || !mes || totalPagar === undefined) {
      return new Response(
        JSON.stringify({
          error: "Matrícula, mes y monto total son requeridos",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log(`💳 Registrando pago de ${matricula} para ${mes}`);

    // Insertar pago en la base de datos
    const { data: pagoPersistido, error: errorInsert } = await supabase
      .from("pagos_mensuales")
      .insert({
        matricula,
        mes,
        monto_base: montoBase,
        recargo_aplicado: recargo,
        total_pagado: totalPagar,
        concepto,
        folio_recibo: folio,
        fecha_pago: new Date().toISOString(),
        estado: "pagado",
      })
      .select()
      .single();

    if (errorInsert) {
      console.error("❌ Error insertando pago:", errorInsert);
      // Si la tabla no existe, devolver error informativo
      if (errorInsert.code === "PGRST116") {
        return new Response(
          JSON.stringify({
            error:
              "La tabla de pagos no existe. Verifica que la estructura de BD esté configurada.",
            code: "TABLE_NOT_FOUND",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      throw errorInsert;
    }

    console.log(`✅ Pago registrado exitosamente. ID: ${pagoPersistido?.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pago registrado exitosamente",
        pago: {
          id: pagoPersistido?.id,
          matricula,
          mes,
          folio,
          totalPagar,
          fechaPago: pagoPersistido?.fecha_pago,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error en registrar-pago:", error);
    return new Response(
      JSON.stringify({
        error: "Error al registrar el pago",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
