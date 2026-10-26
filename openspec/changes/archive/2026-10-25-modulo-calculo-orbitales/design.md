# Design

## Context

El repositorio `D:\DMC\Projects\visualAtoms` ya tiene la física (`src/visualatoms/physics.py`, con `tests/test_physics.py`: normalización, caso analítico 1s, ortogonalidad, nodos radiales, simetrías, umbral acumulado y entradas inválidas) y un script de exportación (`web/export_web.py`) que genera los anillos y el formato compacto con N = 110, 44 rebanadas para la envolvente (fracción 0,90) y 22 para el núcleo (fracción 0,12). Ese script no tiene pruebas y arrastra el modo "real" y m distinto de 0, que el ADR 0012 sacó del alcance. `slices.py` y `rings.py` dependen de PyVista y matplotlib y no se usan. Ver `proposal.md` para la motivación.

Entorno: Python 3.12 disponible en la máquina (coincide con la versión por defecto de Vercel) y Node/npm ya instalados. El sistema operativo local es Windows y Vercel usa Linux, de modo que los resultados numéricos pueden diferir en los últimos decimales.

## Goals / Non-Goals

**Goals:**
- Un paquete pequeño, probado y con las dependencias mínimas, que el servicio del ítem #3 pueda importar sin cambios.
- Resultados que coincidan con la teoría y con el formato que el visor leerá.

**Non-Goals:**
- Servicio HTTP, secreto compartido, base de datos y visor.
- Soporte para m distinto de 0, modo real, otros valores de Z o n mayor que 5.

## Decisions

**D1. Ubicación y nombres.** Proyecto en `servicio-calculo/` (frente a `web/`, según el ADR 0014), con el paquete `servicio-calculo/src/orbitales/` y las pruebas en `servicio-calculo/tests/`. Alternativa: un solo repositorio de Python en la raíz (mezcla con documentos y con el proyecto de la página).

**D2. Física trasladada sin cambios.** `physics.py` se copia tal cual como `orbitales/fisica.py`, con un comentario de origen, y sus pruebas se copian como `tests/test_fisica.py`, ajustando solo las importaciones. Así se cumple la regla de no reescribir lo ya probado y se detecta cualquier divergencia futura. Alternativa: instalar `visualatoms` como dependencia (arrastra opencv, matplotlib y PyVista).

**D3. Extracción de anillos con rebanadas 3D, como en el script.** Se calcula la densidad en una malla de 110 × 110 × 110 y se extraen curvas de nivel en planos perpendiculares a z con `skimage.measure.find_contours`: 44 rebanadas para la envolvente (fracción de probabilidad 0,90) y 22 para el núcleo (0,12). El umbral se obtiene ordenando la densidad por valor y acumulando la probabilidad por celda, como en el script. Para m = 0 la densidad tiene simetría de revolución y los anillos salen circulares. Alternativa: construir las circunferencias a partir de un corte 2D y revolucionarlas (más rápido, pero cambia el algoritmo ya validado visualmente y no sirve si algún día se abre m).

**D4. Formato compacto como en el script.** Cada curva se remuestrea según su perímetro (entre 10 y 72 puntos), todo el conjunto se divide por la extensión para quedar en [−1, 1], se cuantiza a enteros de 16 bits con signo (little-endian, escala 32767) y se codifica en base64; se acompaña de la lista de longitudes por curva. El resultado del orbital es `{n, l, version, extension, envolvente: {p, l}, nucleo: {p, l}}`; los nombres de campo se fijan en español para coincidir con el resto del proyecto. La extensión es el radio que contiene el 98,5 % de la probabilidad radial, como en el script.

**D5. Versión del algoritmo.** Una constante `VERSION_ALGORITMO` (texto, inicialmente "1") que se incluye en el resultado y que debe subir cuando cambie cualquier parámetro de D3 o D4; una prueba compara los parámetros con una huella para que no se cambien sin subir la versión. Alternativa: derivarla automáticamente de los parámetros (más frágil de leer).

**D6. Errores.** Una excepción propia `OrbitalInvalidoError` (hereda de `ValueError`) con un mensaje que nombra el valor inválido; la validación del dominio ocurre antes de calcular nada.

**D7. Entorno de desarrollo.** Entorno virtual en `servicio-calculo/.venv` con Python 3.12, dependencias de ejecución en `requirements.txt` (numpy, scipy y scikit-image) y de desarrollo en `requirements-dev.txt` (pytest). Las versiones se anotan al instalar. Alternativa: `pyproject.toml` como única fuente; se evita para dejar a la vista exactamente lo que Vercel instalará en el ítem #3.

**D8. Pruebas.** Además de las copiadas: dominio y errores; nodos radiales y angulares para los 15 orbitales (la parte angular se cuenta con ceros del polinomio de Legendre entre los polos); circunferencias en los 15 orbitales con tolerancia de 2 % del radio medio o 1,5 celdas de la malla, lo que sea mayor (medido: 4 de 1365 anillos superan "2 % o 1 celda", y el peor se desvía 1,12 celdas, por lo que 1,5 celdas deja margen); ausencia de valores no finitos y de segmentos de longitud cero; recuperación de coordenadas desde el formato compacto; determinismo; tamaño (≤ 150 KB) y tiempo (< 2 s) de los 15 orbitales; y que tras importar el módulo y calcular no queden cargadas PyVista, matplotlib ni OpenCV.

## Risks / Trade-offs

- **Diferencias entre Windows y Linux** → los resultados pueden variar en los últimos decimales; las pruebas usan tolerancias y la comparación byte a byte se hace dentro de la misma plataforma. Se confirma en el ítem #3 con la ejecución en Linux.
- **Tamaño de las dependencias en Linux** → aquí se mide en Windows; el valor real se comprueba en el ítem #3. Se anota el tamaño medido como referencia.
- **Cambio de parámetros sin subir la versión** → la prueba de huella de D5 lo detecta.
- **Malla de 110 puntos en lugar de 96** → es más lenta, pero es la que produjo los datos ya validados visualmente; se mide el tiempo y, si no cumple 2 s, se revisa.

## Open Questions

- Si los parámetros de D3 y D4 (por ejemplo, el número de rebanadas) son los adecuados para el visor del ítem #7 se podrá afinar al implementarlo; en ese caso se sube la versión del algoritmo.
