/**
 * Cliente para interactuar con el portal SIGE usando cookies de sesión
 * Este cliente hace peticiones directas a los endpoints del SIGE usando la cookie PHPSESSID
 */

interface SigeSession {
  phpsessid: string;
  timestamp: number;
}

interface DatosAlumno {
  matricula: string;
  nombreCompleto: string;
  curp: string;
  carrera: string;
  periodoActivo: string;
  cuatrimestre: string;
  grupo: string;
  grupoIngles: string;
  estatus: string;
  fotoUrl?: string;
  // Contacto
  telefonoRecados?: string;
  nombreRecados?: string;
  telefonoMovil?: string;
  telefonoCasa?: string;
}

interface MateriaHistorial {
  cuatrimestre: string;
  grupo: string;
  asignatura: string;
  calificacion: string;
}

interface CalificacionActual {
  grupo: string;
  asignatura: string;
  docente: string;
  unidad: string;
  evaluacion: string;
  remedial: string;
  extraordinario: string;
  asistencia: string;
}

interface Adeudo {
  concepto: string;
  descripcion: string;
  importe: string;
  recargos: string;
}

interface HistorialAcademico {
  materias: MateriaHistorial[];
  totalMaterias: number;
  promedioGeneral?: number;
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
   * Extrae texto entre <td> tags
   */
  private extractTableCellValue(html: string, strongText: string): string {
    // Buscar patrón: <td><strong>Texto</strong></td><td>Valor</td>
    const regex = new RegExp(
      `<td><strong>${strongText}:?</strong></td>\\s*<td>([^<]*)</td>`,
      "i",
    );
    const match = html.match(regex);
    return match ? match[1].trim() : "";
  }

  /**
   * Extrae todas las filas de una tabla (más robusto para el HTML del SIGE)
   */
  private extractTableRows(html: string, skipHeader = true): string[][] {
    const rows: string[][] = [];

    // Encontrar todas las tablas
    const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
    const tableMatches = html.matchAll(tableRegex);

    for (const tableMatch of tableMatches) {
      const tableContent = tableMatch[1];

      // Encontrar todas las filas
      const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
      const rowMatches = tableContent.matchAll(rowRegex);

      let rowIndex = 0;
      for (const rowMatch of rowMatches) {
        rowIndex++;

        // Saltar encabezados si está habilitado
        if (skipHeader && rowIndex === 1) {
          // Verificar si es un encabezado
          if (rowMatch[1].includes("<th")) continue;
        }

        const rowContent = rowMatch[1];

        // Extraer celdas (td o th)
        const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gis;
        const cellMatches = rowContent.matchAll(cellRegex);

        const cells: string[] = [];
        for (const cellMatch of cellMatches) {
          // Limpiar HTML interno y espacios
          let cellText = cellMatch[1]
            .replace(/<[^>]+>/g, " ") // Reemplazar tags con espacio
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ") // Normalizar espacios
            .trim();

          cells.push(cellText);
        }

        if (cells.length > 0 && !cells.every((c) => c === "")) {
          rows.push(cells);
        }
      }
    }

    return rows;
  }

  /**
   * Obtiene los datos personales del alumno parseando el HTML real
   */
  async getDatosAlumno(): Promise<DatosAlumno> {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/datosAlumno.php",
      );

      console.log(
        "\n📊 ==================== DATOS DEL ALUMNO ====================",
      );

      // Extraer matrícula
      const matricula = this.extractTableCellValue(html, "Matricula");
      console.log(`📋 Matrícula: ${matricula}`);

      // Extraer nombre completo
      const nombreCompleto = this.extractTableCellValue(html, "Nombre");
      console.log(`👤 Nombre: ${nombreCompleto}`);

      // Extraer CURP
      const curp = this.extractTableCellValue(html, "C.U.R.P");
      console.log(`🆔 CURP: ${curp}`);

      // Extraer carrera
      const carrera = this.extractTableCellValue(html, "Oferta Educativa");
      console.log(`🎓 Carrera: ${carrera}`);

      // Extraer periodo activo
      const periodoActivo = this.extractTableCellValue(html, "Periodo activo");
      console.log(`📅 Periodo Activo: ${periodoActivo}`);

