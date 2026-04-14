# Quickstart

## Requisitos

- Node.js 20 o superior
- Variables de Supabase en `.env`
- Acceso al portal SIGE para sincronización

## Arranque

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:4321`.

## Login y sincronización

1. Abre `/sige-login`.
2. Inicia sesión en el portal SIGE oficial.
3. Pega la cookie `PHPSESSID`.
4. Sincroniza datos.

## Pruebas útiles

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

## Base de datos

Si necesitas crear la estructura manualmente, revisa `supabase-schema.sql`.