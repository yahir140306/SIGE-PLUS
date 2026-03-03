# 🎓 Sistema de Extracción de Datos del Portal SIGE

## 📋 Descripción

Este sistema permite a los estudiantes de la UTSH sincronizar automáticamente sus datos académicos del portal oficial SIGE a nuestra plataforma. Los datos se extraen de forma segura y se almacenan en una base de datos propia como respaldo.

## 🚀 Cómo Funciona

### Flujo del Sistema

```
1. Estudiante → Abre portal oficial SIGE
2. Estudiante → Inicia sesión normalmente
3. Sistema    → Captura cookie PHPSESSID
4. Sistema    → Hace peticiones a endpoints del SIGE
5. Sistema    → Extrae todos los datos (personal, materias, calificaciones, adeudos)
6. Sistema    → Guarda datos en Supabase (respaldo)
7. Estudiante → Ve sus datos en nuestra plataforma
```

### Ventajas de este Enfoque

✅ **Transparencia**: El estudiante ve que inicia sesión en el portal oficial
✅ **Seguridad**: No almacenamos contraseñas, solo usamos la cookie de sesión temporal
✅ **Rapidez**: Los datos se extraen en segundos usando peticiones directas
✅ **Respaldo**: Los datos se guardan en nuestra BD para acceso rápido
✅ **Actualizado**: Cada vez que el estudiante sincroniza, obtiene los datos más recientes

## 📁 Archivos Creados

### 1. `src/lib/sige-client.ts`

Cliente TypeScript para interactuar con el portal SIGE usando cookies de sesión.

**Funcionalidades:**

- `getDatosAlumno()` - Obtiene datos personales
- `getHistorialAcademico()` - Obtiene historial de materias
- `getCalificacionesActuales()` - Obtiene calificaciones actuales
- `getAdeudos()` - Obtiene adeudos pendientes
- `getAllData()` - Obtiene todo de una vez
- `verificarSesion()` - Verifica si la cookie sigue válida

### 2. `src/pages/api/sige/extract-data.ts`

API endpoint que recibe la cookie PHPSESSID y extrae todos los datos del SIGE.

**Request:**

```json
{
  "phpsessid": "k4u7stltn6f3ch8cv30601ll62",
  "matricula": "2021004562" // Opcional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "datosPersonales": { ... },
    "historialAcademico": { ... },
    "calificacionesActuales": [ ... ],
    "adeudos": [ ... ]
  },
  "matricula": "2021004562"
}
```

### 3. `src/pages/api/sige/save-to-db.ts`

API endpoint que guarda los datos extraídos en Supabase.

**Request:**

```json
{
  "data": {
    /* Datos del SIGE */
  },
  "matricula": "2021004562"
}
```

### 4. `src/pages/sige-login.astro`

Página de login que guía al estudiante para:

1. Abrir el portal oficial del SIGE
2. Iniciar sesión
3. Capturar la cookie PHPSESSID
4. Sincronizar datos automáticamente

### 5. `supabase-schema.sql`

Schema completo de la base de datos con todas las tablas necesarias.

**Tablas:**

- `estudiantes` - Datos personales y académicos
- `materias_historial` - Historial completo de materias
- `calificaciones_actuales` - Calificaciones del cuatrimestre actual
- `adeudos` - Pagos y adeudos pendientes
- `sincronizaciones` - Log de sincronizaciones

## 🛠️ Instalación

### 1. Configurar Base de Datos (Supabase)

```bash
# 1. Ve a https://supabase.com y crea un proyecto
# 2. Copia las credenciales

# 3. Configura variables de entorno
# Crea .env en la raíz del proyecto:
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 2. Ejecutar Schema de Base de Datos

```bash
# 1. Abre Supabase Dashboard → SQL Editor
# 2. Copia el contenido de supabase-schema.sql
# 3. Ejecuta el script
# 4. Verifica que las tablas se crearon en Table Editor
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Iniciar Servidor

```bash
npm run dev
```

## 📖 Uso para Estudiantes

### Método 1: Automático (Recomendado)

1. Ve a `/sige-login` en tu navegador
2. Haz clic en "Abrir Portal SIGE"
3. Inicia sesión con tu matrícula y contraseña en la ventana que se abre
4. Regresa a la página de sincronización
5. Haz clic en "Sincronizar Datos"
6. ¡Listo! Tus datos se importarán automáticamente

### Método 2: Manual (Para usuarios avanzados)

1. Abre http://sige.utsh.edu.mx/estudiantes/ en una pestaña nueva
2. Inicia sesión normalmente
3. Presiona `F12` para abrir DevTools
4. En la consola, escribe: `document.cookie`
5. Copia el valor de `PHPSESSID` (ejemplo: `PHPSESSID=abc123xyz`)
6. Ve a `/sige-login` en tu navegador
7. Expande "Método alternativo"
8. Pega la cookie y haz clic en "Usar Cookie"

