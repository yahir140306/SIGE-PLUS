import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/auth-service";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { matricula, password } = await request.json();

    if (!matricula || !password) {
      return new Response(
        JSON.stringify({ error: "Matrícula y contraseña son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // 1. Intentar inicio de sesión directo con el portal oficial SIGE
    const sigeResult = await AuthService.login(matricula, password);

    if (sigeResult.success) {
      return new Response(JSON.stringify(sigeResult), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Si el error fue por credenciales incorrectas directas de SIGE
    if (sigeResult.error && sigeResult.error.includes("incorrecta")) {
      return new Response(JSON.stringify({ error: sigeResult.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Fallback de contingencia: si el portal oficial no responde, consultar base de datos local
    if (supabase) {
      const { data: estudiante, error: estudianteError } = await supabase
        .from("estudiantes")
        .select("*")
        .eq("matricula", matricula.trim())
        .maybeSingle();

      if (!estudianteError && estudiante && estudiante.password === password) {
        const { password: _, ...estudianteSinPassword } = estudiante;
        return new Response(
          JSON.stringify({
            success: true,
            user: estudianteSinPassword,
            token: `token-${estudiante.id}`,
            dataSource: "database",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(
      JSON.stringify({
        error: sigeResult.error || "Matrícula o contraseña incorrectos",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("❌ Error en endpoint /api/auth/login:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
