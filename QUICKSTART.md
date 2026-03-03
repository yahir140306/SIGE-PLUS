# 🚀 GUÍA RÁPIDA DE INICIO

## ⚡ Setup en 5 minutos

### 1. Configurar Supabase (2 min)

```bash
# 1. Ve a https://supabase.com y crea un proyecto
# 2. Copia las credenciales

# 3. Crea archivo .env en la raíz:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Ejecutar Schema SQL (1 min)

```bash
# 1. Abre Supabase Dashboard
# 2. Ve a SQL Editor
# 3. Copia el contenido de supabase-schema.sql
# 4. Ejecuta
# 5. Verifica en Table Editor que se crearon las tablas
```

### 3. Instalar y Correr (2 min)

```bash
npm install
npm run dev
```

## 🎯 Uso Rápido

### Para Estudiantes:

1. Abre: `http://localhost:4321/sige-login`
2. Clic en "Abrir Portal SIGE"
3. Inicia sesión con tu matrícula
4. Regresa y clic en "Sincronizar"
5. ¡Listo!

### Método Manual (más confiable):

1. Abre http://sige.utsh.edu.mx/estudiantes/
2. Inicia sesión
3. Presiona F12
4. En consola escribe: `document.cookie`
5. Copia el valor de PHPSESSID
6. Ve a `/sige-login` → Método alternativo
7. Pega la cookie → "Usar Cookie"

## 🧪 Probar Rápido

```powershell
# PowerShell
.\test-sync.ps1

# Te pedirá la cookie y hará todo automáticamente
```

## 📁 Archivos Importantes

```
src/
  lib/
    sige-client.ts          ← Cliente para SIGE
  pages/
    api/sige/
      extract-data.ts       ← API de extracción
      save-to-db.ts         ← API de guardado
    sige-login.astro        ← Página de login

supabase-schema.sql         ← Schema de BD
cookie-capture-tools.js     ← Herramientas de captura
test-sync.ps1               ← Script de prueba
SIGE-INTEGRATION.md         ← Documentación completa
```

## 🔧 URLs Importantes

| URL                      | Descripción              |
| ------------------------ | ------------------------ |
| `/sige-login`            | Página de sincronización |
| `/api/sige/extract-data` | Extrae datos del SIGE    |
| `/api/sige/save-to-db`   | Guarda en Supabase       |

## ⚠️ Troubleshooting Rápido

**Error: "Sesión inválida"**

- Obtén una nueva cookie del SIGE

**Error: "No se pudieron extraer datos"**

- Verifica que el SIGE no haya cambiado su HTML
- Revisa los selectores en `sige-client.ts`

**Error: "Error en BD"**

- Verifica que el schema esté ejecutado
- Revisa las variables de entorno

## 📞 Soporte

¿Problemas? Revisa [SIGE-INTEGRATION.md](./SIGE-INTEGRATION.md) para documentación completa.

---

**¡Todo listo para sincronizar datos del SIGE! 🎉**
