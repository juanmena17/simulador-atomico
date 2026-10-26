# data-storage Specification

## Purpose

Define el almacenamiento persistente de los orbitales calculados y del contenido teórico: qué se guarda, con qué claves, cómo se escribe sin duplicar y cómo se versiona el esquema, para que la API y la carga inicial lo usen con seguridad.

## Requirements

### Requirement: Orbitales guardados por clave
El sistema SHALL guardar cada orbital calculado identificado por n, l y la versión del algoritmo, conservando el resultado completo, y SHALL devolver exactamente ese resultado al consultarlo con la misma clave.

#### Scenario: Guardar y recuperar
- **WHEN** se guarda el resultado del orbital n = 3, l = 2 con una versión y luego se consulta con esa misma clave
- **THEN** se obtiene un resultado idéntico al guardado

#### Scenario: Orbital inexistente
- **WHEN** se consulta una clave que no se ha guardado
- **THEN** el resultado es la ausencia de datos, sin error

### Requirement: Versiones independientes
El sistema SHALL tratar como entradas distintas el mismo orbital con versiones distintas del algoritmo, y una consulta con una versión SHALL NOT devolver datos de otra.

#### Scenario: Cambio de versión
- **WHEN** existe el orbital n = 2, l = 1 con la versión "1" y se consulta con la versión "2"
- **THEN** la consulta no devuelve datos, y guardar la versión "2" no modifica la "1"

### Requirement: Escritura idempotente
Guardar un orbital con una clave que ya existe SHALL actualizar la entrada existente sin duplicarla ni fallar, también cuando varias escrituras con la misma clave llegan a la vez.

#### Scenario: Doble escritura
- **WHEN** se guarda dos veces el mismo orbital con la misma versión
- **THEN** queda una sola entrada con el último contenido

#### Scenario: Escrituras simultáneas
- **WHEN** se lanzan varias escrituras a la vez con la misma clave
- **THEN** todas terminan sin error y queda una sola entrada

### Requirement: Dominio de los orbitales
El sistema SHALL rechazar, antes de acceder a la base de datos, cualquier orbital cuyo n no sea un entero de 1 a 5 o cuyo l no sea un entero de 0 a n − 1.

#### Scenario: Orbital fuera de dominio
- **WHEN** se intenta guardar o consultar n = 1 con l = 1, o n = 6
- **THEN** la operación se rechaza con un error de dominio y no se consulta la base

### Requirement: Contenido teórico ordenado
El sistema SHALL guardar cada sección teórica con una clave estable, un orden único, un título y su contenido en Markdown sin alterar, y SHALL listarlas en orden ascendente.

#### Scenario: Listado en orden
- **WHEN** se guardan las secciones con órdenes 3, 1 y 2 y se listan
- **THEN** se devuelven en el orden 1, 2, 3 con su título y su contenido original

#### Scenario: Actualización por clave
- **WHEN** se guarda una sección con una clave existente y un contenido nuevo
- **THEN** la sección conserva su clave, tiene el contenido nuevo y no se duplica

### Requirement: Esquema versionado y repetible
El esquema SHALL crearse mediante migraciones versionadas en el repositorio, aplicables sobre una base vacía y repetibles sin error ni cambios cuando ya están aplicadas, y SHALL contener únicamente las tablas de orbitales y de secciones teóricas.

#### Scenario: Base vacía
- **WHEN** se aplican las migraciones sobre una base sin tablas
- **THEN** se crean las dos tablas con sus claves

#### Scenario: Reaplicación
- **WHEN** se aplican otra vez las migraciones sobre una base ya migrada
- **THEN** el comando termina sin error y sin cambios

### Requirement: Configuración sin exponer credenciales
La conexión SHALL tomarse de una variable de entorno; si falta, el sistema SHALL fallar con un error claro que indique la variable ausente, y SHALL NOT mostrar la dirección de conexión ni sus credenciales en errores o registros.

#### Scenario: Variable ausente
- **WHEN** se intenta acceder a los datos sin la variable de conexión
- **THEN** se produce un error que nombra la variable y no contiene ninguna dirección de conexión

#### Scenario: Fallo de conexión
- **WHEN** la conexión falla por una dirección o credencial incorrecta
- **THEN** el mensaje de error no contiene la dirección de conexión ni la contraseña
