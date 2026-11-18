/**
 * API: Extraer datos del SIGE mediante cookie PHPSESSID
 * Utiliza AuthService para mantener la coherencia y normalización de datos.
 */

import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/auth-service";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { phpsessid, matricula } = await request.json();

    if (!phpsessid) {
      return new Response(
        JSON.stringify({ error: "Cookie PHPSESSID es requerida" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await AuthService.loginWithCookie(phpsessid, matricula);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error || "La sesión del SIGE no es válida o ha expirado",
          code: "INVALID_SESSION",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result.data,
        user: result.user,
        matricula: result.matricula,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error procesando cookie del SIGE:", error);
    return new Response(
      JSON.stringify({
        error: "Error al extraer datos del portal SIGE",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
