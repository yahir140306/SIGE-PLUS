# Integración SIGE

Este proyecto sincroniza datos desde el portal oficial SIGE usando una cookie de sesión `PHPSESSID` capturada por el usuario.

## Flujo

1. El usuario abre `/sige-login` o `/login`.
2. Inicia sesión en el portal SIGE oficial.
3. Copia su cookie `PHPSESSID`.
4. La app llama a `/api/sige/extract-data`.
5. La app guarda el respaldo en Supabase con `/api/sige/save-to-db`.

## Variables de entorno

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
PORTAL_URL=http://sige.utsh.edu.mx/estudiantes/
```

Para scripts administrativos se usa además:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

## Endpoints principales

- `POST /api/sige/extract-data`
- `POST /api/sige/save-to-db`
- `GET /api/sige/academic-data?matricula=...`
- `GET /api/sige/proxy-image?matricula=...`

## Notas

- No se almacena la contraseña del portal SIGE.
- El extractor depende del HTML actual del portal, así que debe revisarse si SIGE cambia su vista.