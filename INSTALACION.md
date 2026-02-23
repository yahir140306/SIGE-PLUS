# Instrucciones de Instalación

## Paso 1: Instalar dependencias

Abre una terminal en el directorio del proyecto y ejecuta:

```bash
npm install
```

Si encuentras problemas, intenta:

```bash
npm cache clean --force
npm install
```

## Paso 2: Ejecutar el servidor de desarrollo

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:4321`

## Paso 3: Construir para producción

```bash
npm run build
```

## Estructura del proyecto creado

### Página Principal

✅ Layout principal con soporte para modo oscuro
✅ Header con navegación y logo de UTSH
✅ Hero section con título principal
✅ Cards de servicios (Nuevo Ingreso y Reinscripción)
✅ Sección de trámites frecuentes
✅ Footer con información de contacto
✅ Configuración de Tailwind CSS con colores personalizados
✅ Tipografía Montserrat y Public Sans
✅ Iconos de Material Icons y Material Symbols Outlined

### Proceso de Reinscripción

✅ Layout específico para reinscripción
✅ Componente Stepper (indicador de progreso)
✅ Paso 1: Validación de datos académicos
✅ Paso 2: Selección de carga académica (materias)
✅ Paso 3: Generación de referencia de pago

## Colores configurados

- Primary: #00a651 (Verde institucional)
- Maroon: #8b1d3d (Vino)
- Secondary: #00a651 (Verde)
- Accent: #c4a006 (Dorado)
- Header Top: #a68b4d (Beige/Dorado)
- Background Light: #f8f9fa
- Background Dark: #1a1a1a

## Características

- Diseño totalmente responsivo
- Modo oscuro funcional
- Componentes modulares y reutilizables
- Optimizado para rendimiento
- Navegación fluida entre pasos de reinscripción
- Validación visual de datos
- Tablas interactivas para selección de materias
- Sistema de referencia de pago con múltiples opciones

## Navegación

### Rutas disponibles:

- `/` - Página principal
- `/reinscripcion/paso-1` - Validación de datos
- `/reinscripcion/paso-2` - Carga académica
- `/reinscripcion/paso-3` - Referencia de pago

Para acceder al proceso de reinscripción desde la página principal, haz clic en el botón "ACCESO ALUMNOS" en la card de Reinscripción.
