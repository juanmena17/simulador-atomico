# Technical Design Document v2: Simulador atómico

**Versión:** 2. Reemplaza en vigor a `TECH-DESIGN.md` (v1), que se conserva sin cambios como historial.
**Origen de los cambios:** revisión adversarial (`REVISION-ADVERSARIAL.md`) y las decisiones tomadas sobre sus hallazgos (ADR 0011 a 0022).
**Tipo de proyecto:** Brownfield parcial. Se revisó el repositorio existente `D:\DMC\Projects\visualAtoms`; la página web, el servicio, la base de datos y la API son nuevos.
**Design.md disponible:** Sí. Manda el `code.html` de `design/stitch/ultima_v4/` (ADR 0022).

## Resumen

El Simulador atómico es una página web de escritorio para estudiantes de química y aficionados, que muestra en 3D la forma de los orbitales de un átomo hidrogenoide con m = 0 (uno por cada combinación de n y l, con n hasta 5: 15 orbitales) y permite girarlos en los tres ejes, de modo que el estudiante pueda reconocer la forma y relacionarla con n y l (ver `PRD.md`). Los cálculos se hacen en un servidor, se guardan en Neon y se sirven con caché inmutable. Se despliega en Vercel con el plan gratuito.

## Qué cambió respecto a la v1

| Tema | Cambio | ADR |
|---|---|---|
| Código reutilizado | Se usa un módulo mínimo (`physics.py`, NumPy, SciPy y scikit-image, sin PyVista, matplotlib ni opencv), con pruebas propias | 0011 (reemplaza al 0006) |
| Modo y m | El estudiante elige solo n y l; m = 0 y no hay modo; 15 orbitales y clave de caché (n, l) | 0012 |
| Tiempos y caché | Respuestas inmutables en navegador y CDN, con versión del algoritmo en la dirección; 1 s con caché y hasta 5 s la primera vez tras inactividad | 0013 |
| Dos proyectos | Se mantienen y se justifica por aislamiento e independencia | 0014 |
| Servicio de cálculo | FastAPI en lugar de una función sin framework | 0015 (reemplaza al 0007) |
| Cuota de Neon | Riesgo aceptado y vigilado | 0016 |
| Contenido teórico | Markdown con fórmulas, sin HTML crudo, leído de Neon sin volver a desplegar | 0017 |
| Elementos del diseño | Lo que no tiene datos es ornamento; los selectores, el estado de carga y el error se añaden | 0018 |
| Selectores | Se bloquean mientras una consulta está en curso | 0019 |
| Reintentos | Solo en el navegador: 2 reintentos, esperas 0,5 y 1,5 s, 8 s por intento y 15 s de bloqueo máximo | 0020 |
| Operación | Script de carga repetible, migraciones de Prisma, dos bases (producción y local) y registros de Vercel | 0021 |
| Diseño de referencia | Manda el `code.html` de `ultima_v4` | 0022 |

## Arquitectura de componentes

Dos proyectos en Vercel y una base de datos en Neon:

- **Página web (nuevo):** Next.js con TypeScript. Interfaz del `code.html` de `ultima_v4`, visor 3D de anillos en un canvas 2D propio, y las rutas de API que usa el navegador. Es el único componente que habla con Neon (con Prisma) y el único que llama al servicio de cálculo, de servidor a servidor y sin reintentos propios.
- **Servicio de cálculo (heredado y nuevo):** Python con FastAPI. Usa un módulo mínimo que traslada la lógica de `export_web.py` y reutiliza `physics.py`, con NumPy, SciPy y scikit-image. Recibe n y l, devuelve la extensión y los anillos en el formato compacto, no accede a la base de datos y exige un secreto compartido.
- **Base de datos (nuevo):** PostgreSQL en Neon, con una tabla de orbitales (15 filas) y otra de contenido teórico en Markdown.
- **No se reutiliza:** el visor de escritorio con PyVista (`viewer.py`, `motion.py`, `renderer.py`, `calibrate.py`) ni `slices.py` y `rings.py` tal como están.

Flujo principal: el navegador pide un orbital a la página; la página lo busca en Neon y, si falta, lo pide al servicio de cálculo, lo guarda (insertar o actualizar) y lo devuelve con cabeceras de caché inmutable; el navegador lo dibuja y el usuario lo gira.

## Decisiones de arquitectura

