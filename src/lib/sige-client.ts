/**
 * Cliente para interactuar con el portal SIGE usando cookies de sesión
 * Este cliente hace peticiones directas a los endpoints del SIGE usando la cookie PHPSESSID
 */

interface SigeSession {
  phpsessid: string;
  timestamp: number;
}

interface DatosAlumno {
  nombre: string;
  apPaterno: string;
  apMaterno: string;
  curp: string;
  email: string;
  celular: string;
  matricula: string;
  carrera?: string;
  cuatrimestre?: string;
}

interface Materia {
  nombre: string;
  calificacion: string;
  creditos: string;
  periodo: string;
  profesor?: string;
}

interface Adeudo {
  concepto: string;
  monto: string;
  fecha_limite: string;
  estado: string;
}

interface HistorialAcademico {
  materias: Materia[];
  promedio?: string;
  creditosCursados?: string;
  creditosTotales?: string;
}

export class SigeClient {
  private readonly BASE_URL = "http://sige.utsh.edu.mx/estudiantes";
  private phpsessid: string;

  constructor(phpsessid: string) {
    this.phpsessid = phpsessid;
  }

  /**
   * Realiza una petición POST al portal SIGE con la cookie de sesión
   */
  private async fetchSigeEndpoint(
    endpoint: string,
    body: Record<string, any> = {},
  ): Promise<string> {
    try {
      const url = `${this.BASE_URL}/${endpoint}`;

      console.log(`🔗 Petición a: ${endpoint}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `PHPSESSID=${this.phpsessid}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: new URLSearchParams(body).toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return html;
    } catch (error) {
      console.error(`❌ Error en endpoint ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Extrae valores de campos input/select del HTML
   */
  private extractFieldValue(html: string, fieldId: string): string {
    // Buscar input con id específico
    const inputRegex = new RegExp(
      `<input[^>]*id="${fieldId}"[^>]*value="([^"]*)"`,
      "i",
    );
    const selectRegex = new RegExp(
      `<select[^>]*id="${fieldId}"[^>]*>.*?<option[^>]*selected[^>]*>([^<]*)<`,
      "is",
    );

    let match = html.match(inputRegex);
    if (match) return match[1];

    match = html.match(selectRegex);
    if (match) return match[1];

    // Buscar por el texto después del label
    const labelRegex = new RegExp(`<[^>]*id="${fieldId}"[^>]*>([^<]*)<`, "i");
    match = html.match(labelRegex);
    if (match) return match[1].trim();

    return "";
  }

