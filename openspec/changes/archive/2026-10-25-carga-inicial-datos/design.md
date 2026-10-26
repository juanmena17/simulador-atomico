# Design

## Context

El módulo `orbitales` (Python) calcula los orbitales y los entrega en un formato JSON; la base de datos (ítem #4) guarda cada orbital en `OrbitalCalculado` (clave n, l y versión, con el resultado completo en una columna JSONB) y las secciones en `SeccionTeorica`. Los repositorios `guardarOrbital` y `guardarSeccion` ya hacen "insertar o actualizar". Por el ADR 0005 solo la página accede a la base de datos, de modo que el servicio y el script de Python no deben tener credenciales. El texto provisional de las tres secciones está en `web/src/data/theory-sections.ts` (lo usa hoy el panel teórico). `tsx` está instalado en `web/` para ejecutar scripts de TypeScript. Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Una carga que se pueda repetir en cualquier base (local o Neon) con un solo comando y que no deje datos a medias.
- Que los datos cargados no puedan quedar desfasados del cálculo sin que una prueba lo avise.

**Non-Goals:**
- El texto teórico definitivo, la API, el despliegue y la ejecución contra Neon real.

## Decisions

**D1. Dos pasos con un archivo intermedio versionado.** Un script de Python (`servicio-calculo/scripts/exportar_orbitales.py`) calcula los 15 orbitales con `calcular_orbital` y escribe `web/datos/orbitales.json`: `{"version": "<VERSION_ALGORITMO>", "orbitales": [ {resultado}, ... ]}` en orden (n, l), con JSON compacto y claves ordenadas, de modo que el archivo sea determinista. Un script de TypeScript de la página lee ese archivo y lo carga. Así Python no necesita credenciales (ADR 0005), la carga en Neon no necesita Python ni un servicio en ejecución, y el contenido cargado es exactamente el que está en el repositorio. Alternativas: que el script de TypeScript llame al servicio por HTTP (necesita el servicio levantado y el secreto compartido) o que Python escriba directo en la base (rompe el ADR 0005).

**D2. Prueba contra el desfase.** Una prueba de Python (`tests/test_exportacion.py`) calcula los 15 orbitales y los compara con `web/datos/orbitales.json`; si difieren, falla con el mensaje "regenera web/datos/orbitales.json con scripts/exportar_orbitales.py". También comprueba que la versión del archivo es `VERSION_ALGORITMO`.

**D3. Secciones en Markdown.** Tres archivos en `web/datos/secciones/` (`01-estructura-atomica.md`, `02-mecanica-clasica.md`, `03-mecanica-cuantica.md`), cada uno con una cabecera mínima (clave, orden y título) y el cuerpo en Markdown con el texto provisional ya existente (la cita como bloque de cita y la ecuación como línea de texto Unicode). La clave es estable (`estructura-atomica`, `mecanica-clasica`, `mecanica-cuantica`). El ítem #10 reemplazará el contenido sin tocar la carga. La cabecera se analiza con un lector propio mínimo (líneas `clave: valor` entre marcas `---`), sin dependencias nuevas.

**D4. Biblioteca de carga en `web/src/lib/carga/`.** Tres piezas: `leer-origenes.ts` (lee y analiza los archivos), `validar.ts` (valida todo, sin tocar la base) y `cargar.ts` (escribe). La validación comprueba: 15 orbitales exactos, uno por combinación (n, l) del dominio, sin repetidos, todos con la misma versión y con la forma esperada del resultado (extensión numérica, grupos envolvente y núcleo con `p` y `l`); y secciones con clave, orden entero positivo único, título y contenido no vacíos. Los errores listan todos los problemas encontrados. Reutiliza `validarDominioOrbital` del ítem #4.

**D5. Transacción única.** `cargar.ts` escribe orbitales y secciones dentro de una sola transacción (`$transaction` con el cliente de Prisma); si algo falla, no se guarda nada. Cuenta cuántas filas son creadas y cuántas actualizadas (comparando con las existentes antes de escribir, dentro de la misma transacción). Los repositorios existentes no se modifican; la carga usa directamente el cliente con la misma lógica de "insertar o actualizar".

**D6. Comando.** `web/scripts/cargar-datos.ts` ejecutado con `tsx` mediante el script de npm `db:cargar`. Usa `DATABASE_URL` (como la aplicación), imprime el resumen en español (orbitales y secciones creados y actualizados) y sale con código distinto de cero ante cualquier error, sin mostrar la dirección de conexión. No acepta la dirección por argumento. Alternativa: un modo `--simular` que no escriba; no se incluye porque la carga es idempotente.

**D7. Pruebas.** Unitarias sin base de datos: lectura y validación (15 correctos pasan; fuera de dominio, versiones mezcladas, repetidos, faltantes, secciones inválidas fallan listando los problemas). De integración (solo con `DATABASE_URL_PRUEBAS`, en un esquema propio como las del ítem #4): base vacía queda con 15 y 3; segunda ejecución sin cambios de recuento; contenido de cada orbital y de cada sección idéntico al origen; modificar un origen actualiza sin duplicar; un origen inválido aborta sin escribir; y un fallo simulado a mitad de la escritura no deja datos (todo o nada).

**D8. Regeneración documentada.** El README explica cuándo regenerar el archivo (al subir la versión del algoritmo) y el orden: exportar, probar y cargar.

## Risks / Trade-offs

- **Archivo de datos de unos 0,6 MB en el repositorio** → es el costo de no necesitar Python al cargar; la prueba de desfase evita que se desactualice.
- **Cargar en Neon con una versión nueva deja las filas de la versión anterior** → no se borran (la clave incluye la versión, ADR 0013); limpiar versiones antiguas queda fuera de este cambio y se anota en el README.
- **Lector de cabecera propio** → es mínimo y está cubierto por pruebas; evita una dependencia para tres archivos.
- **El texto provisional se carga tal cual** → no es contenido revisado; el ítem #10 lo sustituye.

## Open Questions

- Ninguna que cambie las specs, el enfoque o las tareas.
