# Tasks

## 1. Proyecto y física heredada

- [x] 1.1 Crear `servicio-calculo/` con un entorno virtual de Python 3.12, `requirements.txt` (numpy, scipy, scikit-image) y `requirements-dev.txt` (pytest), y verificar que `python -c "import numpy, scipy, skimage"` funciona y que `pytest` se ejecuta
- [x] 1.2 Copiar `physics.py` de `D:\DMC\Projects\visualAtoms` como `src/orbitales/fisica.py` sin cambios (solo un comentario de origen) y sus pruebas como `tests/test_fisica.py` con las importaciones ajustadas; verificar que pasan las mismas pruebas que en el repositorio original

## 2. Dominio de entrada

- [x] 2.1 Implementar la validación del dominio (n de 1 a 5, l de 0 a n − 1, enteros) con la excepción `OrbitalInvalidoError` y pruebas para entradas válidas, l incompatible con n, valores fuera de rango y no enteros; verificar que las pruebas pasan

## 3. Cálculo de anillos

- [x] 3.1 Implementar el cálculo de la densidad con m = 0 en la malla de 110 puntos y el umbral por fracción de probabilidad acumulada, con pruebas de normalización (error de a lo sumo 0,5 %) y de nodos radiales y angulares para los 15 orbitales; verificar que pasan
- [x] 3.2 Implementar la extracción de curvas de nivel por rebanadas (44 para la envolvente con fracción 0,90 y 22 para el núcleo con fracción 0,12) con pruebas de circunferencias para los 15 orbitales (tolerancia de 2 % del radio medio o 1,5 celdas de la malla, lo que sea mayor) y de ausencia de valores no finitos y de segmentos de longitud cero para los 15 orbitales; verificar que pasan

## 4. Formato y resultado

- [x] 4.1 Implementar el remuestreo, la normalización a [−1, 1], la cuantización a enteros de 16 bits y la codificación en base64 con la lista de longitudes, con una prueba de recuperación de coordenadas (error de a lo sumo 1/32767 de la extensión); verificar que pasa
- [x] 4.2 Implementar `calcular_orbital(n, l)` que devuelve el resultado con n, l, versión del algoritmo, extensión y los grupos envolvente y núcleo, con pruebas de estructura, serialización a JSON, determinismo y una prueba de huella de los parámetros contra `VERSION_ALGORITMO`; verificar que pasan

## 5. Verificación de integración

- [x] 5.1 Escribir las pruebas de tamaño (≤ 150 KB) y de tiempo (< 2 s) para los 15 orbitales y la de dependencias (tras importar y calcular no están cargadas PyVista, matplotlib ni OpenCV), y guardar en `openspec/changes/modulo-calculo-orbitales/evidencia/` una tabla con el tamaño y el tiempo de cada orbital; verificar que las pruebas pasan
- [x] 5.2 Escribir `servicio-calculo/README.md` con los comandos de instalación, pruebas y uso, y actualizar la sección "Comandos del entorno" de `CLAUDE.md`; verificar que cada comando documentado se ejecuta tal como está escrito
- [x] 5.3 Ejecutar todas las pruebas de `servicio-calculo/` y registrar en la evidencia el tamaño instalado de NumPy, SciPy y scikit-image; verificar que todas pasan

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `orbital-computation` en `openspec/specs/`.
