# ADR 0013: Caché HTTP inmutable y criterio de tiempo realista

## Estado

Aceptado. Complementa al ADR 0003 (contratos de API) y al ADR 0009 (resiliencia), y ajusta el criterio de tiempo del PRD.

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo C3) señaló que el diseño había rebajado por su cuenta el criterio de 1 segundo del PRD a 5 segundos para los orbitales que faltan en la caché, y que ni el camino con caché lo garantiza:

- Con los 15 orbitales ya sembrados en Neon (ADR 0012), el camino de "orbital no guardado" casi no ocurre.
- El camino frecuente depende de Neon, que se suspende tras 5 minutos sin uso en el plan gratuito, y de los arranques en frío de las funciones; tras un periodo sin visitas, la primera consulta puede superar 1 segundo.
- Ningún ADR decidía si las respuestas se guardan en el navegador o en la red de distribución de contenido (CDN) de Vercel, aunque los datos de un orbital no cambian.

## Decisión

Las respuestas de orbital (y de contenido teórico) se marcan como **inmutables mediante cabeceras de caché HTTP**, de modo que el navegador y el CDN las reutilicen sin consultar a Neon ni al servicio de cálculo. La dirección de cada orbital incluye una **versión del algoritmo de cálculo**, de forma que, al cambiar el método, la nueva versión se pide con otra dirección y no se reutiliza la respuesta antigua.

El criterio de tiempo del PRD y del Tech Design se redefine así:

- Un orbital que ya está en caché (del navegador o del CDN) aparece en menos de 1 segundo.
- La primera consulta tras un periodo sin uso puede tardar hasta 5 segundos, y mientras tanto la página muestra un indicador de carga.

## Alternativas consideradas

- **Orbitales como archivos estáticos servidos por el CDN, con Neon solo para el texto teórico** — era viable y deja el camino principal más rápido, sin depender de Neon. No se eligió porque el cálculo dejaría de ocurrir al pedir el orbital y el servicio de cálculo quedaría casi sin uso.
- **Dejar el diseño como estaba, con el criterio de 5 segundos y sin decidir nada sobre caché** — era viable y no exigía trabajo adicional. No se eligió porque el camino frecuente podía incumplir el 1 segundo del PRD tras un tiempo de inactividad.

## Consecuencias

- La mayoría de las consultas se resuelven sin tocar Neon ni el servicio de cálculo, lo que reduce el consumo de horas de cómputo de Neon.
- El criterio de 1 segundo deja de valer para todas las consultas: aplica a las que están en caché y no a la primera tras un periodo sin uso. El PRD debe actualizarse para reflejarlo.
- Hay que gestionar la versión del algoritmo en la dirección y subirla cada vez que cambie el método de cálculo; si se olvida, el navegador y el CDN seguirán sirviendo datos antiguos.
- La página necesita un indicador de carga para la primera consulta, que debe incorporarse al diseño.
