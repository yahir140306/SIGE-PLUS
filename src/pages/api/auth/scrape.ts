import type { APIRoute } from "astro";
import { UniversityPortalScraper } from "../../../lib/scraper";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { matricula, password } = await request.json();

    console.log("=== SCRAPING DE DATOS DEL PORTAL ===");
    console.log("Matrícula:", matricula);

    if (!matricula || !password) {
      return new Response(
        JSON.stringify({ error: "Matrícula y contraseña son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Crear instancia del scraper
    const scraper = new UniversityPortalScraper();

    // Ejecutar scraping
    console.log("🤖 Iniciando scraping del portal oficial...");
    const studentData = await scraper.scrapeStudentData({
      matricula,
      password,
    });

    if (!studentData) {
      console.log("❌ No se pudieron extraer los datos");
      return new Response(
        JSON.stringify({
          error:
            "No se pudo acceder al portal o las credenciales son incorrectas",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("✅ Datos extraídos exitosamente del portal oficial");
    console.log(
      "\n🎉 RESUMEN:",
      `${studentData.nombre} ${studentData.apellido_paterno} ${studentData.apellido_materno}`,
    );
    console.log(
      `   📊 ${studentData.materias?.length || 0} materias | ${studentData.pagos?.length || 0} pagos`,
    );

    // Devolver datos del estudiante
    return new Response(
      JSON.stringify({
        success: true,
        user: studentData,
        token: `token-scraper-${Date.now()}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error en scraping:", error);
    return new Response(
      JSON.stringify({
        error: "Error al extraer datos del portal",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
