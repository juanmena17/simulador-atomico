# Tasks

## 1. Base

- [x] 1.1 Crear `web/src/lib/api/version.ts` con `VERSION_ALGORITMO_VIGENTE`, el formato único de error con sus códigos (`web/src/lib/api/errores.ts`) y las cabeceras de caché (`web/src/lib/api/cabeceras.ts`), con pruebas unitarias de que la versión coincide con `web/datos/orbitales.json`, de que ningún error contiene datos internos y de los valores exactos de las cabeceras; verificar que pasan

## 2. Cliente del servicio

- [x] 2.1 Implementar `web/src/lib/api/servicio.ts` (una llamada, secreto en cabecera, tiempo máximo de 20 s, comprobación de la respuesta, errores genéricos y variables nombradas sin valores) con pruebas contra un servidor HTTP falso de Node: respuesta correcta, error del servicio, tiempo agotado, respuesta mal formada, versión distinta, falta de configuración, y que el secreto viaja en la cabecera y no aparece en ningún error; verificar que pasan

## 3. Consultas

- [x] 3.1 Implementar el caso de uso `atenderOrbital` (`web/src/lib/api/orbital.ts`) y la ruta `GET /api/orbital` con pruebas unitarias de dependencias falsas: orden de comprobaciones (versión, validación, lectura, servicio, guardado), orbital guardado sin llamar al servicio, orbital que falta que se calcula y se guarda, fallo del servicio, fallo de lectura, fallo al guardar con respuesta exitosa, y cabeceras de éxito y de error; verificar que pasan
- [x] 3.2 Implementar la ruta `GET /api/contenido` con pruebas unitarias: orden ascendente, cabecera de caché breve, error de base de datos sin caché y formato de error; verificar que pasan

## 4. Integración

- [x] 4.1 Escribir pruebas de integración (solo con `DATABASE_URL_PRUEBAS`, en un esquema propio, con el servidor HTTP falso que cuenta llamadas) de las rutas: primera consulta calcula y guarda, segunda se atiende sin llamar al servicio, el contenido devuelve las secciones cargadas en orden, el servicio caído da 502 tras una sola llamada y la base caída da 503; verificar que pasan
- [x] 4.2 Verificar de punta a punta con el servicio FastAPI real y la base local (arrancar ambos, hacer las dos consultas con `curl`, comprobar cabeceras y que la segunda no calcula, y detener los procesos), y guardar el resultado en `openspec/changes/api-de-la-pagina/evidencia/api-real.md`

## 5. Documentación y verificación

- [x] 5.1 Documentar en `web/README.md` y en la sección "Comandos del entorno" de `CLAUDE.md` las variables `URL_SERVICIO_CALCULO` y `SECRETO_SERVICIO` y un ejemplo de consulta con `curl`, y verificar que los comandos funcionan tal como están escritos
- [x] 5.2 Ejecutar `npm run lint`, `npm test` (con y sin `DATABASE_URL_PRUEBAS`) y `npm run build` (sin variables de entorno) y verificar que terminan sin errores

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `page-api` en `openspec/specs/`.