  /**
   * Extrae filas de una tabla HTML
   */
  private extractTableRows(html: string): string[][] {
    const rows: string[][] = [];
    const tableRegex = /<table[^>]*>(.*?)<\/table>/is;
    const tableMatch = html.match(tableRegex);

    if (!tableMatch) return rows;

    const tableContent = tableMatch[1];
    const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
    const rowMatches = tableContent.matchAll(rowRegex);

    for (const rowMatch of rowMatches) {
      const rowContent = rowMatch[1];
      const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gis;
      const cellMatches = rowContent.matchAll(cellRegex);

      const cells: string[] = [];
      for (const cellMatch of cellMatches) {
        // Limpiar HTML tags y espacios
        const cellText = cellMatch[1]
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim();
        cells.push(cellText);
      }

      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    return rows;
  }

  /**
   * Obtiene los datos personales del alumno
   */
  async getDatosAlumno(): Promise<DatosAlumno> {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/datosAlumno.php",
      );

      const datos: DatosAlumno = {
        nombre: this.extractFieldValue(html, "txtNombre"),
        apPaterno: this.extractFieldValue(html, "txtApPaterno"),
        apMaterno: this.extractFieldValue(html, "txtApMaterno"),
        curp: this.extractFieldValue(html, "txtCURP"),
        email: this.extractFieldValue(html, "txtEmail"),
        celular: this.extractFieldValue(html, "txtCelular"),
        matricula: this.extractFieldValue(html, "txtMatricula"),
        carrera: this.extractFieldValue(html, "txtCarrera"),
        cuatrimestre: this.extractFieldValue(html, "txtCuatrimestre"),
      };

      console.log("✅ Datos del alumno extraídos");
      return datos;
    } catch (error) {
      console.error("❌ Error obteniendo datos del alumno:", error);
      throw error;
    }
  }

  /**
   * Obtiene el historial académico (materias y calificaciones)
   */
  async getHistorialAcademico(): Promise<HistorialAcademico> {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/historialAcademico.php",
      );

      const rows = this.extractTableRows(html);
      const materias: Materia[] = [];

      // Saltar la primera fila (encabezados)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 3) {
          materias.push({
            nombre: row[0] || "",
            calificacion: row[1] || "",
            creditos: row[2] || "",
            periodo: row[3] || "",
            profesor: row[4] || "",
          });
        }
      }

      console.log(`✅ ${materias.length} materias extraídas del historial`);

      return {
        materias,
        promedio: this.extractFieldValue(html, "txtPromedio"),
        creditosCursados: this.extractFieldValue(html, "txtCreditosCursados"),
        creditosTotales: this.extractFieldValue(html, "txtCreditosTotales"),
      };
    } catch (error) {
      console.error("❌ Error obteniendo historial académico:", error);
      throw error;
    }
  }

  /**
   * Obtiene las calificaciones del cuatrimestre actual
   */
  async getCalificacionesActuales(): Promise<Materia[]> {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/calificacionesUnidad.php",
      );

      const rows = this.extractTableRows(html);
      const materias: Materia[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 2) {
          materias.push({
            nombre: row[0] || "",
            calificacion: row[1] || "",
            creditos: row[2] || "",
            periodo: "Actual",
          });
        }
      }

      console.log(`✅ ${materias.length} calificaciones actuales extraídas`);
      return materias;
    } catch (error) {
      console.error("❌ Error obteniendo calificaciones:", error);
      throw error;
    }
  }

  /**
   * Obtiene los adeudos pendientes
   */
  async getAdeudos(): Promise<Adeudo[]> {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/adeudos.php",
      );

      const rows = this.extractTableRows(html);
      const adeudos: Adeudo[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 3) {
          adeudos.push({
            concepto: row[0] || "",
            monto: row[1] || "",
            fecha_limite: row[2] || "",
            estado: row[3] || "Pendiente",
          });
        }
      }

      console.log(`✅ ${adeudos.length} adeudos extraídos`);
      return adeudos;
    } catch (error) {
      console.error("❌ Error obteniendo adeudos:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los datos del estudiante en una sola llamada
   */
  async getAllData() {
    console.log("📊 Extrayendo todos los datos del estudiante...");

    try {
      const [datosAlumno, historial, calificaciones, adeudos] =
        await Promise.all([
          this.getDatosAlumno(),
          this.getHistorialAcademico(),
          this.getCalificacionesActuales(),
          this.getAdeudos(),
        ]);

      console.log("✅ Todos los datos extraídos exitosamente");

      return {
        datosPersonales: datosAlumno,
        historialAcademico: historial,
        calificacionesActuales: calificaciones,
        adeudos: adeudos,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error obteniendo todos los datos:", error);
      throw error;
    }
  }

  /**
   * Verifica si la sesión (cookie) sigue siendo válida
   */
  async verificarSesion(): Promise<boolean> {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/datosAlumno.php",
      );

      // Si no hay redirección al login y hay contenido, la sesión es válida
      return html.length > 100 && !html.includes("login");
    } catch (error) {
      return false;
    }
  }
}

/**
 * Clase auxiliar para gestionar sesiones del SIGE en el servidor
 */
export class SigeSessionManager {
  private sessions: Map<string, SigeSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  /**
   * Guarda una sesión del SIGE
   */
  saveSession(matricula: string, phpsessid: string): void {
    this.sessions.set(matricula, {
      phpsessid,
      timestamp: Date.now(),
    });
    console.log(`💾 Sesión guardada para matrícula: ${matricula}`);
  }

  /**
   * Obtiene una sesión guardada
   */
  getSession(matricula: string): string | null {
    const session = this.sessions.get(matricula);

    if (!session) {
      return null;
    }

    // Verificar si la sesión ha expirado
    if (Date.now() - session.timestamp > this.SESSION_TIMEOUT) {
      this.sessions.delete(matricula);
      console.log(`⏰ Sesión expirada para matrícula: ${matricula}`);
      return null;
    }

    return session.phpsessid;
  }

  /**
   * Elimina una sesión
   */
  removeSession(matricula: string): void {
    this.sessions.delete(matricula);
    console.log(`🗑️ Sesión eliminada para matrícula: ${matricula}`);
  }

  /**
   * Limpia sesiones expiradas
   */
  cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [matricula, session] of this.sessions.entries()) {
      if (now - session.timestamp > this.SESSION_TIMEOUT) {
        this.sessions.delete(matricula);
      }
    }
  }
}

// Instancia global del gestor de sesiones
export const sessionManager = new SigeSessionManager();

// Limpiar sesiones expiradas cada 5 minutos
setInterval(
  () => {
    sessionManager.cleanExpiredSessions();
  },
  5 * 60 * 1000,
);
