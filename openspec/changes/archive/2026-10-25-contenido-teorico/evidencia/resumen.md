# Evidencia: contenido-teorico (#10)

Servidor de producción local (`next start`), BD local con `npm run db:cargar`, Edge headless 1920x1080 (CDP).

- Panel (`panel-1920x1080.png`): 3 títulos h3 en orden, 37 fórmulas en línea y 2 ecuaciones en bloque (`.katex-display`), MathML presente, 0 signos `$` ni órdenes LaTeX crudas visibles, 3 listas, 1 cita, desplazamiento propio (`overflow-y: auto`), visor intacto, sin mensajes de consola.
- Red: todas las solicitudes al mismo origen (`http://localhost:3600`), incluidas las fuentes KaTeX (woff2).
- Cambio en BD (`panel-bd-modificada.png`): título editado en la base visible tras la caché de 60 s, sin desplegar.
- Contenido malicioso insertado en BD (`<script>`, `<img onerror>`, enlace `javascript:`, LaTeX inválido): se muestra como texto; `window.__xss` = null; 0 script/img/atributos on*/enlaces peligrosos; fórmulas inválidas no rompen el panel. Fila eliminada y contenido restaurado con `db:cargar`.
- Calidad: `tsc --noEmit` OK, `eslint` OK, `npm test` 79 pasan + 23 omitidos sin BD; 102 pasan con BD; `npm run build` OK.
- Hallazgo: una ecuación `$$...$$` en una sola línea se interpreta como fórmula en línea; las ecuaciones en bloque deben ir con `$$` en líneas propias (corregido en las secciones 2 y 3).
