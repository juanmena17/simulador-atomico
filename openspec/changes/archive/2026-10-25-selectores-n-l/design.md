# Design

## Context

La página principal (`web/src/app/page.tsx`) es un componente de servidor que compone `Header`, `TheoryPanel`, `ViewerArea` (vacía) y `QuantumCard` (de solo lectura con n, l y m por parámetros). El visor `VisorOrbital` (cliente) recibe un `orbital` en el formato de la API y conserva su orientación al cambiarlo. `GET /api/orbital?n=&l=&v=` entrega el orbital (ADR 0003 y 0013) y exige la versión `VERSION_ALGORITMO_VIGENTE`. El estado vive solo en memoria (ADR 0008 y 0012); los selectores se bloquean durante la consulta (ADR 0019); los reintentos y el indicador de carga son del ítem #9 (ADR 0020). Las funciones `shellLabelFromN` y `orbitalLabelFromL` (ítem #1) ya derivan "CAPA K" y "ORBITAL s". Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Una interacción sencilla que haga imposible elegir una combinación inválida.
- Una sola consulta en curso y un estado coherente ante éxito y fallo.

**Non-Goals:**
- Mensajes de error, "Reintentar", reintentos e indicador de carga (ítem #9), y cualquier persistencia de la selección.

## Decisions

**D1. Selectores como dos grupos de botones.** En la tarjeta, la celda de n muestra los botones 1 a 5 y la de l los botones s, p, d, f y g (con su valor numérico como nombre accesible, por ejemplo "l = 2 (d)"). Cada botón es un `<button>` nativo con `aria-pressed` para el elegido y `disabled` para los no disponibles. Se eligen botones y no listas desplegables porque son pocas opciones, se ven todas a la vez y hacen evidente qué combinaciones están bloqueadas. Alternativa: listas `<select>` o deslizadores (ocultan las opciones inválidas o permiten estados intermedios).

**D2. Reglas de disponibilidad.** Un botón de l está habilitado si l < n de la selección; un botón de n está habilitado si n > l de la selección. Así nunca se alcanza una combinación inválida, a costa de que, para bajar de n = 3, l = 2 a n = 2, haya que bajar antes l. Es lo que pide el PRD ("no le deja poner esa configuración"). La lógica vive en funciones puras (`web/src/lib/seleccion/combinaciones.ts`) reutilizando `validarDominioOrbital`.

**D3. Componente `PanelOrbital` (cliente).** `web/src/components/PanelOrbital.tsx` contiene la columna derecha: el visor dentro de `ViewerArea` y la tarjeta con los selectores. Guarda en el estado la selección (n, l), el orbital mostrado y si hay una consulta en curso. `page.tsx` sigue siendo un componente de servidor y solo cambia la columna derecha por `<PanelOrbital />`. `TheoryPanel` no cambia.

**D4. Flujo de una elección.** Al pulsar un botón habilitado: se marca "en curso" (selectores deshabilitados), se actualiza la selección y se llama al cliente de la API; si llega el orbital, se guarda como orbital mostrado y se levanta el bloqueo; si falla, la selección vuelve a la del orbital mostrado y se levanta el bloqueo. Como los botones están deshabilitados durante la consulta, nunca hay dos a la vez (ADR 0019); no hace falta cancelación. La tarjeta muestra la selección (no el orbital mostrado) para que el clic tenga respuesta inmediata; el visor sigue con el orbital anterior hasta que llega el nuevo.

**D5. Carga inicial.** Al montarse, `PanelOrbital` pide el orbital n = 1, l = 0 con el mismo flujo (con el bloqueo activo mientras llega). Si falla, queda el visor vacío y los selectores habilitados; el mensaje y el reintento son del ítem #9.

**D6. Cliente de la API (`web/src/lib/seleccion/cliente-api.ts`).** Una función `pedirOrbital(n, l, { fetchFn })` que hace una sola petición `GET /api/orbital?n=&l=&v=<VERSION_ALGORITMO_VIGENTE>`, comprueba el estado 200 y que la respuesta tenga la forma de `OrbitalApi` con el n y el l pedidos, y lanza un `ErrorConsultaOrbital` con el código de la API (o `respuesta_invalida` o `red`) en cualquier otro caso. `fetch` es inyectable para las pruebas. No reintenta.

**D7. Tarjeta.** `QuantumCard` recibe, además de `n`, `l` y `m`, `alElegirN`, `alElegirL` y `deshabilitado` opcionales; sin esas funciones se comporta como hasta ahora (solo lectura), lo que conserva las pruebas existentes de la tarjeta sola. Las etiquetas "CAPA" y "ORBITAL" siguen derivadas de n y l; la celda de m no tiene controles.

**D8. Pruebas.** Unitarias de las combinaciones (las 15 válidas, las inválidas bloqueadas, disponibilidad de botones para todas las selecciones posibles). Del cliente de la API con un `fetch` falso (URL y versión, respuesta correcta, error de la API, red caída, forma inválida). De `PanelOrbital` en jsdom con `fetch` y lienzo falsos: carga inicial, elegir l, bloqueo mientras la promesa no se resuelve, un solo `fetch` en vuelo, reversión ante error, tarjeta actualizada, ausencia de control para m, uso del teclado. La verificación real (servidor de producción, API y base reales, clics y arrastres en un navegador) la hace quien orquesta.

## Risks / Trade-offs

- **Para bajar n hay que bajar antes l** → es una fricción consciente del PRD; se valida con el usuario.
- **La primera consulta tras inactividad puede tardar hasta 5 s con los selectores bloqueados y sin indicador de carga** → hasta el ítem #9 el estudiante solo ve que los botones se apagan; se acepta de forma temporal.
- **La tarjeta muestra la selección mientras el visor muestra el orbital anterior** → desfase breve y deliberado (D4).
- **Sin cancelación de consultas** → no hace falta por el bloqueo, pero no hay salida si una consulta no termina; el tiempo máximo y el desbloqueo a los 15 s son del ítem #9.

## Open Questions

- Ninguna que cambie las specs, el enfoque o las tareas.
