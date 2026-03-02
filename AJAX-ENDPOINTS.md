# 🎯 Endpoints AJAX del Portal

## ✅ Endpoints Descubiertos

Estos son los endpoints internos que el portal usa para cargar datos dinámicamente:

### 1. **Datos del Alumno**

```
POST interfacesNME/ajx/datosAlumno.php
```

**Contiene:**

- Nombre, ApPaterno, ApMaterno
- CURP, Matrícula
- Email, Celular, TelefonoCasa
- Datos de nacimiento y procedencia
- Información laboral
- PromedioGeneral

### 2. **Adeudos/Pagos**

```
POST interfacesNME/ajx/adeudos.php
```

**Contiene:**

- Lista de pagos pendientes
- Conceptos (mensualidad, inscripción, etc.)
- Montos
- Fechas límite
- Estados (pendiente/pagado)

### 3. **Calificaciones**

```
POST interfacesNME/ajx/calificacionesUnidad.php
```

**Contiene:**

- Materias del estudiante
- Calificaciones por unidad
- Créditos

### 4. **Historial Académico**

```
POST interfacesNME/ajx/historialAcademico.php
```

**Contiene:**

- Historial completo de calificaciones
- Materias de cuatrimestres anteriores

### 5. **Horario**

```
POST interfacesNME/ajx/tblHorarioGrupoNME.php
```

**Contiene:**

- Horario de clases del grupo
- Días y horas
- Materias y profesores

### 6. **Paraescolares**

```
POST interfacesNME/ajx/paraescolares.php
```

**Parámetros:** `{ IdGrupoParaescolar }`

**Contiene:**

- Actividades paraescolares disponibles
- Grupos de actividades

---

## 🚀 Ventajas de Usar Estos Endpoints

### ✅ **Comparado con Scraping HTML:**

| Aspecto           | Endpoints AJAX      | Scraping HTML        |
| ----------------- | ------------------- | -------------------- |
| **Velocidad**     | ⚡ Rápido (1-2 seg) | 🐌 Lento (15-30 seg) |
| **Confiabilidad** | ✅ Alta             | ⚠️ Media             |
| **Mantenimiento** | ✅ Bajo             | ❌ Alto              |
| **Dependencia**   | APIs internas       | Estructura HTML      |
| **Datos**         | Estructurados       | No estructurados     |

### 📊 **Por qué es mejor:**

1. **No navegas entre páginas** - Llamadas directas después del login
2. **Sin selectores CSS frágiles** - Usas endpoints estables
3. **Más rápido** - Solo 3-4 peticiones HTTP
4. **Menos errores** - APIs internas fueron diseñadas para esto
5. **Datos completos** - Acceso a toda la información disponible

---

## 🔧 Cómo Personalizar para tu Portal

### **Paso 1: Inspeccionar el HTML de Respuesta**

Después del login, abre DevTools del navegador y ve a la pestaña **Network**:

1. Navega en el portal (ej: click en "Datos del Estudiante")
2. Busca peticiones POST a archivos `.php`
3. Haz click en la petición y ve a **Preview** o **Response**
4. Observa la estructura HTML que devuelve

### **Paso 2: Identificar los Selectores**

Ejemplo del HTML devuelto por `datosAlumno.php`:

```html
<div class="form-group">
  <label>Nombre:</label>
  <input type="text" id="txtNombre" name="Nombre" value="Juan" />
</div>
<div class="form-group">
  <label>Apellido Paterno:</label>
  <input type="text" id="txtApPaterno" name="ApPaterno" value="Pérez" />
</div>
```

### **Paso 3: Actualizar los Selectores en el Código**

En `scraper.ts`, método `parseStudentDataFromHTML()`:

```typescript
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
    'input[name="Nombre"]', // ✅ Basado en atributo name
    'input[id="txtNombre"]', // ✅ Basado en id
    "#txtNombre", // ✅ Selector directo
  ]),
  // ... más campos
};
```

### **Paso 4: Ajustar URLs de Endpoints**

Si tu portal tiene rutas diferentes:

```typescript
// En scraper.ts, método extractStudentData()
const datosAlumnoHTML = await this.fetchAjaxEndpoint(
  "tu-ruta/ajax/estudiante.php", // 👈 Cambia aquí
);
```

---

## 🧪 Cómo Probar

### **1. Ejecutar el scraper en modo desarrollo:**

```bash
npm run dev
```

### **2. Hacer login con el toggle "Usar Portal Oficial"**

