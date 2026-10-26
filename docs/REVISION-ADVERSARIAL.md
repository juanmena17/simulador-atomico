# Revisión adversarial: Simulador atómico (TECH-DESIGN + ADR 0001–0010)

**Condiciones de la revisión.** La hizo una sesión nueva, sin el historial de cómo se produjo el diseño. Entradas leídas completas: `TECH-DESIGN.md`, los ADR 0001 a 0010, `PRD.md`, `design/stitch/ultima_v4/DESIGN.md` y `code.html`. También se revisó el código heredado en `D:\DMC\Projects\visualAtoms` (`physics.py`, `fields.py`, `slices.py`, `rings.py`, `web/export_web.py`, `web/atomo.template.html`, `web/orbitals.json`, `pyproject.toml`, `tests/`). Se ejecutó `export_web.build()` en local para medir tiempos y tamaños.

**Qué se verificó y qué no.**

- **Verificado en la documentación oficial de Vercel** (`/docs/functions/limitations`, `/docs/functions/runtimes/python`, `/docs/functions/runtimes/python/api-directory` y `/docs/limits`, consultadas el 2026-10-24):
  - Las funciones en Python admiten hasta **500 MB sin comprimir**. Las demás tienen 250 MB.
  - En el plan Hobby, con Fluid compute, la duración máxima es de **300 s** (también es el valor por defecto) y la memoria es de **2 GB / 1 vCPU**.
  - El cuerpo de una petición o de una respuesta no puede pasar de **4,5 MB**.
  - Los registros de ejecución se guardan **1 hora** en Hobby.
  - Hobby **no puede conectar repositorios de Git que pertenezcan a organizaciones**.
  - Para aplicaciones Python nuevas, Vercel recomienda un preset de framework, o **Services** si se combina Python con otro framework en un mismo proyecto. Los archivos `/api/*.py` con `BaseHTTPRequestHandler` se documentan como soporte para "existing projects".
- **Verificado en la documentación de Neon** (`/docs/introduction/plans`): el plan Free da **1 GB** de almacenamiento por proyecto y **100 CU-hora al mes**. La base se suspende tras **5 minutos sin uso**, y en Free eso **no se puede desactivar**. Si se agotan las CU-hora, la base queda suspendida hasta el siguiente periodo de facturación.
- **Medido en local** (Windows, Python 3.11, venv del proyecto heredado):
  - Importar numpy, scipy y skimage tarda **1,62 s**.
  - `export_web.build()` tarda entre **0,32 y 0,44 s** por orbital, con malla de 110 puntos.
  - Cada orbital ocupa entre **18 y 107 KB**. Como máximo tiene **208 anillos** y **13 730 puntos**.
  - `orbitals.json` tiene 75 entradas y pesa 4,4 MB.
  - En disco: numpy, scipy, skimage y sus dependencias transitivas (networkx, pillow, imageio, tifffile) ocupan **unos 260 MB**. VTK más PyVista ocupan **unos 300 MB**, opencv **113 MB**, matplotlib **33 MB**, y todo `site-packages` **539 MB**.
- **No verificado:**
  - El tamaño real de las ruedas Linux en el entorno de Vercel. Las cifras anteriores son de Windows y, en Linux, scipy suele ocupar algo menos.
  - El tiempo de arranque en frío de una función Python en Vercel.
  - La latencia real de reanudación de Neon tras la suspensión.
  - Los términos de uso del plan Hobby (uso no comercial), que no se consultaron.

---

## Crítico

### C1. El mapa de reutilización del ADR 0006 es incorrecto: los módulos citados arrastran PyVista/VTK y matplotlib, y el formato del contrato lo produce otro código, sin pruebas

**Objetivo:** ADR 0006, ADR 0007, ADR 0001 (consecuencias) y TECH-DESIGN, apartado "Arquitectura de componentes".

**Problema.**

