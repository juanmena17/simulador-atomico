# Technical Design Document: Simulador atómico

**Tipo de proyecto:** Brownfield parcial. Se revisó el repositorio existente `D:\DMC\Projects\visualAtoms` (cálculo de los orbitales hidrogenoides y extracción de anillos, con pruebas). La página web, el servicio, la base de datos y la API son nuevos.
**Design.md disponible:** Sí (`design/stitch/ultima_v4/DESIGN.md`, junto con `code.html`). El modelo de datos se derivó del PRD y de lo que la interfaz muestra.

## Resumen

El Simulador atómico es una página web de escritorio para estudiantes de química y aficionados, que muestra en 3D la forma de los orbitales de un átomo hidrogenoide (s, p, d y f, con n hasta 5) y permite girarlos en los tres ejes, de modo que el estudiante pueda reconocer la forma y relacionarla con n y l (ver `PRD.md`). Los cálculos se hacen en un servidor para que el estudiante no dependa de la potencia de su computador. Se despliega en Vercel con el plan gratuito, persiste en PostgreSQL sobre Neon y reutiliza el código de cálculo ya existente.

## Arquitectura de componentes

Hay dos proyectos en Vercel y una base de datos en Neon:

- **Página web (nuevo):** Next.js con TypeScript. Contiene la interfaz del diseño aprobado, el visor 3D de anillos dibujado en un canvas 2D propio (trasladado del visor web ya existente) y las rutas de API que usa el navegador. Es el único componente que habla con Neon (mediante Prisma) y el único que llama al servicio de cálculo.
- **Servicio de cálculo (heredado y nuevo):** función de Vercel en Python, sin framework, que reutiliza `physics.py`, `fields.py`, `slices.py` y `rings.py` del repositorio existente. Recibe n, l, m y modo, y devuelve la extensión y los anillos en un formato compacto. No tiene acceso a la base de datos y exige un secreto compartido.
- **Base de datos (nuevo):** PostgreSQL en Neon, con una tabla de orbitales calculados y otra de contenido teórico.
- **No se reutiliza:** el visor de escritorio con PyVista (`viewer.py`, `motion.py`, `renderer.py`, `calibrate.py`).

Flujo principal: el navegador pide un orbital a la página; la página lo busca en Neon y, si falta, lo pide al servicio de cálculo, lo guarda y lo devuelve; el navegador lo dibuja y el usuario lo gira.

## Decisiones de arquitectura

| # | Decisión | Estado |
|---|---|---|
| [ADR-0001](adrs/0001-componentes-dos-proyectos-vercel.md) | Componentes del sistema: dos proyectos en Vercel | Aceptado |
| [ADR-0002](adrs/0002-modelo-de-datos-orbitales-y-contenido.md) | Modelo de datos: caché de orbitales y contenido teórico en Neon | Aceptado |
| [ADR-0003](adrs/0003-contratos-de-api-via-la-pagina.md) | Contratos de API: el navegador solo habla con la página | Aceptado |
| [ADR-0004](adrs/0004-stack-de-la-pagina-nextjs-canvas-2d.md) | Stack de la página web: Next.js (TypeScript) con canvas 2D propio | Aceptado |
| [ADR-0005](adrs/0005-acceso-a-datos-prisma-solo-la-pagina.md) | Acceso a datos: Prisma, solo desde la página | Aceptado |
| [ADR-0006](adrs/0006-calculo-en-python-heredado.md) | Cálculo de orbitales en Python (heredado) | Aceptado (heredado) |
| [ADR-0007](adrs/0007-interfaz-http-del-servicio-sin-framework.md) | Interfaz HTTP del servicio de cálculo: función de Vercel sin framework | Aceptado |
| [ADR-0008](adrs/0008-estado-solo-en-la-pagina.md) | Manejo de estado: solo en la página, en memoria | Aceptado |
| [ADR-0009](adrs/0009-resiliencia-reintento-y-mensaje.md) | Resiliencia y manejo de errores: reintento automático y mensaje claro | Aceptado |
| [ADR-0010](adrs/0010-proteccion-del-servicio-secreto-compartido.md) | Protección del servicio de cálculo: secreto compartido | Aceptado |

## Modelo de datos

Dos entidades, sin relación entre ellas y sin datos de usuario (el PRD descarta cuentas y progreso):

- **Orbital (caché):** identificado por n, l, m y modo (complejo o real). Guarda la extensión del orbital y los anillos en el formato compacto (enteros de 16 bits en base64, con la longitud de cada anillo). Los valores derivados, como la energía (a partir de n) o la etiqueta de capa y subcapa (por ejemplo "K" y "s"), se calculan y no se guardan.
- **Sección teórica:** orden, título y texto de cada sección del panel izquierdo (Estructura atómica, Mecánica Clásica y Mecánica Cuántica).