Ve a `/login` y activa el switch de scraping.

### **3. Ver los logs en la terminal:**

Verás algo como:

```
🤖 Iniciando scraping del portal oficial...
🌐 Navegando al portal...
✅ Login exitoso
📊 Extrayendo datos del estudiante usando endpoints AJAX...

🎯 Usando endpoints internos del portal:
🔗 Llamando a: interfacesNME/ajx/datosAlumno.php
🔗 Llamando a: interfacesNME/ajx/adeudos.php
🔗 Llamando a: interfacesNME/ajx/calificacionesUnidad.php

============================================================
📋 INFORMACIÓN DEL ESTUDIANTE
============================================================
👤 Nombre Completo: Juan Pérez García
🎓 Matrícula: 12345678
🆔 CURP: PEGJ950101HDFRRL01
📚 Carrera: Ingeniería en Sistemas
📊 Cuatrimestre: 0
⭐ Promedio: 9.2
📧 Email: juan.perez@ejemplo.com
📱 Celular: 5512345678

📖 Materias (5):
   1. Programación Web
      - Calificación: 9.5
      - Créditos: 8
   2. Bases de Datos
      - Calificación: 9.0
      - Créditos: 8
...
```

---

## 🐛 Solución de Problemas

### **Problema: No se extraen datos**

**Solución:**

1. Verifica en DevTools qué HTML devuelve el endpoint
2. Ajusta los selectores en `parseStudentDataFromHTML()`
3. Agrega logs temporales:
   ```typescript
   console.log("HTML recibido:", htmlContent.substring(0, 500));
   ```

### **Problema: Endpoint no encontrado (404)**

**Solución:**

1. Verifica la URL base en `.env`: `PORTAL_URL=https://tu-portal.com`
2. Comprueba la ruta completa del endpoint en DevTools
3. Ajusta la ruta en `fetchAjaxEndpoint()`

### **Problema: Login falla**

**Solución:**

1. Inspecciona el formulario de login en el portal real
2. Encuentra los `name` de los inputs de usuario y contraseña
3. Actualiza los selectores en el método `login()` de `scraper.ts`

---

## 📝 Campos Adicionales Disponibles

Según el código JavaScript que encontraste, estos campos están disponibles:

```typescript
interface DatosCompletos {
  // Datos personales
  Nombre: string;
  ApPaterno: string;
  ApMaterno: string;
  CURP: string;
  Sexo: string;
  EstadoCivil: string;

  // Contacto
  Email: string;
  Celular: string;
  TelefonoCasa: string;
  Tutor: string;
  Recados: string;
  TelefonoRecados: string;

  // Ubicación
  IdPaisNacimiento: string;
  IdEstadoNacimiento: string;
  IdMunicipioNacimiento: string;
  IdPaisProcedencia: string;
  IdEstadoProcedencia: string;
  IdMunicipioProcedencia: string;
  IdLocalidadProcedencia: string;
  IdAsentamientoProcedencia: string;
  CalleProcedencia: string;
  NoExterior: string;
  NoInterior: string;
  CodigoPostal: string;

  // Educación
  IdPaisEscuelaProcedencia: string;
  IdEstadoEscuelaProcedencia: string;
  IdMunicipioEscuelaProcedencia: string;
  IdEscuelaProcedencia: string;
  IdAreaCursada: string;
  IdTipoEscuelaProcedencia: string;
  PromedioGeneral: string;

  // Trabajo
  EmpresaTrabajo: string;
  PuestoTrabajo: string;
  AreaTrabajo: string;
  IngresoTrabajo: string;
  TelefonoTrabajo: string;
  HoraInicioTrabajo: string;
  HoraFinTrabajo: string;
}
```

Puedes agregar cualquiera de estos campos al scraper según tus necesidades.

---

## 🎯 Próximos Pasos

1. ✅ **Ya hecho:** El scraper usa los endpoints AJAX
2. 📝 **Pendiente:** Personalizar selectores según tu portal
3. 🧪 **Pendiente:** Probar con credenciales reales
4. 🎨 **Opcional:** Agregar más campos si los necesitas

---

## 💡 Tip Final

Los endpoints AJAX son como **"APIs ocultas"** del portal. Son mucho más confiables que hacer scraping del HTML porque:

- El portal los usa internamente
- Están optimizados para velocidad
- Devuelven datos estructurados
- Son más estables que el diseño visual

¡Has encontrado la forma más eficiente de extraer datos del portal! 🎉
