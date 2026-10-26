# Spec Delta

## Purpose

Define las consultas públicas que usa el navegador para obtener orbitales y contenido teórico: qué devuelven, cómo se guardan en caché, cómo se obtienen los datos que faltan y cómo responden ante errores sin revelar información interna.

## ADDED Requirements

### Requirement: Consulta de orbital
La página SHALL ofrecer una consulta de solo lectura que reciba n, l y la versión del algoritmo y devuelva el orbital completo, con el mismo contenido que entrega el servicio de cálculo.

#### Scenario: Orbital ya guardado
- **WHEN** se consulta un orbital que ya está en la base de datos con la versión vigente
- **THEN** la respuesta es exitosa, contiene el orbital guardado y no se llama al servicio de cálculo

#### Scenario: Orbital que falta
- **WHEN** se consulta un orbital válido que no está en la base de datos
- **THEN** la página lo pide al servicio de cálculo, lo guarda y responde con él, y una segunda consulta se atiende desde la base de datos sin llamar al servicio

### Requirement: Caché inmutable de orbitales
Toda respuesta exitosa de orbital SHALL indicar que es pública e inmutable con una vigencia de un año, y toda respuesta de error SHALL indicar que no debe guardarse en caché.

#### Scenario: Cabeceras de éxito
- **WHEN** se obtiene un orbital con éxito
- **THEN** la respuesta indica caché pública, inmutable y de un año

#### Scenario: Cabeceras de error
- **WHEN** una consulta termina con un error
- **THEN** la respuesta indica que no se guarde en caché

### Requirement: Versión del algoritmo en la consulta
La consulta de orbital SHALL exigir la versión del algoritmo y SHALL rechazar con un error de versión no vigente toda versión distinta de la vigente, indicando cuál es la vigente.

#### Scenario: Versión antigua
- **WHEN** se consulta con una versión que no es la vigente
- **THEN** la respuesta es de solicitud inválida con el código de versión no vigente y el mensaje indica la versión vigente

#### Scenario: Versión ausente
- **WHEN** se consulta sin indicar la versión
- **THEN** la respuesta es de solicitud inválida con el código de versión no vigente

### Requirement: Validación de la entrada
La página SHALL rechazar con un error de solicitud inválida y el código de orbital inválido toda consulta cuyo n o l falten, no sean enteros o no formen una combinación válida, sin acceder a la base de datos ni al servicio.

#### Scenario: Combinación inválida
- **WHEN** se consulta n = 1 y l = 1
- **THEN** la respuesta es de solicitud inválida con el código de orbital inválido y no se accede a la base de datos ni al servicio

#### Scenario: Valor no entero
- **WHEN** se consulta n = 1.5 o l = abc
- **THEN** la respuesta es de solicitud inválida con el código de orbital inválido

### Requirement: Una sola llamada al servicio
Por cada consulta, la página SHALL llamar como máximo una vez al servicio de cálculo, con el secreto compartido, sin reintentos, y con un tiempo máximo de espera.

#### Scenario: Fallo del servicio
- **WHEN** el servicio de cálculo falla o no responde
- **THEN** la página responde con un error de servicio no disponible con un código propio, tras una sola llamada

#### Scenario: Orbital válido nuevo
- **WHEN** se atiende una consulta de un orbital que falta
- **THEN** el servicio recibe exactamente una petición con el secreto compartido

### Requirement: Base de datos no disponible
Si la base de datos falla al leer, la página SHALL responder con un error de base de datos no disponible con un código propio, y si falla al guardar un orbital recién calculado SHALL devolver igualmente el orbital calculado.

#### Scenario: Fallo al leer
- **WHEN** la lectura de la base de datos falla
- **THEN** la respuesta es un error de base de datos no disponible y no se llama al servicio

#### Scenario: Fallo al guardar
- **WHEN** el orbital se calcula pero no se puede guardar
- **THEN** la respuesta es exitosa y contiene el orbital calculado

### Requirement: Consulta del contenido teórico
La página SHALL ofrecer una consulta de solo lectura que devuelva las secciones teóricas en orden ascendente, con su clave, orden, título y contenido, con una caché pública de 60 segundos y revalidación en segundo plano.

#### Scenario: Listado en orden
- **WHEN** se consulta el contenido teórico
- **THEN** la respuesta contiene las secciones en orden ascendente con su contenido original y una cabecera de caché breve

#### Scenario: Base de datos no disponible
- **WHEN** la lectura falla
- **THEN** la respuesta es un error de base de datos no disponible y no se guarda en caché

### Requirement: Formato único de error sin datos internos
Toda respuesta de error SHALL tener la estructura con un código estable y un mensaje legible, y SHALL NOT incluir el secreto, la dirección del servicio ni la de la base de datos, trazas de ejecución ni rutas internas.

#### Scenario: Ningún dato interno
- **WHEN** ocurre cualquier error de las consultas
- **THEN** el cuerpo de la respuesta no contiene el secreto, ninguna dirección de conexión ni trazas

### Requirement: Versión vigente sincronizada con los datos
La versión del algoritmo que usa la página SHALL coincidir con la versión del archivo de datos de la carga inicial, y una comprobación automática SHALL fallar si difieren.

#### Scenario: Versiones distintas
- **WHEN** la versión del archivo de datos cambia y la de la página no
- **THEN** una prueba falla indicando que hay que actualizar la versión vigente
