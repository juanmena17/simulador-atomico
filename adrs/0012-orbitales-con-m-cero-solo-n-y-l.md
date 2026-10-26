# ADR 0012: Orbitales con m = 0: el estudiante elige solo n y l

## Estado

Aceptado. Complementa al ADR 0002 (modelo de datos), al ADR 0003 (contratos de API) y al ADR 0008 (estado) en lo relativo al modo y a m.

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo C2) señaló que el modo (complejo o real) y el número m no estaban definidos de punta a punta:

- El PRD solo pide elegir n y l; la etiqueta del diseño muestra "n, l, m", pero no hay selectores de m ni de modo.
- En modo complejo, los orbitales p se dibujan como anillos de revolución y no con los dos lóbulos que muestran los libros, por lo que el criterio de lóbulos del PRD no se puede comprobar con ellos.
- Las claves de la caché (n, l, m y modo) no estaban normalizadas, y una misma forma podía pedirse con claves distintas.

Con m = 0, la forma del orbital complejo y la del real coinciden (p_z, d_z², etc.), y existe uno por cada combinación (n, l).

## Decisión

El estudiante elige **solo n y l**; m queda fijo en **0** y no hay selector de modo. Para cada combinación (n, l) con n ≤ 5 existe exactamente un orbital (15 en total). La etiqueta del diseño puede mostrar "n, l, m" con m = 0 fijo.

## Alternativas consideradas

- **Selector de m con solo modo real** — era viable y muestra las formas de los libros (p_x, p_y, d_xy y otras), con 55 orbitales para n ≤ 5 y claves de caché sin ambigüedad. No se eligió porque añade un selector al diseño y más datos que el producto no necesita en esta versión.
- **Selector de m con los dos modos (complejo y real)** — era viable y el más completo. No se eligió porque suma un selector, normalización de claves y casi el doble de datos, y el PRD pidió dejar fuera lo avanzado.

## Consecuencias

- La caché pasa de 75 orbitales a 15, y la clave se reduce a (n, l): desaparece el problema de las claves distintas para una misma forma.
- La API y el estado de la página solo manejan n y l; el modo y m dejan de ser parte de los contratos de esta versión.
- El estudiante solo ve el orbital con m = 0 de cada subcapa: para l = 1 ve únicamente p_z, y no verá p_x, p_y ni los d con otras orientaciones. Eso limita el objetivo de reconocer la forma de los orbitales.
- El PRD debe actualizarse: m queda fijo en 0 y la etiqueta "m" no es un control. El campo "modo" del modelo de datos y de los contratos puede eliminarse.
