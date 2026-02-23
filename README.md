# Portal de Servicios Escolares - UTSH

Proyecto Astro basado en el diseño del Portal de Servicios Escolares de la Universidad Tecnológica de la Sierra Hidalguense.

## 🚀 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto en una terminal:

| Comando             | Acción                                               |
| :------------------ | :--------------------------------------------------- |
| `npm install`       | Instala las dependencias                             |
| `npm run dev`       | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build`     | Construye el sitio para producción en `./dist/`      |
| `npm run preview`   | Previsualiza la construcción localmente              |
| `npm run astro ...` | Ejecuta comandos CLI de Astro                        |

## 📁 Estructura del Proyecto

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── ServiceCards.astro
│   │   ├── Tramites.astro
│   │   ├── Footer.astro
│   │   └── Stepper.astro
│   ├── layouts/
│   │   ├── Layout.astro
│   │   └── ReinscripcionLayout.astro
│   └── pages/
│       ├── index.astro
│       └── reinscripcion/
│           ├── paso-1.astro (Validación de Datos)
│           ├── paso-2.astro (Carga Académica)
│           └── paso-3.astro (Referencia de Pago)
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── tsconfig.json
```

## 🎨 Tecnologías

- **Astro**: Framework web moderno
- **Tailwind CSS**: Framework de utilidades CSS
- **TypeScript**: Tipado estático
- **Material Symbols Outlined**: Iconografía moderna
- **Google Material Icons**: Iconografía complementaria

## 🎨 Colores del Proyecto

- **Primary**: `#00a651` (Verde institucional)
- **Maroon**: `#8b1d3d` (Vino)
- **Secondary**: `#00a651` (Verde)
- **Accent**: `#c4a006` (Dorado)
- **Header Top**: `#a68b4d` (Beige/Dorado)
- **Background Light**: `#f8f9fa`
- **Background Dark**: `#1a1a1a`

## 📝 Características

- ✨ Diseño responsivo
- 🌙 Soporte para modo oscuro
- 🎯 Componentes modulares y reutilizables
- ⚡ Optimizado para rendimiento
- 🎨 Diseño institucional basado en la identidad de la UTSH
- 📋 Proceso completo de reinscripción en 3 pasos
- 🔄 Stepper de progreso visual
- 💳 Sistema de referencia de pago

## 🎓 Módulos Implementados

### Portal Principal

- Página de inicio con servicios destacados
- Cards de Nuevo Ingreso y Reinscripción
- Sección de trámites frecuentes
- Footer institucional completo

### Proceso de Reinscripción (3 Pasos)

#### Paso 1: Validación de Datos

- Verificación de información académica
- Datos de matrícula, nombre y carrera
- Confirmación de integridad de datos
- Opción para reportar errores

#### Paso 2: Carga Académica

- Tabla de selección de materias
- Información de créditos y horarios
- Resumen de carga académica
- Validación de créditos mínimos/máximos

#### Paso 3: Referencia de Pago

- Generación de referencia de pago
- Instrucciones para pago en ventanilla
- Información para transferencia SPEI
- Descarga de referencia en PDF

# SIGE-PLUS
