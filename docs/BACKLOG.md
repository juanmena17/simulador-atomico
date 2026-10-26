# Backlog: Simulador atómico

Generado a partir de `docs/PRD.md` y `docs/TECH-DESIGN-v2.md` (con los ADR de `adrs/`). Los ítems están ordenados por dependencia, no por prioridad: los ítems 1 y 2 no dependen de nada y pueden hacerse primero, en cualquier orden.

| # | Item | Alcance | Depende de | Contexto extra requerido |
|---|---|---|---|---|
| 1 | Cascarón de la página | Proyecto Next.js (TypeScript) con la estructura de `code.html` de `design/stitch/ultima_v4/` (cabecera, panel izquierdo, visor, tarjeta n/l/m), responsivo en escritorio y con Tailwind, fuentes e iconos alojados en el propio servidor | — | — |
| 2 | Módulo de cálculo de orbitales | Módulo Python mínimo (`physics.py` + extracción de anillos + formato compacto), con pruebas de lóbulos y nodos para las 15 combinaciones (n, l); fija la malla | — | Física de orbitales: código y referencia en `D:\DMC\Projects\visualAtoms` (`src/visualatoms/physics.py`, `tests/test_physics.py`, `REFERENCE.md`, `web/export_web.py`) |
| 3 | Servicio de cálculo | FastAPI en su propio proyecto de Vercel: recibe n y l, valida, devuelve los anillos y exige el secreto compartido; incluye la comprobación del tamaño del paquete | #2 | — |
| 4 | Base de datos y migraciones | Neon con Prisma: tablas de orbitales (clave n, l y versión) y de contenido teórico; migraciones; dos bases (producción y local); escritura de tipo "insertar o actualizar" | #1 | — |
| 5 | Carga inicial de datos | Script repetible que calcula los 15 orbitales y los inserta en Neon, y carga el texto teórico inicial | #2, #4 | — |
| 6 | API de la página | Rutas de consulta de orbital (Neon y, si falta, el servicio, guardando el resultado) con caché inmutable y versión del algoritmo, y de contenido teórico; errores claros; la página no reintenta al servicio | #3, #4 | — |
| 7 | Visor 3D con giro | Canvas 2D que dibuja los anillos y gira en los tres ejes con el ratón, a 30 cuadros por segundo o más para n ≤ 4 | #1, #2 | — |
| 8 | Selectores n y l | Selectores con combinaciones válidas, estado inicial n = 1 y l = 0, bloqueo mientras carga; conectados al visor y a la API | #6, #7 | — |
| 9 | Resiliencia en el navegador | Hasta 2 reintentos (esperas de 0,5 y 1,5 s, 8 s por intento), indicador de carga, mensaje con "Reintentar", orbital anterior visible y desbloqueo a los 15 s | #8 | — |
| 10 | Contenido teórico | Panel izquierdo con las tres secciones (Estructura atómica, Mecánica Clásica y Mecánica Cuántica) en Markdown con fórmulas, sin HTML crudo, leído de Neon; incluye la redacción del texto | #1, #4, #6 | Texto teórico: `docs/teory/Introducción a la Química Orgánica-1.pdf` |
| 11 | Despliegue y verificación final | Ambos proyectos en Vercel, variables de entorno, y comprobación de los criterios de tiempo y del consumo de Neon | #3, #6, #9, #10 | — |

## Cómo usar este backlog

Cada ítem es una spec independiente. Al implementarlo, se arranca un ciclo de Spec-Driven Development (en este proyecto, con OpenSpec) usando ese ítem como el "change", no el proyecto completo. Se trabaja un ítem a la vez y se pasa al siguiente solo cuando el anterior está implementado y verificado.

Si la columna "Contexto extra requerido" tiene algo, debe compartirse como contexto al generar la spec de ese ítem.

Al generar la spec de cada ítem, se debe leer `docs/PRD.md`, `docs/TECH-DESIGN-v2.md` y los ADR que lo afectan, y no ampliar el alcance más allá del ítem.
