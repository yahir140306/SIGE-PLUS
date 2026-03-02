# Configuración del Scraper del Portal Universitario

Este sistema permite extraer automáticamente los datos de los estudiantes desde el portal oficial de la universidad mediante web scraping autenticado con Playwright.

## 🚀 Características

- ✅ Login automático al portal oficial
- ✅ Extracción de datos del estudiante (nombre, matrícula, carrera, etc.)
- ✅ Extracción de materias y calificaciones
- ✅ Extracción de pagos pendientes
- ✅ Navegador headless (invisible)
- ✅ Timeouts configurables
- ✅ Manejo robusto de errores

## 📋 Configuración Inicial

### 1. Instalar Playwright browsers

Después de instalar las dependencias, instala los navegadores de Playwright:

```bash
npx playwright install chromium
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura:

```env
PORTAL_URL=https://portal.universidad.edu.mx
```

### 3. Personalizar el scraper para tu portal

El archivo `src/lib/scraper.ts` contiene selectores CSS genéricos que **deben ser personalizados** según el HTML de tu portal específico.

## 🔧 Personalización de Selectores

### Paso 1: Inspeccionar el portal

1. Abre el portal oficial en tu navegador
2. Presiona F12 para abrir las herramientas de desarrollador
3. Usa "Inspect Element" para identificar los selectores de:
   - Campos de login (usuario/matrícula y contraseña)
   - Botón de submit
   - Datos del estudiante (nombre, carrera, etc.)
   - Tablas de materias
   - Tablas de pagos

### Paso 2: Actualizar selectores en `scraper.ts`

#### Login

```typescript
// ANTES (genérico)
await this.page.fill(
  'input[name="username"], input[name="matricula"]',
  credentials.matricula,
);

// DESPUÉS (específico para tu portal)
await this.page.fill("#txtUsuario", credentials.matricula);
await this.page.fill("#txtPassword", credentials.password);
await this.page.click("#btnLogin");
```

#### Datos del estudiante

```typescript
// ANTES (genérico)
nombre: await this.extractText(".student-name, .nombre");

// DESPUÉS (específico)
nombre: await this.extractText("#lblNombre");
carrera: await this.extractText(".info-academica .carrera");
cuatrimestre: await this.extractText("#spanCuatrimestre");
```

#### Materias

```typescript
// Ajusta el selector de la tabla de materias
const materias = await this.page.$$eval(
  "#tblMaterias tbody tr", // Selector específico de tu portal
  (rows) => {
    return rows.map((row) => {
      const cells = row.querySelectorAll("td");
      return {
        nombre: cells[0]?.textContent?.trim() || "",
        calificacion: parseFloat(cells[2]?.textContent?.trim() || "0"),
        creditos: parseInt(cells[3]?.textContent?.trim() || "0"),
      };
    });
  },
);
```

## 🎯 Ejemplos por Universidad

### Universidad Tecnológica de la Sierra Hidalguense

```typescript
// Login
await this.page.goto("https://sae.utsh.edu.mx");
await this.page.fill("#usuario", credentials.matricula);
await this.page.fill("#password", credentials.password);
await this.page.click("#btnIngresar");

// Datos del estudiante
nombre: await this.extractText("#datosAlumno .nombre");
carrera: await this.extractText("#datosAlumno .carrera");
```

### Universidad Tecnológica de México (ejemplo)

```typescript
// Login
await this.page.goto("https://alumnos.utm.mx");
await this.page.fill('input[name="matricula"]', credentials.matricula);
await this.page.fill('input[name="contrasena"]', credentials.password);
await this.page.click('button[type="submit"]');
```

## 🧪 Pruebas y Depuración

### Modo de depuración (ver navegador)

Cambia `headless` a `false` en `scraper.ts`:

```typescript
this.browser = await chromium.launch({
  headless: false, // Verás el navegador en acción
  slowMo: 1000, // Ralentiza las acciones para observarlas
});
```

### Capturar pantallas

Agrega screenshots para debugging:

```typescript
await this.page.screenshot({ path: "debug-login.png" });
```

### Logs detallados

El scraper ya incluye logs en consola. Revisa la terminal del servidor.

## 📝 Flujo de Uso

1. Usuario marca el checkbox "Extraer datos del portal oficial"
2. Click en "Iniciar Sesión"
3. El sistema:
   - Lanza navegador headless
   - Navega al portal oficial
   - Ingresa credenciales
   - Extrae datos automáticamente
   - Cierra navegador
   - Devuelve datos al frontend
4. Usuario ve sus datos actualizados

## ⚠️ Consideraciones Importantes

### Seguridad

- ❌ **NO almacenes las contraseñas** del portal oficial en tu base de datos
- ✅ Las credenciales se usan solo durante la sesión
- ✅ El scraping se ejecuta server-side (seguro)
- ✅ Usa HTTPS en producción

### Rendimiento

- 🐢 El scraping es más lento que consultar la base de datos (15-30 segundos)
- 💡 Considera cachear los datos extraídos temporalmente
- 💡 Muestra un indicador de "Cargando..." al usuario

### Mantenimiento

- ⚠️ Si el portal cambia su HTML, debes actualizar los selectores
- 💡 Considera agregar tests automatizados con Playwright
- 💡 Monitorea errores de scraping en producción

### Problemas Comunes

**Error: "timeout of 30000ms exceeded"**

- Solución: Aumenta el timeout o verifica que el portal esté disponible

**Error: "Element not found"**

- Solución: Verifica los selectores CSS en las herramientas de desarrollador

**Login falla silenciosamente**

- Solución: Activa `headless: false` para ver qué está pasando
- Puede haber un CAPTCHA o verificación adicional

**Datos extraídos vacíos**

- Solución: El portal puede usar JavaScript para cargar datos
- Agrega `await this.page.waitForLoadState('networkidle')`

## 🚢 Despliegue en Producción

### Servidor VPS/Cloud

```bash
# Instalar dependencias del sistema para Playwright
sudo npx playwright install-deps chromium
```

### Docker

Si usas Docker, agrega al Dockerfile:

```dockerfile
FROM node:20

# Instalar dependencias de Playwright
RUN npx playwright install --with-deps chromium

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

CMD ["node", "./dist/server/entry.mjs"]
```

### Vercel/Netlify

⚠️ Estos servicios serverless tienen limitaciones para Playwright.
Considera usar:

- AWS Lambda con Playwright Layer
- Google Cloud Functions
- Un servidor VPS dedicado

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [Selectores CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [XPath Cheatsheet](https://devhints.io/xpath)

## 🤝 Soporte

Si necesitas ayuda para configurar el scraper para tu universidad específica, abre un issue con:

1. URL del portal
2. Screenshots del formulario de login
3. Screenshots de la página de datos del estudiante
4. Cualquier error que estés experimentando
