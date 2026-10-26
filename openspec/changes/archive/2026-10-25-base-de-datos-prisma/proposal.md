# Proposal

## Why

La API de la página (ítem #6) necesita guardar los orbitales ya calculados y leer el contenido teórico, y la carga inicial (ítem #5) necesita un lugar donde escribir. El ADR 0002 definió las dos entidades, el ADR 0005 eligió Prisma con acceso solo desde la página y el ADR 0021 pidió migraciones versionadas, escrituras de tipo "insertar o actualizar" y dos bases (producción y local). Todavía no existe nada de eso. Este ítem crea el esquema, las migraciones y la capa de acceso, y los verifica contra una base PostgreSQL real.

## What Changes

- Se define el esquema de datos de la página con Prisma: una tabla de orbitales calculados (clave n, l y versión del algoritmo) y una de secciones teóricas (clave estable, orden y contenido en Markdown).
- Se crea la migración inicial versionada en el repositorio y los comandos para aplicarla.
- Se añade una capa de acceso en `web/src/lib/db/` para leer y guardar orbitales y secciones: escrituras de tipo "insertar o actualizar", validación del dominio antes de tocar la base y un error claro si falta la configuración.
- Se documenta cómo levantar la base local (contenedor de PostgreSQL) y cómo aplicar las migraciones en Neon, sin guardar ninguna credencial en el repositorio.
- Se prueban esquema, migración y acceso contra un PostgreSQL local real.

## Capabilities

### New Capabilities

- `data-storage`: almacenamiento persistente de los orbitales calculados y del contenido teórico, con claves estables, escrituras idempotentes y esquema versionado.

### Modified Capabilities

(ninguna)

## Impact

- **Código nuevo:** `web/prisma/` (esquema y migraciones), `web/prisma.config.ts`, `web/src/lib/db/` y sus pruebas, y scripts de npm; no se modifica ninguna pantalla.
- **Dependencias nuevas:** `prisma`, `@prisma/client`, `@prisma/adapter-pg` y `pg` (y `@types/pg` en desarrollo).
- **Entorno:** un contenedor local de PostgreSQL para desarrollo y pruebas (la base de producción en Neon la crea el usuario; este cambio no la toca).
- **Fuera de alcance:** la carga de los 15 orbitales y del texto (ítem #5), las rutas de API y las cabeceras de caché (ítem #6), la conexión real a Neon y el despliegue (ítem #11).
- **Referencias:** ADR 0002, 0005, 0012, 0013, 0017 y 0021; `docs/TECH-DESIGN-v2.md`.
