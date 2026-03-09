import { chromium } from 'playwright';
export { renderers } from '../../../renderers.mjs';

class UniversityPortalScraper {
  browser = null;
  page = null;
  // URL del portal oficial - CONFIGURAR SEGÚN LA UNIVERSIDAD
  portalUrl = process.env.PORTAL_URL || "https://portal.universidad.edu.mx";
  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      // Ejecutar en modo invisible
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(3e4);
    this.page.setDefaultNavigationTimeout(3e4);
  }
  async login(credentials) {
    if (!this.page) throw new Error("Page not initialized");
    try {
      console.log("🌐 Navegando al portal...");
      await this.page.goto(this.portalUrl);
      await this.page.waitForSelector(
        'input[name="username"], input[name="matricula"], input[type="text"]',
        {
          timeout: 5e3
        }
      );
      await this.page.fill(
        'input[name="username"], input[name="matricula"], input[type="text"]',
        credentials.matricula
      );
      await this.page.fill(
        'input[name="password"], input[type="password"]',
        credentials.password
      );
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: "networkidle" }),
        this.page.click(
          'button[type="submit"], input[type="submit"], button:has-text("Entrar"), button:has-text("Iniciar")'
        )
      ]);
      const currentUrl = this.page.url();
      const isLoggedIn = !currentUrl.includes("login") && !currentUrl.includes("error");
      console.log(isLoggedIn ? "✅ Login exitoso" : "❌ Login fallido");
      return isLoggedIn;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    }
  }
  // Método para hacer peticiones AJAX a los endpoints internos del portal
  async fetchAjaxEndpoint(endpoint) {
    if (!this.page) return "";
    try {
      const baseUrl = new URL(this.portalUrl).origin;
      const fullUrl = `${baseUrl}/${endpoint}`;
      console.log(`🔗 Llamando a: ${endpoint}`);
      const response = await this.page.evaluate(async (url) => {
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          // Incluir cookies de sesión
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });
        return await res.text();
      }, fullUrl);
      return response;
    } catch (error) {
      console.error(`❌ Error llamando a ${endpoint}:`, error);
      return "";
    }
  }
  async extractStudentData() {
    if (!this.page) throw new Error("Page not initialized");
    try {
      console.log(
        "📊 Extrayendo datos del estudiante usando endpoints AJAX..."
      );
      await this.page.waitForLoadState("networkidle");
      console.log("\n🎯 Usando endpoints internos del portal:");
      const datosAlumnoHTML = await this.fetchAjaxEndpoint(
        "interfacesNME/ajx/datosAlumno.php"
      );
      const adeudosHTML = await this.fetchAjaxEndpoint(
        "interfacesNME/ajx/adeudos.php"
      );
      const calificacionesHTML = await this.fetchAjaxEndpoint(
        "interfacesNME/ajx/calificacionesUnidad.php"
      );
      const studentData = await this.parseStudentDataFromHTML(datosAlumnoHTML);
      const materias = await this.parseCalificacionesFromHTML(calificacionesHTML);
      if (materias.length > 0) {
        studentData.materias = materias;
      }
      const pagos = await this.parseAdeudosFromHTML(adeudosHTML);
      if (pagos.length > 0) {
        studentData.pagos = pagos;
      }
      console.log("✅ Datos extraídos correctamente");
      console.log("\n" + "=".repeat(60));
      console.log("📋 INFORMACIÓN DEL ESTUDIANTE");
      console.log("=".repeat(60));
      console.log(
        `👤 Nombre Completo: ${studentData.nombre} ${studentData.apellido_paterno} ${studentData.apellido_materno}`
      );
      console.log(`🎓 Matrícula: ${studentData.matricula}`);
      if (studentData.curp) {
        console.log(`🆔 CURP: ${studentData.curp}`);
      }
      console.log(`📚 Carrera: ${studentData.carrera}`);
      console.log(`📊 Cuatrimestre: ${studentData.cuatrimestre}`);
      console.log(`⭐ Promedio: ${studentData.promedio}`);
      if (studentData.email) {
        console.log(`📧 Email: ${studentData.email}`);
      }
      if (studentData.celular) {
        console.log(`📱 Celular: ${studentData.celular}`);
      }
      if (materias.length > 0) {
        console.log(`
📖 Materias (${materias.length}):`);
        materias.forEach((materia, index) => {
          console.log(`   ${index + 1}. ${materia.nombre}`);
          console.log(`      - Calificación: ${materia.calificacion}`);
          console.log(`      - Créditos: ${materia.creditos}`);
        });
      } else {
        console.log("\n📖 Materias: No se encontraron materias");
      }
      if (pagos.length > 0) {
        console.log(`
💰 Pagos (${pagos.length}):`);
        pagos.forEach((pago, index) => {
          console.log(`   ${index + 1}. ${pago.concepto}`);
          console.log(`      - Monto: $${pago.monto}`);
          console.log(`      - Fecha límite: ${pago.fecha_limite}`);
          console.log(`      - Estado: ${pago.estado}`);
        });
      } else {
        console.log("\n💰 Pagos: No se encontraron pagos pendientes");
      }
      console.log("=".repeat(60));
      console.log("\n📄 JSON COMPLETO:");
      console.log(JSON.stringify(studentData, null, 2));
      console.log("=".repeat(60) + "\n");
      return studentData;
    } catch (error) {
      console.error("Error extrayendo datos:", error);
      return null;
    }
  }
  // Parsear datos del alumno desde el HTML devuelto por datosAlumno.php
  async parseStudentDataFromHTML(html) {
    if (!this.page) throw new Error("Page not initialized");
    const data = await this.page.evaluate((htmlContent) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const getText = (selectors) => {
        for (const selector of selectors) {
          const element = doc.querySelector(selector);
          if (element) {
            const value = element.getAttribute("value") || element.textContent?.trim();
            if (value) return value;
          }
        }
        return "";
      };
      return {
        nombre: getText([
          'input[name="Nombre"]',
          'input[id="txtNombre"]',
          "#txtNombre",
          '[data-field="nombre"]'
        ]),
        apellido_paterno: getText([
          'input[name="ApPaterno"]',
          'input[id="txtApPaterno"]',
          "#txtApPaterno"
        ]),
        apellido_materno: getText([
          'input[name="ApMaterno"]',
          'input[id="txtApMaterno"]',
          "#txtApMaterno"
        ]),
        matricula: getText([
          'input[name="Matricula"]',
          ".matricula",
          '[data-field="matricula"]'
        ]),
        carrera: getText([
          'input[name="Carrera"]',
          'select[name="Carrera"] option[selected]',
          ".carrera"
        ]),
        promedio: getText([
          'input[name="PromedioGeneral"]',
          'input[id="txtPromedioGeneral"]',
          "#txtPromedioGeneral"
        ]),
        email: getText(['input[name="Email"]', 'input[id="txtEmail"]']),
        celular: getText(['input[name="Celular"]', 'input[id="txtCelular"]']),
        curp: getText(['input[name="CURP"]', 'input[id="txtCURP"]'])
      };
    }, html);
    return {
      nombre: data.nombre || "Sin nombre",
      apellido_paterno: data.apellido_paterno || "",
      apellido_materno: data.apellido_materno || "",
      matricula: data.matricula || "",
      carrera: data.carrera || "Sin especificar",
      cuatrimestre: 0,
      // Se puede extraer si está disponible
      promedio: parseFloat(data.promedio) || 0,
      curp: data.curp || void 0,
      email: data.email || void 0,
      celular: data.celular || void 0
    };
  }
  // Parsear calificaciones desde calificacionesUnidad.php
  async parseCalificacionesFromHTML(html) {
    if (!this.page || !html) return [];
    const materias = await this.page.evaluate((htmlContent) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const rows = doc.querySelectorAll("table tr, .materia, .subject");
      const result = [];
      rows.forEach((row, index) => {
        if (index === 0) return;
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          const nombre = cells[0]?.textContent?.trim() || "";
          const calificacion = parseFloat(cells[1]?.textContent?.trim() || "0") || 0;
          const creditos = parseInt(cells[2]?.textContent?.trim() || "0") || 0;
          if (nombre) {
            result.push({ nombre, calificacion, creditos });
          }
        }
      });
      return result;
    }, html);
    return materias;
  }
  // Parsear adeudos desde adeudos.php
  async parseAdeudosFromHTML(html) {
    if (!this.page || !html) return [];
    const pagos = await this.page.evaluate((htmlContent) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const rows = doc.querySelectorAll("table tr, .adeudo, .payment");
      const result = [];
      rows.forEach((row, index) => {
        if (index === 0) return;
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          const concepto = cells[0]?.textContent?.trim() || "";
          const montoText = cells[1]?.textContent?.trim() || "0";
          const monto = parseFloat(montoText.replace(/[^\d.]/g, "")) || 0;
          const fecha_limite = cells[2]?.textContent?.trim() || "";
          const estado = cells[3]?.textContent?.trim().toLowerCase() || "pendiente";
          if (concepto) {
            result.push({ concepto, monto, fecha_limite, estado });
          }
        }
      });
      return result;
    }, html);
    return pagos;
  }
  async extractText(selector) {
    if (!this.page) return "";
    try {
      const element = await this.page.$(selector);
      if (element) {
        return (await element.textContent())?.trim() || "";
      }
      return "";
    } catch {
      return "";
    }
  }
  async extractSubjects() {
    if (!this.page) return [];
    try {
      const materias = await this.page.$$eval(
        "table.materias tr, table.grades tr, .subject-list .subject",
        (rows) => {
          return rows.slice(1).map((row) => {
            const cells = row.querySelectorAll("td, .subject-name, .grade");
            return {
              nombre: cells[0]?.textContent?.trim() || "",
              calificacion: parseFloat(cells[1]?.textContent?.trim() || "0"),
              creditos: parseInt(cells[2]?.textContent?.trim() || "0")
            };
          }).filter((m) => m.nombre !== "");
        }
      );
      return materias;
    } catch {
      return [];
    }
  }
  async extractPayments() {
    if (!this.page) return [];
    try {
      const pagos = await this.page.$$eval(
        "table.pagos tr, table.payments tr, .payment-list .payment",
        (rows) => {
          return rows.slice(1).map((row) => {
            const cells = row.querySelectorAll(
              "td, .payment-concept, .payment-amount"
            );
            return {
              concepto: cells[0]?.textContent?.trim() || "",
              monto: parseFloat(
                cells[1]?.textContent?.replace(/[^\d.]/g, "") || "0"
              ),
              fecha_limite: cells[2]?.textContent?.trim() || "",
              estado: cells[3]?.textContent?.trim().toLowerCase() || "pendiente"
            };
          }).filter((p) => p.concepto !== "");
        }
      );
      return pagos;
    } catch {
      return [];
    }
  }
  async close() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
    this.page = null;
    this.browser = null;
  }
  async scrapeStudentData(credentials) {
    try {
      await this.initialize();
      const loginSuccess = await this.login(credentials);
      if (!loginSuccess) {
        await this.close();
        return null;
      }
      const studentData = await this.extractStudentData();
      await this.close();
      return studentData;
    } catch (error) {
      console.error("Error en scraping:", error);
      await this.close();
      return null;
    }
  }
}

