# Proposal

## Why

El Simulador atómico todavía no tiene código: solo existen el PRD, el Tech Design v2, los ADR y el diseño aprobado (`design/stitch/ultima_v4/code.html`). La página web es el primer componente del backlog (ítem #1) y la base sobre la que se construyen los demás: la base de datos (#4), el visor 3D (#7), los selectores (#8) y el contenido teórico (#10). Crear primero un cascarón con la estructura aprobada permite validar el diseño en el navegador y dar a esos ítems un lugar donde integrarse.

## What Changes

- Se crea el proyecto de la página: Next.js con TypeScript, en una carpeta propia dentro del repositorio.
- Se construye el cascarón de la página según el `code.html` de `ultima_v4`: cabecera alta con el título "Simulador atómico", panel izquierdo con las tres secciones teóricas (Estructura atómica, Mecánica Clásica y Mecánica Cuántica) y barra de desplazamiento, zona del visor sobre fondo oscuro y tarjeta con n, l y m.
- El contenido es estático y provisional: el texto de las secciones, un contenedor vacío para el visor y los valores n = 1, l = 0, m = 0 sin interacción.
- El diseño se adapta a distintos tamaños de pantalla de escritorio, tomando 1920×1080 como referencia.
- Tailwind, las fuentes (Space Grotesk, Newsreader y JetBrains Mono) y los iconos se sirven desde el propio proyecto, sin cargar recursos de terceros en tiempo de ejecución.
- Se omiten del cascarón los elementos del diseño con datos inventados o afirmaciones físicas incorrectas (ver `design.md`).

## Capabilities

### New Capabilities

- `app-shell`: estructura y diseño de la página (cabecera, panel teórico, zona del visor y tarjeta de números cuánticos), su adaptación a pantallas de escritorio y el uso exclusivo de recursos propios.

### Modified Capabilities

(ninguna: aún no existe ninguna capacidad en `openspec/specs/`)

## Impact

- **Código nuevo:** carpeta `web/` con el proyecto Next.js; no se modifica ningún archivo existente fuera de `openspec/`.
- **Dependencias nuevas:** Next.js, React, TypeScript, Tailwind CSS y una herramienta de pruebas de componentes.
- **Fuera de alcance de este cambio:** visor 3D y giro (#7), selectores de n y l (#8), reintentos, indicador de carga y pantalla de error (#9), contenido teórico real en Markdown leído de Neon (#10), rutas de API (#6), base de datos y migraciones (#4), servicio de cálculo (#3) y despliegue en Vercel (#11).
- **Documentos de referencia:** `docs/PRD.md`, `docs/TECH-DESIGN-v2.md`, `docs/BACKLOG.md`, ADR 0004, 0018 y 0022.
