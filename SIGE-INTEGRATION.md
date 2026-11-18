# Integración SIGE

Este proyecto sincroniza datos directamente desde el portal oficial SIGE de la UTSH.

## Flujo Automatizado (Recomendado)

1. El estudiante abre `/login` o `/sige-login` (compatible con móvil y escritorio).
2. Ingresa su **Matrícula** y **Contraseña** del portal SIGE.
3. El servidor (`POST /api/auth/sige-login`) realiza la autenticación HTTP segura con el portal oficial (`https://sige.utsh.edu.mx/estudiantes/login.php`), captura automáticamente la cookie `PHPSESSID` del encabezado `Set-Cookie` y extrae los datos académicos.
4. El respaldo se sincroniza en Supabase y los datos se cargan en `sessionStorage`.
5. El estudiante ingresa directamente al sistema sin necesidad de DevTools, F12 ni pasos manuales.

## Flujo Secundario / Fallback

Para desarrolladores o soporte técnico, se mantiene un método alternativo en un menú desplegable para introducir manualmente una cookie `PHPSESSID` activa:
- `POST /api/sige/extract-data`
- `POST /api/sige/save-to-db`

## Variables de entorno

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
PORTAL_URL=https://sige.utsh.edu.mx/estudiantes/
```

Para scripts administrativos se usa además:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

## Endpoints principales

- `POST /api/auth/sige-login` (Autenticación y sincronización automática 1-clic)
- `POST /api/sige/extract-data` (Extracción mediante PHPSESSID manual)
- `POST /api/sige/save-to-db` (Guardado de respaldo en Supabase)
- `GET /api/sige/academic-data?matricula=...`
- `GET /api/sige/proxy-image?matricula=...`

## Endpoints oficiales consumidos del SIGE (AJAX)

- `login.php` (Autenticación de sesión inicial)
- `interfacesNME/ajx/datosAlumno.php` (Datos personales y carrera)
- `interfacesNME/ajx/historialAcademico.php` (Historial de materias y promedio)
- `interfacesNME/ajx/calificacionesUnidad.php` (Calificaciones actuales por unidad)
- `interfacesNME/ajx/adeudos.php` (Adeudos y pagos pendientes)
- `interfacesNME/ajx/tblHorarioGrupoNME.php` (Horario de clases)

## Notas de Seguridad

- Las credenciales nunca se almacenan en texto plano en la base de datos local.
- Las peticiones se realizan sobre HTTPS (`https://sige.utsh.edu.mx/estudiantes/`).
- La cookie `PHPSESSID` se mantiene en el servidor y solo se comparte la sesión necesaria.