const POST = async ({ request }) => {
  try {
    const { matricula, password } = await request.json();
    console.log("=== SCRAPING DE DATOS DEL PORTAL ===");
    console.log("Matrícula:", matricula);
    if (!matricula || !password) {
      return new Response(
        JSON.stringify({ error: "Matrícula y contraseña son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const scraper = new UniversityPortalScraper();
    console.log("🤖 Iniciando scraping del portal oficial...");
    const studentData = await scraper.scrapeStudentData({
      matricula,
      password
    });
    if (!studentData) {
      console.log("❌ No se pudieron extraer los datos");
      return new Response(
        JSON.stringify({
          error: "No se pudo acceder al portal o las credenciales son incorrectas"
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("✅ Datos extraídos exitosamente del portal oficial");
    console.log(
      "\n🎉 RESUMEN:",
      `${studentData.nombre} ${studentData.apellido_paterno} ${studentData.apellido_materno}`
    );
    console.log(
      `   📊 ${studentData.materias?.length || 0} materias | ${studentData.pagos?.length || 0} pagos`
    );
    return new Response(
      JSON.stringify({
        success: true,
        user: studentData,
        token: `token-scraper-${Date.now()}`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Error en scraping:", error);
    return new Response(
      JSON.stringify({
        error: "Error al extraer datos del portal",
        details: error instanceof Error ? error.message : "Error desconocido"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