1. `slices.py` hace `import pyvista as pv` en la primera línea y devuelve `pv.PolyData`. `rings.py` hace `from matplotlib import pyplot as plt` también al inicio. El ADR dice que se reutilizan `slices.py` y `rings.py` "con scikit-image" y que se excluye PyVista. Es falso: importar `slices.py` exige PyVista y, con él, VTK (unos 300 MB). Importar `rings.py` exige matplotlib.
2. `pyproject.toml` declara como dependencias del paquete `opencv-python`, `pillow` y `matplotlib`. Si el servicio instala el paquete `visualatoms` tal cual, ocupa unos 540 MB y **supera el límite de 500 MB**, ya verificado, de las funciones Python.
3. El formato compacto del contrato (int16 en base64, grupos `e`/`c` y extensión `x`) no sale de `slices.py` ni de `rings.py`. Sale de `web/export_web.py`, un script con sus propias funciones:
   - su propio `real_field`, `threshold`, `loops_for`, `resample` y `pack`;
   - `N_GRID = 110` y `fraction = 0.985`, no la malla de 96 que cita el ADR;
   - un `sys.path.insert` y un `main()` que escribe un archivo.

   `rings.py` usa además otro método: curvas meridianas en (ρ, z) con simetría de revolución, que no sirve para el modo real con m ≠ 0. Ninguna prueba de `tests/` cubre `export_web.py`.

**Por qué importa.**

- Si se implementa lo que dice el ADR, el despliegue falla por tamaño o por imports, o el servicio genera anillos con un algoritmo distinto del que produjo la caché sembrada. En ese caso la caché mezcla dos geometrías según el orbital haya venido de la semilla o del cálculo en vivo.
- La afirmación "código ya validado con pruebas" vale para `physics.py` y `fields.py`, pero no para el camino que produce lo que ve el usuario.

Hay que rehacer el ADR 0006:

- extraer `export_web.build` a un módulo importable y sin efectos al importarse;
- escribir un `requirements.txt` propio del servicio con solo numpy, scipy y scikit-image;
- añadir pruebas del formato.

### C2. El modo (complejo/real) y el número m entran en el contrato, el estado y los criterios sin que el PRD ni el diseño los definan, y la caché no normaliza las claves

**Objetivo:** ADR 0002, 0003 y 0008, criterios "Ver un orbital" y "Cambiar n, l, m", y PRD (alcance y `REVISAR` sobre m).

**Problema.**

- **El PRD no lo pide.** Solo habla de seleccionar n y l. Deja como `REVISAR` si m se puede elegir, y no menciona el modo real/complejo en ningún punto.
- **El diseño (`code.html`) no tiene controles.** No hay ningún control para elegir n, l, m ni el modo: las tres tarjetas inferiores solo muestran valores.
- **Los ADR los dan por resueltos.** Ponen m y el modo en el contrato público, en el estado de la página y en el estado inicial ("modo complejo"). Es una decisión de producto tomada en el diseño técnico.
- **Consecuencia pedagógica que nadie registró.** En modo complejo, |ψ|² con m ≠ 0 es axialmente simétrico: 2p con m = ±1 se ve como una rosquilla, no como las "pesas" p_x y p_y de los libros. El objetivo del PRD es "reconocer la forma de los orbitales s, p, d y f". El criterio "número de lóbulos y nodos coincide con la referencia teórica para las 15 combinaciones (n, l)" no se puede verificar, porque el número de lóbulos depende de m y del modo, no solo de (n, l).
- **Hueco funcional en la caché.** La semilla contiene exactamente los 75 orbitales visualmente distintos: modo complejo con m ≥ 0 y modo real con m ≠ 0. El visor heredado normaliza la clave en el cliente (`shapeFor`: complejo usa |m|, y real con m = 0 pasa a complejo). El modelo de datos y el contrato del ADR 0002 y 0003 no dicen nada de esa normalización. Con el diseño actual, una petición válida como (2, 1, −1, complejo) o (2, 1, 0, real) **falla en la caché**, dispara el servicio de cálculo y guarda un duplicado. Ese duplicado puede ser distinto si se usa el código de C1.

**Por qué importa.** El flujo principal, cambiar los números cuánticos, no se puede implementar sin tomar antes decisiones de producto: si m se elige o queda fijo, si el modo existe y cuál es el predeterminado. Mientras tanto, el criterio de éxito central del PRD no es comprobable.

### C3. El diseño rebaja por su cuenta el criterio de 1 s del PRD, y ni siquiera la ruta con caché lo garantiza: la lectura depende de Neon, que se suspende

