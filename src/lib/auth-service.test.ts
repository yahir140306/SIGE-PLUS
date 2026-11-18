import { describe, it, expect } from "vitest";
import { AuthService } from "./auth-service";

describe("AuthService - Pruebas Unitarias", () => {
  describe("formatStudentProfile", () => {
    it("debe formatear correctamente datos completos del estudiante", () => {
      const rawData = {
        datosPersonales: {
          matricula: "2021004562",
          nombreCompleto: "JUAN PEREZ GONZALEZ",
          curp: "PEGI010101HHGXXX01",
          carrera: "INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN",
          periodoActivo: "ENERO - ABRIL 2026",
          cuatrimestre: "7mo Cuatrimestre",
          grupo: "7-A",
          estatus: "ACTIVO",
          telefonoMovil: "7741002030",
        },
        historialAcademico: {
          promedioGeneral: 9.45,
          materias: [
            { asignatura: "PROGRAMACIÓN MÓVIL", calificacion: "10" },
            { asignatura: "BASE DE DATOS", calificacion: "9" },
          ],
        },
        calificacionesActuales: [
          { asignatura: "SEGURIDAD INFORMÁTICA", evaluacion: "9" },
        ],
        adeudos: [],
      };

      const profile = AuthService.formatStudentProfile(rawData);

      expect(profile.matricula).toBe("2021004562");
      expect(profile.nombre).toBe("JUAN");
      expect(profile.apellido_paterno).toBe("PEREZ");
      expect(profile.apellido_materno).toBe("GONZALEZ");
      expect(profile.cuatrimestre).toBe(7);
      expect(profile.promedio).toBe(9.45);
      expect(profile.foto_url).toBe("https://sige.utsh.edu.mx/ctrlfotos/2021004562.jpg");
      expect(profile.tienePagosPendientes).toBe(false);
      expect(profile.carrera.nombre).toContain("TECNOLOGÍAS");
    });

    it("debe marcar adeudos pendientes cuando existan pagos no liquidados", () => {
      const rawData = {
        datosPersonales: {
          matricula: "2022001122",
          nombreCompleto: "MARIA LOPEZ",
        },
        adeudos: [{ concepto: "Reinscripción", importe: "1200" }],
      };

      const profile = AuthService.formatStudentProfile(rawData);

      expect(profile.tienePagosPendientes).toBe(true);
      expect(profile.adeudos.length).toBe(1);
      expect(profile.nombre).toBe("MARIA");
      expect(profile.apellido_paterno).toBe("LOPEZ");
      expect(profile.apellido_materno).toBe("");
    });

    it("debe interpretar cuatrimestres en palabras", () => {
      const casos = [
        { entrada: "Primer Cuatrimestre", esperado: 1 },
        { entrada: "Cuarto Cuatrimestre", esperado: 4 },
        { entrada: "Décimo Cuatrimestre", esperado: 10 },
      ];

      for (const caso of casos) {
        const profile = AuthService.formatStudentProfile({
          datosPersonales: { cuatrimestre: caso.entrada },
        });
        expect(profile.cuatrimestre).toBe(caso.esperado);
      }
    });

    it("debe manejar objetos vacíos sin lanzar excepciones", () => {
      const profile = AuthService.formatStudentProfile({}, "2021000000");

      expect(profile.matricula).toBe("2021000000");
      expect(profile.nombre).toBe("");
      expect(profile.promedio).toBe(0);
      expect(profile.tienePagosPendientes).toBe(false);
    });
  });

  describe("Validación de parámetros", () => {
    it("login debe rechazar entradas vacías", async () => {
      const res1 = await AuthService.login("", "123");
      expect(res1.success).toBe(false);
      expect(res1.error).toBeDefined();

      const res2 = await AuthService.login("2021000", "");
      expect(res2.success).toBe(false);
    });

    it("loginWithCookie debe rechazar cookies cortas o inválidas", async () => {
      const res1 = await AuthService.loginWithCookie("");
      expect(res1.success).toBe(false);

      const res2 = await AuthService.loginWithCookie("123");
      expect(res2.success).toBe(false);
    });
  });
});
