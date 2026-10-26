# ADR 0002: Modelo de datos: caché de orbitales y contenido teórico en Neon

## Estado

Aceptado

## Contexto

El PRD establece que no hay cuentas de usuario, guardado de progreso, ejercicios ni cuestionarios, por lo que el sistema no maneja datos de usuario. Aun así, la persistencia debe hacerse en PostgreSQL sobre Neon. Por tanto, lo que se persiste es información propia del producto.

El diseño (`design/stitch/ultima_v4/`) muestra datos del orbital (números cuánticos n, l y m, el modo, la etiqueta de capa y subcapa, y los anillos que se dibujan) y un panel con tres secciones de texto teórico: Estructura atómica, Mecánica Clásica y Mecánica Cuántica. Valores como la energía (a partir de n) se calculan con una fórmula y no se guardan. Elementos como "COH 99.98%", "60 FPS" y "V1.04" son decoración del diseño y no generan datos.

El cálculo del orbital es la parte más pesada del sistema y el plan gratuito de Vercel limita el tiempo de ejecución de las funciones. El proyecto ya dispone de 75 orbitales precalculados (n hasta 5) en `orbitals.json`.

## Decisión

Se persisten dos conjuntos de datos en Neon PostgreSQL:

1. **Orbitales calculados (caché):** una tabla con una fila por orbital, identificada por n, l, m y modo (complejo o real). Cada fila guarda los datos de los anillos y la extensión del orbital. Se carga con los orbitales ya precalculados y el servicio de cálculo la completa cuando falta alguno.
2. **Contenido teórico:** una tabla con las secciones del panel izquierdo (orden, título y texto), para poder cambiar el contenido sin volver a desplegar la página.

## Alternativas consideradas

- **Solo caché de orbitales (el texto fijo en la página)** — era viable y más simple: el cálculo es lo pesado y el texto cambia poco. No se eligió porque se quiso poder editar el contenido teórico sin un nuevo despliegue.
- **Solo contenido teórico (el cálculo siempre en vivo)** — era viable y evita invalidar una caché. No se eligió porque el cálculo es costoso y el límite de tiempo del plan gratuito hace conveniente guardar los resultados.

## Consecuencias

- Los orbitales ya calculados responden sin repetir el cálculo, y el texto teórico se edita sin tocar el código.
- Hay que mantener dos tablas y un procedimiento para cargar los datos iniciales.
- Cuando cambie la fórmula o el método de extracción de anillos, la caché queda desactualizada y debe regenerarse; se necesita una forma de invalidarla.
- Los datos de anillos pueden pesar varios megabytes en conjunto (el archivo precalculado ocupa unos 4,4 MB), lo que cuenta contra el almacenamiento del plan gratuito de Neon.
- Guardar el contenido teórico en la base de datos añade una consulta para algo que casi no cambia.
