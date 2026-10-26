# ADR 0008: Manejo de estado: solo en la página, en memoria

## Estado

Aceptado

## Contexto

Mientras el estudiante usa la página cambian los números cuánticos n, l y m, el modo (complejo o real) y el ángulo de giro del orbital. El PRD descarta cuentas de usuario, guardado de progreso y ejercicios, por lo que el servidor no guarda estado de cada usuario. La dirección de la página y el almacenamiento del navegador son otros lugares donde podría vivir el estado.

## Decisión

El estado vive **solo en la página, en memoria**: n, l, m, modo y giro son variables de la interfaz. Al recargar o volver a abrir la página, el estado regresa a su valor inicial (n = 1, l = 0, m = 0 en modo complejo). El servidor no conserva ningún estado de usuario.

## Alternativas consideradas

- **Estado en la dirección (URL), con el giro en memoria** — era viable: permite recargar y compartir un orbital copiando la dirección, y no guarda nada en el servidor. No se eligió porque se prefiere no sumar esa complejidad en esta versión; puede incorporarse después.
- **Estado en el navegador (localStorage)** — era viable: recuerda la última selección al volver. No se eligió porque se parece a guardar progreso, que el PRD dejó fuera, y no se puede compartir; también se pospone.

## Consecuencias

- Es lo más simple: no hay lectura ni escritura de la dirección ni del almacenamiento del navegador.
- Recargar la página pierde la selección, y no se puede compartir un orbital concreto con otra persona.
- El estado inicial (n = 1, l = 0, m = 0) difiere del n = 0 que muestra el diseño de Stitch; el diseño debe ajustarse, porque n = 0 no es una combinación válida.
- Si más adelante se quiere compartir o recordar la selección, se podrá añadir la dirección o el almacenamiento del navegador sin cambiar los contratos de la API.
