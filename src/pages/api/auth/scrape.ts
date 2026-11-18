import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/auth-service";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { matricula, password } = await request.json();

    if (!matricula || !password) {
      return new Response(
        JSON.stringify({ error: "Matrícula y contraseña son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("⚡ Ejecutando extracción automática optimizada para:", matricula);

    // Usar AuthService unificado para login y extracción HTTP directa
    const result = await AuthService.login(matricula, password);

    if (!result.success || !result.user) {
      return new Response(
        JSON.stringify({
          error:
            result.error ||
            "No se pudo acceder al portal oficial o las credenciales son incorrectas",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: result.user,
        data: result.data,
        token: result.token,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("❌ Error en endpoint scrape:", error);
    return new Response(
      JSON.stringify({
        error: "Error al extraer datos del portal",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
