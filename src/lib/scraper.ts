import { chromium, type Browser, type Page } from "playwright";

interface ScraperCredentials {
  matricula: string;
  password: string;
}

interface StudentData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  matricula: string;
  carrera: string;
  cuatrimestre: number;
  promedio: number;
  curp?: string;
  email?: string;
  celular?: string;
  materias?: Array<{
    nombre: string;
    calificacion: number;
    creditos: number;
  }>;
  pagos?: Array<{
    concepto: string;
    monto: number;
    fecha_limite: string;
    estado: string;
  }>;
}

export class UniversityPortalScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  // URL del portal oficial - CONFIGURAR SEGÚN LA UNIVERSIDAD
  private readonly portalUrl =
    process.env.PORTAL_URL || "https://portal.universidad.edu.mx";

  async initialize() {
    this.browser = await chromium.launch({
      headless: true, // Ejecutar en modo invisible
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();

    // Configurar timeouts
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);
  }

  async login(credentials: ScraperCredentials): Promise<boolean> {
    if (!this.page) throw new Error("Page not initialized");

    try {
      console.log("🌐 Navegando al portal...");
      await this.page.goto(this.portalUrl);

      // NOTA: Estos selectores deben ajustarse según el portal real
      // Buscar el campo de matrícula/usuario
      await this.page.waitForSelector(
        'input[name="username"], input[name="matricula"], input[type="text"]',
        {
          timeout: 5000,
        },
      );

      // Llenar formulario de login
      await this.page.fill(
        'input[name="username"], input[name="matricula"], input[type="text"]',
        credentials.matricula,
      );
      await this.page.fill(
        'input[name="password"], input[type="password"]',
        credentials.password,
      );

      // Click en botón de login
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: "networkidle" }),
        this.page.click(
          'button[type="submit"], input[type="submit"], button:has-text("Entrar"), button:has-text("Iniciar")',
        ),
      ]);

      // Verificar si el login fue exitoso
      const currentUrl = this.page.url();
      const isLoggedIn =
        !currentUrl.includes("login") && !currentUrl.includes("error");

      console.log(isLoggedIn ? "✅ Login exitoso" : "❌ Login fallido");
      return isLoggedIn;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    }
  }

  // Método para hacer peticiones AJAX a los endpoints internos del portal
  private async fetchAjaxEndpoint(endpoint: string): Promise<string> {
    if (!this.page) return "";

    try {
      const baseUrl = new URL(this.portalUrl).origin;
      const fullUrl = `${baseUrl}/${endpoint}`;

      console.log(`🔗 Llamando a: ${endpoint}`);

      const response = await this.page.evaluate(async (url) => {
        const res = await fetch(url, {
          method: "POST",
          credentials: "include", // Incluir cookies de sesión
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        return await res.text();
      }, fullUrl);

      return response;
    } catch (error) {
      console.error(`❌ Error llamando a ${endpoint}:`, error);
      return "";
    }
  }

  async extractStudentData(): Promise<StudentData | null> {
    if (!this.page) throw new Error("Page not initialized");

    try {
      console.log(
        "📊 Extrayendo datos del estudiante usando endpoints AJAX...",
      );

      // Esperar a que la página de inicio cargue
      await this.page.waitForLoadState("networkidle");

      // Llamar a los endpoints AJAX del portal
      console.log("\n🎯 Usando endpoints internos del portal:");
      const datosAlumnoHTML = await this.fetchAjaxEndpoint(
        "interfacesNME/ajx/datosAlumno.php",
      );
      const adeudosHTML = await this.fetchAjaxEndpoint(
        "interfacesNME/ajx/adeudos.php",
      );
      const calificacionesHTML = await this.fetchAjaxEndpoint(
        "interfacesNME/ajx/calificacionesUnidad.php",
      );

      // Parsear datos del estudiante desde el HTML
      const studentData = await this.parseStudentDataFromHTML(datosAlumnoHTML);

      // Extraer materias desde el HTML de calificaciones
      const materias =
        await this.parseCalificacionesFromHTML(calificacionesHTML);
      if (materias.length > 0) {
        studentData.materias = materias;
      }

      // Extraer pagos desde el HTML de adeudos
      const pagos = await this.parseAdeudosFromHTML(adeudosHTML);
      if (pagos.length > 0) {
        studentData.pagos = pagos;
      }

      console.log("✅ Datos extraídos correctamente");
      console.log("\n" + "=".repeat(60));
      console.log("📋 INFORMACIÓN DEL ESTUDIANTE");
      console.log("=".repeat(60));
      console.log(
        `👤 Nombre Completo: ${studentData.nombre} ${studentData.apellido_paterno} ${studentData.apellido_materno}`,
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
        console.log(`\n📖 Materias (${materias.length}):`);
        materias.forEach((materia, index) => {
          console.log(`   ${index + 1}. ${materia.nombre}`);
          console.log(`      - Calificación: ${materia.calificacion}`);
          console.log(`      - Créditos: ${materia.creditos}`);
        });
      } else {
        console.log("\n📖 Materias: No se encontraron materias");
      }

      if (pagos.length > 0) {
        console.log(`\n💰 Pagos (${pagos.length}):`);
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
  private async parseStudentDataFromHTML(html: string): Promise<StudentData> {
    if (!this.page) throw new Error("Page not initialized");

    const data = await this.page.evaluate((htmlContent) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      // NOTA: Ajustar estos selectores según la estructura real del HTML
      // Buscar en inputs con name o id específicos
      const getText = (selectors: string[]): string => {
        for (const selector of selectors) {
          const element = doc.querySelector(selector);
          if (element) {
            const value =
              element.getAttribute("value") || element.textContent?.trim();
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
          '[data-field="nombre"]',
        ]),
        apellido_paterno: getText([
          'input[name="ApPaterno"]',
          'input[id="txtApPaterno"]',
          "#txtApPaterno",
        ]),
        apellido_materno: getText([
          'input[name="ApMaterno"]',
          'input[id="txtApMaterno"]',
          "#txtApMaterno",
        ]),
        matricula: getText([
          'input[name="Matricula"]',
          ".matricula",
          '[data-field="matricula"]',
        ]),
        carrera: getText([
          'input[name="Carrera"]',
          'select[name="Carrera"] option[selected]',
          ".carrera",
        ]),
        promedio: getText([
          'input[name="PromedioGeneral"]',
          'input[id="txtPromedioGeneral"]',
          "#txtPromedioGeneral",
        ]),
        email: getText(['input[name="Email"]', 'input[id="txtEmail"]']),
        celular: getText(['input[name="Celular"]', 'input[id="txtCelular"]']),
        curp: getText(['input[name="CURP"]', 'input[id="txtCURP"]']),
      };
    }, html);

    return {
      nombre: data.nombre || "Sin nombre",
      apellido_paterno: data.apellido_paterno || "",
      apellido_materno: data.apellido_materno || "",
      matricula: data.matricula || "",
      carrera: data.carrera || "Sin especificar",
      cuatrimestre: 0, // Se puede extraer si está disponible
      promedio: parseFloat(data.promedio) || 0,
      curp: data.curp || undefined,
      email: data.email || undefined,
      celular: data.celular || undefined,
    };
  }

  // Parsear calificaciones desde calificacionesUnidad.php
  private async parseCalificacionesFromHTML(
    html: string,
  ): Promise<
    Array<{ nombre: string; calificacion: number; creditos: number }>
  > {
    if (!this.page || !html) return [];

    const materias = await this.page.evaluate((htmlContent) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      const rows = doc.querySelectorAll("table tr, .materia, .subject");
      const result: Array<{
        nombre: string;
        calificacion: number;
        creditos: number;
      }> = [];

      rows.forEach((row, index) => {
        if (index === 0) return; // Saltar encabezado

        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          const nombre = cells[0]?.textContent?.trim() || "";
          const calificacion =
            parseFloat(cells[1]?.textContent?.trim() || "0") || 0;
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
  private async parseAdeudosFromHTML(html: string): Promise<
    Array<{
      concepto: string;
      monto: number;
      fecha_limite: string;
      estado: string;
    }>
  > {
    if (!this.page || !html) return [];

    const pagos = await this.page.evaluate((htmlContent) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      const rows = doc.querySelectorAll("table tr, .adeudo, .payment");
      const result: Array<{
        concepto: string;
        monto: number;
        fecha_limite: string;
        estado: string;
      }> = [];

      rows.forEach((row, index) => {
        if (index === 0) return; // Saltar encabezado

        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          const concepto = cells[0]?.textContent?.trim() || "";
          const montoText = cells[1]?.textContent?.trim() || "0";
          const monto = parseFloat(montoText.replace(/[^\d.]/g, "")) || 0;
          const fecha_limite = cells[2]?.textContent?.trim() || "";
          const estado =
            cells[3]?.textContent?.trim().toLowerCase() || "pendiente";

          if (concepto) {
            result.push({ concepto, monto, fecha_limite, estado });
          }
        }
      });

      return result;
    }, html);

    return pagos;
  }

  private async extractText(selector: string): Promise<string> {
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

  private async extractSubjects(): Promise<
    Array<{ nombre: string; calificacion: number; creditos: number }>
  > {
    if (!this.page) return [];

    try {
      // Navegar a la sección de materias si es necesario
      // await this.page.click('a:has-text("Materias"), a:has-text("Calificaciones")');
      // await this.page.waitForLoadState('networkidle');

      // Extraer tabla de materias
      const materias = await this.page.$$eval(
        "table.materias tr, table.grades tr, .subject-list .subject",
        (rows) => {
          return rows
            .slice(1)
            .map((row) => {
              const cells = row.querySelectorAll("td, .subject-name, .grade");
              return {
                nombre: cells[0]?.textContent?.trim() || "",
                calificacion: parseFloat(cells[1]?.textContent?.trim() || "0"),
                creditos: parseInt(cells[2]?.textContent?.trim() || "0"),
              };
            })
            .filter((m) => m.nombre !== "");
        },
      );

      return materias;
    } catch {
      return [];
    }
  }

  private async extractPayments(): Promise<
    Array<{
      concepto: string;
      monto: number;
      fecha_limite: string;
      estado: string;
    }>
  > {
    if (!this.page) return [];

    try {
      // Navegar a la sección de pagos si es necesario
      // await this.page.click('a:has-text("Pagos"), a:has-text("Finanzas")');
      // await this.page.waitForLoadState('networkidle');

      // Extraer tabla de pagos
      const pagos = await this.page.$$eval(
        "table.pagos tr, table.payments tr, .payment-list .payment",
        (rows) => {
          return rows
            .slice(1)
            .map((row) => {
              const cells = row.querySelectorAll(
                "td, .payment-concept, .payment-amount",
              );
              return {
                concepto: cells[0]?.textContent?.trim() || "",
                monto: parseFloat(
                  cells[1]?.textContent?.replace(/[^\d.]/g, "") || "0",
                ),
                fecha_limite: cells[2]?.textContent?.trim() || "",
                estado:
                  cells[3]?.textContent?.trim().toLowerCase() || "pendiente",
              };
            })
            .filter((p) => p.concepto !== "");
        },
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

  async scrapeStudentData(
    credentials: ScraperCredentials,
  ): Promise<StudentData | null> {
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
