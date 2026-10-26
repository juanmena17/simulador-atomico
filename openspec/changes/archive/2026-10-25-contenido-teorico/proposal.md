# Proposal

## Why

El panel teórico de la izquierda todavía muestra el texto provisional del diseño de Stitch, escrito en el propio código, que contiene afirmaciones sin revisar ("99.94 % de la masa", "leptones", una ecuación que no corresponde a lo que simula el producto). El ADR 0017 decidió que el contenido viva en Neon como Markdown con fórmulas, sin HTML crudo, y que se pueda cambiar sin volver a desplegar; el ADR 0023 fijó una caché breve; y la base de datos y la API (`/api/contenido`) ya existen. Falta redactar el contenido real y hacer que el panel lo lea y lo muestre con las fórmulas bien formadas.

## What Changes

- El panel teórico deja de usar datos escritos en el código: al cargar pide `/api/contenido` y muestra las secciones recibidas, en orden, con su título y su contenido.
- El contenido se muestra como Markdown con fórmulas matemáticas renderizadas (en línea y en bloque), sin interpretar HTML crudo, con los estilos y las fuentes de las fórmulas servidos desde el propio sitio.
- Mientras llega el contenido se muestra un indicador de carga; si falla, un mensaje claro con "Reintentar", con la misma política de reintentos de la consulta de orbitales.
- Se redactan las tres secciones iniciales (Estructura atómica, Mecánica Clásica y Mecánica Cuántica) con el enfoque de la presentación de clase del autor: estructura del átomo y capa de valencia, modelo de Bohr y diagrama de Möller frente a la descripción cuántica con orbitales, números cuánticos y qué muestra el simulador. Se cargan con `npm run db:cargar`.
- Se retira el texto provisional del código.

## Capabilities

### New Capabilities

- `theory-content`: obtención y presentación del contenido teórico (Markdown con fórmulas) y su contenido inicial.

### Modified Capabilities

(ninguna: el requisito del panel teórico de `app-shell` —tres secciones en orden con desplazamiento propio— sigue siendo válido)

## Impact

- **Código:** `TheoryPanel` pasa a ser un componente de cliente que consume la API; nuevo cliente de contenido y presentador de Markdown en `web/src/lib/contenido/` y `web/src/components/`; se elimina `web/src/data/theory-sections.ts`; los textos de `web/datos/secciones/*.md` ya están reescritos.
- **Dependencias nuevas:** `react-markdown`, `remark-math`, `rehype-katex` y `katex` (ya instaladas). Aviso de seguridad de baja gravedad en KaTeX relacionado con su opción `trust`, que no se usa.
- **Fuera de alcance:** un panel de edición del texto (se cambia con el script de carga o consultas a la base), la revisión científica definitiva del texto por el autor, el despliegue y la carga en Neon (ítem #11).
- **Referencias:** PRD, ADR 0017, 0020 y 0023; capacidades `page-api`, `data-loading` y `orbital-resilience`; `docs/teory/Introducción a la Química Orgánica-1.pdf` (solo como guía de enfoque: sus 117 diapositivas tienen unos 11 000 caracteres de texto, sin contenido explicativo desarrollado).
