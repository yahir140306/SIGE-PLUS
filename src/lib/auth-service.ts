/**
 * Servicio unificado de Autenticación para SIGE-PLUS
 * Centraliza la lógica de login oficial, formateo de perfiles y sincronización con base de datos.
 */

import { SigeClient, sessionManager } from "./sige-client";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { StudentProfile, AuthResult, MateriaItem, AdeudoItem } from "./types/auth";

export class AuthService {
  /**
   * Transforma los datos crudos extraídos del SIGE en un perfil de estudiante estándar y normalizado.
   */
  static formatStudentProfile(rawSigeData: any, matriculaFallback?: string): StudentProfile {
    const datosPersonales = rawSigeData?.datosPersonales || {};
    const historialAcademico = rawSigeData?.historialAcademico || {};
    const calificacionesActuales: MateriaItem[] = rawSigeData?.calificacionesActuales || [];
    const adeudos: AdeudoItem[] = rawSigeData?.adeudos || [];
    const matricula = datosPersonales.matricula || matriculaFallback || "";

    const fotoUrl = `https://sige.utsh.edu.mx/ctrlfotos/${matricula}.jpg`;
    const nombreCompleto = (datosPersonales.nombreCompleto || "").trim();
    const partesNombre = nombreCompleto ? nombreCompleto.split(/\s+/) : [];

    let nombre = "";
    let apellidoPaterno = "";
    let apellidoMaterno = "";

    if (partesNombre.length >= 3) {
      nombre = partesNombre[0];
      apellidoPaterno = partesNombre[1];
      apellidoMaterno = partesNombre.slice(2).join(" ");
    } else if (partesNombre.length === 2) {
      nombre = partesNombre[0];
      apellidoPaterno = partesNombre[1];
    } else if (partesNombre.length === 1) {
      nombre = partesNombre[0];
    }

    const cuatrimestreStr = (datosPersonales.cuatrimestre || "").toString();
    let cuatrimestreNum = 0;
    const match = cuatrimestreStr.match(/\d+/);
    if (match) {
      cuatrimestreNum = parseInt(match[0], 10);
    } else if (cuatrimestreStr.toLowerCase().includes("primer")) {
      cuatrimestreNum = 1;
    } else if (cuatrimestreStr.toLowerCase().includes("segundo")) {
      cuatrimestreNum = 2;
    } else if (cuatrimestreStr.toLowerCase().includes("tercer")) {
      cuatrimestreNum = 3;
    } else if (cuatrimestreStr.toLowerCase().includes("cuarto")) {
      cuatrimestreNum = 4;
    } else if (cuatrimestreStr.toLowerCase().includes("quinto")) {
      cuatrimestreNum = 5;
    } else if (cuatrimestreStr.toLowerCase().includes("sexto")) {
      cuatrimestreNum = 6;
    } else if (cuatrimestreStr.toLowerCase().includes("sept") || cuatrimestreStr.toLowerCase().includes("sépt")) {
      cuatrimestreNum = 7;
    } else if (cuatrimestreStr.toLowerCase().includes("octav")) {
      cuatrimestreNum = 8;
    } else if (cuatrimestreStr.toLowerCase().includes("noven")) {
      cuatrimestreNum = 9;
    } else if (cuatrimestreStr.toLowerCase().includes("decim") || cuatrimestreStr.toLowerCase().includes("décim")) {
      cuatrimestreNum = 10;
    }

    return {
      matricula,
      nombre,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      curp: datosPersonales.curp || "",
      carrera: {
        nombre: datosPersonales.carrera || "No disponible",
      },
      periodo: {
        nombre: datosPersonales.periodoActivo || "No disponible",
      },
      cuatrimestre: cuatrimestreNum,
      promedio: Number(historialAcademico.promedioGeneral) || 0,
      foto_url: fotoUrl,
      grupo: datosPersonales.grupo || "",
      estatus: datosPersonales.estatus || "ACTIVO",
      tienePagosPendientes: Array.isArray(adeudos) && adeudos.length > 0,
      materias: calificacionesActuales,
      adeudos: adeudos,
      historialAcademico: historialAcademico.materias || [],
      email: `${matricula}@utsh.edu.mx`,
      celular: datosPersonales.telefonoMovil || undefined,
    };
  }

