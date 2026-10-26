# ADR 0022: El diseño de referencia es el `code.html` de `ultima_v4`

## Estado

Aceptado. Complementa al ADR 0004 (stack de la página) y al ADR 0018 (elementos del diseño).

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, sugerencia S6) señaló que las dos versiones del diseño aprobado no coinciden: `DESIGN.md` describe un tema oscuro, y el `code.html` de `design/stitch/ultima_v4/` es la versión con paleta de grises claros que se aprobó visualmente. Para implementar hay que fijar cuál manda. El `code.html` además carga Tailwind y la fuente de iconos desde internet, y el PRD no admite recursos de terceros en uso.

## Decisión

El diseño de referencia para la implementación es el **`code.html` de `design/stitch/ultima_v4/`** (paleta de grises claros). Si `DESIGN.md` difiere del `code.html`, manda el `code.html`. Tailwind y la fuente de iconos que carga se alojan en el propio servidor.

## Alternativas consideradas

- **Que mande `DESIGN.md` (tema oscuro)** — era viable y es la descripción original del sistema de diseño de Stitch. No se eligió porque lo aprobado visualmente, con la paleta de grises claros pedida, es el `code.html`.

## Consecuencias

- La implementación tiene una única referencia visual, sin ambigüedad.
- Hay que alojar en el servidor Tailwind y la fuente de iconos, y dejar de cargarlos desde internet.
- `DESIGN.md` queda desactualizado respecto a la paleta aprobada y no debe usarse como fuente de colores.
