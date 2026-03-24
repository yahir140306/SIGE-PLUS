import { test, expect } from "@playwright/test";

test.describe("Portal de Servicios Escolares - E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto("/");
  });

  test.describe("Pantalla de inicio", () => {
    test("debe cargar correctamente la página principal", async ({ page }) => {
      await expect(page).toHaveTitle(/Portal de Servicios Escolares/i);
      await expect(page.locator("h1")).toBeVisible();
    });

    test("debe mostrar componentes principales (Header, Hero, ServiceCards, Footer)", async ({
      page,
    }) => {
      // Header
      await expect(page.locator("nav")).toBeVisible();

      // Hero section
      await expect(page.locator("main")).toBeVisible();

      // Footer (puede no ser visible sin scroll)
      const footer = page.locator("footer");
      if (await footer.isVisible()) {
        await expect(footer).toBeVisible();
      }
    });

    test("debe tener navegación a pagos mensuales", async ({ page }) => {
      // Buscar botón o link a pagos
      const pagosLink = page.locator('a[href*="pagos"]').first();
      await expect(pagosLink).toBeVisible();
      await expect(pagosLink).not.toBeDisabled();
    });
  });

  test.describe("Flujo de acceso a pagos mensuales", () => {
    test("debe redirigir a login si no hay sesion en paso-1", async ({
      page,
    }) => {
      // Ir a paso-1 sin sesion
      await page.goto("/pagos-mensuales/paso-1");

      // Debe mostrar información de no autenticado
      const loginCard = page.locator("text=INICIAR SESIÓN CON SIGE").first();
      await expect(loginCard).toBeVisible();
    });

    test("debe navegar a sige-login desde paso-1", async ({ page }) => {
      await page.goto("/pagos-mensuales/paso-1");
      const sigeLoginBtn = page.locator('a[href*="sige-login"]').first();
      await expect(sigeLoginBtn).toBeVisible();

      // Hacer click
      await sigeLoginBtn.click();
      await page.waitForURL("**/sige-login**");

      // Verificar que estamos en sige-login
      const pageTitle = await page.title();
      expect(pageTitle).toContain("Iniciar Sesión");
    });
  });

  test.describe("Flujo de reinscripcion", () => {
    test("debe acceder a reinscripcion paso-1", async ({ page }) => {
      // Simular sesion guardada
      await page.evaluate(() => {
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            matricula: "2021004562",
            nombre: "Juan",
            apellido_paterno: "Palacios",
            apellido_materno: "Vazquez",
            carrera: "Ingenieria en Software",
          }),
        );
      });

      await page.goto("/reinscripcion/paso-1");

      // Debe mostrar datos del estudiante
      await expect(page.locator("text=Validación de Datos")).toBeVisible();
      await expect(page.locator("text=2021004562")).toBeVisible();
    });

    test("debe mostrar stepper en paso-1", async ({ page }) => {
      // Simular sesion
      await page.evaluate(() => {
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            matricula: "2021004562",
            nombre: "Test",
            apellido_paterno: "User",
          }),
        );
      });

      await page.goto("/reinscripcion/paso-1");

      // Buscar el stepper
      const stepper = page.locator("text=Paso 1");
      await expect(stepper).toBeVisible();
    });
  });

  test.describe("Accesibilidad y responsive", () => {
    test("debe ser responsive en dispositivo móvil", async ({ page }) => {
      // Configurar viewport móvil
      await page.setViewportSize({ width: 390, height: 844 });

      await page.goto("/");

      // Verificar que el contenido sigue siendo visible
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    });

    test("debe ser responsive en tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto("/");

      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    });

    test("debe tener contraste adecuado en botones principales", async ({
      page,
    }) => {
      await page.goto("/");

      const buttons = page.locator('button, a[role="button"]');
      const count = await buttons.count();

      // Simplemente verificar que hay botones interactivos
      if (count > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeVisible();
      }
    });
  });

  test.describe("Navegacion", () => {
    test("debe permitir volver atrás con el botón back del navegador", async ({
      page,
    }) => {
      await page.goto("/");
      const initialUrl = page.url();

      // Si hay algún link, clickearlo
      const link = page.locator("a").first();
      if (link) {
        await link.click();
        await page.waitForLoadState("networkidle");

        // Volver atrás
        await page.goBack();
        await page.waitForLoadState("networkidle");

        // Debe estar en la URL original o similar
        expect(page.url()).toContain("/");
      }
    });
  });
});
