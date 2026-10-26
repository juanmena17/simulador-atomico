# Design

## Context

`TheoryPanel` (ítem #1) es un componente de servidor que dibuja tres secciones desde `web/src/data/theory-sections.ts`, con un punto de color por sección, el título y los párrafos; el cuerpo del panel tiene desplazamiento propio y la cabecera "TRATADO TEÓRICO // FUNDAMENTOS". La API `GET /api/contenido` devuelve `[{clave, orden, titulo, contenido}]` con caché de 60 s (ADR 0023) y errores en el formato único. `web/datos/secciones/*.md` (cargados con `npm run db:cargar`) ya contienen el texto nuevo. El ADR 0017 pide Markdown con fórmulas, sin HTML crudo y con las bibliotecas alojadas en el propio servidor; el ADR 0020 fija la política de reintentos del navegador, ya implementada para orbitales (ítem #9). Las bibliotecas `react-markdown`, `remark-math`, `rehype-katex` y `katex` están instaladas. Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Que el panel consuma la API como cualquier cliente, sin acceder a la base de datos, y se pueda cambiar el texto sin desplegar.
- Que el contenido no pueda inyectar HTML ni cargar recursos externos.

**Non-Goals:**
- Edición del texto desde la interfaz, caché propia del navegador, y revisión científica final.

## Decisions

**D1. Panel como componente de cliente que consume la API.** `TheoryPanel` pasa a ser un componente de cliente que, al montarse, pide `/api/contenido` y guarda las secciones, la fase (cargando, listo o error) y el tipo de error. Así respeta el ADR 0003 (el navegador solo habla con la página), la caché del ADR 0023 y que la compilación no necesite la base de datos. Alternativa: leer la base de datos en un componente de servidor (obliga a que la construcción o cada solicitud dependan de Neon y no aprovecha la caché de la API).

**D2. Cliente y política de reintentos reutilizados.** Un cliente `pedirContenido()` en `web/src/lib/contenido/cliente-api.ts` (una petición, comprobación de forma, errores con código, cancelación por señal) y la misma política de reintentos del ítem #9 (esperas de 0,5 y 1,5 s, 8 s por intento, tope de 15 s), generalizando `reintentos.ts` para que acepte la función de petición y devuelva cualquier tipo, sin cambiar su comportamiento con orbitales. Mensajes de error reutilizando `AvisoError` y `IndicadorCarga` del ítem #9 (con textos propios para contenido: "No se pudo cargar el contenido teórico." según el tipo).

**D3. Presentador de Markdown.** Un componente `ContenidoMarkdown` con `react-markdown` (que no interpreta HTML crudo por defecto: no se activa ninguna opción para permitirlo), `remark-math` y `rehype-katex` con la salida de HTML y MathML (alternativa accesible) y las opciones por defecto de seguridad de KaTeX (sin `trust`). La hoja de estilos de KaTeX se importa desde el paquete, de modo que sus fuentes se emiten con la construcción y se sirven desde el propio sitio. Los elementos del Markdown (párrafos, énfasis, listas, citas y ecuaciones en bloque) se estilan con las clases del tema para igualar el aspecto del diseño (cita con borde verde azulado, ecuación centrada sobre fondo neutro). Alternativa: escribir un analizador propio (riesgoso y limitado).

**D4. Estructura visual de cada sección.** Se conserva el aspecto actual: punto de color según el orden (dorado, verde azulado, violeta; si hay más, se repite el ciclo), título como encabezado de nivel 3 y el contenido a continuación, con separación entre secciones. El panel conserva su cabecera, su marco con esquinas y el desplazamiento propio.

**D5. Estados.** Cargando: indicador "Cargando contenido…" dentro del cuerpo del panel (`role="status"`). Error: `AvisoError` en variante central dentro del cuerpo del panel con el botón "Reintentar", que repite la consulta con la misma política. Éxito: las secciones. Los estados no afectan a `PanelOrbital`.

**D6. Retiro del texto provisional.** Se elimina `web/src/data/theory-sections.ts` y las pruebas que dependían de él se reescriben con contenido de ejemplo. El texto real vive solo en `web/datos/secciones/*.md` y en la base de datos.

**D7. Pruebas.** De la capa de datos: cliente de contenido con `fetch` falso (forma, orden, errores, cancelación, una sola petición) y la generalización de los reintentos. Del presentador, con Markdown de ejemplo: negrita, lista, cita, fórmula en línea y en bloque (se comprueba que el HTML contiene los elementos de KaTeX y no el texto `$`), que `<script>` y `<img onerror>` no producen elementos activos, y que no hay solicitudes a terceros en las hojas de estilo. Del panel con relojes y `fetch` falsos: orden, cargando, error con "Reintentar", reintento exitoso y que el visor no se ve afectado. De contenido real: leer los tres archivos `web/datos/secciones/*.md` y comprobar los conceptos exigidos por la spec y la ausencia del texto provisional, y que todas las fórmulas se renderizan sin errores de KaTeX (con `throwOnError` activado en la prueba). La verificación real (servidor de producción, API y base cargadas, navegador, solicitudes de red y capturas) la hace quien orquesta.

## Risks / Trade-offs

- **El panel queda vacío hasta que llega la API** → indicador de carga y reintentos; la caché de 60 s reduce la espera en visitas repetidas.
- **KaTeX y react-markdown añaden peso al paquete del navegador** → se mide el tamaño y se informa; son bibliotecas habituales.
- **Aviso de seguridad de baja gravedad de KaTeX (opción `trust`)** → la opción no se usa y el contenido es del autor; se anota como riesgo aceptado.
- **El contenido se redactó para este cambio** → es un borrador que el autor debe revisar; se informa expresamente.
- **Un cambio del texto tarda hasta unos minutos en verse** → consecuencia aceptada del ADR 0023.

## Open Questions

- Ninguna que cambie las specs, el enfoque o las tareas.
