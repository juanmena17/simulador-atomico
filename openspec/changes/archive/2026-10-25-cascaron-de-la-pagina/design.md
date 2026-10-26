# Design

## Context

No existe código del producto: el repositorio solo tiene documentos (`docs/`), ADR (`adrs/`), el diseño de referencia (`design/stitch/ultima_v4/code.html`) y OpenSpec. La página debe seguir el ADR 0004 (Next.js con TypeScript y, más adelante, un canvas 2D propio para el visor) y el ADR 0022 (manda el `code.html` de `ultima_v4`). El `code.html` está hecho con Tailwind cargado desde un CDN, una fuente de iconos de Google y las fuentes de Google Fonts, y fija el cuerpo en 1920×1080; todo eso contradice el PRD (sin recursos de terceros y adaptable a distintas pantallas de escritorio). Las herramientas disponibles son Node 22.20.0 y npm 10.9.3. Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Un cascarón fiel a la estructura y al estilo del `code.html`, que se adapte a pantallas de escritorio de 1280×720 o más.
- Componentes separados (cabecera, panel teórico, zona del visor, tarjeta de números cuánticos) para que los ítems #7, #8 y #10 se integren sin reescribir el cascarón.
- Que no haya solicitudes a terceros al cargar la página.

**Non-Goals:**
- El visor, el giro, los selectores, los estados de carga y de error, y el contenido teórico real quedan para otros ítems del backlog.
- Rutas de API, base de datos y despliegue.
- Soporte para teléfono o tableta.

## Decisions

**D1. El proyecto vive en `web/`, en la raíz del repositorio.** El repositorio guarda documentos, ADR y OpenSpec en la raíz, y el ADR 0001 prevé dos proyectos en Vercel (página y servicio de cálculo). Cada uno necesita su propia carpeta raíz. Alternativas: poner Next.js en la raíz (mezcla el código con los documentos y complica el segundo proyecto) o usar una herramienta de monorepo (excesivo para dos carpetas).

**D2. Next.js con App Router, TypeScript y Tailwind compilado en la construcción.** Se crea con el generador oficial de Next.js, fijando las versiones que instale. El tema del `code.html` (colores, fuentes y radios) se traslada a la configuración de Tailwind. Alternativas: mantener el CDN (contradice el PRD), o escribir CSS a mano (más trabajo sin ventaja).

**D3. Fuentes servidas desde el propio proyecto con paquetes de `@fontsource`.** Se usan Space Grotesk (títulos), Newsreader (texto) y JetBrains Mono (etiquetas y valores). Los paquetes incluyen los archivos de la fuente, así que la construcción no depende de internet ni se piden fuentes a Google al abrir la página. Alternativa: el cargador de fuentes de Google de Next.js, que descarga las fuentes en la construcción pero depende de la red en ese momento.

**D4. Iconos como SVG en línea.** Tras omitir los elementos descritos en D8, solo quedan dos iconos (logotipo de la cabecera y libro del panel). Se dibujan como SVG dentro del código en vez de cargar la fuente completa de Material Symbols. Alternativa: instalar la fuente de iconos como paquete (pesada para dos iconos).

**D5. Adaptación por escala de la unidad base.** Las medidas se expresan en `rem` y la fuente raíz crece con el ancho de la ventana (por ejemplo, 16 px a 1920 px de ancho, con un mínimo de 13 px y un máximo de 22 px). La página ocupa el 100 % de la altura de la ventana, y el panel teórico se desplaza por dentro. Con esto, 1920×1080 reproduce el diseño y las demás pantallas conservan las proporciones. La cabecera mide 6,25 rem (100 px a 1920 px). Alternativas: puntos de quiebre con tres diseños (más código y más pruebas) o fijar 1920×1080 con escala por transformación (borroso y deja franjas vacías).

**D6. Contenido provisional estático.** El texto de las tres secciones es el del diseño aprobado, guardado en el código como datos. El ítem #10 lo reemplaza por Markdown leído de Neon. Las ecuaciones se muestran como texto Unicode, sin renderizador de fórmulas. Los valores de la tarjeta son n = 1, l = 0 y m = 0 y entran por parámetros del componente, para que el ítem #8 los conecte con los selectores.

**D7. Tarjeta de números cuánticos con etiquetas derivadas.** Un par de funciones puras calculan la capa (K, L, M, N, O) a partir de n y el tipo de orbital (s, p, d, f, g) a partir de l, de modo que las etiquetas "CAPA K" y "ORBITAL s" nunca queden desactualizadas cuando los valores cambien. Se omiten las barras de progreso y las descripciones entre corchetes del diseño.

**D8. Elementos del diseño que se omiten.** En línea con el ADR 0018, que dejó pendiente decidir al implementar qué ornamentos conservar, el cascarón no incluye: "ESTADO: RESONANTE", "COH: 99.98%", el botón de ajustes, "LIVE 60 FPS", "V1.04", "POTENCIAL: -13.6 eV" fijo, "B-FIELD = 0", "[NO DEGENERADO]", las coordenadas X, Y y Z del visor ni las barras de progreso. Se conservan los elementos puramente visuales: marcos con esquinas en L, cuadrículas y colores. El subtítulo de la cabecera pasa a "ORBITALES DE UN ÁTOMO HIDROGENOIDE", un texto neutro y verdadero.

**D9. Componentes.** `Header`, `TheoryPanel`, `ViewerArea` (con una zona de contenido que el ítem #7 rellenará con el canvas), `QuantumCard` y las funciones de etiquetas, cada uno en su archivo bajo `web/src/`.

**D10. Pruebas.** Pruebas de componentes con Vitest y Testing Library que comprueban el orden y el contenido de las secciones, los valores iniciales, la ausencia de los textos omitidos y las etiquetas derivadas. Una comprobación del resultado de la construcción busca direcciones externas en el HTML, el CSS y el JavaScript generados. La adaptación se verifica a mano con capturas de pantalla en 1280×720, 1366×768, 1920×1080 y 2560×1440. Alternativa: pruebas de navegador con Playwright (más completas, pero con más peso y configuración para un cascarón estático).

## Risks / Trade-offs

- **Pantallas con proporciones poco comunes** (por ejemplo, ultra anchas) → la escala por ancho puede dejar la altura justa; se verifica en las cuatro resoluciones y se acota el mínimo y el máximo de la unidad base.
- **Texto provisional del diseño** con afirmaciones que no se han revisado como contenido científico → se marca como provisional y el ítem #10 lo reemplaza; no se debe tomar como texto final.
- **El cascarón se verá algo más sobrio que el diseño**, por las omisiones de D8 → es el costo de no mostrar datos inventados; los elementos faltantes que el PRD exige (selectores, estado de carga y error) llegan en los ítems #8 y #9.
- **Versiones de las dependencias**: no se fijan en este documento porque se conocen al crear el proyecto → se anotan en el archivo de dependencias y en la verificación.
- **Las pruebas de red externa solo ven lo que está en la construcción**, no las solicitudes del navegador → se complementa con la inspección manual de las solicitudes en el navegador.

## Open Questions

- ¿El subtítulo de la cabecera debe quedar como "ORBITALES DE UN ÁTOMO HIDROGENOIDE" o se prefiere otro texto? No cambia las specs ni las tareas.
- ¿Se conserva el texto del diseño como contenido provisional o se prefiere un texto de relleno neutro? Se decide al implementar; el ítem #10 lo reemplaza en cualquier caso.
