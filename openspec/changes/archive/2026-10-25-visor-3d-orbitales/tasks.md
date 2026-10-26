# Tasks

## 1. Datos

- [x] 1.1 Crear `web/src/lib/visor/tipos.ts` (tipo del orbital de la API) y `decodificar.ts` (base64 a enteros de 16 bits a coordenadas en [−1, 1] y lista de anillos), con pruebas unitarias que usen los 15 orbitales reales de `web/datos/orbitales.json`: cantidad de anillos igual a la de longitudes, suma de puntos correcta y recuperación con error de a lo sumo 1/32767; verificar que pasan

## 2. Giro y proyección

- [x] 2.1 Implementar `rotacion.ts` (cuaterniones, composición, normalización, matriz de rotación y bola virtual) con pruebas: giro de 90° alrededor de cada eje, arrastre horizontal gira alrededor del eje vertical, arrastre vertical alrededor del horizontal, arrastre circular cerca del borde gira alrededor del eje de la vista y, tras 10 000 giros aleatorios, la matriz sigue siendo ortogonal con determinante 1 (tolerancia 1e-9); verificar que pasan
- [x] 2.2 Implementar `proyeccion.ts` (rotación de los puntos, perspectiva con cámara a 4 unidades, escala por el lado menor, profundidad media por anillo y orden de los más lejanos a los más cercanos) con pruebas de perspectiva, orden por profundidad y de que el orbital cabe completo en el área visible en 200 orientaciones aleatorias; verificar que pasan

## 3. Dibujo

- [x] 3.1 Implementar `dibujar.ts` (halo ancho y trazo fino por anillo, caminos cerrados, color e intensidad por profundidad, colores distintos para envolvente y núcleo, grosor por densidad de píxeles, limpieza del lienzo) con pruebas con un contexto falso: cantidad de anillos dibujados igual a la esperada, orden de dibujo por profundidad, mayor intensidad del anillo cercano que el del lejano y que el orbital vacío no dibuja nada; verificar que pasan

## 4. Componente

- [x] 4.1 Implementar `web/src/components/VisorOrbital.tsx` (componente de cliente: lienzo al 100 % del contenedor, `ResizeObserver`, densidad de píxeles, descripción accesible con n y l, estado sin orbital, eventos de puntero con captura y solo el botón principal, `touch-action: none`) con pruebas en jsdom con un contexto de lienzo falso: sin orbital no dibuja y no falla, descripción con n = 3 y l = 2, el arrastre cambia la orientación y redibuja, un cambio de orbital conserva la orientación, el cambio de tamaño redibuja, en reposo no hay redibujados y no existen controles (botones, deslizadores); verificar que pasan
- [x] 4.2 Añadir la orientación inicial por defecto y el parámetro opcional de orientación inicial en grados por eje, y la prueba de rendimiento (tiempo medio de proyección y dibujo del orbital de n = 4 con más anillos con el contexto falso, menor que 8 milisegundos); verificar que pasan

## 5. Ruta de desarrollo

- [x] 5.1 Crear `web/src/app/dev/visor/page.tsx` (solo fuera de producción; en producción responde "no encontrado") con los parámetros `n`, `l`, `rx`, `ry`, `rz` y `medir=1` (240 cuadros girando y promedio en un elemento con el identificador `resultado-medicion`), con una prueba de que en producción devuelve "no encontrado" y de que fuera de producción acepta los parámetros; verificar que pasan y que `npm run build` la deja marcada como no disponible en producción

## 6. Verificación y documentación

- [x] 6.1 Capturar con Edge sin ventana los orbitales 1s, 2p, 3d, 4f y 5g (n = 5, l = 4) en la orientación inicial y tres orientaciones con giros en cada uno de los tres ejes, guardarlas en `openspec/changes/visor-3d-orbitales/evidencia/` y verificar que se ven completas, centradas y tridimensionales
- [x] 6.2 Medir el tiempo por cuadro en un navegador real con `medir=1` para los 15 orbitales, guardar la tabla en la evidencia y verificar que los de n ≤ 4 están por debajo de 33 ms por cuadro
- [x] 6.3 Documentar en `web/README.md` la ruta de desarrollo y sus parámetros y ejecutar `npm run lint`, `npm test` (con y sin `DATABASE_URL_PRUEBAS`) y `npm run build`; verificar que terminan sin errores

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `orbital-viewer` en `openspec/specs/`.
