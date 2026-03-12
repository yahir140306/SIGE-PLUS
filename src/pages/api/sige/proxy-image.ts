import type { APIRoute } from "astro";

/**
 * Proxy para imágenes del SIGE
 * Descarga la imagen desde HTTP y la sirve a través de HTTPS
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

    // URL de la foto en el servidor SIGE (HTTP)
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
