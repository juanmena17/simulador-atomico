# Proposal

## Why

Los componentes ya existen por separado: la página (ítem #1), el servicio de cálculo (#3) y la base de datos con datos (#4 y #5). Falta la capa que los une: las rutas de API que usará el navegador (ADR 0003). Sin ellas, el visor y el panel teórico no pueden obtener datos. Esta capa debe aplicar las decisiones de caché inmutable (ADR 0013 y 0023), de no reintentar al servicio (ADR 0020) y de proteger el secreto (ADR 0010).

## What Changes

- Una ruta pública `GET /api/orbital` que, dados n, l y la versión del algoritmo, devuelve el orbital: lo lee de la base de datos y, si falta, se lo pide al servicio de cálculo con el secreto compartido, lo guarda y lo devuelve.
- Las respuestas de orbital llevan cabeceras de caché inmutable; las de error, no se guardan en caché.
- Una ruta pública `GET /api/contenido` que devuelve las secciones teóricas en orden, con una caché breve (ADR 0023).
- Un formato único de error (`{"error": {"codigo", "mensaje"}}`) con códigos distintos para entrada inválida, versión no vigente, servicio de cálculo no disponible, base de datos no disponible y error interno, sin revelar el secreto, la dirección del servicio ni la de la base.
- Una constante con la versión vigente del algoritmo, comprobada automáticamente contra el archivo de datos.
- Configuración por variables de entorno: dirección del servicio y secreto compartido.

## Capabilities

### New Capabilities

- `page-api`: consulta pública de orbitales y de contenido teórico, con caché HTTP, validación, orquestación base de datos → servicio y errores unificados.

### Modified Capabilities

(ninguna)

## Impact

- **Código nuevo:** `web/src/app/api/orbital/route.ts`, `web/src/app/api/contenido/route.ts`, `web/src/lib/api/` y sus pruebas. No se modifican la interfaz, los repositorios, el esquema ni el servicio.
- **Variables de entorno nuevas:** `URL_SERVICIO_CALCULO` y `SECRETO_SERVICIO` (esta última ya existe en el servicio, con el mismo valor).
- **Fuera de alcance:** el uso de las rutas desde el navegador, los reintentos y el indicador de carga (ítems #7, #8 y #9) y el despliegue y las variables en Vercel (ítem #11).
- **Referencias:** ADR 0003, 0010, 0013, 0017, 0020 y 0023; `docs/TECH-DESIGN-v2.md`.