      // Extraer cuatrimestre y grupo (están en la misma fila)
      const cuatrimestreMatch = html.match(
        /<td><strong>Cuatrimestre:<\/strong>\s*([^<]+)<\/td>/i,
      );
      const cuatrimestre = cuatrimestreMatch ? cuatrimestreMatch[1].trim() : "";
      console.log(`📚 Cuatrimestre: ${cuatrimestre}`);

      const grupoMatch = html.match(/<strong>Grupo:<\/strong>\s*([^<]+)</i);
      const grupo = grupoMatch ? grupoMatch[1].trim() : "";
      console.log(`👥 Grupo: ${grupo}`);

      // Extraer grupo de inglés y estatus
      const grupoInglesMatch = html.match(
        /<td><strong>Grupo Inglés:<\/strong>\s*([^<]*)<\/td>/i,
      );
      const grupoIngles = grupoInglesMatch ? grupoInglesMatch[1].trim() : "";

      const estatusMatch = html.match(/<strong>Estatus:<\/strong>([^<]+)</i);
      const estatus = estatusMatch ? estatusMatch[1].trim() : "";
      console.log(`🌐 Grupo Inglés: ${grupoIngles || "N/A"}`);
      console.log(`✅ Estatus: ${estatus}`);

      // Extraer foto (opcional)
      const fotoMatch = html.match(/<img src="([^"]+)"/i);
      const fotoUrl = fotoMatch ? fotoMatch[1] : "";
      if (fotoUrl) {
        console.log(`📷 Foto: ${fotoUrl}`);
      }

      // Sección de contacto
      console.log("\n📞 ==================== CONTACTO ====================");

      const nombreRecadosMatch = html.match(
        /<td><strong>Recados:<\/strong>\s*([^<]+)<\/td>/i,
      );
      const nombreRecados = nombreRecadosMatch
        ? nombreRecadosMatch[1].trim()
        : "";
      if (nombreRecados) {
        console.log(`👤 Recados: ${nombreRecados}`);
      }

      const telefonoRecados = this.extractTableCellValue(
        html,
        "Telefono recados",
      );
      if (telefonoRecados) {
        console.log(`📱 Teléfono Recados: ${telefonoRecados}`);
      }

      const telefonoMovil = this.extractTableCellValue(html, "Telefono movil");
      if (telefonoMovil) {
        console.log(`📲 Teléfono Móvil: ${telefonoMovil}`);
      }

      const telefonoCasa = this.extractTableCellValue(html, "Telefono casa");
      if (telefonoCasa) {
        console.log(`🏠 Teléfono Casa: ${telefonoCasa}`);
      }

      console.log("=".repeat(60) + "\n");

      const datos: DatosAlumno = {
        matricula,
        nombreCompleto,
        curp,
        carrera,
        periodoActivo,
        cuatrimestre,
        grupo,
        grupoIngles,
        estatus,
        fotoUrl,
        nombreRecados,
        telefonoRecados,
        telefonoMovil,
        telefonoCasa,
      };

      return datos;
    } catch (error) {
      console.error("❌ Error obteniendo datos del alumno:", error);
      throw error;
    }
  }

  /**
   * Obtiene el historial académico completo
   */
  async getHistorialAcademico(): Promise<HistorialAcademico> {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/historialAcademico.php",
      );

      console.log(
        "\n📚 ================== HISTORIAL ACADÉMICO ==================",
      );

      const rows = this.extractTableRows(html, true);
      const materias: MateriaHistorial[] = [];

      // Agrupar por cuatrimestre para mejor visualización
      const porCuatrimestre = new Map<string, MateriaHistorial[]>();

      for (const row of rows) {
        if (row.length >= 4) {
          const materia: MateriaHistorial = {
            cuatrimestre: row[0] || "",
            grupo: row[1] || "",
            asignatura: row[2] || "",
            calificacion: row[3] || "",
          };

          materias.push(materia);

          // Agrupar
          if (!porCuatrimestre.has(materia.cuatrimestre)) {
            porCuatrimestre.set(materia.cuatrimestre, []);
          }
          porCuatrimestre.get(materia.cuatrimestre)!.push(materia);
        }
      }

      // Mostrar por cuatrimestre
      for (const [cuatrimestre, mats] of porCuatrimestre) {
        console.log(`\n📖 ${cuatrimestre.toUpperCase()}`);
        console.log("─".repeat(60));

        let sumaCalif = 0;
        let countCalif = 0;

        for (const mat of mats) {
          const calif = parseFloat(mat.calificacion);
          if (!isNaN(calif)) {
            sumaCalif += calif;
            countCalif++;
          }

          const emoji = calif >= 9 ? "🟢" : calif >= 7 ? "🟡" : "🔴";
          console.log(
            `${emoji} ${mat.asignatura.padEnd(50)} ${mat.calificacion.padStart(4)} | ${mat.grupo}`,
          );
        }

        if (countCalif > 0) {
          const promedio = (sumaCalif / countCalif).toFixed(2);
          console.log(`   ${"Promedio:".padEnd(50)} ${promedio.padStart(4)}`);
        }
      }

      // Calcular promedio general
      let sumaTotal = 0;
      let countTotal = 0;
      for (const mat of materias) {
        const calif = parseFloat(mat.calificacion);
        if (!isNaN(calif)) {
          sumaTotal += calif;
          countTotal++;
        }
      }

      const promedioGeneral = countTotal > 0 ? sumaTotal / countTotal : 0;

      console.log("\n" + "=".repeat(60));
      console.log(`📊 Total de materias: ${materias.length}`);
      console.log(`📈 Promedio General: ${promedioGeneral.toFixed(2)}`);
      console.log("=".repeat(60) + "\n");

      return {
        materias,
        totalMaterias: materias.length,
        promedioGeneral,
      };
    } catch (error) {
      console.error("❌ Error obteniendo historial académico:", error);
      throw error;
    }
  }

  /**
   * Obtiene las calificaciones del cuatrimestre actual
   */
  async getCalificacionesActuales(): Promise<CalificacionActual[]> {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/calificacionesUnidad.php",
      );

      console.log(
        "\n📊 ================ CALIFICACIONES ACTUALES ================",
      );

      const rows = this.extractTableRows(html, true);
      const calificaciones: CalificacionActual[] = [];

      for (const row of rows) {
        if (row.length >= 8) {
          const calif: CalificacionActual = {
            grupo: row[0] || "",
            asignatura: row[1] || "",
            docente: row[2] || "",
            unidad: row[3] || "",
            evaluacion: row[4] || "",
            remedial: row[5] || "",
            extraordinario: row[6] || "",
            asistencia: row[7] || "",
          };

          calificaciones.push(calif);
        }
      }

      // Agrupar por asignatura (para unidades múltiples)
      const porAsignatura = new Map<string, CalificacionActual[]>();

      for (const calif of calificaciones) {
        if (!porAsignatura.has(calif.asignatura)) {
          porAsignatura.set(calif.asignatura, []);
        }
        porAsignatura.get(calif.asignatura)!.push(calif);
      }

      // Mostrar agrupado por asignatura
      let totalEvaluaciones = 0;
      let sumaCalificaciones = 0;

      for (const [asignatura, califs] of porAsignatura) {
        console.log(`\n📘 ${asignatura}`);
        console.log(`   👨‍🏫 Docente: ${califs[0].docente}`);
        console.log(`   👥 Grupo: ${califs[0].grupo}`);
        console.log("   " + "─".repeat(55));

        for (const calif of califs) {
          const eval_num = parseFloat(calif.evaluacion);
          const emoji = eval_num >= 9 ? "🟢" : eval_num >= 7 ? "🟡" : "🔴";

          console.log(
            `   ${emoji} Unidad ${calif.unidad}: ${calif.evaluacion.padStart(4)} | Asistencia: ${calif.asistencia}%`,
          );

          if (!isNaN(eval_num)) {
            totalEvaluaciones++;
            sumaCalificaciones += eval_num;
          }

          if (calif.remedial) {
            console.log(`      🔄 Remedial: ${calif.remedial}`);
          }
          if (calif.extraordinario) {
            console.log(`      📝 Extraordinario: ${calif.extraordinario}`);
          }
        }
      }

      const promedioActual =
        totalEvaluaciones > 0
          ? (sumaCalificaciones / totalEvaluaciones).toFixed(2)
          : "0.00";

      console.log("\n" + "=".repeat(60));
      console.log(`📈 Promedio Actual: ${promedioActual}`);
      console.log(`📚 Total de evaluaciones: ${totalEvaluaciones}`);
      console.log("=".repeat(60) + "\n");

      return calificaciones;
    } catch (error) {
      console.error("❌ Error obteniendo calificaciones actuales:", error);
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

      console.log("\n💰 ==================== ADEUDOS ====================");

      const rows = this.extractTableRows(html, true);
      const adeudos: Adeudo[] = [];

      if (rows.length === 0) {
        console.log("✅ ¡No tienes adeudos pendientes!");
        console.log("=".repeat(60) + "\n");
        return adeudos;
      }

      for (const row of rows) {
        if (row.length >= 4) {
          const adeudo: Adeudo = {
            concepto: row[0] || "",
            descripcion: row[1] || "",
            importe: row[2] || "",
            recargos: row[3] || "",
          };

          adeudos.push(adeudo);

          console.log(`\n📄 ${adeudo.concepto}`);
          if (adeudo.descripcion) {
            console.log(`   ℹ️  ${adeudo.descripcion}`);
          }
          console.log(`   💵 Importe: ${adeudo.importe}`);
          if (
            adeudo.recargos &&
            adeudo.recargos !== "0" &&
            adeudo.recargos !== "$0.00"
          ) {
            console.log(`   ⚠️  Recargos: ${adeudo.recargos}`);
          }
        }
      }

      console.log("\n" + "=".repeat(60));
      console.log(`⚠️  Total de adeudos: ${adeudos.length}`);
      console.log("=".repeat(60) + "\n");

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
    console.log("\n");
    console.log(
      "╔═══════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  🎓  SINCRONIZACIÓN COMPLETA DEL PORTAL SIGE - UTSH       ║",
    );
    console.log(
      "╚═══════════════════════════════════════════════════════════╝",
    );
    console.log("");

    try {
      const [datosAlumno, historial, calificaciones, adeudos] =
        await Promise.all([
          this.getDatosAlumno(),
          this.getHistorialAcademico(),
          this.getCalificacionesActuales(),
          this.getAdeudos(),
        ]);

      // Resumen final
      console.log("\n");
      console.log(
        "╔═══════════════════════════════════════════════════════════╗",
      );
      console.log(
        "║                  📊  RESUMEN GENERAL                       ║",
      );
      console.log(
        "╚═══════════════════════════════════════════════════════════╝",
      );
      console.log("");
      console.log(`👤 Estudiante: ${datosAlumno.nombreCompleto}`);
      console.log(`📋 Matrícula: ${datosAlumno.matricula}`);
      console.log(`🎓 Carrera: ${datosAlumno.carrera}`);
      console.log(`📅 Periodo: ${datosAlumno.periodoActivo}`);
      console.log(
        `📚 Cuatrimestre: ${datosAlumno.cuatrimestre} | Grupo: ${datosAlumno.grupo}`,
      );
      console.log("");
      console.log("─".repeat(63));
      console.log("");
      console.log(
        `📖 Materias cursadas (historial): ${historial.totalMaterias}`,
      );
      console.log(
        `📈 Promedio general: ${historial.promedioGeneral?.toFixed(2) || "N/A"}`,
      );
      console.log(`📊 Evaluaciones actuales: ${calificaciones.length}`);
      console.log(`💰 Adeudos pendientes: ${adeudos.length}`);
      console.log("");
      console.log("═".repeat(63));
      console.log("✅ SINCRONIZACIÓN COMPLETADA EXITOSAMENTE");
      console.log("═".repeat(63));
      console.log("");

      return {
        datosPersonales: datosAlumno,
        historialAcademico: historial,
        calificacionesActuales: calificaciones,
        adeudos: adeudos,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("\n❌ Error obteniendo todos los datos:", error);
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
