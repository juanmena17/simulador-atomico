# Proposal

## Why

El visor ya dibuja y gira orbitales (ítem #7) y la API ya los entrega (ítem #6), pero la página principal sigue mostrando un visor vacío y una tarjeta con valores fijos. El objetivo del producto (PRD) es que el estudiante cambie n y l y vea la forma del orbital correspondiente. Este ítem une las piezas: selectores de n y l que solo permiten combinaciones válidas (ADR 0012), la consulta a la API con la versión vigente, el bloqueo de los selectores mientras hay una consulta en curso (ADR 0019) y el estado inicial n = 1, l = 0 (ADR 0008).

## What Changes

- La tarjeta de números cuánticos pasa de ser solo de lectura a incluir selectores para n (1 a 5) y l (s, p, d, f, g), con las combinaciones inválidas deshabilitadas; m sigue fijo en 0 y sin control.
- Un componente de cliente mantiene el estado en memoria (n, l y el orbital mostrado), pide el orbital a `GET /api/orbital` con la versión vigente y lo muestra en el visor, conservando la orientación.
- Mientras una consulta está en curso, todos los selectores quedan deshabilitados y nunca hay dos consultas a la vez; al terminar, con éxito o con error, se habilitan de nuevo.
- Si la consulta falla, la selección vuelve al orbital que se estaba mostrando, que sigue visible. El mensaje de error, el botón "Reintentar", el indicador de carga y los reintentos son del ítem #9.
- La página principal monta ese componente en la columna derecha; el panel teórico no cambia.

## Capabilities

### New Capabilities

- `orbital-selection`: elección de n y l con combinaciones válidas, consulta del orbital elegido, bloqueo durante la consulta y comportamiento ante fallos.

### Modified Capabilities

- `app-shell`: el requisito de la tarjeta de números cuánticos deja de ser de solo lectura y pasa a incluir los selectores de n y l.

## Impact

- **Código nuevo:** `web/src/lib/seleccion/` (combinaciones válidas y cliente de la API), `web/src/components/PanelOrbital.tsx` y sus pruebas; cambios en `QuantumCard.tsx` (selectores) y en `page.tsx` (montaje), y en las pruebas que asumían la tarjeta de solo lectura.
- **Dependencias nuevas:** ninguna.
- **Fuera de alcance:** indicador de carga, mensaje de error, botón "Reintentar" y reintentos (ítem #9); contenido teórico leído de la base (ítem #10); despliegue (ítem #11); compartir la selección por la dirección o guardarla en el navegador (ADR 0008).
- **Referencias:** PRD, ADR 0008, 0012, 0013, 0018, 0019 y 0020; capacidades `app-shell`, `orbital-viewer` y `page-api`.
