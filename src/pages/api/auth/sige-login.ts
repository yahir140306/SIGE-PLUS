import type { APIRoute } from "astro";
import { AuthService } from "../../../lib/auth-service";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { matricula, password } = await request.json();

    if (!matricula || !password) {
      return new Response(
        JSON.stringify({
          error: "Matrícula y contraseña son requeridas para ingresar.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await AuthService.login(matricula, password);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error || "Matrícula o contraseña incorrecta en el portal SIGE.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error en endpoint /api/auth/sige-login:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al procesar el inicio de sesión.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
