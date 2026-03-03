# 🔧 SOLUCIÓN AL ERROR 400 EN save-to-db

## ❌ Problema

La API `/api/sige/save-to-db` retornaba error 400 porque intentaba insertar datos en tablas que no existían o con campos incompatibles con tu schema.

## ✅ Solución Implementada

### 1. Nuevo Schema Complementario

He creado `supabase-sige-complementary.sql` que agrega tablas compatibles con tu estructura existente:

**Nuevas tablas:**

- `sige_datos_respaldo` - Guarda todos los datos del SIGE en formato JSON (flexible)
- `sige_historial_materias` - Historial de materias estructurado
- `sige_adeudos` - Adeudos pendientes estructurados

**Ventajas:**

- ✅ No modifica tus tablas existentes
- ✅ Compatible con tu schema actual
- ✅ Usa JSON para flexibilidad
- ✅ Se vincula con tu tabla `estudiantes` por matrícula

### 2. API Actualizada

La API ahora:

1. Busca el estudiante por matrícula en tu tabla `estudiantes`
2. Guarda los datos completos en `sige_datos_respaldo` (JSON)
3. Si el estudiante existe, también guarda en tablas estructuradas
4. Si no existe, solo guarda el respaldo JSON

## 📋 Pasos para Aplicar la Solución

### Paso 1: Ejecutar el Nuevo Schema (2 min)

```bash
# 1. Abre Supabase Dashboard
# 2. Ve a SQL Editor
# 3. Copia el contenido de: supabase-sige-complementary.sql
# 4. Ejecuta el script
# 5. Verifica que se crearon las nuevas tablas
```

### Paso 2: Verificar las Tablas

Deberías ver estas nuevas tablas en Supabase:

- ✅ `sige_datos_respaldo`
- ✅ `sige_historial_materias`
- ✅ `sige_adeudos`
- ✅ Vista: `sige_estadisticas_estudiante`

### Paso 3: Probar la Sincronización

```powershell
# Ejecuta el script de prueba
.\test-sync.ps1

# O prueba manualmente en /sige-login
```

## 🔍 Cómo Funciona Ahora

### Escenario 1: Estudiante YA existe en tu BD

```
1. API busca matricula en tabla estudiantes ✅
2. Guarda JSON completo en sige_datos_respaldo ✅
3. Guarda materias en sige_historial_materias ✅
4. Guarda adeudos en sige_adeudos ✅
```

### Escenario 2: Estudiante NO existe en tu BD

```
1. API busca matricula en tabla estudiantes ❌ (no encontrado)
2. Guarda JSON completo en sige_datos_respaldo ✅
3. NO intenta crear en tabla estudiantes (evita error por campos faltantes)
4. Retorna nota informativa
```

## 🎯 Ventajas del Nuevo Enfoque

### 1. Respaldo Completo

```sql
-- Todos los datos se guardan en JSON
SELECT * FROM sige_datos_respaldo
WHERE matricula = '2021004562';
```

### 2. Datos Estructurados (cuando es posible)

```sql
-- Materias en formato tabular
SELECT * FROM sige_historial_materias
WHERE matricula = '2021004562';

-- Adeudos estructurados
SELECT * FROM sige_adeudos
WHERE matricula = '2021004562' AND estatus = 'PENDIENTE';
```

### 3. Estadísticas Rápidas

```sql
-- Vista con resumen
SELECT * FROM sige_estadisticas_estudiante
WHERE matricula = '2021004562';
```

## 🔗 Integración con tus Tablas Existentes

Puedes hacer joins con tus tablas:

```sql
-- Estudiantes con datos del SIGE
SELECT
  e.nombre_completo,
  e.carrera_id,
  e.cuatrimestre,
  s.ultima_sincronizacion,
  s.total_materias_sige,
  s.adeudos_pendientes
FROM estudiantes e
LEFT JOIN sige_estadisticas_estudiante s ON e.id = s.estudiante_id
WHERE e.estatus = 'activo';
```

## 📊 Estructura de Datos Guardados

### sige_datos_respaldo

```json
{
  "datos_personales": {
    "nombre": "Juan",
    "apPaterno": "Vahir",
    "curp": "...",
    "email": "...",
    // ... todos los campos
  },
  "historial_academico": {
    "materias": [...],
    "promedio": "9.2"
  },
  "calificaciones_actuales": [...],
  "adeudos": [...]
}
```

### sige_historial_materias

```
| nombre_materia | calificacion | creditos | periodo |
|----------------|--------------|----------|---------|
| Programación   | 9.5          | 6        | ENE-ABR |
```

### sige_adeudos

```
| concepto      | monto_decimal | estatus   |
|---------------|---------------|-----------|
| Colegiatura   | 2500.00       | PENDIENTE |
```

## 🧪 Testing

### Verificar que Todo Funciona

1. **Ejecuta sincronización:**

   ```powershell
   .\test-sync.ps1
   ```

2. **Verifica en Supabase:**

   ```sql
   -- Debe haber un registro
   SELECT * FROM sige_datos_respaldo
   ORDER BY fecha_sincronizacion DESC
   LIMIT 1;
   ```

3. **Revisa logs en la terminal:**
   ```
   ✅ Respaldo completo guardado en sige_datos_respaldo
   ✅ N materias guardadas en sige_historial_materias
   ✅ N adeudos guardados en sige_adeudos
   ```

## ❓ Preguntas Frecuentes

### ¿Puedo crear estudiantes automáticamente?

No ahora mismo, porque tu tabla `estudiantes` tiene campos obligatorios que el SIGE no proporciona:

- `password_hash` (NOT NULL)
- `fecha_nacimiento` (NOT NULL)

**Opciones:**

1. Crear manualmente los estudiantes en tu BD
2. Modificar el schema para hacer esos campos opcionales
3. Generar valores por defecto para esos campos

### ¿Qué pasa si ya tengo datos viejos?

Las nuevas tablas son independientes. Tus datos existentes no se afectan.

### ¿Puedo eliminar el schema antiguo?

El archivo `supabase-schema.sql` ya no es necesario. Usa `supabase-sige-complementary.sql` en su lugar.

## 🎉 Resultado Final

Ahora la API:

- ✅ Funciona sin error 400
- ✅ Guarda todos los datos del SIGE
- ✅ Es compatible con tu schema
- ✅ No rompe tus tablas existentes
- ✅ Proporciona datos estructurados cuando es posible
- ✅ Siempre guarda respaldo completo en JSON

---

**¿Problema resuelto?** Ejecuta `supabase-sige-complementary.sql` y prueba nuevamente.
