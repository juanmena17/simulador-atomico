# ADR 0011: Módulo de cálculo mínimo para el servicio (reemplaza al ADR 0006)

## Estado

Aceptado. Reemplaza al ADR 0006, que se conserva como historial.

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo C1) señaló que el ADR 0006 describía una reutilización que no es la real:

- `slices.py` importa PyVista (que arrastra VTK, unos 300 MB) y `rings.py` importa matplotlib; además `pyproject.toml` declara opencv y matplotlib. Con esas dependencias, el servicio de cálculo no cabe en el límite de tamaño de las funciones de Python de Vercel.
- El formato compacto que usa el contrato de la API (ADR 0003) no lo generan esos módulos, sino `web/export_web.py`, un script sin pruebas, con una malla de 110 puntos y su propio algoritmo de extracción de anillos.
- Sí es reutilizable `physics.py` (fórmulas de los orbitales hidrogenoides, con pruebas contra valores analíticos) con NumPy y SciPy, y scikit-image para extraer las curvas de nivel.

## Decisión

El servicio de cálculo se implementa con un **módulo nuevo y mínimo**, que traslada la lógica de `export_web.py` y usa solo `physics.py`, NumPy, SciPy y scikit-image. No usa PyVista, matplotlib ni opencv. Al módulo nuevo se le escriben pruebas propias, incluida la comparación de la forma de los orbitales con valores de referencia. El código restante de `visualAtoms` (visor de escritorio, renderizador y calibración) queda como referencia y no se despliega.

## Alternativas consideradas

- **Precalcular fuera de Vercel y sembrar Neon, sin servicio de cálculo** — era viable y elimina el problema del tamaño y del tiempo de ejecución. No se eligió porque el cálculo dejaría de ocurrir en un servidor al pedirlo, que es lo que se decidió, y el segundo proyecto de Vercel perdería sentido.
- **Reescribir el cálculo en TypeScript dentro de la página** — era viable y deja un solo proyecto y un solo lenguaje. No se eligió porque se pierde el código existente y hay que volver a validar la física.

## Consecuencias

- El servicio es liviano y cabe en los límites de Vercel, pero es código nuevo que hay que escribir y probar.
- Solo `physics.py` conserva sus pruebas actuales; la extracción de anillos y el formato compacto no tienen pruebas hasta que se escriban.
- La malla del script (110 puntos) y la de las pruebas existentes (96 puntos) difieren; hay que fijar una para el servicio y validarla.
- El código heredado queda como referencia que puede divergir del módulo nuevo; no debe usarse como fuente en el despliegue.
