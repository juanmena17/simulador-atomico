# Tasks

## 1. Entorno

- [x] 1.1 Instalar `tsx` en `web/` y verificar que `npx tsx --version` funciona y que `npm test`, `npm run lint` y `npm run build` siguen pasando

## 2. Orígenes de datos

- [x] 2.1 Crear `servicio-calculo/scripts/exportar_orbitales.py` que escribe `web/datos/orbitales.json` (15 orbitales en orden, JSON compacto determinista con la versión del algoritmo) y la prueba `tests/test_exportacion.py` que falla si el archivo difiere del cálculo actual; verificar que el archivo se genera dos veces idéntico y que la prueba pasa
- [x] 2.2 Crear las tres secciones Markdown en `web/datos/secciones/` con su cabecera (clave, orden y título) y el texto provisional del diseño; verificar que los títulos y el orden coinciden con `web/src/data/theory-sections.ts` y que no hay caracteres corruptos

## 3. Biblioteca y script de carga

- [x] 3.1 Implementar la lectura de orígenes y la validación (`web/src/lib/carga/leer-origenes.ts` y `validar.ts`) con pruebas unitarias sin base de datos (datos correctos pasan; orbital fuera de dominio, versiones mezcladas, repetidos, faltantes y secciones inválidas fallan listando los problemas); verificar que pasan
- [x] 3.2 Implementar `web/src/lib/carga/cargar.ts` (transacción única, creados y actualizados) y `web/scripts/cargar-datos.ts` con el script de npm `db:cargar`, con pruebas de integración contra la base local: base vacía queda con 15 orbitales y 3 secciones, segunda ejecución sin cambios, contenido idéntico al origen, modificación de un origen sin duplicar, origen inválido sin escribir y fallo a mitad de la escritura sin dejar datos; verificar que pasan
- [x] 3.3 Verificar que el resumen y los errores del comando no contienen la dirección de conexión ni la contraseña y que sin `DATABASE_URL` el comando falla nombrando la variable, con pruebas del comando como proceso

## 4. Documentación y verificación

- [x] 4.1 Actualizar `web/README.md` y la sección "Comandos del entorno" de `CLAUDE.md` con los comandos para regenerar los orbitales y para cargar los datos (base local y Neon), y la nota sobre las versiones antiguas; verificar que cada comando funciona tal como está escrito contra la base local
- [x] 4.2 Ejecutar todas las pruebas de `servicio-calculo/` y de `web/` (con y sin `DATABASE_URL_PRUEBAS`), `npm run lint` y `npm run build`, y verificar que terminan sin errores

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `data-loading` en `openspec/specs/`.