Elementos del diseño que no generan datos: "COH 99.98%", "LIVE 60 FPS" y "V1.04" son decoración de Stitch. Deben quitarse o conectarse a datos reales al implementar.

## Criterios de aceptación por flujo

### Ver un orbital

- [ ] Al abrir la página se muestra el orbital con n = 1, l = 0, m = 0 en modo complejo.
- [ ] Al elegir una combinación válida (n, l, m), la página muestra el orbital correspondiente.
- [ ] Un orbital que ya está en la caché aparece en menos de 1 segundo.
- [ ] Un orbital que falta en la caché aparece en menos de 5 segundos.
- [ ] Para las 15 combinaciones (n, l) con n ≤ 5, el número de lóbulos y de nodos coincide con la referencia teórica.

### Cambiar n, l, m

- [ ] Con n = 1 solo se puede elegir l = 0; con n = 2, l = 0 o 1; en general, l va de 0 a n − 1 y |m| ≤ l.
- [ ] Las combinaciones inválidas no se pueden seleccionar en la interfaz.
- [ ] Una petición a la API con una combinación inválida o con n > 5 se rechaza con un código y un mensaje claros.

### Girar el orbital

- [ ] El orbital se puede girar en los tres ejes arrastrando con el ratón.
- [ ] Durante el giro, el visor mantiene al menos 30 cuadros por segundo con n ≤ 4 en un computador de escritorio de gama media.

### Leer el contenido teórico

- [ ] El panel izquierdo muestra las tres secciones, en orden, con barra de desplazamiento.
- [ ] El texto se lee desde la base de datos y se puede cambiar sin volver a desplegar la página.

### Fallos

- [ ] Si una consulta falla, la página reintenta automáticamente hasta 2 veces y después muestra un mensaje claro con el botón "Reintentar".
- [ ] Durante un fallo, el orbital anterior sigue visible.
- [ ] El servicio de cálculo rechaza las peticiones que no llevan el secreto compartido.

### Diseño y tamaño

- [ ] La página se ve completa en 1920×1080 y se adapta a otros tamaños de pantalla de escritorio.
- [ ] No hay llamadas a recursos externos: fuentes y estilos se sirven desde el propio servidor.

## Riesgos técnicos abiertos

- **Límite de tamaño y de tiempo en Vercel:** el servicio de cálculo usa NumPy, SciPy y scikit-image (unos 180 MB instalados). No se verificó si caben en el límite de tamaño de las funciones de Python en el plan gratuito ni si el cálculo entra en el límite de tiempo. Debe comprobarse en el primer despliegue; si no cabe, hay que reconsiderar los ADR 0001 y 0007.
- **Tiempo del primer orbital:** un orbital que falta en la caché pasa por dos saltos de servidor y puede tardar más que el límite de 1 segundo del PRD. El PRD dice que cada cambio debe actualizarse en menos de 1 segundo; los criterios de este documento fijan 1 s para lo guardado y 5 s para lo nuevo. Debe alinearse el PRD con esa diferencia.
- **Almacenamiento en Neon:** los 75 orbitales precalculados ocupan unos 4,4 MB; cuenta contra el límite del plan gratuito y debe vigilarse si se amplía el rango de n.
- **Invalidación de la caché:** si cambia la fórmula o el método de extracción de anillos, la caché queda desactualizada y hay que regenerarla; falta definir cómo se hace.
- **Diseño de Stitch con ancho fijo y n = 0:** el HTML de Stitch usa 1920 px fijos, carga estilos y fuentes desde internet y muestra n = 0, que no es una combinación válida. Debe hacerse responsivo, alojar sus recursos en el servidor y arrancar en n = 1.
- **Rendimiento del canvas 2D:** con n = 4 y 5 hay muchos anillos y el giro puede ir menos fluido en equipos modestos; debe medirse al implementar y, si hace falta, migrar a Three.js.
- **Secreto compartido:** su gestión (cambio, filtración y entornos) es manual y debe cuidarse.
- **Pendientes del PRD:** siguen abiertos los puntos `REVISAR` de `PRD.md` (selector de m, nombre de los modelos clásicos, animaciones y exportación, qué ve el usuario con el servidor lento, cantidad de usuarios simultáneos y quién redacta el texto teórico).
- **Este documento es un borrador estructurado:** la revisión real (ambigüedades, números y bordes) sigue siendo del humano. Se recomienda una revisión adversarial con una sesión nueva antes de implementar.
