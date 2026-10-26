# Design

## Context

La página (`web/`, Next.js 16, TypeScript, Vitest) es el único componente que habla con la base de datos (ADR 0005). El proyecto `mimo_demo` del usuario ya usa Prisma 7 con Neon y sirve de referencia de configuración (`prisma.config.ts` con la URL del CLI, adaptador de controlador). Prisma 7 no carga el archivo `.env` por sí solo y exige un adaptador de controlador para PostgreSQL. Las dependencias `prisma`, `@prisma/client`, `@prisma/adapter-pg` y `pg` ya están instaladas en `web/`. El entorno local dispone de Docker con un contenedor de PostgreSQL 17 desechable (`simulador-atomico-pg`, puerto 5440, base `simulador`, contraseña de prueba falsa). Neon es la base de producción, que crea el usuario; este cambio no la toca. Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Esquema mínimo y migración inicial versionada; capa de acceso pequeña, probada contra PostgreSQL real.
- Que nada exija una conexión real para compilar la página (`npm run build`, `npm test` sin base).

**Non-Goals:**
- Cargar datos, rutas de API, caché HTTP, conexión a Neon y despliegue.

## Decisions

**D1. Dos modelos.** `OrbitalCalculado` con clave compuesta (`n`, `l`, `version`), la columna `datos` de tipo `Json` (JSONB) con el resultado completo del servicio (extensión y anillos en el formato compacto) y `creadoEn`/`actualizadoEn`. `SeccionTeorica` con `clave` (texto, clave primaria estable), `orden` (entero único), `titulo`, `contenido` (texto largo con el Markdown) y `actualizadoEn`. El resultado se guarda entero porque la API lo devuelve tal cual (ADR 0013) y los anillos son de decenas de KB; JSONB lo devuelve idéntico sin reconstruir columnas. Alternativa: columnas separadas para extensión y anillos (más rígido, sin ventaja para una caché que solo se lee por clave). Esto resuelve la mejora S1 del Tech Design (tipo de columna de los anillos).

**D2. Adaptador `@prisma/adapter-pg` para todos los entornos.** Funciona igual con el PostgreSQL local y con Neon (con la cadena de conexión agrupada de Neon, apta para funciones sin estado). Alternativa: `@prisma/adapter-neon` (el de `mimo_demo`, necesita WebSockets y no sirve con un PostgreSQL local sin un proxy). Queda por confirmar con Neon real en el ítem #11.

**D3. Configuración de Prisma.** `web/prisma.config.ts` con esquema `prisma/schema.prisma`, carpeta de migraciones y `datasource.url` tomado de `DATABASE_URL_UNPOOLED` y, si no existe, de `DATABASE_URL` (como en `mimo_demo`: migrar con la conexión directa y operar con la agrupada). Sin leer archivos `.env`: las variables vienen del entorno del proceso. Cuando falta la variable el CLI falla con su propio mensaje; el código de la aplicación usa la comprobación de D4.

**D4. Cliente en `web/src/lib/db/cliente.ts`.** Una función que crea un único `PrismaClient` por proceso (patrón de instancia global para el modo de desarrollo), con el adaptador de D2 y `DATABASE_URL`; si falta, lanza `ErrorConfiguracionBD` nombrando la variable. Se crea de forma perezosa, solo cuando se usa, para que importar el módulo no exija conexión. Captura los errores de conexión y los vuelve a lanzar con un mensaje genérico, sin la dirección ni la contraseña.

**D5. Repositorios.** `orbitales.ts`: `obtenerOrbital(n, l, version)` (devuelve `datos` o `null`) y `guardarOrbital(resultado)` (usa los campos n, l y version del propio resultado; "insertar o actualizar" con `upsert` por la clave compuesta; las escrituras simultáneas se resuelven con la restricción de unicidad y un reintento por conflicto de clave). `secciones.ts`: `listarSecciones()` ordenadas por `orden` y `guardarSeccion(...)` con `upsert` por `clave`. Ambos validan el dominio (n de 1 a 5, l de 0 a n − 1, enteros) con una función propia en `web/src/lib/db/dominio.ts` antes de tocar la base, que reutiliza `web/src/lib/quantum-labels.ts` si encaja.

**D6. Migraciones.** Carpeta `web/prisma/migrations/` versionada, con la migración inicial creada con `prisma migrate dev --name inicial` contra la base local y aplicable con `prisma migrate deploy` (idempotente). Scripts de npm: `db:generar`, `db:migrar` (deploy) y `db:migrar:dev`. `prisma generate` se ejecuta en `postinstall` y antes de la construcción, sin necesitar conexión.

**D7. Pruebas.** Pruebas de integración con Vitest contra el PostgreSQL local, activadas solo si existe la variable `DATABASE_URL_PRUEBAS` (si no, se omiten con un aviso claro); cada ejecución aísla sus datos (esquema propio o limpieza al inicio) y aplica las migraciones sobre una base vacía. Además, pruebas unitarias sin base: validación de dominio, error de configuración sin dirección de conexión y mensaje de error de conexión sin credenciales (simulando un fallo).

**D8. Base local de desarrollo.** Un comando documentado de `docker run` crea `simulador-atomico-pg` con una contraseña de prueba obviamente falsa y un puerto propio (5440). La cadena de conexión local no es un secreto, pero se pasa por variable de entorno y no se guarda en archivos del repositorio.

## Risks / Trade-offs

- **Adaptador `pg` frente a Neon** → no se ha probado con Neon real; se confirma en el ítem #11 y, si falla, se cambia a `@prisma/adapter-neon` (un ADR nuevo).
- **Pruebas que dependen de Docker** → se omiten sin la variable; la verificación de este cambio las ejecuta con el contenedor local. Quien no tenga Docker puede apuntarlas a otra base PostgreSQL de pruebas.
- **JSONB con resultados de decenas de KB** → son 15 filas de hasta ~70 KB (~0,5 MB en total, unas 2 veces ese tamaño con índices): cabe de sobra en el límite de 1 GB del plan gratuito (ADR 0016).
- **Prisma 7 es reciente** → la configuración se basa en la de `mimo_demo`, que el usuario ya ejecutó.

## Open Questions

- Ninguna que cambie las specs, el enfoque o las tareas.
