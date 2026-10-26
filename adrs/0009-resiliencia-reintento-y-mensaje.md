# ADR 0009: Resiliencia y manejo de errores: reintento automático y mensaje claro

## Estado

Aceptado

## Contexto

El sistema depende del servicio de cálculo (puede tardar más que el límite de ejecución del plan gratuito de Vercel o no estar disponible), de la base de datos en Neon y de la conexión del propio usuario (ADR 0001, ADR 0003 y ADR 0005). Las combinaciones inválidas ya están resueltas por otro mecanismo: la interfaz las bloquea y la API las rechaza (PRD y ADR 0003).

El PRD pide que el sistema sea utilizable, pero no define una exigencia de disponibilidad; el producto es sencillo y la respuesta debe ser proporcional a su riesgo real. Los servicios gratuitos suelen tener fallos pasajeros, por ejemplo tras un periodo sin uso.

## Decisión

Cuando una consulta de orbital o de contenido falla, la **página reintenta automáticamente una o dos veces**. Si el fallo continúa, muestra un **mensaje claro** al usuario, mantiene visible el orbital que había y ofrece un botón "Reintentar". El visor nunca queda vacío ni roto.

## Alternativas consideradas

- **Solo mensaje y mantener el orbital anterior, sin reintento automático** — era viable y más simple. No se eligió porque los fallos pasajeros son frecuentes en servicios gratuitos y se resuelven solos con un reintento.
- **Respaldo con los 75 orbitales precalculados incluidos en la página** — era viable y permite que la página funcione con el servicio caído. No se eligió porque aumenta el peso de la página (unos 4,4 MB), duplica datos y deja de hacer indispensable al servidor, lo que choca con el PRD.

## Consecuencias

- Los fallos pasajeros se resuelven sin que el usuario haga nada, y el visor siempre queda en un estado utilizable.
- Los reintentos alargan la espera en los fallos reales y chocan con el límite de ejecución de Vercel; el número de reintentos y su espera deben ser pequeños.
- Si el servidor está caído por un tiempo prolongado, el usuario solo puede ver el orbital que ya estaba en pantalla.
- Hay que escribir y probar los mensajes de error y el comportamiento del botón "Reintentar", incluida una combinación que el servicio rechaza.
