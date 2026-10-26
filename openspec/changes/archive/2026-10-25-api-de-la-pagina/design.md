# Design

## Context

La página (`web/`, Next.js 16 con App Router) tiene los repositorios `obtenerOrbital`/`guardarOrbital` y `listarSecciones` (ítem #4), un cliente de base de datos perezoso con errores genéricos y la validación de dominio (`validarDominioOrbital`). El servicio de cálculo (FastAPI) expone `GET /orbital?n=&l=` y exige la cabecera `X-Servicio-Secreto`; devuelve `{n, l, version, extension, envolvente, nucleo}` o un error `{"error": {"codigo", "mensaje"}}`. Las decisiones relevantes son: el navegador solo habla con la página (ADR 0003), caché inmutable para orbitales con la versión en la dirección (ADR 0013), caché breve para el contenido (ADR 0023), la página no reintenta al servicio (ADR 0020) y errores sin datos internos (ADR 0003 y 0010). El archivo `web/datos/orbitales.json` guarda la versión vigente del algoritmo. Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Dos consultas pequeñas, previsibles y fáciles de probar sin red ni servicios reales.
- Que ningún error filtre direcciones, credenciales o trazas.

**Non-Goals:**
- Reintentos (los hace el navegador), cualquier uso desde la interfaz, autenticación de usuarios y despliegue.

## Decisions

**D1. Rutas.** `GET /api/orbital?n=..&l=..&v=..` y `GET /api/contenido`, como manejadores de ruta de Next.js (`web/src/app/api/orbital/route.ts` y `.../contenido/route.ts`) forzados a ejecutarse en el servidor (sin generación estática). La versión va como parámetro `v` de la dirección: es parte de la clave de caché del navegador y del CDN, que es lo que exige el ADR 0013. Alternativa: la versión como segmento de la ruta (`/api/orbital/1`), equivalente; se prefiere el parámetro por simplicidad.

**D2. Lógica fuera de las rutas, con dependencias inyectables.** `web/src/lib/api/orbital.ts` contiene el caso de uso (`atenderOrbital(parametros, deps)`) y recibe como dependencias la lectura, la escritura, la llamada al servicio y la versión vigente. Las rutas solo traducen la petición y la respuesta. Así las pruebas unitarias usan dependencias falsas y las de integración usan la base real y un servidor HTTP falso que imita al servicio. Alternativa: probar solo a través de las rutas (más acoplado y lento).

**D3. Orden de las comprobaciones.** Versión → validación de n y l → lectura en base de datos → si falta, llamada al servicio → guardar (sin bloquear la respuesta si falla) → respuesta. La versión se comprueba primero porque no cuesta nada y evita guardar datos con versiones antiguas.

**D4. Cliente del servicio (`web/src/lib/api/servicio.ts`).** Usa `fetch` con `AbortController` y un tiempo máximo de 20 segundos, una sola llamada, la cabecera `X-Servicio-Secreto` con `SECRETO_SERVICIO` y la dirección base de `URL_SERVICIO_CALCULO`. Comprueba que la respuesta tenga la forma esperada y que n, l y versión coincidan con lo pedido; cualquier otra cosa (error HTTP, tiempo agotado, respuesta mal formada, versión distinta) es `servicio_no_disponible` (502) con un mensaje genérico. Si falta la dirección o el secreto, el error es `configuracion_incompleta` (500) y el mensaje nombra la variable, sin ningún valor. La respuesta del servicio no se reenvía tal cual en los errores.

**D5. Códigos de error.** `orbital_invalido` (400), `version_no_vigente` (400, el mensaje incluye la versión vigente), `servicio_no_disponible` (502), `bd_no_disponible` (503), `configuracion_incompleta` (500) y `error_interno` (500), todos en el formato `{"error": {"codigo", "mensaje"}}` y con `Cache-Control: no-store`. Un manejador general captura lo inesperado sin exponer el texto de la excepción.

**D6. Cabeceras de caché.** Orbital con éxito: `Cache-Control: public, max-age=31536000, immutable`. Contenido: `public, max-age=60, s-maxage=60, stale-while-revalidate=300` (ADR 0023). Errores: `no-store`.

**D7. Base de datos.** Un fallo de lectura es `bd_no_disponible` y no se llama al servicio (ADR 0003: un fallo de la base se distingue del de cálculo). Un fallo al guardar un orbital recién calculado no cambia la respuesta (la caché es una optimización); se registra con un mensaje genérico en la salida de errores, sin datos de conexión. Los repositorios ya encapsulan los errores como "Error de conexión con la base de datos".

**D8. Versión vigente.** `web/src/lib/api/version.ts` exporta `VERSION_ALGORITMO_VIGENTE = "1"`. Una prueba compara esa constante con `web/datos/orbitales.json`; si se regenera con otra versión, la prueba obliga a actualizarla. Alternativa: leer la versión del archivo en tiempo de ejecución (acopla la ejecución a un archivo de carga y esconde el cambio).

**D9. Pruebas.** Unitarias con dependencias falsas (orden de comprobaciones, cabeceras, códigos y que ningún cuerpo de error contiene el secreto ni las direcciones). De integración, con `DATABASE_URL_PRUEBAS` y un servidor HTTP falso de Node que cuenta las llamadas y comprueba la cabecera del secreto: primera consulta calcula y guarda, segunda se atiende sin llamar al servicio, el servicio caído o lento da 502 tras una sola llamada, la base caída da 503, y la consulta de contenido devuelve el orden correcto. La verificación con el servicio FastAPI real y la base local la hace quien orquesta.

## Risks / Trade-offs

- **Dos consultas simultáneas del mismo orbital que falta** → ambas llaman al servicio y ambas guardan; es inocuo (la escritura es "insertar o actualizar") y raro; se acepta.
- **El tiempo máximo de 20 s del servicio supera los 8 s por intento del navegador (ADR 0020)** → el navegador abandona antes; la función de Vercel puede seguir calculando y guardar el resultado, de modo que el siguiente intento lo encuentra en la base. Se acepta y se anota para el ítem #9.
- **`/api/contenido` consulta la base una vez por minuto y punto de presencia** → dentro de lo previsto en el ADR 0023.
- **La caché inmutable del navegador no se puede invalidar** → por eso la versión va en la dirección.

## Open Questions

- Ninguna que cambie las specs, el enfoque o las tareas.
