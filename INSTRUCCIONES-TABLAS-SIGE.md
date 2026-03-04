# 📋 Instrucciones para las Tablas del SIGE

## ✅ Paso 1: Ejecutar el Script SQL

Ejecuta el archivo `sige-complementary-tables.sql` en tu base de datos:

```bash
# Si usas PostgreSQL local
psql -U tu_usuario -d tu_base_de_datos -f sige-complementary-tables.sql

# O copia y pega el contenido en tu cliente SQL preferido (pgAdmin, DBeaver, etc.)
```

Si usas **Supabase**:

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `sige-complementary-tables.sql`
4. Haz clic en **Run** para ejecutarlo

---

## 📊 Tablas Creadas

### 1. **`sige_datos_respaldo`**

**Propósito:** Almacena el respaldo completo de cada sincronización del SIGE en formato JSON.

**Columnas principales:**

- `matricula` - Referencia al estudiante
- `datos_personales` - JSON con info personal del SIGE
- `historial_academico` - JSON con todas las materias cursadas
- `calificaciones_actuales` - JSON con calificaciones del periodo actual
- `adeudos` - JSON con adeudos pendientes
- `fecha_sincronizacion` - Timestamp de cuándo se sincronizó
- `exitosa` - Si la sincronización fue exitosa

**Ejemplo de consulta:**

```sql
SELECT * FROM sige_datos_respaldo
WHERE matricula = '20240074'
ORDER BY fecha_sincronizacion DESC
LIMIT 1;
```

---

### 2. **`sige_historial_materias`**

**Propósito:** Almacena el historial académico del estudiante en formato estructurado (cada materia es una fila).

**Columnas principales:**

- `matricula` - Referencia al estudiante
- `nombre_materia` - Nombre de la materia
- `calificacion_texto` - Calificación como texto ("9.5", "AC", "NA")
- `calificacion_numerica` - Calificación convertida a número
- `cuatrimestre` - Cuatrimestre que cursó la materia
- `grupo` - Grupo del estudiante
- `periodo` - Periodo escolar

**Ejemplo de consulta:**

```sql
SELECT nombre_materia, calificacion_texto, cuatrimestre
FROM sige_historial_materias
WHERE matricula = '20240074'
ORDER BY cuatrimestre;
```

---

### 3. **`sige_adeudos`**

**Propósito:** Almacena los adeudos pendientes del estudiante según el SIGE.

**Columnas principales:**

- `matricula` - Referencia al estudiante
- `concepto` - Tipo de adeudo ("Colegiatura", "Reinscripción", etc.)
- `descripcion` - Descripción adicional del adeudo
- `monto_texto` - Monto como texto ("$2,500.00")
- `monto_decimal` - Monto convertido a número
- `recargos_texto` y `recargos_decimal` - Recargos por mora
- `estatus` - Estado del adeudo (PENDIENTE, PAGADO, VENCIDO)
- `resuelto` - Si ya fue resuelto/pagado

**Ejemplo de consulta:**

```sql
SELECT concepto, monto_decimal, recargos_decimal, estatus
FROM sige_adeudos
WHERE matricula = '20240074' AND estatus = 'PENDIENTE';
```

---

## 🔍 Vista Útil

Se creó una vista llamada **`sige_resumen_estudiante`** que te da un resumen completo:

```sql
SELECT * FROM sige_resumen_estudiante WHERE matricula = '20240074';
```

**Devuelve:**

- Última sincronización exitosa
- Total de sincronizaciones
- Total de materias en historial
- Adeudos pendientes
- Total de deuda

---

## 🧹 Función de Limpieza

Para evitar que la BD crezca mucho, hay una función para limpiar sincronizaciones antiguas:

```sql
-- Mantiene solo las últimas 5 sincronizaciones por estudiante
SELECT limpiar_sincronizaciones_antiguas(5);

-- Puedes cambiar el número según tus necesidades
SELECT limpiar_sincronizaciones_antiguas(10);
```

**Recomendación:** Ejecuta esto periódicamente (ej: cada mes) o crea un CRON job.

---

## 🔒 Seguridad

Las tablas usan **foreign keys** a la tabla `estudiantes`:

- Si eliminas un estudiante, **todos sus datos del SIGE se eliminan automáticamente** (`ON DELETE CASCADE`)
- Solo se pueden insertar datos de estudiantes que existan en la tabla `estudiantes`

---

## 🚀 Uso del Sistema

Una vez ejecutado el SQL:

1. **Captura de datos del SIGE:**
   - El frontend captura la cookie PHPSESSID
   - Se envía a `/api/sige/extract-data`
   - Los datos se extraen del portal SIGE

2. **Guardado en BD:**
   - Los datos se envían a `/api/sige/save-to-db`
   - Se guarda respaldo completo en `sige_datos_respaldo`
   - Si el estudiante existe, también se guardan en:
     - `sige_historial_materias` (cada materia)
     - `sige_adeudos` (cada adeudo)

3. **Consulta de datos:**
   - Usa las vistas y consultas de arriba
   - O crea tus propias consultas según necesites

---

## ⚠️ Notas Importantes

1. **Compatibilidad:** Estas tablas **NO interfieren** con tus tablas existentes (`calificaciones`, `pagos`, etc.)

2. **Datos del estudiante:** Si el estudiante **no existe** en la tabla `estudiantes`, solo se guarda en `sige_datos_respaldo` (JSON), no en las tablas estructuradas.

3. **Relaciones:** Las tablas del SIGE usan `matricula` como referencia, no IDs numéricos.

4. **Períodos y Materias:** Los datos del SIGE vienen con **nombres de texto** (no IDs), por eso se guardan tal cual.

---

## 🐛 Troubleshooting

**Error: relation "estudiantes" does not exist**

- Asegúrate de que la tabla `estudiantes` existe primero
- Verifica que el campo `matricula` sea VARCHAR(20) y tenga UNIQUE

**Error: foreign key constraint fails**

- Estás intentando guardar datos de una matrícula que no existe en `estudiantes`
- Inserta primero el estudiante en la tabla `estudiantes`

**Los datos no se guardan en las tablas estructuradas**

- Revisa los logs del servidor (consola donde corre `npm run dev`)
- Verifica que el estudiante exista en la tabla `estudiantes`
- Checa que los datos vengan correctamente del SIGE

---

## 📚 Próximos Pasos

Después de ejecutar el SQL y probar que funciona:

1. **Prueba la sincronización:**
   - Inicia sesión en el SIGE
   - Captura la cookie
   - Sincroniza tus datos
   - Verifica que se guardaron en las tablas

2. **Crea tus consultas:**
   - Adapta las consultas de ejemplo a tus necesidades
   - Crea reportes o dashboards

3. **Integra con tu frontend:**
   - Lee los datos de estas tablas
   - Muéstralos en tu interfaz de usuario

---

¿Tienes dudas? Revisa los logs de la consola cuando sincronizas datos del SIGE.
