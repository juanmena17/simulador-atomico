# Design

## Context

La zona del visor (`ViewerArea`, ítem #1) acepta contenido (`children`) y hoy está vacía. La API entrega cada orbital como `{n, l, version, extension, envolvente: {p, l}, nucleo: {p, l}}`, donde `p` son los puntos en enteros de 16 bits con signo (little-endian, escala 32767) codificados en base64, ya normalizados a [−1, 1] respecto de la extensión, y `l` es la lista de longitudes de cada anillo (ADR 0011). Un orbital con n = 5 tiene unos 9 000 puntos y unos 130 anillos; con n ≤ 4 menos de 7 000 puntos. El visor web anterior (`D:\DMC\Projects\visualAtoms\web\atomo.template.html`) dibujaba los mismos anillos en un canvas 2D con perspectiva, agrupación por profundidad y un halo tenue, pero con un giro de dos ejes por el ratón y un tercero por deslizador, además de controles que el PRD descartó. El PRD pide girar libremente en los tres ejes con el ratón, sin brillo ni velocidad de giro. Next.js 16: el visor es un componente de cliente. Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Un visor fluido, simple y probado, con una matemática de giro correcta y sin dependencias.
- Poder verlo y medirlo ya con datos reales, antes de que existan los selectores (ítem #8).

**Non-Goals:**
- Selectores, carga de datos desde la API, indicadores de carga y reintentos; giro automático, ejes visibles, zoom y exportación.

## Decisions

**D1. Módulos puros más un componente.** `web/src/lib/visor/` con cuatro módulos sin dependencia del DOM: `decodificar.ts` (base64 a enteros de 16 bits a números en [−1, 1], con las longitudes de los anillos), `rotacion.ts` (cuaterniones y la bola virtual), `proyeccion.ts` (rotación de puntos, perspectiva, profundidad y ordenamiento) y `dibujar.ts` (recibe un contexto 2D mínimo y los puntos ya proyectados). El componente `web/src/components/VisorOrbital.tsx` los une con los eventos y el tamaño. Separarlos permite probar la matemática y el dibujo sin navegador.

**D2. Giro con bola virtual (cuaterniones).** Cada posición del puntero se proyecta sobre una esfera virtual centrada en el visor (con radio igual a la mitad del lado menor, y una hiperbólica fuera de ella, como en la bola virtual clásica); la rotación entre dos posiciones sucesivas se compone con la orientación actual (`q = dq · q`) y se normaliza en cada paso para que sea siempre un giro puro. Esto permite los tres ejes con un solo gesto: arrastrar hacia el centro gira alrededor de ejes de la pantalla; hacerlo en círculo cerca del borde gira alrededor del eje de la vista. Alternativas: giro por ángulos de Euler con dos ejes (bloqueo de cardán y tercer eje inaccesible) o un modificador de teclado para el tercer eje (menos descubrible).

**D3. Proyección.** Perspectiva con la cámara a una distancia de 4 unidades del origen y el orbital normalizado en una esfera de radio 1: `factor = distancia / (distancia − z)`; la escala en pantalla es `0.46 · min(ancho, alto)` para que el orbital quede completo en cualquier orientación. La profundidad `z` (tras el giro) alimenta el orden y la intensidad.

**D4. Dibujo.** Por cada anillo se calcula la profundidad media; se ordenan de menor a mayor (los lejanos primero). Cada anillo se traza como camino cerrado con dos pasadas: un halo ancho y muy transparente y el trazo fino, con la opacidad y el color según la profundidad media (cerca más intenso). Colores: envolvente en tonos dorados y núcleo en naranja intenso, sobre el fondo oscuro del visor. El grosor se multiplica por la densidad de píxeles. Cuando se dibuja, se limpia el lienzo completo.

**D5. Dibujo bajo demanda.** Un solo `requestAnimationFrame` pendiente como máximo; se solicita al cambiar la orientación (movimiento del puntero), el tamaño o el orbital. Sin eventos no hay trabajo: reposo sin consumo (requisito "sin movimiento propio").

**D6. Tamaño y densidad.** Un `ResizeObserver` sobre el contenedor fija el tamaño del lienzo en píxeles CSS y su resolución interna en píxeles de dispositivo (`devicePixelRatio`); al cambiar, se redibuja. El lienzo ocupa el 100 % del contenedor.

**D7. Orientación inicial y conservación.** La orientación inicial inclina el orbital (giro de unos 25° alrededor del eje horizontal y unos −30° alrededor del vertical) para que los anillos se vean en perspectiva en lugar de rectas. La orientación vive en una referencia del componente, no en el estado del orbital, de modo que cambiar de orbital la conserva. Un parámetro opcional permite fijar la orientación inicial (en grados por eje), útil para pruebas y capturas.

**D8. Punteros.** Se usan eventos de puntero (`pointerdown`, `pointermove`, `pointerup`/`cancel`) con captura del puntero, solo con el botón principal, y `touch-action: none` sobre el lienzo, de modo que el mismo código sirve para ratón y para pantallas táctiles sin trabajo adicional.

**D9. Ruta de desarrollo.** `web/src/app/dev/visor/page.tsx` (solo fuera de producción: en producción responde "no encontrado") lee `web/datos/orbitales.json` en el servidor y muestra el visor con el orbital pedido por `n` y `l`, admitiendo `rx`, `ry` y `rz` (grados) para la orientación inicial. Con `medir=1` redibuja 240 cuadros girando de forma continua y escribe el promedio de milisegundos por cuadro en un elemento de la página, de modo que se pueda leer en un navegador real. No altera la página principal.

**D10. Pruebas.** Unitarias sin DOM: decodificación (incluida la recuperación con error ≤ 1/32767 usando datos reales de `orbitales.json`), cuaterniones (giro de 90° alrededor de un eje, normalización tras miles de giros, composición), bola virtual (arrastre horizontal gira alrededor del eje vertical, arrastre circular cerca del borde gira alrededor del eje de la vista), proyección (perspectiva, orden por profundidad, intensidad) y dibujo con un contexto falso que registra llamadas (cantidad de anillos, orden, caminos cerrados). Del componente (jsdom con un contexto de lienzo falso): sin orbital no dibuja y no falla, la descripción accesible, giro con eventos de puntero, conservación de la orientación al cambiar de orbital, redibujado al cambiar de tamaño, ausencia de redibujado en reposo y ausencia de controles. Rendimiento: tiempo medio de proyección y dibujo (con el contexto falso) del orbital de n = 4 con más anillos.

## Risks / Trade-offs

- **jsdom no implementa el lienzo** → se prueba con un contexto falso; el aspecto real y el rendimiento real se verifican con capturas y con la medición en un navegador real (Edge sin ventana), tarea de quien orquesta.
- **La bola virtual puede sentirse distinta de la costumbre** → es el comportamiento estándar de los visores de moléculas y de modelos 3D; se anota para validarlo con el usuario.
- **Pantallas táctiles** → funcionan con el mismo código pero no están en el alcance; sin pruebas específicas.
- **Orbitales con muchos anillos (n = 5)** → el criterio de 30 cuadros por segundo es para n ≤ 4; se mide también n = 5 y se informa.

## Open Questions

- Ninguna que cambie las specs, el enfoque o las tareas.