## 🔐 Seguridad

### Lo que SÍ hacemos:

✅ Capturamos la cookie de sesión temporal (PHPSESSID)
✅ Usamos la cookie para hacer peticiones al SIGE
✅ Guardamos los datos académicos en nuestra BD
✅ Encriptamos los datos en Supabase

### Lo que NO hacemos:

❌ NO almacenamos tu contraseña
❌ NO hacemos login por ti
❌ NO compartimos tus datos
❌ NO modificamos nada en el portal SIGE

### Limitaciones de Seguridad del Navegador

Por políticas CORS y SameSite cookies, **NO podemos** leer automáticamente cookies de otro dominio. Por eso necesitamos que el estudiante:

- Inicie sesión en el portal oficial
- Copie manualmente su cookie de sesión

Esto es **por diseño** para proteger la seguridad del estudiante.

## 🧪 Pruebas

### Probar Extracción de Datos (con cookie)

```bash
# PowerShell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    phpsessid = "TU_PHPSESSID_AQUI"
    matricula = "2021004562"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4321/api/sige/extract-data" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### Probar Guardado en BD

```bash
# Primero extrae los datos (comando anterior)
# Luego guárdalos:

$bodyGuardar = @{
    data = $datosExtraidos
    matricula = "2021004562"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:4321/api/sige/save-to-db" `
    -Method POST `
    -Headers $headers `
    -Body $bodyGuardar
```

## 🔧 Troubleshooting

### Error: "La sesión del SIGE no es válida"

**Causa**: La cookie PHPSESSID ha expirado o es inválida.

**Solución**:

1. Ve al portal SIGE
2. Cierra sesión
3. Inicia sesión nuevamente
4. Obtén una nueva cookie PHPSESSID
5. Intenta sincronizar de nuevo

### Error: "No se pudieron extraer los datos"

**Causa**: El HTML del portal SIGE cambió.

**Solución**:

1. Abre `src/lib/sige-client.ts`
2. Actualiza los selectores en `extractFieldValue()` y `extractTableRows()`
3. Inspecciona el HTML del SIGE con F12 para encontrar los nuevos IDs/selectores

### Error: "Error al guardar datos en la base de datos"

**Causa**: Problema con Supabase o schema.

**Solución**:

1. Verifica que las variables de entorno estén correctas
2. Verifica que el schema esté ejecutado en Supabase
3. Revisa los logs en Supabase Dashboard → Logs

## 📊 Endpoints Disponibles

| Endpoint                 | Método | Descripción                         |
| ------------------------ | ------ | ----------------------------------- |
| `/api/sige/extract-data` | POST   | Extrae datos del SIGE usando cookie |
| `/api/sige/save-to-db`   | POST   | Guarda datos en Supabase            |
| `/sige-login`            | GET    | Página de login/sincronización      |

## 🎯 Endpoints del SIGE Utilizados

Estos son los endpoints internos del portal SIGE que usamos:

```
http://sige.utsh.edu.mx/estudiantes/interfacesNME/ajx/datosAlumno.php
http://sige.utsh.edu.mx/estudiantes/interfacesNME/ajx/historialAcademico.php
http://sige.utsh.edu.mx/estudiantes/interfacesNME/ajx/calificacionesUnidad.php
http://sige.utsh.edu.mx/estudiantes/interfacesNME/ajx/adeudos.php
```

Todos retornan HTML que parseamos en el servidor.

## 📝 Notas Importantes

1. **Cookies expiran**: Las sesiones del SIGE expiran después de ~30 minutos de inactividad
2. **CORS**: Por seguridad, las peticiones se hacen desde el servidor (no desde el navegador)
3. **Parsing HTML**: Si el SIGE actualiza su HTML, puede que necesitemos ajustar los selectores
4. **Rate Limiting**: Evita hacer demasiadas sincronizaciones seguidas

## 🚧 Trabajo Futuro

- [ ] Agregar sincronización automática programada
- [ ] Notificaciones cuando hay nuevas calificaciones
- [ ] Dashboard con gráficas de rendimiento académico
- [ ] Exportar datos a PDF
- [ ] Sincronización en segundo plano
- [ ] Extensión de navegador para captura automática de cookie

## 🤝 Aprobación Universidad

Este sistema fue presentado y aprobado por los profesores de la UTSH como parte del proyecto SIGE-PLUS.

## 📞 Soporte

Para dudas o problemas:

- Abre un issue en el repositorio
- Contacta al equipo de desarrollo

---

**Creado con ❤️ para mejorar la experiencia de los estudiantes de la UTSH**