| # | Decisión | Estado |
|---|---|---|
| [ADR-0001](../adrs/0001-componentes-dos-proyectos-vercel.md) | Componentes del sistema: dos proyectos en Vercel | Aceptado |
| [ADR-0002](../adrs/0002-modelo-de-datos-orbitales-y-contenido.md) | Modelo de datos: caché de orbitales y contenido teórico en Neon | Aceptado (complementado por 0012, 0013 y 0017) |
| [ADR-0003](../adrs/0003-contratos-de-api-via-la-pagina.md) | Contratos de API: el navegador solo habla con la página | Aceptado (complementado por 0012 y 0013) |
| [ADR-0004](../adrs/0004-stack-de-la-pagina-nextjs-canvas-2d.md) | Stack de la página web: Next.js (TypeScript) con canvas 2D propio | Aceptado (complementado por 0022) |
| [ADR-0005](../adrs/0005-acceso-a-datos-prisma-solo-la-pagina.md) | Acceso a datos: Prisma, solo desde la página | Aceptado |
| [ADR-0006](../adrs/0006-calculo-en-python-heredado.md) | Cálculo de orbitales en Python (heredado) | Reemplazado por ADR-0011 |
| [ADR-0007](../adrs/0007-interfaz-http-del-servicio-sin-framework.md) | Interfaz HTTP del servicio: función de Vercel sin framework | Reemplazado por ADR-0015 |
| [ADR-0008](../adrs/0008-estado-solo-en-la-pagina.md) | Manejo de estado: solo en la página, en memoria | Aceptado (complementado por 0012 y 0019) |
| [ADR-0009](../adrs/0009-resiliencia-reintento-y-mensaje.md) | Resiliencia: reintento automático y mensaje claro | Aceptado (complementado por 0020) |
| [ADR-0010](../adrs/0010-proteccion-del-servicio-secreto-compartido.md) | Protección del servicio: secreto compartido | Aceptado |
| [ADR-0011](../adrs/0011-modulo-de-calculo-minimo-reemplaza-adr-0006.md) | Módulo de cálculo mínimo para el servicio | Aceptado |
| [ADR-0012](../adrs/0012-orbitales-con-m-cero-solo-n-y-l.md) | Orbitales con m = 0: el estudiante elige solo n y l | Aceptado |
| [ADR-0013](../adrs/0013-cache-http-inmutable-y-criterio-de-tiempo.md) | Caché HTTP inmutable y criterio de tiempo realista | Aceptado |
| [ADR-0014](../adrs/0014-justificacion-de-la-separacion-en-dos-proyectos.md) | Justificación de la separación en dos proyectos | Aceptado |
| [ADR-0015](../adrs/0015-fastapi-en-el-servicio-de-calculo-reemplaza-adr-0007.md) | FastAPI en el servicio de cálculo | Aceptado |
| [ADR-0016](../adrs/0016-aceptar-el-riesgo-de-la-cuota-de-neon.md) | Cuota gratuita de Neon: aceptar el riesgo y vigilarlo | Aceptado |
| [ADR-0017](../adrs/0017-contenido-teorico-en-markdown-con-formulas.md) | Contenido teórico en Markdown con fórmulas | Aceptado |
| [ADR-0018](../adrs/0018-elementos-del-diseno-sin-datos-son-ornamento.md) | Elementos del diseño sin datos: ornamento | Aceptado |
| [ADR-0019](../adrs/0019-bloquear-selectores-mientras-carga.md) | Selectores bloqueados mientras una consulta está en curso | Aceptado |
| [ADR-0020](../adrs/0020-politica-de-reintentos-acotada.md) | Política de reintentos acotada, en una sola capa | Aceptado |
| [ADR-0021](../adrs/0021-operacion-minima-carga-migraciones-entornos-registros.md) | Operación mínima: carga, migraciones, entornos y registros | Aceptado |
| [ADR-0022](../adrs/0022-el-diseno-de-referencia-es-code-html-de-ultima-v4.md) | El diseño de referencia es el `code.html` de `ultima_v4` | Aceptado |

## Modelo de datos

Dos entidades, sin relación entre ellas y sin datos de usuario:

- **Orbital:** identificado por (n, l), con n de 1 a 5 y l de 0 a n − 1 (15 filas), más la versión del algoritmo de cálculo. Guarda la extensión del orbital y los anillos en el formato compacto (enteros de 16 bits en base64, con la longitud de cada anillo). Los valores derivados, como la energía (a partir de n) o la etiqueta de capa y subcapa, se calculan y no se guardan. Las escrituras son de tipo "insertar o actualizar".
- **Sección teórica:** orden, título y contenido en Markdown con fórmulas, para las tres secciones del panel izquierdo.

Los elementos del diseño que no generan datos son ornamento (ADR 0018). El campo "modo" ya no existe.

## Criterios de aceptación por flujo

### Ver un orbital

- [ ] Al abrir la página se muestra el orbital con n = 1 y l = 0 (m = 0).
- [ ] Al elegir una combinación válida (n, l), la página muestra el orbital correspondiente.
- [ ] Un orbital que ya está en caché (navegador o CDN) aparece en menos de 1 segundo.
- [ ] La primera consulta tras un periodo sin uso puede tardar hasta 5 segundos, y mientras tanto se muestra un indicador de carga.
- [ ] Para las 15 combinaciones (n, l), el número de lóbulos y de nodos coincide con la referencia teórica del orbital con m = 0.

### Cambiar n y l

- [ ] Con n = 1 solo se puede elegir l = 0; con n = 2, l = 0 o 1; en general, l va de 0 a n − 1.
- [ ] Las combinaciones inválidas no se pueden seleccionar en la interfaz.
- [ ] Una petición a la API con una combinación inválida o con n > 5 se rechaza con un código y un mensaje claros, sin reintentarse.
- [ ] Mientras una consulta está en curso, los selectores de n y l quedan deshabilitados, y se desbloquean al terminar o a los 15 segundos como máximo.

