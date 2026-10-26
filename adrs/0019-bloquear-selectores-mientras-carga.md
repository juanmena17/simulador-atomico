# ADR 0019: Selectores bloqueados mientras una consulta está en curso

## Estado

Aceptado. Complementa al ADR 0008 (manejo de estado).

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo A6) señaló que el ADR 0008 no preveía qué ocurre si el estudiante cambia n y l muy rápido. Cada cambio lanza una consulta de orbital; si la respuesta de una consulta anterior llega después de la de una posterior, el visor puede mostrar un orbital que no corresponde a la selección. Tampoco había cancelación de consultas ni una caché propia en el navegador (el ADR 0013 la cubre en parte con las cabeceras HTTP).

## Decisión

Mientras una consulta de orbital está en curso, los **selectores de n y l quedan deshabilitados**. Se vuelven a habilitar cuando la consulta termina, con éxito o con error. Así nunca hay dos consultas de orbital en vuelo a la vez y no pueden llegar respuestas cruzadas.

## Alternativas consideradas

- **Cancelar la consulta anterior y descartar las respuestas viejas** — era viable y mantiene la fluidez, porque el usuario nunca queda bloqueado. No se eligió porque se prefirió una solución que impida las respuestas cruzadas por construcción, sin lógica de cancelación.
- **No decidir nada** — era viable y no exigía trabajo. No se eligió porque con cambios rápidos puede mostrarse el orbital equivocado.

## Consecuencias

- Es imposible mostrar un orbital que no corresponde a la selección, y la lógica de la página es simple.
- Cada cambio se siente más lento, sobre todo cuando la respuesta no está en caché (la primera consulta tras un periodo sin uso puede tardar hasta 5 segundos, según el ADR 0013).
- El tiempo máximo que los selectores pueden quedar bloqueados debe acotarse junto con la política de reintentos (ADR 0009); si no, un fallo prolongado dejaría la interfaz bloqueada.
- El diseño debe mostrar el estado deshabilitado de los selectores y un indicador de carga.