**Objetivo:** TECH-DESIGN ("Criterios de aceptación", "Riesgos": tiempo del primer orbital), ADR 0002, 0003 y 0005.

**Problema.**

- **El criterio cambia sin aprobación.** El PRD fija como criterio de éxito que el orbital se actualice en menos de 1 s al cambiar n o l. El TECH-DESIGN lo sustituye por "1 s si está en caché, 5 s si no" y pide que sea el PRD el que se adapte.
- **El camino de 5 s es evitable.** Con la normalización de C2, los 75 orbitales sembrados son **todo** el dominio posible (n ≤ 5 es un límite duro de la API), así que en régimen normal nunca habría un fallo de caché.
- **La ruta con caché tampoco cumple siempre.** En el plan Free, Neon se suspende tras 5 minutos sin actividad y no se puede desactivar. En un producto educativo de poco tráfico, la primera petición de casi cada sesión, o la de un estudiante que pasa más de 5 minutos leyendo el panel teórico, encadena varios pasos:
  - arranque en frío de la función de Next.js;
  - arranque de Prisma;
  - reanudación de Neon;
  - la consulta.

  No se midió, pero es plausible que esa suma pase de 1 s.
- **Falta una decisión.** Ningún ADR decide caché HTTP ni de CDN, aunque los orbitales son **inmutables** y se podrían servir con `Cache-Control: s-maxage` larga, o generarse de forma estática en el build y servirse sin tocar la base.

**Por qué importa.** Esto contradice un criterio de éxito explícito del PRD. Además, la ruta sobre la que se construyó la complejidad (dos saltos, secreto compartido, reintentos) es justo la que no hace falta, mientras que la ruta frecuente no tiene ninguna protección contra la latencia.

---

## Advertencia

### A1. La cuota de cómputo de Neon Free puede tumbar el sitio entero a mitad de mes

**Objetivo:** ADR 0002 y ADR 0005 (consecuencias) y TECH-DESIGN ("Almacenamiento en Neon").

**Problema.** El TECH-DESIGN solo vigila el almacenamiento, y sin motivo: 4,4 MB es el 0,4 % de 1 GB. Omite que cada visita, cada cambio de orbital y cada carga del panel teórico hace una consulta a Neon. Neon Free da 100 CU-hora al mes. Una base que pase el mes entero despierta a 0,25 CU consume unas 180 CU-hora. Basta con que haya tráfico, por ejemplo un bot o un monitor, menos de cada 5 minutos para agotar la cuota hacia el día 16 o 17. A partir de ahí Neon suspende la base hasta el mes siguiente y **dejan de funcionar a la vez el visor y el panel teórico**. El reintento del ADR 0009 no lo resuelve.

**Por qué importa.** Es una consecuencia de segundo orden de poner la base en la ruta de cada lectura, y ningún ADR la menciona. La misma caché de CDN o generación estática de C3 la elimina casi por completo.

### A2. ADR 0001: la separación en dos proyectos no tiene justificación, y Vercel admite oficialmente la alternativa que se descartó

**Objetivo:** ADR 0001 y, por arrastre, ADR 0003 y ADR 0010.

**Problema.** La alternativa "un solo proyecto con la página y una función en Python" se reconoce "viable y más simple", y se descarta solo porque "se prefirió separar responsabilidades". Eso no es un argumento de contexto. Vercel documenta **Services** para combinar un backend Python con otro framework en un mismo proyecto y dominio. La separación genera costos que el ADR no pondera:

- dos despliegues que pueden quedar desincronizados respecto al contrato interno;
- dos juegos de variables de entorno;
- el secreto compartido entero del ADR 0010, que en un solo proyecto podría no hacer falta;
- dos proyectos que conectar a Git, y en Hobby **no se pueden conectar repositorios de una organización de GitHub**, algo relevante si el código vive en la organización del curso.

Además, el ADR 0003 descarta la opción "solo precálculo" en parte porque "dejaba al segundo proyecto de Vercel sin sentido". Es un razonamiento circular: justifica una decisión con otra que es precisamente la que está en revisión.

**Por qué importa.** Se pagan complejidad y una superficie de seguridad que el tamaño del producto no pide.

### A3. ADR 0007: la razón para ir sin framework (poco margen de tamaño) no se sostiene, y la vía elegida está documentada como compatibilidad

