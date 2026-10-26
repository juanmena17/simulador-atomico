# ADR 0006: Cálculo de orbitales en Python (heredado)

## Estado

Aceptado (heredado)

## Contexto

El repositorio existente `D:\DMC\Projects\visualAtoms` ya resuelve el cálculo de los orbitales hidrogenoides en Python, con pruebas automáticas. El servicio de cálculo del sistema (ADR 0001) reutiliza ese código.

## Decisión

El servicio de cálculo se implementa en **Python**, reutilizando el código existente:

- `physics.py`: funciones radial, angular, de onda y densidad de los orbitales hidrogenoides, con NumPy y SciPy.
- `fields.py`: malla 3D de la densidad y una caché en memoria por (n, l, m, modo, N, Z).
- `slices.py` y `rings.py`: extracción de los anillos mediante curvas de nivel por rebanadas planas, con scikit-image.
- `web/export_web.py`: el formato compacto de los anillos (enteros de 16 bits en base64), que usa el contrato de la API.

Se excluyen el visor de escritorio con PyVista (`viewer.py`, `motion.py`, `renderer.py`, `calibrate.py`), que no se usa en la web.

## Consecuencias

- Se reutiliza código ya validado con pruebas contra valores analíticos, sin volver a escribir la física.
- El servicio hereda las dependencias NumPy, SciPy y scikit-image (unos 180 MB instalados), que deben caber en el límite de tamaño de las funciones de Vercel en el plan gratuito; debe verificarse en el despliegue.
- El código existente tiene un tiempo de cálculo del orden de décimas de segundo por orbital con una malla de 96 puntos; hay que confirmar que cabe en el límite de ejecución de Vercel.