  /**
   * Sincroniza el perfil y datos del estudiante en Supabase como respaldo.
   * Si la base de datos no está disponible o falla, la ejecución continúa de forma transparente.
   */
  static async syncWithDatabase(profile: StudentProfile, rawData: any): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      // 1. Verificar si el estudiante existe en la tabla de estudiantes
      const { data: estudianteExistente } = await supabase
        .from("estudiantes")
        .select("id, matricula")
        .eq("matricula", profile.matricula)
        .maybeSingle();

      if (!estudianteExistente) {
        await supabase.from("estudiantes").insert({
          matricula: profile.matricula,
          nombre: profile.nombre,
          apellido_paterno: profile.apellido_paterno,
          apellido_materno: profile.apellido_materno || null,
          curp: profile.curp || null,
          email: profile.email || `${profile.matricula}@utsh.edu.mx`,
          password: profile.matricula,
        });
      }

      // 2. Guardar snapshot completo en sige_datos_respaldo
      await supabase.from("sige_datos_respaldo").insert({
        matricula: profile.matricula,
        datos_personales: rawData.datosPersonales,
        historial_academico: rawData.historialAcademico,
        calificaciones_actuales: rawData.calificacionesActuales,
        adeudos: rawData.adeudos,
        fecha_sincronizacion: new Date().toISOString(),
        exitosa: true,
      });
    } catch (error) {
      console.warn("⚠️ No se pudo completar el respaldo en Supabase (no bloqueante):", error);
    }
  }

  /**
   * Flujo principal de inicio de sesión:
   * 1. Autentica contra el portal oficial https://sige.utsh.edu.mx/estudiantes/login.php
   * 2. Obtiene la cookie PHPSESSID del servidor
   * 3. Extrae automáticamente la información académica
   * 4. Normaliza el perfil del estudiante y lo respalda
   */
  static async login(matricula: string, password: string): Promise<AuthResult> {
    if (!matricula || !password) {
      return {
        success: false,
        error: "Matrícula y contraseña son requeridas.",
      };
    }

    const cleanMatricula = matricula.trim();

    // 1. Autenticar en SIGE oficial
    const authResult = await SigeClient.login(cleanMatricula, password);
    if (!authResult.success || !authResult.phpsessid) {
      return {
        success: false,
        error: authResult.error || "Matrícula o contraseña incorrecta en el portal SIGE.",
      };
    }

    const phpsessid = authResult.phpsessid;

    // 2. Extraer datos con la sesión oficial
    const client = new SigeClient(phpsessid);
    const allData = await client.getAllData();
    const finalMatricula = allData.datosPersonales?.matricula || cleanMatricula;

    // 3. Registrar sesión en el gestor en memoria
    sessionManager.saveSession(finalMatricula, phpsessid);

    // 4. Formatear perfil
    const userProfile = this.formatStudentProfile(allData, finalMatricula);

    // 5. Respaldar en base de datos
    await this.syncWithDatabase(userProfile, allData);

    return {
      success: true,
      matricula: finalMatricula,
      phpsessid,
      user: userProfile,
      data: allData,
      token: `sige-token-${Date.now()}`,
    };
  }

  /**
   * Flujo secundario (Cookie manual):
   * Permite sincronizar si el usuario ya cuenta con su cookie PHPSESSID activa.
   */
  static async loginWithCookie(phpsessid: string, matriculaHint?: string): Promise<AuthResult> {
    if (!phpsessid || phpsessid.length < 10) {
      return {
        success: false,
        error: "Cookie PHPSESSID inválida o no proporcionada.",
      };
    }

    const cleanCookie = phpsessid.replace(/^PHPSESSID=/, "").trim();
    const client = new SigeClient(cleanCookie);

    const sesionValida = await client.verificarSesion();
    if (!sesionValida) {
      return {
        success: false,
        error: "La sesión del SIGE no es válida o ha expirado.",
      };
    }

    const allData = await client.getAllData();
    const finalMatricula = allData.datosPersonales?.matricula || matriculaHint || "";

    if (finalMatricula) {
      sessionManager.saveSession(finalMatricula, cleanCookie);
    }

    const userProfile = this.formatStudentProfile(allData, finalMatricula);
    await this.syncWithDatabase(userProfile, allData);

    return {
      success: true,
      matricula: finalMatricula,
      phpsessid: cleanCookie,
      user: userProfile,
      data: allData,
      token: `sige-cookie-token-${Date.now()}`,
    };
  }
}
