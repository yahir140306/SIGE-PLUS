import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { SigeClient, sessionManager } from "../../../lib/sige-client";

/**
 * Proxy para imágenes del SIGE
 * Primero intenta obtener la foto desde la base de datos
 * Si no está disponible, descarga desde el servidor SIGE
 * Incluye retry logic y timeout extendido para conexiones lentas
 */

// Función helper para fetch con timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Función para reintentar fetch con exponential backoff
async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  timeout = 10000,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "image/jpeg,image/png,image/*,*/*",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
            Connection: "keep-alive",
            Referer: "http://sige.utsh.edu.mx/",
          },
        },
        timeout,
      );

      if (response.ok) {
        return response;
      }

      // Si es 404, no reintentar
      if (response.status === 404) {
        throw new Error("Imagen no encontrada");
      }
    } catch (error) {
      lastError = error as Error;
      // Esperar antes de reintentar (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 500),
        );
      }
    }
  }

  throw lastError || new Error("Error desconocido al obtener la imagen");
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const matricula = url.searchParams.get("matricula");

    if (!matricula) {
      return new Response(JSON.stringify({ error: "Matrícula requerida" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[Proxy Image] Obteniendo foto para matrícula: ${matricula}`);

    // 1. Primero intentar obtener la foto desde la base de datos
    try {
      const { data: respaldo, error: errorRespaldo } = await supabase
        .from("sige_datos_respaldo")
        .select("datos_personales")
        .eq("matricula", matricula)
        .order("fecha_sincronizacion", { ascending: false })
        .limit(1)
        .single();

      console.log("[Proxy Image] Resultado consulta BD:", {
        error: errorRespaldo,
        tieneRespaldo: !!respaldo,
        tieneDatosPersonales: !!respaldo?.datos_personales,
        tieneFoto: !!respaldo?.datos_personales?.foto,
        longitudFoto: respaldo?.datos_personales?.foto?.length,
      });

      if (!errorRespaldo && respaldo?.datos_personales?.foto) {
        const fotoBase64 = respaldo.datos_personales.foto;
        console.log(
          `[Proxy Image] ✅ Foto encontrada en base de datos (${fotoBase64.length} caracteres)`,
        );

        // La foto está en formato "data:image/jpeg;base64,..."
        // Extraer el tipo MIME y los datos base64
        const matches = fotoBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const imageBuffer = Buffer.from(base64Data, "base64");

          console.log(
            `[Proxy Image] Retornando foto (${imageBuffer.byteLength} bytes, tipo: ${mimeType})`,
          );

          return new Response(imageBuffer, {
            status: 200,
            headers: {
              "Content-Type": mimeType,
              "Cache-Control":
                "public, max-age=86400, stale-while-revalidate=604800",
              "Access-Control-Allow-Origin": "*",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } else {
          console.warn(
            "[Proxy Image] ⚠️ Foto no tiene formato data URI válido",
          );
        }
      }
    } catch (dbError) {
      console.warn(
        "[Proxy Image] ⚠️ Error consultando base de datos:",
        dbError,
      );
      // Continuar al método alternativo
    }

    // 2. Si no está en la BD, intentar extraer foto base64 usando una sesión SIGE activa
    const activeSession = sessionManager.getSession(matricula);
    if (activeSession) {
      try {
        console.log(
          "[Proxy Image] Intentando obtener foto con sesión SIGE activa...",
        );

        const sigeClient = new SigeClient(activeSession);
        const datosAlumno = await sigeClient.getDatosAlumno();

        if (datosAlumno?.foto?.startsWith("data:")) {
          const matches = datosAlumno.foto.match(/^data:([^;]+);base64,(.+)$/);

          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const imageBuffer = Buffer.from(base64Data, "base64");

            console.log(
              `[Proxy Image] ✅ Foto obtenida desde sesión SIGE (${imageBuffer.byteLength} bytes, tipo: ${mimeType})`,
            );

            return new Response(imageBuffer, {
              status: 200,
              headers: {
                "Content-Type": mimeType,
                "Cache-Control":
                  "public, max-age=86400, stale-while-revalidate=604800",
                "Access-Control-Allow-Origin": "*",
                "X-Content-Type-Options": "nosniff",
              },
            });
          }
        }

        console.warn(
          "[Proxy Image] ⚠️ Sesión SIGE activa encontrada, pero sin foto base64 válida",
        );
      } catch (sessionError) {
        console.warn(
          "[Proxy Image] ⚠️ No se pudo extraer foto usando sesión SIGE:",
          sessionError,
        );
      }
    } else {
      console.log(
        "[Proxy Image] No hay sesión SIGE activa para esta matrícula. Omitiendo extracción en vivo.",
      );
    }

    // 3. Fallback legacy: intentar desde la URL antigua del servidor SIGE
    console.log("[Proxy Image] Intentando fallback legacy por URL JPG...");
    const imageUrl = `http://sige.utsh.edu.mx/ctrlfotos/${matricula}.jpg`;

    // Descargar la imagen con retry logic
    const response = await fetchWithRetry(imageUrl, 3, 15000); // 15 segundos de timeout

    // Obtener la imagen como arrayBuffer
    const imageBuffer = await response.arrayBuffer();

    console.log(
      `[Proxy Image] Imagen obtenida exitosamente: ${imageBuffer.byteLength} bytes`,
    );

    // Retornar la imagen con los headers apropiados
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", // Cache por 24 horas, stale por 7 días
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[Proxy Image] Error al obtener la imagen:", error);

    // Retornar un SVG placeholder en lugar de error JSON
    const placeholderSVG = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#e2e8f0"/>
        <text x="50%" y="45%" text-anchor="middle" font-family="system-ui" font-size="60" fill="#94a3b8">👤</text>
        <text x="50%" y="75%" text-anchor="middle" font-family="system-ui" font-size="12" fill="#64748b">Foto no disponible</text>
      </svg>
    `;

    return new Response(placeholderSVG, {
      status: 200, // Devolver 200 para que la imagen se muestre
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600", // Cache el placeholder por 1 hora
      },
    });
  }
};
