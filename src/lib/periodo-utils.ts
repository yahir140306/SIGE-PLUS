/**
 * Utilidades para manejo de periodos académicos de la UTSH
 */

export interface PeriodoAcademico {
  nombre: string; // Ej: "Enero-Abril 2026"
  nombreCorto: string; // Ej: "Ene-Abr 2026"
  cuatrimestre: 1 | 2 | 3; // 1: Enero-Abril, 2: Mayo-Agosto, 3: Sep-Dic
  year: number;
  fechaInicio: Date;
  fechaFin: Date;
}

/**
 * Determina el periodo académico actual basándose en la fecha
 */
export function getPeriodoActual(fecha: Date = new Date()): PeriodoAcademico {
  const mes = fecha.getMonth() + 1; // getMonth() retorna 0-11
  const year = fecha.getFullYear();

  if (mes >= 1 && mes <= 4) {
    // Enero - Abril
    return {
      nombre: `Enero-Abril ${year}`,
      nombreCorto: `Ene-Abr ${year}`,
      cuatrimestre: 1,
      year: year,
      fechaInicio: new Date(year, 0, 1), // 1 de enero
      fechaFin: new Date(year, 3, 30), // 30 de abril
    };
  } else if (mes >= 5 && mes <= 8) {
    // Mayo - Agosto
    return {
      nombre: `Mayo-Agosto ${year}`,
      nombreCorto: `May-Ago ${year}`,
      cuatrimestre: 2,
      year: year,
      fechaInicio: new Date(year, 4, 1), // 1 de mayo
      fechaFin: new Date(year, 7, 31), // 31 de agosto
    };
  } else {
    // Septiembre - Diciembre
    return {
      nombre: `Septiembre-Diciembre ${year}`,
      nombreCorto: `Sep-Dic ${year}`,
      cuatrimestre: 3,
      year: year,
      fechaInicio: new Date(year, 8, 1), // 1 de septiembre
      fechaFin: new Date(year, 11, 31), // 31 de diciembre
    };
  }
}

/**
 * Obtiene el periodo siguiente al actual
 */
export function getPeriodoSiguiente(
  periodoActual?: PeriodoAcademico
): PeriodoAcademico {
  const periodo = periodoActual || getPeriodoActual();

  if (periodo.cuatrimestre === 1) {
    // Enero-Abril -> Mayo-Agosto (mismo año)
    return {
      nombre: `Mayo-Agosto ${periodo.year}`,
      nombreCorto: `May-Ago ${periodo.year}`,
      cuatrimestre: 2,
      year: periodo.year,
      fechaInicio: new Date(periodo.year, 4, 1),
      fechaFin: new Date(periodo.year, 7, 31),
    };
  } else if (periodo.cuatrimestre === 2) {
    // Mayo-Agosto -> Septiembre-Diciembre (mismo año)
    return {
      nombre: `Septiembre-Diciembre ${periodo.year}`,
      nombreCorto: `Sep-Dic ${periodo.year}`,
      cuatrimestre: 3,
      year: periodo.year,
      fechaInicio: new Date(periodo.year, 8, 1),
      fechaFin: new Date(periodo.year, 11, 31),
    };
  } else {
    // Septiembre-Diciembre -> Enero-Abril (siguiente año)
    const nextYear = periodo.year + 1;
    return {
      nombre: `Enero-Abril ${nextYear}`,
      nombreCorto: `Ene-Abr ${nextYear}`,
      cuatrimestre: 1,
      year: nextYear,
      fechaInicio: new Date(nextYear, 0, 1),
      fechaFin: new Date(nextYear, 3, 30),
    };
  }
}

/**
 * Obtiene el periodo anterior al actual
 */
export function getPeriodoAnterior(
  periodoActual?: PeriodoAcademico
): PeriodoAcademico {
  const periodo = periodoActual || getPeriodoActual();

  if (periodo.cuatrimestre === 1) {
    // Enero-Abril -> Septiembre-Diciembre (año anterior)
    const prevYear = periodo.year - 1;
    return {
      nombre: `Septiembre-Diciembre ${prevYear}`,
      nombreCorto: `Sep-Dic ${prevYear}`,
      cuatrimestre: 3,
      year: prevYear,
      fechaInicio: new Date(prevYear, 8, 1),
      fechaFin: new Date(prevYear, 11, 31),
    };
  } else if (periodo.cuatrimestre === 2) {
    // Mayo-Agosto -> Enero-Abril (mismo año)
    return {
      nombre: `Enero-Abril ${periodo.year}`,
      nombreCorto: `Ene-Abr ${periodo.year}`,
      cuatrimestre: 1,
      year: periodo.year,
      fechaInicio: new Date(periodo.year, 0, 1),
      fechaFin: new Date(periodo.year, 3, 30),
    };
  } else {
    // Septiembre-Diciembre -> Mayo-Agosto (mismo año)
    return {
      nombre: `Mayo-Agosto ${periodo.year}`,
      nombreCorto: `May-Ago ${periodo.year}`,
      cuatrimestre: 2,
      year: periodo.year,
      fechaInicio: new Date(periodo.year, 4, 1),
      fechaFin: new Date(periodo.year, 7, 31),
    };
  }
}

/**
 * Verifica si estamos en periodo de reinscripción
 * Generalmente el último mes de cada cuatrimestre
 */
export function esPeriodoReinscripcion(fecha: Date = new Date()): boolean {
  const mes = fecha.getMonth() + 1;
  // Abril, Agosto, Diciembre son meses de reinscripción
  return mes === 4 || mes === 8 || mes === 12;
}

/**
 * Calcula el cuatrimestre siguiente para un estudiante
 * basándose en su cuatrimestre actual
 */
export function calcularCuatrimestreSiguiente(
  cuatrimestreActual: number
): number {
  return cuatrimestreActual + 1;
}

/**
 * Formatea un periodo para mostrar en la UI
 */
export function formatPeriodo(periodo: PeriodoAcademico): string {
  return periodo.nombre;
}
