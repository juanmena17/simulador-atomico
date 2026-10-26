# Simulador atómico — proyecto base

## Selección de orbitales

La página permite elegir n y l mediante botones y muestra el orbital correspondiente. Consulta `/api/orbital` usando la versión vigente del algoritmo. El servicio de cálculo y la base de datos deben estar disponibles y contener datos; para cargar los datos iniciales usa `npm run db:cargar`. Sin ellos, el visor queda vacío hasta que se implemente el manejo de errores del ítem #9.

Cascarón del proyecto web. Usa Next.js con App Router, TypeScript, Tailwind CSS v4 y fuentes locales.

## Visor orbital de desarrollo

Fuera de producción, `/dev/visor` muestra un orbital real desde `datos/orbitales.json`. Acepta `n` y `l` para elegirlo, `rx`, `ry` y `rz` para la orientación inicial en grados, y `medir=1` para medir 240 cuadros. Ejemplo: `/dev/visor?n=3&l=2&rx=25&ry=-30&rz=0&medir=1`. Esta ruta no existe en producción.

Para verlo abre `http://localhost:3000/dev/visor?n=3&l=2` con `npm run dev`. Usa `localhost` y no `127.0.0.1`: en desarrollo Next.js bloquea los recursos de otro origen y el visor no se hidrata (queda vacío). Se gira arrastrando con el botón principal del ratón; arrastrar en círculo cerca del borde gira alrededor del eje de la vista.

## Fallos y reintentos

Las consultas de orbitales se reintentan hasta tres intentos. Entre ellos se esperan 500 ms y 1500 ms; cada intento tiene un máximo de 8 segundos y la consulta completa un tope de 15 segundos. Se reintentan fallos de red, tiempo agotado y errores del servidor; no se reintentan errores de validación ni respuestas inválidas.

Si la consulta no puede completarse, se mantiene visible el orbital anterior y se muestra un mensaje claro, sin detalles técnicos. El botón «Reintentar» repite la última elección con la misma política.

## Contenido teórico

El panel obtiene sus secciones desde `/api/contenido`; la API usa los datos cargados en la base de datos y los conserva en caché durante 60 segundos. Para cambiar el texto, edita `web/datos/secciones/*.md` y ejecuta `npm run db:cargar` desde `web/`.

El contenido admite Markdown y fórmulas entre `$...$` o `$$...$$`. No se permite HTML crudo.

## Prueba E2E con Playwright

La prueba `web/test/flujo-critico.spec.ts` recorre el flujo crítico en Edge: panel teórico con fórmulas, orbital inicial, cambio de `n` y `l`, y combinaciones bloqueadas. Es de solo lectura.

```bash
npm run test:e2e                      # levanta la app local (build + start en el puerto 3600); requiere DATABASE_URL, URL_SERVICIO_CALCULO y SECRETO_SERVICIO en el entorno
E2E_BASE_URL=https://simulador-atomico-web.vercel.app npm run test:e2e   # contra el sitio desplegado, sin servidor local
npm run test:e2e:informe              # abre el informe HTML
```

Los selectores usan coincidencia exacta (`exact: true`): sin ella Playwright compara por subcadena y una prueba puede pasar aunque el texto esté mal.

## Comandos del entorno

Para las rutas de API define en el entorno del terminal `URL_SERVICIO_CALCULO` y `SECRETO_SERVICIO`. En local, usa `URL_SERVICIO_CALCULO=http://127.0.0.1:8000` y el mismo secreto configurado en el servicio; nunca guardes el secreto en el repositorio.

Con `npm run dev` puedes consultar:

```bash
curl "http://localhost:3000/api/orbital?n=3&l=2&v=1"
curl "http://localhost:3000/api/contenido"
```

Instalar dependencias:

```bash
npm install
```

Desarrollo:

```bash
npm run dev
```

Pruebas:

```bash
npm test
```

La prueba del tema compilado requiere ejecutar antes `npm run build`; si no existe `.next`, fallará con un mensaje indicando ese orden.

Lint:

```bash
npm run lint
```

Construcción:

```bash
npm run build
```

Carga inicial de datos (ejecutar en este orden desde el repositorio):

```bash
cd ../servicio-calculo
./.venv/Scripts/python.exe scripts/exportar_orbitales.py
cd ../web
npm test
npm run db:cargar
```

En `web/`, `npm run db:cargar` usa `DATABASE_URL` definido en el entorno del terminal, tanto para la base local como para Neon. Nunca se escribe la variable en un archivo. La carga es repetible y no borra versiones antiguas del algoritmo.

Base de datos local:

```bash
docker run --name simulador-atomico-pg -e POSTGRES_PASSWORD=contraseña-local -e POSTGRES_DB=simulador -p 5440:5432 -d postgres:17
export DATABASE_URL='postgresql://postgres:<contraseña-local>@localhost:5440/simulador'
export DATABASE_URL_UNPOOLED="$DATABASE_URL"
export DATABASE_URL_PRUEBAS="$DATABASE_URL"
npm run db:generar
npm run db:migrar
npm run db:migrar:dev
npm test
```

`DATABASE_URL` se usa por la aplicación; `DATABASE_URL_UNPOOLED` por Prisma CLI y `DATABASE_URL_PRUEBAS` activa las pruebas de integración. No se guardan en archivos del repositorio. Para Neon, define `DATABASE_URL_UNPOOLED` de Neon en el entorno del terminal y ejecuta `npm run db:migrar`; no la pongas en un archivo del repositorio.

La página es deliberadamente mínima en este grupo; los componentes del cascarón se añadirán en los grupos siguientes.
