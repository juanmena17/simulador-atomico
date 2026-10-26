# ADR 0017: Contenido teórico en Markdown con fórmulas, guardado en Neon

## Estado

Aceptado. Complementa al ADR 0002 en lo relativo al formato del contenido teórico.

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo A4) señaló que la tabla de contenido teórico del ADR 0002 ("orden, título y texto") no puede representar lo que muestra el diseño: citas, ecuaciones (por ejemplo la ecuación de Schrödinger) y fórmulas en línea (por ejemplo Ψ(r, θ, φ)). El formato no estaba definido; si se guardara HTML, habría riesgo de inyección de código (XSS). Tampoco había una herramienta para editar el texto, y el renderizado estático de Next.js podía impedir que un cambio en la base de datos se viera sin volver a desplegar, que era el motivo de guardar el contenido en Neon.

El texto teórico aún no está redactado; se define más adelante (PRD).

## Decisión

Cada sección teórica se guarda en Neon como **Markdown con fórmulas** (texto con formato, citas y ecuaciones). La página lo renderiza **sin aceptar HTML crudo**, y las fórmulas se muestran con una biblioteca alojada en el propio servidor, sin recursos de terceros. La página lee el contenido desde Neon en cada consulta o con revalidación, de modo que un cambio en la base se refleje sin volver a desplegar. La edición se hace por script o consulta directa; no hay panel de edición en esta versión.

## Alternativas consideradas

- **Texto fijo en el código (archivo Markdown en el repositorio)** — era viable, lo más simple y sin riesgo de inyección. No se eligió porque cambiar el texto exigiría volver a desplegar, que contradice el motivo de guardarlo en la base.
- **Bloques estructurados (lista de bloques con tipo, guardada como JSON)** — era viable y da más control sobre cada pieza. No se eligió porque es más trabajo de modelado y de renderizado, y es excesivo para tres secciones.

## Consecuencias

- El contenido puede representar citas, ecuaciones y fórmulas, y es seguro frente a la inyección de código porque no se acepta HTML crudo.
- Hay que añadir al proyecto el renderizado de Markdown y la biblioteca de fórmulas, y alojarla en el propio servidor.
- Editar el texto exige un script o una consulta, lo que es incómodo para quien no sea técnico; un panel de edición queda fuera de esta versión.
- La página debe leer el contenido de forma dinámica o con revalidación; si se genera estática por error, los cambios no se verán sin desplegar.