**Objetivo:** ADR 0007 y TECH-DESIGN ("Límite de tamaño y de tiempo").

**Problema.** El ADR asume que "el margen es justo", partiendo de unos 180 MB sin verificar frente a un límite que tampoco se verificó. El límite real para Python es 500 MB. numpy, scipy y skimage, con sus dependencias transitivas, ocupan unos 260 MB en Windows. FastAPI o Flask añaden unos pocos MB. Por tanto, el principal motivo de la decisión es incorrecto.

Por otro lado, la documentación actual presenta los archivos `/api/*.py` con `handler(BaseHTTPRequestHandler)` como soporte para "existing projects", y recomienda presets de framework para aplicaciones nuevas.

En cuanto al tiempo, el riesgo abierto "el cálculo podría no entrar en el límite" queda resuelto: 0,3 a 0,45 s de cálculo más unos 1,6 s de import, frente a 300 s.

**Por qué importa.** La decisión puede seguir siendo razonable para un único punto de entrada, pero hay que justificarla con argumentos reales. El riesgo que el TECH-DESIGN deja abierto ya no es el tamaño de numpy y scipy, sino lo descrito en C1.

### A4. El contenido teórico: el modelo "orden, título, texto" no puede representar el diseño, el formato no está definido y la "edición sin desplegar" puede no funcionar

**Objetivo:** ADR 0002, TECH-DESIGN ("Modelo de datos" y criterio "se puede cambiar sin volver a desplegar").

**Problema.**

1. Cada sección de `code.html` tiene más que "un texto":
   - varios párrafos con dos estilos;
   - una cita destacada (Larmor);
   - un bloque de ecuación con pie ("i ℏ ∂Ψ/∂t = Ĥ Ψ");
   - fórmulas en línea con estilo propio (`Ψ(r, θ, φ)`);
   - un código de sección ("SEC-01") y un color de punto por sección.

   Con un único campo de texto plano, eso no se puede reproducir. Hace falta un formato (Markdown o un subconjunto de HTML). Si se guarda HTML, hay que sanearlo, o la base pasa a ser un vector de XSS.
2. No hay ninguna herramienta de edición. "Cambiar sin desplegar" significa, en la práctica, escribir SQL en la consola de Neon, y el PRD tampoco ha decidido quién redacta el texto.
3. Por defecto, Next.js (App Router) puede renderizar de forma estática en el build una página o ruta que lee la base. En ese caso, cambiar la fila **no** se refleja hasta el siguiente despliegue, lo que incumple el criterio de aceptación. Falta decidir la política de revalidación, sea dinámica o con `revalidate`.

**Por qué importa.** El único motivo para tener la segunda tabla, editar sin desplegar, puede no cumplirse, y su contenido no cabe en el esquema.

### A5. El diseño tiene muchos más datos de los que el TECH-DESIGN clasifica, y le faltan controles y estados que los ADR dan por existentes

**Objetivo:** TECH-DESIGN ("Elementos del diseño que no generan datos"), ADR 0002, ADR 0008 y ADR 0009.

**Problema.** El TECH-DESIGN solo clasifica "COH 99.98%", "LIVE 60 FPS" y "V1.04".

Elementos de `code.html` que siguen sin decidir si son datos, valores derivados o decoración:

- "ESTADO: RESONANTE", "REF: Q-MEC.01", "CANAL: DE BROGLIE // LECTURA ACTIVA", "VISTA: ISOSUPERFICIE PROBABILÍSTICA" y "Ψ*Ψ dV = 1.000".
- "MODELO: HIDROGENOIDE [Z=1]": el código admite Z, pero el contrato no.
- La lectura de ángulos **X/Y/Z**: implica obtener ángulos de Euler a partir de la matriz de giro libre acumulada, cosa que el visor heredado no hace.
- "ESCALA: 100 pm": requiere convertir la extensión, en a₀, a picómetros, y una barra de escala dinámica.
- "POTENCIAL: −13.6 eV": está fijo, debería ser −13,6/n² eV, y además es energía, no potencial.
- "CAPA K".
- Los descriptores por número: "[ENERGÍA BASE]", "[SIMETRÍA ESFÉRICA]", "[NO DEGENERADO]" y "B-FIELD = 0".
- Las barras de progreso de cada número cuántico.

