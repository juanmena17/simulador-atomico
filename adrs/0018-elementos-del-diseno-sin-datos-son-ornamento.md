# ADR 0018: Elementos del diseño sin datos asociados: se tratan como ornamento

## Estado

Aceptado. Complementa al ADR 0002 en lo relativo a los elementos de la interfaz.

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo A5) señaló que el diseño aprobado (`design/stitch/ultima_v4/`) tiene más datos y elementos de los que el Tech Design clasifica. Algunos son físicamente incorrectos, como "[NO DEGENERADO]" para m = 0 o un "POTENCIAL −13.6 eV" fijo que no cambia con n. También indicó que al diseño le faltan elementos funcionales que el PRD y otras decisiones exigen: los selectores de n y l, un estado de carga (ADR 0013) y la pantalla de error con "Reintentar" (ADR 0009). El botón de ajustes y la animación del giro sugieren funciones que el PRD excluye.

## Decisión

Los datos y elementos del diseño que el Tech Design no clasifica como datos reales ni como derivados **se tratan como ornamento**: no tienen datos asociados, no se conectan a ningún componente y no forman parte de los criterios de aceptación. No se añade ninguna tabla de clasificación ni se corrige el diseño en Stitch en esta versión.

Los elementos funcionales que faltan (selectores de n y l, estado de carga y pantalla de error) **no son ornamento**: se añaden en la implementación, según el PRD y los ADR 0009 y 0013.

## Alternativas consideradas

- **Tabla de clasificación en el Tech Design, que indica para cada elemento si es dato real, derivado, decorativo o se quita** — era viable y haría del Tech Design la fuente de verdad de la implementación. No se eligió porque se prefiere no añadir esa carga a esta versión.
- **Corregir el diseño en Stitch antes de implementar** — era viable y deja el diseño correcto. No se eligió porque requiere otra ronda con Stitch, cuyas ediciones han tardado y se han cortado.

## Consecuencias

- No hay trabajo adicional de clasificación ni de corrección del diseño.
- Los elementos ornamentales con afirmaciones físicas incorrectas (por ejemplo "[NO DEGENERADO]" o un potencial fijo) pueden llegar a la página; en un producto educativo, esto puede inducir a error al estudiante. Debe revisarse al implementar si se conservan.
- El botón de ajustes y la animación sugieren funciones que no existen; el estudiante puede esperar algo que no ocurre.
- La implementación debe distinguir, al construir cada pantalla, qué elementos son funcionales y cuáles ornamento, sin una tabla de referencia.
