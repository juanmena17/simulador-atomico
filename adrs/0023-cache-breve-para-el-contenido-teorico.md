# ADR 0023: Caché breve para el contenido teórico (precisa al ADR 0013)

## Estado

Aceptado. Precisa al ADR 0013 en lo relativo al contenido teórico; no lo reemplaza.

## Contexto

El ADR 0013 decidió marcar como inmutables, mediante cabeceras de caché HTTP, "las respuestas de orbital (y de contenido teórico)". El ADR 0017 decidió guardar el contenido teórico en Neon precisamente para poder cambiarlo sin volver a desplegar la página. Ambas decisiones chocan: una respuesta marcada como inmutable y guardada un año en el navegador y en el CDN no mostraría un cambio del texto hasta que expire.

Los orbitales sí son inmutables por construcción: su dirección incluye la versión del algoritmo, de modo que un cambio de método cambia la dirección. El contenido teórico no tiene un identificador de versión equivalente.

## Decisión

- Las respuestas de **orbital** siguen siendo inmutables (caché pública de un año, `immutable`), con la versión del algoritmo en la dirección, como decidió el ADR 0013.
- Las respuestas de **contenido teórico** se guardan en caché durante un tiempo breve (60 segundos en el navegador y en el CDN, con revalidación en segundo plano de hasta 5 minutos), de modo que un cambio del texto se vea en pocos minutos sin volver a desplegar, como pide el ADR 0017.
- Las respuestas de **error** no se guardan en caché.

## Alternativas consideradas

- **Contenido teórico inmutable con una versión en la dirección** — era viable y reduce aún más las consultas a Neon. No se eligió porque obligaría a gestionar una versión del texto y a que la página la conozca, lo que contradice la idea de cambiar el texto en la base sin tocar la página.
- **Sin caché para el contenido teórico** — era viable y muestra los cambios al instante. No se eligió porque cada visita consultaría Neon, y su cuota gratuita de cómputo es limitada (ADR 0016).

## Consecuencias

- Un cambio del texto teórico tarda hasta unos minutos en verse en todos los usuarios, no al instante.
- Las consultas al contenido teórico siguen llegando a Neon, aunque a lo sumo una por minuto y por punto de presencia del CDN.
- Los dos ADR anteriores quedan coherentes: los orbitales son inmutables y el contenido teórico se renueva solo.