Algunos de esos valores son **físicamente incorrectos** para el hidrógeno: los estados son degenerados en l y m, así que "[NO DEGENERADO]" es falso, y −13,6 eV solo vale para n = 1. En un producto cuyo criterio de éxito es "mostrar la estructura atómica correctamente", eso es un riesgo.

Al revés, el diseño **no tiene**:

- selectores de n, l y m;
- un conmutador de modo;
- un estado de carga;
- el mensaje de error con el botón "Reintentar" del ADR 0009.

Además, el botón "tune" sugiere ajustes de visualización que el PRD excluye, y los anillos animados con CSS sugieren un giro automático que el PRD también deja fuera.

**Por qué importa.** Sin esta clasificación, quien implemente tendrá que inventar datos o copiar valores incorrectos.

### A6. El estado del cliente no prevé respuestas desordenadas ni una caché local

**Objetivo:** ADR 0008.

**Problema.** El ADR trata el estado como "variables en memoria" y no considera la concurrencia en el navegador. Si el usuario cambia n y luego l rápidamente, se lanzan dos peticiones. Si la primera llega después, el visor muestra un orbital que no corresponde a la selección. Falta decidir:

- la cancelación de peticiones (AbortController) o un identificador de petición;
- un mapa en memoria de los orbitales ya descargados, que haría instantáneo volver a una selección anterior y ayuda directamente con el criterio de 1 s.

**Por qué importa.** Es un fallo de corrección visible, fácil de introducir y difícil de reproducir en las pruebas manuales.

### A7. ADR 0009: la política de reintentos no está especificada y el caso de la primera carga queda sin cubrir

**Objetivo:** ADR 0009 y criterios "Fallos".

**Problema.**

- **No se dice qué errores se reintentan.** Un 400 por combinación inválida no debe reintentarse.
- **No hay tiempos de espera ni pausa entre intentos.** Tampoco se dice si la página reintenta además su llamada al servicio. Si se reintenta en el navegador y en la página a la vez, los intentos se multiplican: 3 × 3.
- **La primera carga no tiene respaldo.** El criterio "el orbital anterior sigue visible" no se puede cumplir cuando la primera carga de la página falla, porque no hay orbital anterior. Falta definir ese estado vacío.
- **El motivo del descarte no se sostiene.** La alternativa "respaldo con los 75 orbitales en la página" se descarta porque "deja de hacer indispensable al servidor, lo que choca con el PRD". El PRD no exige que el servidor sea indispensable: exige que el cálculo no dependa del computador del usuario.

**Por qué importa.** Así como está, el ADR es una intención, no una decisión que se pueda probar.

### A8. Faltan áreas de decisión enteras: despliegue/CI, migraciones, carga inicial, invalidación y observabilidad

**Objetivo:** TECH-DESIGN en su conjunto, ADR 0002 y ADR 0005.

**Problema.**

- **Carga inicial.** No se dice quién siembra los 75 orbitales, con qué código (el de C1), ni cómo se garantiza que las claves queden normalizadas (C2).
- **Migraciones.** No se dice dónde se ejecuta `prisma migrate deploy`: en el build de Vercel o a mano. Tampoco qué URL se usa: la directa para migrar y la del pooler para ejecutar.
- **Despliegues de vista previa.** No se dice si los despliegues de vista previa apuntan a la base de producción, ni si se usan ramas de Neon. Neon Free permite 10 ramas.
- **Invalidación.** Está marcada como riesgo, pero se resuelve casi gratis con una columna o clave de versión del algoritmo, y nadie lo decide.
- **Observabilidad.** Hobby guarda los registros solo 1 hora, y no hay ninguna monitorización. Si el proyecto Python deja de desplegarse, nadie se entera, porque en régimen normal nunca recibe llamadas (C3).

**Por qué importa.** Son justo los puntos donde un proyecto pequeño se rompe el día del despliegue o de la primera corrección de la física.

---

## Sugerencia

