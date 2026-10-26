# Tasks

## 1. Entorno

- [x] 1.1 Instalar `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg` y `@types/pg` en `web/` y verificar que `npx prisma --version` funciona y que `npm test`, `npm run lint` y `npm run build` siguen pasando
- [x] 1.2 Levantar el contenedor local `simulador-atomico-pg` (PostgreSQL 17, puerto 5440, contraseña de prueba falsa) y verificar que acepta conexiones con `pg_isready`

## 2. Esquema y migración

- [x] 2.1 Escribir `web/prisma/schema.prisma` (modelos `OrbitalCalculado` y `SeccionTeorica`) y `web/prisma.config.ts` según el diseño, y verificar que `prisma validate` y `prisma generate` terminan sin errores sin necesitar conexión
- [x] 2.2 Crear la migración inicial en `web/prisma/migrations/` con `prisma migrate dev --name inicial` contra la base local, añadir los scripts de npm `db:generar`, `db:migrar` y `db:migrar:dev`, y verificar con `psql` que existen las dos tablas con sus claves y que `db:migrar` repetido termina sin error ni cambios

## 3. Acceso a datos

- [x] 3.1 Implementar `web/src/lib/db/cliente.ts` (cliente perezoso, error de configuración sin dirección de conexión, mensaje de conexión sin credenciales) y `dominio.ts`, con pruebas unitarias sin base; verificar que pasan
- [x] 3.2 Implementar `orbitales.ts` (`obtenerOrbital`, `guardarOrbital` con "insertar o actualizar") con pruebas de integración contra la base local: guardar y recuperar idéntico, ausente da nulo, versiones independientes, doble escritura y escrituras simultáneas dejan una sola entrada, dominio rechazado antes de acceder a la base; verificar que pasan
- [x] 3.3 Implementar `secciones.ts` (`listarSecciones`, `guardarSeccion`) con pruebas de integración: listado ordenado, contenido Markdown idéntico, actualización por clave sin duplicar; verificar que pasan

## 4. Verificación y documentación

- [x] 4.1 Escribir una prueba de integración de migraciones que aplique `migrate deploy` sobre una base vacía (esquema nuevo) y la repita, y que compruebe que solo existen las tablas `OrbitalCalculado` y `SeccionTeorica`; verificar que pasa
- [x] 4.2 Actualizar `web/README.md` y la sección "Comandos del entorno" de `CLAUDE.md` con el comando para crear la base local, las variables `DATABASE_URL`, `DATABASE_URL_UNPOOLED` y `DATABASE_URL_PRUEBAS`, los comandos de migración y de pruebas con base, y la forma de aplicar las migraciones en Neon; verificar que cada comando documentado funciona tal como está escrito contra la base local
- [x] 4.3 Ejecutar `npm run lint`, `npm test` (con y sin `DATABASE_URL_PRUEBAS`) y `npm run build` (sin ninguna variable de base de datos) y verificar que terminan sin errores

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `data-storage` en `openspec/specs/`.
