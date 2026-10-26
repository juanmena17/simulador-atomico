# Proposal

## Why

El objetivo del producto es que el estudiante vea la forma tridimensional del orbital y la pueda girar (PRD). La zona del visor existe (ítem #1) pero está vacía, y la API ya entrega los anillos en un formato compacto (ítems #2 y #6). Falta el visor mismo: decodificar los anillos, dibujarlos con aspecto tridimensional y permitir girarlos libremente en los tres ejes con el ratón. Es la pieza que más pesa en el criterio de éxito del PRD (reconocer la forma de los orbitales) y la que tiene el criterio de rendimiento más exigente (30 cuadros por segundo con n ≤ 4).

## What Changes

- Un componente de visor que recibe un orbital en el formato de la API y dibuja sus anillos (envolvente y núcleo) en un canvas 2D, con perspectiva, ordenamiento por profundidad, color según la profundidad y un halo tenue, sin bibliotecas gráficas.
- Giro libre en los tres ejes con el ratón mediante un control de tipo "bola virtual" (arrastrar con el botón principal); sin giro automático, sin deslizadores ni controles de brillo o velocidad (fuera de alcance del PRD).
- Dibujo bajo demanda (solo cuando cambia la orientación, el tamaño o el orbital) para no gastar procesador en reposo.
- Adaptación al tamaño de su contenedor y a pantallas de alta densidad.
- Al cambiar de orbital se conserva la orientación, de modo que el estudiante compara formas desde el mismo ángulo.
- Una ruta de desarrollo (no disponible en producción) para ver y medir el visor con un orbital real, con la orientación inicial y la medición de cuadros configurables.

## Capabilities

### New Capabilities

- `orbital-viewer`: visualización tridimensional de un orbital a partir de sus anillos y giro libre con el ratón.

### Modified Capabilities

(ninguna)

## Impact

- **Código nuevo:** `web/src/lib/visor/` (decodificación, rotación, proyección y dibujo), `web/src/components/VisorOrbital.tsx`, una ruta de desarrollo y sus pruebas. No se modifica la página principal (la integración con los selectores y la API es del ítem #8), la API ni el servicio.
- **Dependencias nuevas:** ninguna.
- **Fuera de alcance:** selectores, carga de datos desde la API, reintentos e indicador de carga (ítems #8 y #9), giro automático, brillo, velocidad, ejes visibles y exportación de imágenes (PRD, "No alcance").
- **Referencias:** PRD (objetivo y criterios de éxito), ADR 0004, 0008, 0013 y 0018; visor web anterior en `D:\DMC\Projects\visualAtoms\web\atomo.template.html` (referencia de solo lectura para el dibujo con halo).