### Girar el orbital

- [ ] El orbital se puede girar en los tres ejes arrastrando con el ratón.
- [ ] Durante el giro, el visor mantiene al menos 30 cuadros por segundo con n ≤ 4 en un computador de escritorio de gama media.

### Leer el contenido teórico

- [ ] El panel izquierdo muestra las tres secciones, en orden, con barra de desplazamiento, incluidas citas y ecuaciones renderizadas.
- [ ] El contenido no acepta HTML crudo.
- [ ] Un cambio del texto en la base de datos se ve sin volver a desplegar la página.

### Fallos

- [ ] Ante un fallo de red o del servidor, el navegador reintenta hasta 2 veces, con esperas de 0,5 y 1,5 segundos y un máximo de 8 segundos por intento; los errores de validación no se reintentan.
- [ ] Si el fallo continúa, se muestra un mensaje claro con el botón "Reintentar"; el orbital anterior sigue visible, y en la primera carga se muestra solo el mensaje.
- [ ] La página no reintenta sus llamadas al servicio de cálculo.
- [ ] El servicio de cálculo rechaza las peticiones que no llevan el secreto compartido.

### Diseño y tamaño

- [ ] La página sigue el `code.html` de `ultima_v4`, se ve completa en 1920×1080 y se adapta a otros tamaños de pantalla de escritorio.
- [ ] No hay llamadas a recursos externos: Tailwind, fuentes e iconos se sirven desde el propio servidor.
- [ ] Hay selectores de n y l, indicador de carga y pantalla de error con "Reintentar", que el diseño original no tenía.

## Riesgos aceptados

- **Cuota gratuita de Neon:** puede agotarse y dejar sin datos al sitio hasta el mes siguiente (ADR 0016). Se vigila el consumo.
- **Registros de Vercel:** duran 1 hora, por lo que los errores nocturnos no se podrán consultar (ADR 0021).
- **Solo orbitales con m = 0:** el estudiante no verá p_x, p_y ni los d con otras orientaciones (ADR 0012).
- **Ornamento con afirmaciones físicas incorrectas:** elementos como "[NO DEGENERADO]" o un potencial fijo pueden llegar a la página y confundir al estudiante (ADR 0018).
- **Selectores bloqueados:** cada cambio se siente más lento, sobre todo en la primera consulta tras inactividad (ADR 0019).

## Riesgos técnicos abiertos

- **Límites de Vercel (verificados en la documentación oficial):** en el plan gratuito (Hobby), una función de Python admite hasta 500 MB sin comprimir (250 MB las demás), 300 s de duración máxima, 2 GB de memoria con 1 vCPU y 4,5 MB de carga útil en la petición o la respuesta. FastAPI es compatible: Vercel lo detecta cuando figura en `requirements.txt` o `pyproject.toml` y carga un archivo de entrada con la variable `app` (por ejemplo `app.py`). Python 3.12 es la versión por defecto. Las funciones en el directorio `/api` están documentadas como soporte para proyectos existentes. Pendiente de comprobar: el tamaño real de NumPy, SciPy y scikit-image en Linux, y que el paquete incluya solo lo necesario, porque Python no reduce el paquete automáticamente (incluye todos los archivos alcanzables en la compilación).
- **Módulo de cálculo nuevo sin pruebas:** solo `physics.py` tiene pruebas; la extracción de anillos y el formato compacto deben probarse al escribirlos, y debe fijarse la malla (96 o 110 puntos).
- **Neon:** debe verificarse si el plan gratuito permite crear dos bases o ramas y cómo se ejecuta el script de carga sin guardar credenciales en el repositorio.
- **Renderizado dinámico:** Next.js puede generar la página estática; si es así, los cambios del texto no se verán sin desplegar.
- **Invalidación de la versión:** subir la versión del algoritmo en la dirección es manual; si se olvida, se sirven datos antiguos.
- **Rendimiento del canvas 2D:** con n = 4 y 5 hay muchos anillos; debe medirse al implementar.
- **Pendientes del PRD:** hay que actualizar `PRD.md`: m fijo en 0 y sin selector, el criterio de tiempo del ADR 0013 y los demás puntos `REVISAR` abiertos.

## Mejoras de implementación aceptadas (sugerencias de la revisión)

- **S1:** definir la conexión de Prisma con Neon y el tipo de columna de los anillos al implementar.
- **S2:** el contrato de la API precisa los grupos envolvente y núcleo, las unidades y la cuantización.
- **S3:** las escrituras en la caché son de tipo "insertar o actualizar", para tolerar dos consultas simultáneas.
- **S4:** el secreto compartido define el nombre de la cabecera, una comparación en tiempo constante y rotación con dos valores.
- **S5:** se quitan del visor las funciones que el PRD excluye (velocidad de giro y otras) y se define el giro del eje Z.
- **S6:** resuelta en el ADR 0022.

## Nota

Este documento es un borrador estructurado: la revisión real (ambigüedades, números y bordes) sigue siendo del humano.
