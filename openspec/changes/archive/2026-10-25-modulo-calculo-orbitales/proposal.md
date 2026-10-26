# Proposal

## Why

El servicio de cálculo (ítem #3) y el visor (ítem #7) necesitan datos de orbitales confiables. El código de `D:\DMC\Projects\visualAtoms` calcula los orbitales y tiene pruebas, pero la revisión adversarial mostró que no se puede reutilizar tal cual: la extracción de anillos depende de PyVista y matplotlib, que no caben en Vercel, y el formato compacto que usará la API solo existe en un script sin pruebas (ADR 0011). Hay que crear un módulo mínimo, probado y sin esas dependencias, antes de construir el servicio.

## What Changes

- Se crea un proyecto Python en `servicio-calculo/` con un módulo que, dados n y l (con m = 0), calcula el orbital hidrogenoide y devuelve sus anillos en un formato compacto.
- Se traslada sin cambios la física ya probada de `physics.py` y se copian sus pruebas.
- Se traslada la lógica de extracción de anillos de `web/export_web.py` (curvas de nivel por rebanadas) usando solo NumPy, SciPy y scikit-image, y se le escriben pruebas propias.
- Se fijan los parámetros del cálculo (malla, fracciones de probabilidad, número de rebanadas) y una versión del algoritmo que el resto del sistema usará para invalidar la caché (ADR 0013).
- Se verifica la forma de los 15 orbitales (n hasta 5) contra la teoría: nodos radiales y angulares, normalización y simetría de revolución.

## Capabilities

### New Capabilities

- `orbital-computation`: cálculo de un orbital hidrogenoide con m = 0 para n de 1 a 5 y l de 0 a n − 1, y entrega de sus anillos (envolvente y núcleo) en un formato compacto, determinista y versionado.

### Modified Capabilities

(ninguna)

## Impact

- **Código nuevo:** carpeta `servicio-calculo/` (paquete Python, pruebas, `README.md`). No se modifica `web/` ni el repositorio `visualAtoms`.
- **Dependencias:** NumPy, SciPy y scikit-image en ejecución; pytest en desarrollo. Sin PyVista, matplotlib ni opencv.
- **Documentos:** se actualiza la sección "Comandos del entorno" de `CLAUDE.md`.
- **Fuera de alcance:** servicio HTTP con FastAPI y secreto compartido (ítem #3), base de datos y carga inicial (ítems #4 y #5), visor (ítem #7) y despliegue (ítem #11).
- **Referencias:** `docs/PRD.md`, `docs/TECH-DESIGN-v2.md`, `docs/BACKLOG.md` (ítem #2), ADR 0011, 0012, 0013 y 0015.
