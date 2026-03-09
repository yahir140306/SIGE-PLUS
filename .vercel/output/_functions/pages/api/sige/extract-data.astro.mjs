export { renderers } from '../../../renderers.mjs';

class SigeClient {
  BASE_URL = "http://sige.utsh.edu.mx/estudiantes";
  phpsessid;
  constructor(phpsessid) {
    this.phpsessid = phpsessid;
  }
  /**
   * Realiza una petición POST al portal SIGE con la cookie de sesión
   */
  async fetchSigeEndpoint(endpoint, body = {}) {
    try {
      const url = `${this.BASE_URL}/${endpoint}`;
      console.log(`🔗 Petición a: ${endpoint}`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `PHPSESSID=${this.phpsessid}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        body: new URLSearchParams(body).toString()
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
  extractTableCellValue(html, strongText) {
    const regex = new RegExp(
      `<td><strong>${strongText}:?</strong></td>\\s*<td>([^<]*)</td>`,
      "i"
    );
    const match = html.match(regex);
    return match ? match[1].trim() : "";
  }
  /**
   * Extrae todas las filas de una tabla (más robusto para el HTML del SIGE)
   */
  extractTableRows(html, skipHeader = true) {
    const rows = [];
    const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
    const tableMatches = html.matchAll(tableRegex);
    for (const tableMatch of tableMatches) {
      const tableContent = tableMatch[1];
      const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
      const rowMatches = tableContent.matchAll(rowRegex);
      let rowIndex = 0;
      for (const rowMatch of rowMatches) {
        rowIndex++;
        if (skipHeader && rowIndex === 1) {
          if (rowMatch[1].includes("<th")) continue;
        }
        const rowContent = rowMatch[1];
        const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gis;
        const cellMatches = rowContent.matchAll(cellRegex);
        const cells = [];
        for (const cellMatch of cellMatches) {
          let cellText = cellMatch[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
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
  async getDatosAlumno() {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/datosAlumno.php"
      );
      console.log(
        "\n📊 ==================== DATOS DEL ALUMNO ===================="
      );
      const matricula = this.extractTableCellValue(html, "Matricula");
      console.log(`📋 Matrícula: ${matricula}`);
      const nombreCompleto = this.extractTableCellValue(html, "Nombre");
      console.log(`👤 Nombre: ${nombreCompleto}`);
      const curp = this.extractTableCellValue(html, "C.U.R.P");
      console.log(`🆔 CURP: ${curp}`);
      const carrera = this.extractTableCellValue(html, "Oferta Educativa");
      console.log(`🎓 Carrera: ${carrera}`);
      const periodoActivo = this.extractTableCellValue(html, "Periodo activo");
      console.log(`📅 Periodo Activo: ${periodoActivo}`);
      const cuatrimestreMatch = html.match(
        /<td><strong>Cuatrimestre:<\/strong>\s*([^<]+)<\/td>/i
      );
      const cuatrimestre = cuatrimestreMatch ? cuatrimestreMatch[1].trim() : "";
      console.log(`📚 Cuatrimestre: ${cuatrimestre}`);
      const grupoMatch = html.match(/<strong>Grupo:<\/strong>\s*([^<]+)</i);
      const grupo = grupoMatch ? grupoMatch[1].trim() : "";
      console.log(`👥 Grupo: ${grupo}`);
      const grupoInglesMatch = html.match(
        /<td><strong>Grupo Inglés:<\/strong>\s*([^<]*)<\/td>/i
      );
      const grupoIngles = grupoInglesMatch ? grupoInglesMatch[1].trim() : "";
      const estatusMatch = html.match(/<strong>Estatus:<\/strong>([^<]+)</i);
      const estatus = estatusMatch ? estatusMatch[1].trim() : "";
      console.log(`🌐 Grupo Inglés: ${grupoIngles || "N/A"}`);
      console.log(`✅ Estatus: ${estatus}`);
      const fotoMatch = html.match(/<img src="([^"]+)"/i);
      const fotoUrl = fotoMatch ? fotoMatch[1] : "";
      if (fotoUrl) {
        console.log(`📷 Foto: ${fotoUrl}`);
      }
      console.log("\n📞 ==================== CONTACTO ====================");
      const nombreRecadosMatch = html.match(
        /<td><strong>Recados:<\/strong>\s*([^<]+)<\/td>/i
      );
      const nombreRecados = nombreRecadosMatch ? nombreRecadosMatch[1].trim() : "";
      if (nombreRecados) {
        console.log(`👤 Recados: ${nombreRecados}`);
      }
      const telefonoRecados = this.extractTableCellValue(
        html,
        "Telefono recados"
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
      const datos = {
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
        telefonoCasa
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
  async getHistorialAcademico() {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/historialAcademico.php"
      );
      console.log(
        "\n📚 ================== HISTORIAL ACADÉMICO =================="
      );
      const rows = this.extractTableRows(html, true);
      const materias = [];
      const porCuatrimestre = /* @__PURE__ */ new Map();
      for (const row of rows) {
        if (row.length >= 4) {
          const materia = {
            cuatrimestre: row[0] || "",
            grupo: row[1] || "",
            asignatura: row[2] || "",
            calificacion: row[3] || ""
          };
          materias.push(materia);
          if (!porCuatrimestre.has(materia.cuatrimestre)) {
            porCuatrimestre.set(materia.cuatrimestre, []);
          }
          porCuatrimestre.get(materia.cuatrimestre).push(materia);
        }
      }
      for (const [cuatrimestre, mats] of porCuatrimestre) {
        console.log(`
📖 ${cuatrimestre.toUpperCase()}`);
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
            `${emoji} ${mat.asignatura.padEnd(50)} ${mat.calificacion.padStart(4)} | ${mat.grupo}`
          );
        }
        if (countCalif > 0) {
          const promedio = (sumaCalif / countCalif).toFixed(2);
          console.log(`   ${"Promedio:".padEnd(50)} ${promedio.padStart(4)}`);
        }
      }
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
        promedioGeneral
      };
    } catch (error) {
      console.error("❌ Error obteniendo historial académico:", error);
      throw error;
    }
  }
  /**
   * Obtiene las calificaciones del cuatrimestre actual
   */
  async getCalificacionesActuales() {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/calificacionesUnidad.php"
      );
      console.log(
        "\n📊 ================ CALIFICACIONES ACTUALES ================"
      );
      const rows = this.extractTableRows(html, true);
      const calificaciones = [];
      for (const row of rows) {
        if (row.length >= 8) {
          const calif = {
            grupo: row[0] || "",
            asignatura: row[1] || "",
            docente: row[2] || "",
            unidad: row[3] || "",
            evaluacion: row[4] || "",
            remedial: row[5] || "",
            extraordinario: row[6] || "",
            asistencia: row[7] || ""
          };
          calificaciones.push(calif);
        }
      }
      const porAsignatura = /* @__PURE__ */ new Map();
      for (const calif of calificaciones) {
        if (!porAsignatura.has(calif.asignatura)) {
          porAsignatura.set(calif.asignatura, []);
        }
        porAsignatura.get(calif.asignatura).push(calif);
      }
      let totalEvaluaciones = 0;
      let sumaCalificaciones = 0;
      for (const [asignatura, califs] of porAsignatura) {
        console.log(`
📘 ${asignatura}`);
        console.log(`   👨‍🏫 Docente: ${califs[0].docente}`);
        console.log(`   👥 Grupo: ${califs[0].grupo}`);
        console.log("   " + "─".repeat(55));
        for (const calif of califs) {
          const eval_num = parseFloat(calif.evaluacion);
          const emoji = eval_num >= 9 ? "🟢" : eval_num >= 7 ? "🟡" : "🔴";
          console.log(
            `   ${emoji} Unidad ${calif.unidad}: ${calif.evaluacion.padStart(4)} | Asistencia: ${calif.asistencia}%`
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
      const promedioActual = totalEvaluaciones > 0 ? (sumaCalificaciones / totalEvaluaciones).toFixed(2) : "0.00";
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
  async getAdeudos() {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/adeudos.php"
      );
      console.log("\n💰 ==================== ADEUDOS ====================");
      const rows = this.extractTableRows(html, true);
      const adeudos = [];
      if (rows.length === 0) {
        console.log("✅ ¡No tienes adeudos pendientes!");
        console.log("=".repeat(60) + "\n");
        return adeudos;
      }
      for (const row of rows) {
        if (row.length >= 4) {
          const adeudo = {
            concepto: row[0] || "",
            descripcion: row[1] || "",
            importe: row[2] || "",
            recargos: row[3] || ""
          };
          adeudos.push(adeudo);
          console.log(`
📄 ${adeudo.concepto}`);
          if (adeudo.descripcion) {
            console.log(`   ℹ️  ${adeudo.descripcion}`);
          }
          console.log(`   💵 Importe: ${adeudo.importe}`);
          if (adeudo.recargos && adeudo.recargos !== "0" && adeudo.recargos !== "$0.00") {
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
      "╔═══════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║  🎓  SINCRONIZACIÓN COMPLETA DEL PORTAL SIGE - UTSH       ║"
    );
    console.log(
      "╚═══════════════════════════════════════════════════════════╝"
    );
    console.log("");
    try {
      const [datosAlumno, historial, calificaciones, adeudos] = await Promise.all([
        this.getDatosAlumno(),
        this.getHistorialAcademico(),
        this.getCalificacionesActuales(),
        this.getAdeudos()
      ]);
      console.log("\n");
      console.log(
        "╔═══════════════════════════════════════════════════════════╗"
      );
      console.log(
        "║                  📊  RESUMEN GENERAL                       ║"
      );
      console.log(
        "╚═══════════════════════════════════════════════════════════╝"
      );
      console.log("");
      console.log(`👤 Estudiante: ${datosAlumno.nombreCompleto}`);
      console.log(`📋 Matrícula: ${datosAlumno.matricula}`);
      console.log(`🎓 Carrera: ${datosAlumno.carrera}`);
      console.log(`📅 Periodo: ${datosAlumno.periodoActivo}`);
      console.log(
        `📚 Cuatrimestre: ${datosAlumno.cuatrimestre} | Grupo: ${datosAlumno.grupo}`
      );
      console.log("");
      console.log("─".repeat(63));
      console.log("");
      console.log(
        `📖 Materias cursadas (historial): ${historial.totalMaterias}`
      );
      console.log(
        `📈 Promedio general: ${historial.promedioGeneral?.toFixed(2) || "N/A"}`
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
        adeudos,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("\n❌ Error obteniendo todos los datos:", error);
      throw error;
    }
  }
  /**
   * Verifica si la sesión (cookie) sigue siendo válida
   */
  async verificarSesion() {
    try {
      const html = await this.fetchSigeEndpoint(
        "interfacesNME/ajx/datosAlumno.php"
      );
      return html.length > 100 && !html.includes("login");
    } catch (error) {
      return false;
    }
  }
}
class SigeSessionManager {
  sessions = /* @__PURE__ */ new Map();
  SESSION_TIMEOUT = 30 * 60 * 1e3;
  // 30 minutos
  /**
   * Guarda una sesión del SIGE
   */
  saveSession(matricula, phpsessid) {
    this.sessions.set(matricula, {
      phpsessid,
      timestamp: Date.now()
    });
    console.log(`💾 Sesión guardada para matrícula: ${matricula}`);
  }
  /**
   * Obtiene una sesión guardada
   */
  getSession(matricula) {
    const session = this.sessions.get(matricula);
    if (!session) {
      return null;
    }
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
  removeSession(matricula) {
    this.sessions.delete(matricula);
    console.log(`🗑️ Sesión eliminada para matrícula: ${matricula}`);
  }
  /**
   * Limpia sesiones expiradas
   */
  cleanExpiredSessions() {
    const now = Date.now();
    for (const [matricula, session] of this.sessions.entries()) {
      if (now - session.timestamp > this.SESSION_TIMEOUT) {
        this.sessions.delete(matricula);
      }
    }
  }
}
const sessionManager = new SigeSessionManager();
setInterval(
  () => {
    sessionManager.cleanExpiredSessions();
  },
  5 * 60 * 1e3
);

const POST = async ({ request }) => {
  try {
    const { phpsessid, matricula } = await request.json();
    if (!phpsessid) {
      return new Response(
        JSON.stringify({ error: "Cookie PHPSESSID es requerida" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("🍪 Cookie PHPSESSID recibida");
    console.log("📋 Matrícula:", matricula || "No proporcionada");
    const sigeClient = new SigeClient(phpsessid);
    console.log("🔐 Verificando validez de la sesión...");
    const sesionValida = await sigeClient.verificarSesion();
    if (!sesionValida) {
      return new Response(
        JSON.stringify({
          error: "La sesión del SIGE no es válida o ha expirado",
          code: "INVALID_SESSION"
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("✅ Sesión válida. Extrayendo datos...");
    const allData = await sigeClient.getAllData();
    const matriculaExtraida = allData.datosPersonales.matricula || matricula;
    if (matriculaExtraida) {
      sessionManager.saveSession(matriculaExtraida, phpsessid);
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: allData,
        matricula: matriculaExtraida
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Error procesando cookie del SIGE:", error);
    return new Response(
      JSON.stringify({
        error: "Error al extraer datos del portal SIGE",
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
