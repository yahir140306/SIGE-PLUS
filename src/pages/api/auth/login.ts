import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { matricula, password } = await request.json();

    // Log para depuración
    console.log("=== INICIO DE SESIÓN ===");
    console.log("Matrícula recibida:", matricula);
    console.log("Contraseña recibida:", password);
    console.log("Longitud matrícula:", matricula?.length);
    console.log("Longitud contraseña:", password?.length);

    if (!matricula || !password) {
      return new Response(
        JSON.stringify({ error: "Matrícula y contraseña son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Buscar el estudiante por matrícula
    const { data: estudiante, error: estudianteError } = await supabase
      .from("estudiantes")
      .select("*")
      .eq("matricula", matricula)
      .single();

    // Log de resultado de búsqueda
    console.log("Error de Supabase:", estudianteError);
    console.log("Estudiante encontrado:", estudiante ? "SÍ" : "NO");
    if (estudiante) {
      console.log("Matrícula en BD:", estudiante.matricula);
      console.log("Contraseña en BD:", estudiante.password);
      console.log("Nombre:", estudiante.nombre, estudiante.apellido_paterno);
    }

    if (estudianteError || !estudiante) {
      console.log("❌ ERROR: Estudiante no encontrado");
      return new Response(
        JSON.stringify({ error: "Matrícula o contraseña incorrectos" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // Verificar la contraseña (en este caso, comparación simple)
    // En producción, deberías usar bcrypt o similar para comparar contraseñas hasheadas
    console.log("Comparando contraseñas:");
    console.log("  Recibida:", `'${password}'`);
    console.log("  En BD:", `'${estudiante.password}'`);
    console.log("  ¿Son iguales?:", estudiante.password === password);

    if (estudiante.password !== password) {
      console.log("❌ ERROR: Contraseña incorrecta");
      return new Response(
        JSON.stringify({ error: "Matrícula o contraseña incorrectos" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("✅ LOGIN EXITOSO");

    // Obtener datos adicionales del estudiante
    const { data: carrera } = await supabase
      .from("carreras")
      .select("*")
      .eq("id", estudiante.carrera_id)
      .single();

    const { data: periodo } = await supabase
      .from("periodos")
      .select("*")
      .eq("activo", true)
      .single();

    // Verificar si tiene pagos pendientes
    const { data: pagos } = await supabase
      .from("pagos")
      .select("*")
      .eq("estudiante_id", estudiante.id)
      .eq("periodo_id", periodo?.id || null)
      .eq("estado", "pendiente");

    const tienePagosPendientes = pagos && pagos.length > 0;

    // No enviar la contraseña al cliente
    const { password: _, ...estudianteSinPassword } = estudiante;

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          ...estudianteSinPassword,
          carrera: carrera,
          periodo: periodo,
          tienePagosPendientes: tienePagosPendientes,
        },
        token: `token-${estudiante.id}`, // En producción, usar JWT real
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error en login:", error);
    console.error("Error detallado:", JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