- **S1. ADR 0005 (Prisma con Neon en serverless).** Conviene especificar:
  - la conexión mediante el pooler de Neon, o el adaptador `@prisma/adapter-neon`, para no agotar conexiones;
  - el tipo de columna de los anillos: `bytea`, texto base64 o `jsonb` con los grupos `e`/`c`;
  - que Prisma añade tiempo al arranque en frío, lo que se suma a C3.

  Rechazar el controlador de Neon con SQL directo porque "no tiene migraciones" pesa poco para dos tablas casi estáticas, aunque elegir Prisma por la experiencia del equipo es legítimo.
- **S2. Contrato (ADR 0003).** Hacer explícito lo que el formato real ya contiene:
  - dos grupos de anillos, envolvente (`e`) y núcleo (`c`);
  - la extensión `x` en unidades de a₀ redondeada a 3 decimales;
  - la cuantización a int16 normalizada a [−1, 1].

  Sin esto, el "formato compacto" no es un contrato.
- **S3. Escrituras simultáneas en la caché.** Dos peticiones simultáneas por el mismo orbital ausente producen dos cálculos y dos inserciones. Hay que usar `upsert` o tolerar la violación de clave única.
- **S4. ADR 0010 (secreto compartido).** Conviene precisar:
  - enviar el secreto en una cabecera, nunca en la query string, para que no aparezca en los registros;
  - compararlo en tiempo constante;
  - aceptar dos valores durante una rotación, para no tener que desplegar los dos proyectos al mismo tiempo.
- **S5. ADR 0004 (trasladar el visor).** El visor heredado incluye giro automático, recorrido de estados, control de velocidad, zoom, brillo y transiciones con fundido. Varias de esas funciones las excluye el PRD de forma explícita, y el ADR debería decir que se quitan. Además, en el visor heredado el giro en Z se hace con un deslizador, no arrastrando. El criterio "girar en los tres ejes arrastrando" exige un giro tipo trackball, o aceptar que arrastrar en X/Y ya cubre todas las orientaciones.
- **S6. Diseño fuente de verdad.** `DESIGN.md` describe un tema oscuro para "físicos teóricos e investigadores", mientras que `code.html` es claro y el PRD apunta a estudiantes de introducción a la química. Además, `code.html` carga Tailwind por CDN y Material Symbols desde Google: hay que compilar Tailwind y alojar la fuente de iconos, no solo las tipografías. Conviene fijar qué archivo manda en los tokens de diseño.

---

## Lo que resistió el escrutinio

- **Tiempo de cálculo frente al límite de Vercel.** Medido: entre 0,32 y 0,44 s por orbital en caliente, más 1,6 s de import, frente a un máximo de 300 s en Hobby (verificado). La memoria de un orbital con malla de 110³ cabe de sobra en 2 GB. Este riesgo del TECH-DESIGN puede cerrarse.
- **Tamaño de numpy, scipy y scikit-image.** Unos 260 MB (Windows, con dependencias transitivas) frente a un límite de 500 MB para Python (verificado). Caben, **siempre que** se excluyan PyVista/VTK, matplotlib y opencv (ver C1).
- **Tamaño de las respuestas.** Entre 18 y 107 KB por orbital, muy por debajo del límite de 4,5 MB.
- **Almacenamiento en Neon.** 4,4 MB frente a 1 GB: no es un riesgo real (el riesgo es el cómputo, A1).
- **El navegador solo habla con la página (ADR 0003).** Es sólido: evita CORS, mantiene el servicio de cálculo detrás de la página y permite cambiar el contrato público sin tocar el interno.
- **Canvas 2D propio (ADR 0004).** Es proporcional. El caso más pesado tiene 208 anillos y 13 730 puntos, una carga baja para un canvas 2D. El riesgo de "migrar a Three.js" está sobredimensionado, aunque debe medirse con el brillo (`lighter` y trazo doble) activado.
- **Sin datos de usuario y con estado en memoria (ADR 0002 y 0008).** Es coherente con el "No alcance" del PRD, que excluye cuentas y progreso, salvo los huecos de concurrencia de A6.
- **El secreto compartido (ADR 0010)** es una protección proporcional para un servicio con un dominio cerrado (n ≤ 5). El abuso que puede hacer un tercero está acotado por la validación de rangos.
- **La física heredada (`physics.py`)** sí tiene pruebas frente a valores analíticos, y valida n, l y m antes de calcular.
