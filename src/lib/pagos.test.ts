import { describe, it, expect } from "vitest";

// Funciones de lógica de pagos (extracto para prueba)
const MONTO_MENSUAL = 250;
const RECARGO_DIARIO = 5;
const DIA_LIMITE_PAGO = 12;

function calcularMontoConRecargo(dias: number): number {
  if (dias <= 0) {
    return MONTO_MENSUAL;
  }
  const recargo = dias * RECARGO_DIARIO;
  return MONTO_MENSUAL + recargo;
}

function tieneBecaAcademica(promedioMensual: number): boolean {
  return promedioMensual >= 9.0;
}

function calcularPorcentajeBeca(tieneBeca: boolean): number {
  return tieneBeca ? 100 : 0;
}

function calcularMontoFinal(montoBase: number, tieneBeca: boolean): number {
  return tieneBeca ? 0 : montoBase;
}

describe("Logica de pagos mensuales", () => {
  describe("calcularMontoConRecargo", () => {
    it("debe retornar monto base sin recargo cuando los dias son 0 o negativos", () => {
      expect(calcularMontoConRecargo(0)).toBe(MONTO_MENSUAL);
      expect(calcularMontoConRecargo(-5)).toBe(MONTO_MENSUAL);
    });

    it("debe sumar recargo por dia vencido", () => {
      const diasVencido = 5;
      const esperado = MONTO_MENSUAL + diasVencido * RECARGO_DIARIO;
      expect(calcularMontoConRecargo(diasVencido)).toBe(esperado);
    });

    it("debe calcular recargo correctamente para 10 dias vencidos", () => {
      const diasVencido = 10;
      const esperado = MONTO_MENSUAL + diasVencido * RECARGO_DIARIO;
      expect(calcularMontoConRecargo(diasVencido)).toBe(esperado);
      expect(calcularMontoConRecargo(diasVencido)).toBe(300); // 250 + 10*5
    });
  });

  describe("tieneBecaAcademica", () => {
    it("debe retornar true si promedio >= 9.0", () => {
      expect(tieneBecaAcademica(9.0)).toBe(true);
      expect(tieneBecaAcademica(9.5)).toBe(true);
      expect(tieneBecaAcademica(10.0)).toBe(true);
    });

    it("debe retornar false si promedio < 9.0", () => {
      expect(tieneBecaAcademica(8.9)).toBe(false);
      expect(tieneBecaAcademica(8.0)).toBe(false);
      expect(tieneBecaAcademica(7.5)).toBe(false);
    });

    it("debe retornar false para promedio en el limite inferior", () => {
      expect(tieneBecaAcademica(8.99)).toBe(false);
    });
  });

  describe("calcularPorcentajeBeca", () => {
    it("debe retornar 100 si tiene beca", () => {
      expect(calcularPorcentajeBeca(true)).toBe(100);
    });

    it("debe retornar 0 si no tiene beca", () => {
      expect(calcularPorcentajeBeca(false)).toBe(0);
    });
  });

  describe("calcularMontoFinal", () => {
    it("debe retornar 0 cuando tiene beca", () => {
      expect(calcularMontoFinal(250, true)).toBe(0);
      expect(calcularMontoFinal(300, true)).toBe(0);
    });

    it("debe retornar el monto base cuando no tiene beca", () => {
      expect(calcularMontoFinal(250, false)).toBe(250);
      expect(calcularMontoFinal(300, false)).toBe(300);
    });
  });

  describe("Flujo completo de calculo de pago", () => {
    it("debe calcular correctamente para estudiante con beca sin atraso", () => {
      const promedioMensual = 9.2;
      const diasAtraso = 0;

      const montoConRecargo = calcularMontoConRecargo(diasAtraso);
      const tieneBeca = tieneBecaAcademica(promedioMensual);
      const montoFinal = calcularMontoFinal(montoConRecargo, tieneBeca);

      expect(montoFinal).toBe(0); // No paga porque tiene beca
      expect(tieneBeca).toBe(true);
    });

    it("debe calcular correctamente para estudiante sin beca con atraso", () => {
      const promedioMensual = 8.5;
      const diasAtraso = 7;

      const montoConRecargo = calcularMontoConRecargo(diasAtraso);
      const tieneBeca = tieneBecaAcademica(promedioMensual);
      const montoFinal = calcularMontoFinal(montoConRecargo, tieneBeca);

      expect(montoFinal).toBe(285); // 250 + 7*5
      expect(tieneBeca).toBe(false);
    });
  });
});
