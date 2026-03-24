import { describe, it, expect } from "vitest";
import {
  getPeriodoActual,
  getPeriodoSiguiente,
  getPeriodoAnterior,
  esPeriodoReinscripcion,
  calcularCuatrimestreSiguiente,
} from "../../src/lib/periodo-utils";

describe("periodo-utils", () => {
  describe("getPeriodoActual", () => {
    it("debe retornar periodo Enero-Abril cuando la fecha está en enero", () => {
      const fecha = new Date(2026, 0, 15); // 15 de enero 2026
      const periodo = getPeriodoActual(fecha);

      expect(periodo.cuatrimestre).toBe(1);
      expect(periodo.nombre).toBe("Enero-Abril 2026");
      expect(periodo.year).toBe(2026);
    });

    it("debe retornar periodo Mayo-Agosto cuando la fecha está en junio", () => {
      const fecha = new Date(2026, 5, 15); // 15 de junio 2026
      const periodo = getPeriodoActual(fecha);

      expect(periodo.cuatrimestre).toBe(2);
      expect(periodo.nombre).toBe("Mayo-Agosto 2026");
    });

    it("debe retornar periodo Sep-Dic cuando la fecha está en octubre", () => {
      const fecha = new Date(2026, 9, 15); // 15 de octubre 2026
      const periodo = getPeriodoActual(fecha);

      expect(periodo.cuatrimestre).toBe(3);
      expect(periodo.nombre).toBe("Septiembre-Diciembre 2026");
    });
  });

  describe("getPeriodoSiguiente", () => {
    it("debe retornar Mayo-Agosto como siguiente de Enero-Abril", () => {
      const periodo = getPeriodoActual(new Date(2026, 0, 15));
      const siguiente = getPeriodoSiguiente(periodo);

      expect(siguiente.cuatrimestre).toBe(2);
      expect(siguiente.nombre).toBe("Mayo-Agosto 2026");
    });

    it("debe retornar Sep-Dic como siguiente de Mayo-Agosto", () => {
      const periodo = getPeriodoActual(new Date(2026, 5, 15));
      const siguiente = getPeriodoSiguiente(periodo);

      expect(siguiente.cuatrimestre).toBe(3);
      expect(siguiente.nombre).toBe("Septiembre-Diciembre 2026");
    });

    it("debe cambiar año cuando siguiente es Enero-Abril", () => {
      const periodo = getPeriodoActual(new Date(2026, 10, 15));
      const siguiente = getPeriodoSiguiente(periodo);

      expect(siguiente.year).toBe(2027);
      expect(siguiente.cuatrimestre).toBe(1);
    });
  });

  describe("esPeriodoReinscripcion", () => {
    it("debe retornar true para abril (mes 4)", () => {
      const fecha = new Date(2026, 3, 15); // Abril
      expect(esPeriodoReinscripcion(fecha)).toBe(true);
    });

    it("debe retornar true para agosto (mes 8)", () => {
      const fecha = new Date(2026, 7, 15); // Agosto
      expect(esPeriodoReinscripcion(fecha)).toBe(true);
    });

    it("debe retornar true para diciembre (mes 12)", () => {
      const fecha = new Date(2026, 11, 15); // Diciembre
      expect(esPeriodoReinscripcion(fecha)).toBe(true);
    });

    it("debe retornar false para enero", () => {
      const fecha = new Date(2026, 0, 15); // Enero
      expect(esPeriodoReinscripcion(fecha)).toBe(false);
    });
  });

  describe("calcularCuatrimestreSiguiente", () => {
    it("debe sumar 1 al cuatrimestre actual", () => {
      expect(calcularCuatrimestreSiguiente(1)).toBe(2);
      expect(calcularCuatrimestreSiguiente(2)).toBe(3);
      expect(calcularCuatrimestreSiguiente(3)).toBe(4);
    });
  });
});
