/**
 * API: Guardar cookie del SIGE y extraer datos
 *
 * Esta API recibe la cookie PHPSESSID capturada desde el frontend
 * y la usa para obtener todos los datos del estudiante del portal SIGE
 */

import type { APIRoute } from "astro";
import { SigeClient, sessionManager } from "../../../lib/sige-client";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { phpsessid, matricula } = await request.json();

    if (!phpsessid) {
      return new Response(
        JSON.stringify({ error: "Cookie PHPSESSID es requerida" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("🍪 Cookie PHPSESSID recibida");
    console.log("📋 Matrícula:", matricula || "No proporcionada");

    // Crear cliente del SIGE con la cookie
    const sigeClient = new SigeClient(phpsessid);

    // Verificar que la sesión sea válida
    console.log("🔐 Verificando validez de la sesión...");
    const sesionValida = await sigeClient.verificarSesion();

    if (!sesionValida) {
      return new Response(
        JSON.stringify({
          error: "La sesión del SIGE no es válida o ha expirado",
          code: "INVALID_SESSION",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("✅ Sesión válida. Extrayendo datos...");

    // Extraer todos los datos del estudiante
    const allData = await sigeClient.getAllData();

    // Guardar la sesión para uso futuro
    const matriculaExtraida = allData.datosPersonales.matricula || matricula;
    if (matriculaExtraida) {
      sessionManager.saveSession(matriculaExtraida, phpsessid);
    }

    console.log("🎉 Datos extraídos exitosamente:");
    console.log(
      `   👤 ${allData.datosPersonales.nombre} ${allData.datosPersonales.apPaterno}`,
    );
    console.log(
      `   📚 ${allData.historialAcademico.materias.length} materias en historial`,
    );
    console.log(
      `   📊 ${allData.calificacionesActuales.length} calificaciones actuales`,
    );
    console.log(`   💰 ${allData.adeudos.length} adeudos`);

    return new Response(
      JSON.stringify({
        success: true,
        data: allData,
        matricula: matriculaExtraida,
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
