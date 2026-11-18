/**
 * Tipos estándar para autenticación y perfiles de estudiante en SIGE-PLUS
 */

export interface CarreraInfo {
  id?: string;
  nombre: string;
}

export interface PeriodoInfo {
  id?: string;
  nombre: string;
}

export interface MateriaItem {
  nombre?: string;
  asignatura?: string;
  calificacion?: string | number;
  cuatrimestre?: string | number;
  grupo?: string;
  docente?: string;
  unidad?: string;
  evaluacion?: string;
  asistencia?: string;
}

export interface AdeudoItem {
  concepto: string;
  descripcion?: string;
  importe: string | number;
  recargos?: string | number;
  fecha_limite?: string;
  estado?: string;
}

export interface StudentProfile {
  id?: string;
  matricula: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  carrera: CarreraInfo;
  periodo: PeriodoInfo;
  cuatrimestre: number;
  promedio: number;
  foto_url: string;
  grupo: string;
  estatus: string;
  tienePagosPendientes: boolean;
  materias: MateriaItem[];
  adeudos: AdeudoItem[];
  historialAcademico: MateriaItem[];
  email?: string;
  celular?: string;
}

export interface AuthResult {
  success: boolean;
  matricula?: string;
  phpsessid?: string;
  user?: StudentProfile;
  data?: any;
  token?: string;
  error?: string;
}
