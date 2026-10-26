# Design

## Context

`PanelOrbital` (ítem #8) pide el orbital con `pedirOrbital` (una sola petición, sin cancelación), bloquea los selectores mientras dura y, si falla, revierte la selección y deja un `console.error` genérico, sin mensaje al usuario. La API devuelve errores con códigos estables: `orbital_invalido` y `version_no_vigente` (400), `servicio_no_disponible` (502), `bd_no_disponible` (503), `configuracion_incompleta` y `error_interno` (500). El cliente ya añade los códigos `red` y `respuesta_invalida`. El ADR 0020 fija: 2 reintentos con esperas de 0,5 y 1,5 s, 8 s por intento, solo ante fallos de red o del servidor, y un bloqueo máximo de unos 15 s. Ver `proposal.md` para la motivación.

Observación: tres intentos de 8 s más las esperas pueden sumar 26 s, más que los 15 s de bloqueo del ADR. Para respetar el tope del ADR se impone un límite total de 15 s sobre toda la consulta.

## Goals / Non-Goals

**Goals:**
- Una política de reintentos pura, determinista y probada con relojes simulados, separada de la interfaz.
- Mensajes claros para el estudiante sin filtrar detalles internos.

**Non-Goals:**
- Reintentos desde la página al servicio de cálculo, cancelación manual, y telemetría de errores.

## Decisions

**D1. Política en una función pura (`web/src/lib/seleccion/reintentos.ts`).** `pedirOrbitalConReintentos(n, l, opciones)` encapsula la política y recibe sus dependencias por inyección (`pedir`, `esperar`, tiempos, y el reloj mediante temporizadores), de modo que las pruebas usan relojes simulados. Constantes: esperas `[500, 1500]`, tiempo por intento `8000`, tope total `15000`. Un `AbortController` externo por consulta encadena la señal del intento y la del tope total.

**D2. Clasificación de errores.** Reintentables: `red`, `tiempo_agotado`, `servicio_no_disponible`, `bd_no_disponible`, `error_interno` y `configuracion_incompleta`. No reintentables: `orbital_invalido`, `version_no_vigente` y `respuesta_invalida`. La clasificación vive en una tabla única, con una prueba que obliga a decidir cada código nuevo.

**D3. Cancelación en el cliente de la API.** `pedirOrbital` acepta una señal de cancelación; si la señal se activa por el tiempo del intento, lanza `ErrorConsultaOrbital("tiempo_agotado")`; si se activa por el tope total, lanza `tiempo_agotado_total` (no reintentable). Un `fetch` abortado por la señal no deja la petición colgada.

**D4. Tope total.** Un temporizador de 15 s cancela el intento en curso y las esperas pendientes y termina la consulta con `tiempo_agotado_total`. Si quedan reintentos pero no tiempo para completar la espera más un intento, se abandona al vencer el tope; no se acorta la espera ni el tiempo del intento para "encajar".

**D5. Estados de la interfaz.** `PanelOrbital` pasa a un estado de consulta con tres valores: ocioso, cargando y error (con el tipo de error y la elección fallida). Mientras carga, los selectores quedan bloqueados (ADR 0019) y se muestra un indicador. Al terminar con éxito, el error se limpia. En un error, la selección vuelve a la del orbital mostrado (requisito de `orbital-selection`) y se conserva la elección fallida para "Reintentar".

**D6. Indicador de carga.** Un componente `IndicadorCarga` sobre el visor (superpuesto, centrado) con `role="status"` y el texto "Cargando orbital…", sin animaciones. Sirve igual si ya hay un orbital debajo (lo cubre parcialmente con un velo tenue) o si el visor está vacío.

**D7. Aviso de error.** Un componente `AvisoError` con `role="alert"`, el mensaje en español según el tipo y un botón "Reintentar". Con un orbital anterior se muestra como una franja sobre el visor, sin ocultarlo; en la primera carga ocupa el centro del visor. Textos: `red` "No hay conexión con el servidor."; `tiempo_agotado` y `tiempo_agotado_total` "El servidor tardó demasiado en responder."; `servicio_no_disponible` "El servicio de cálculo no está disponible en este momento."; `bd_no_disponible` "Los datos no están disponibles en este momento."; `version_no_vigente` "La versión de los datos cambió. Recarga la página."; el resto, "No se pudo cargar el orbital." Ningún mensaje incluye códigos, direcciones ni trazas.

**D8. "Reintentar".** Repite `elegir` con la elección fallida y la misma política; no es posible pulsarlo mientras hay una consulta en curso (el aviso se retira al empezar la nueva consulta).

**D9. Pruebas.** De la política con relojes simulados (éxito al primer intento, éxito tras reintentos con las esperas exactas, fallo persistente con exactamente 3 intentos y esperas de 0,5 y 1,5 s, sin reintento de errores de validación, tiempo por intento de 8 s, tope total de 15 s con un servidor que nunca responde y que no quedan temporizadores ni peticiones pendientes). Del cliente (cancelación). De los componentes y del panel con relojes y `fetch` falsos (indicador visible solo durante la consulta, mensaje por tipo, botón "Reintentar", orbital anterior visible, primera carga con error, un éxito retira el error, selectores bloqueados durante los reintentos y desbloqueados al terminar, sin datos internos en los mensajes). La verificación real con el servidor de producción (la base apagada de verdad, un servidor que no responde) la hace quien orquesta.

## Risks / Trade-offs

- **Las esperas fijas suman unos 2 s antes de rendirse ante un error del servidor** → es el costo de cubrir fallos pasajeros; aceptado por el ADR.
- **El tope de 15 s puede cortar el tercer intento antes de su límite de 8 s** → es intencional; el ADR da prioridad a no dejar los selectores bloqueados más de unos 15 s.
- **Un intento abandonado por el navegador puede seguir ejecutándose en el servidor** → como el servidor guarda el resultado en la base, el siguiente intento probablemente lo encuentre ya calculado (ver ítem #6).
- **Los mensajes dependen de los códigos de la API** → una prueba comprueba que todos los códigos conocidos tienen mensaje y clasificación.

## Open Questions

- Ninguna que cambie las specs, el enfoque o las tareas.
