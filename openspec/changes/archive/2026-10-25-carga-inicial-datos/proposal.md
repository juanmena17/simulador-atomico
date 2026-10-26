# Proposal

## Why

La base de datos ya existe y está probada (ítem #4), pero está vacía, y la página no puede mostrar ni un orbital ni una sección teórica sin datos. El ADR 0021 pidió un script repetible que calcule los 15 orbitales, los inserte sin duplicar y cargue el texto teórico inicial. El ADR 0005 limita el acceso a la base de datos a la página, por lo que el servicio de cálculo no debe escribir en ella.

## What Changes

- Un script de Python exporta los 15 orbitales calculados por el módulo (ítem #2) a un archivo de datos versionado en el repositorio, y una prueba falla si ese archivo queda desactualizado respecto del cálculo.
- Las tres secciones teóricas iniciales se guardan como archivos Markdown en el repositorio (el texto provisional del diseño; el ítem #10 lo reemplazará).
- Un script de la página lee ambos orígenes, valida todo antes de escribir y los carga en la base de datos en una sola transacción, con escrituras de tipo "insertar o actualizar" y un resumen de lo cargado.
- Se documenta el comando de carga para la base local y para Neon.
- Se prueba la carga contra el PostgreSQL local: base vacía, repetición, contenido idéntico al origen y aborto sin escribir ante datos inválidos.

## Capabilities

### New Capabilities

- `data-loading`: carga repetible y verificable de los orbitales calculados y del contenido teórico inicial en la base de datos.

### Modified Capabilities

(ninguna)

## Impact

- **Código nuevo:** `servicio-calculo/scripts/exportar_orbitales.py` y su prueba; `web/datos/` (orbitales y secciones), `web/src/lib/carga/`, `web/scripts/cargar-datos.ts`, pruebas y un script de npm. No se modifica el módulo `orbitales`, el servicio, el esquema ni la interfaz.
- **Dependencias nuevas:** `tsx` (desarrollo) para ejecutar el script de TypeScript.
- **Fuera de alcance:** el texto teórico definitivo (ítem #10), las rutas de API (ítem #6), la carga en la base real de Neon (la ejecuta el usuario con su propia variable de entorno, ítem #11).
- **Referencias:** ADR 0002, 0005, 0013, 0017 y 0021; `docs/BACKLOG.md` (ítem #5).
