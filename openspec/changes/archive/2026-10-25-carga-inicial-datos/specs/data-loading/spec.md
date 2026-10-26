# Spec Delta

## Purpose

Define la carga repetible del contenido inicial de la base de datos (los 15 orbitales calculados y las secciones teóricas), de modo que la página tenga datos desde el primer arranque y que la carga sea segura de repetir.

## ADDED Requirements

### Requirement: Orbitales cargados completos
Tras ejecutar la carga, la base de datos SHALL contener exactamente un orbital por cada una de las 15 combinaciones (n, l) válidas, para la versión vigente del algoritmo, y cada uno SHALL ser idéntico al resultado que produce el cálculo de orbitales.

#### Scenario: Base vacía
- **WHEN** se ejecuta la carga sobre una base sin datos
- **THEN** quedan 15 orbitales, uno por combinación (n, l), todos con la versión vigente

#### Scenario: Igualdad con el cálculo
- **WHEN** se compara cada orbital guardado con el resultado del cálculo para la misma entrada
- **THEN** el contenido guardado es idéntico al calculado

### Requirement: Origen de datos sin desfase
El archivo de orbitales que alimenta la carga SHALL coincidir con el resultado actual del cálculo, y SHALL comprobarse automáticamente que no queda desactualizado cuando cambian los parámetros o la versión del algoritmo.

#### Scenario: Archivo desactualizado
- **WHEN** el cálculo cambia y el archivo de orbitales no se regenera
- **THEN** una comprobación automática falla e indica que hay que regenerarlo

### Requirement: Carga repetible
Ejecutar la carga más de una vez SHALL dejar la base en el mismo estado final, sin duplicar filas ni fallar, y SHALL actualizar el contenido si el origen cambió.

#### Scenario: Segunda ejecución
- **WHEN** se ejecuta la carga dos veces seguidas
- **THEN** ambas terminan sin error y la base contiene las mismas 15 filas de orbitales y las mismas secciones

#### Scenario: Contenido modificado
- **WHEN** cambia el texto de una sección en el origen y se vuelve a cargar
- **THEN** la sección guardada tiene el texto nuevo y no se crea una sección adicional

### Requirement: Secciones teóricas iniciales
La carga SHALL guardar las tres secciones teóricas (Estructura atómica, Mecánica Clásica y Mecánica Cuántica) con claves estables, órdenes 1, 2 y 3, su título y su contenido en Markdown idéntico al del archivo de origen.

#### Scenario: Orden y contenido
- **WHEN** se listan las secciones tras la carga
- **THEN** aparecen en el orden 1, 2 y 3 con los títulos indicados y con un contenido idéntico al de su archivo de origen

### Requirement: Validación antes de escribir
La carga SHALL validar todos los datos de origen antes de escribir cualquier cosa y SHALL abortar sin modificar la base si alguno es inválido: un orbital fuera de dominio, versiones mezcladas, una combinación repetida o faltante, o una sección sin título, orden o contenido.

#### Scenario: Orbital fuera de dominio
- **WHEN** el origen contiene un orbital con n = 1 y l = 1
- **THEN** la carga termina con un error que lo identifica y la base queda sin cambios

#### Scenario: Combinación faltante
- **WHEN** el origen tiene solo 14 de las 15 combinaciones
- **THEN** la carga termina con un error y la base queda sin cambios

### Requirement: Todo o nada
Si la escritura falla a mitad de la carga, la base SHALL quedar en el estado que tenía antes de empezar.

#### Scenario: Fallo durante la escritura
- **WHEN** una escritura falla después de haber guardado algunos orbitales
- **THEN** ninguno de los datos de esa ejecución queda guardado

### Requirement: Resumen sin credenciales
Al terminar, la carga SHALL informar cuántos orbitales y secciones se crearon y cuántos se actualizaron, y SHALL NOT mostrar la dirección de conexión ni sus credenciales, ni en el resumen ni en los errores.

#### Scenario: Resumen
- **WHEN** la carga termina con éxito
- **THEN** el resumen indica las cantidades creadas y actualizadas de orbitales y de secciones y no contiene ninguna dirección de conexión

#### Scenario: Sin variable de conexión
- **WHEN** se ejecuta la carga sin la variable de conexión
- **THEN** falla con un error que nombra la variable y no escribe nada
