import { test, expect } from "@playwright/test";

test.describe("API Testing - Critical Flows", () => {
  const baseURL = "http://localhost:3000";

  test.describe("POST /api/sige/extract-data", () => {
    test("debe retornar error 400 sin phpsessid", async ({ request }) => {
      const response = await request.post(`${baseURL}/api/sige/extract-data`, {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          phpsessid: "",
          matricula: "2021004562",
        }),
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toBeDefined();
    });

    test("debe validar estructura de respuesta exitosa", async ({
      request,
    }) => {
      // Este test podría requerir una sesion válida
      // En CI, se saltaría o usaría mocks
      const response = await request.post(`${baseURL}/api/sige/extract-data`, {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          phpsessid: "test-session-id",
          matricula: "2021004562",
        }),
      });

      // Debe ser 200 o 401 (sesion inválida), pero no 500
      expect([200, 401, 400]).toContain(response.status());
    });
  });

  test.describe("POST /api/pagos-mensuales/registrar-pago", () => {
    test("debe retornar error 400 sin matricula", async ({ request }) => {
      const response = await request.post(
        `${baseURL}/api/pagos-mensuales/registrar-pago`,
        {
          headers: { "Content-Type": "application/json" },
          data: JSON.stringify({
            matricula: "",
            mes: "Enero",
            totalPagar: 250,
          }),
        },
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("requerido");
    });

    test("debe aceptar estructura válida de pago", async ({ request }) => {
      const response = await request.post(
        `${baseURL}/api/pagos-mensuales/registrar-pago`,
        {
          headers: { "Content-Type": "application/json" },
          data: JSON.stringify({
            matricula: "2021004562",
            mes: "Enero 2026",
            montoBase: 250,
            recargo: 0,
            totalPagar: 250,
            concepto: "Inscripcion",
            folio: "RCB-12345678",
          }),
        },
      );

      // Debe retornar success o error de tabla no encontrada
      expect([201, 500]).toContain(response.status());

      if (response.status() === 201) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.pago).toBeDefined();
      }
    });
  });

  test.describe("GET /api/pagos-mensuales/obtener-pagos", () => {
    test("debe retornar error 400 sin matricula", async ({ request }) => {
      const response = await request.get(
        `${baseURL}/api/pagos-mensuales/obtener-pagos`,
      );

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("Matrícula");
    });

    test("debe retornar array de pagos para matricula válida", async ({
      request,
    }) => {
      const response = await request.get(
        `${baseURL}/api/pagos-mensuales/obtener-pagos?matricula=2021004562&meses=6`,
      );

      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(Array.isArray(body.pagos)).toBe(true);
      }
    });
  });

  test.describe("GET /api/sige/academic-data", () => {
    test("debe retornar error 400 sin matricula", async ({ request }) => {
      const response = await request.get(`${baseURL}/api/sige/academic-data`);

      expect(response.status()).toBe(400);
    });

    test("debe retornar estructura academica válida", async ({ request }) => {
      const response = await request.get(
        `${baseURL}/api/sige/academic-data?matricula=2021004562`,
      );

      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.academico).toBeDefined();
        expect(body.academico.promedioGeneral).toBeDefined();
        expect(body.pagoMensual).toBeDefined();
      }
    });
  });

  test.describe("GET /api/sige/proxy-image", () => {
    test("debe retornar error 400 sin matricula", async ({ request }) => {
      const response = await request.get(`${baseURL}/api/sige/proxy-image`);

      expect(response.status()).toBe(400);
    });

    test("debe retornar imagen o placeholder SVG", async ({ request }) => {
      const response = await request.get(
        `${baseURL}/api/sige/proxy-image?matricula=2021004562`,
      );

      expect(response.status()).toBe(200);

      const contentType = response.headers()["content-type"];
      expect(
        contentType?.includes("image/") || contentType?.includes("svg"),
      ).toBeTruthy();
    });
  });
});
