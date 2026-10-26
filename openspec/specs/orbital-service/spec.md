# orbital-service Specification

## Purpose

Define la consulta HTTP interna que entrega un orbital calculado a la página, quién puede hacerla (solo quien presente el secreto compartido) y cómo responde ante errores, sin exponer datos a terceros.

## Requirements

### Requirement: Consulta de orbital
El servicio SHALL ofrecer una consulta de solo lectura que reciba n y l y, si son válidos y la petición está autorizada, responda con éxito y con el mismo resultado que entrega el cálculo de orbitales.

#### Scenario: Consulta válida y autorizada
- **WHEN** se consulta el orbital con n = 3 y l = 2 con el secreto correcto
- **THEN** la respuesta es exitosa y contiene n, l, la versión del algoritmo, la extensión y los grupos de anillos envolvente y núcleo

#### Scenario: Método no permitido
- **WHEN** se intenta modificar o crear datos en la consulta con un método distinto de lectura
- **THEN** la respuesta indica que el método no está permitido

### Requirement: Autorización por secreto compartido
El servicio SHALL exigir en cada consulta un secreto compartido enviado en una cabecera, y SHALL rechazar con un error de no autorizado, sin devolver datos de orbitales, toda petición que no lo lleve o lo lleve incorrecto.

#### Scenario: Sin secreto
- **WHEN** se consulta un orbital válido sin la cabecera del secreto
- **THEN** la respuesta es de no autorizado y no contiene datos de orbitales

#### Scenario: Secreto incorrecto
- **WHEN** se consulta un orbital válido con un secreto que no coincide
- **THEN** la respuesta es de no autorizado y no contiene datos de orbitales

### Requirement: Rotación del secreto
El servicio SHALL aceptar tanto el secreto actual como un secreto anterior opcional, de modo que el secreto pueda cambiarse sin interrumpir las consultas.

#### Scenario: Secreto anterior vigente
- **WHEN** hay un secreto actual y uno anterior configurados y se consulta con el anterior
- **THEN** la consulta se acepta

#### Scenario: Secreto retirado
- **WHEN** se consulta con un secreto que no es ni el actual ni el anterior
- **THEN** la consulta se rechaza como no autorizada

### Requirement: Falla cerrada sin secreto configurado
Si no hay ningún secreto configurado, el servicio SHALL rechazar todas las consultas de orbitales con un error de servicio no disponible, y nunca atenderlas sin autorización.

#### Scenario: Servicio sin secreto
- **WHEN** no hay secreto configurado y se consulta un orbital con o sin cabecera
- **THEN** la respuesta es de servicio no disponible, con un código de error identificable, y sin datos de orbitales

### Requirement: Errores de entrada
El servicio SHALL responder con un error de solicitud inválida, con un código y un mensaje claros, cuando n o l falten, no sean enteros o no formen una combinación válida, y SHALL hacerlo después de comprobar la autorización.

#### Scenario: Combinación inválida
- **WHEN** se consulta con el secreto correcto n = 1 y l = 1
- **THEN** la respuesta es de solicitud inválida con el código de orbital inválido y un mensaje que indica el valor incorrecto

#### Scenario: Parámetro faltante o no entero
- **WHEN** se consulta con el secreto correcto sin l, o con n = 1.5
- **THEN** la respuesta es de solicitud inválida con el código de orbital inválido

### Requirement: Formato único de error
Toda respuesta de error SHALL tener la misma estructura, con un código estable y un mensaje legible, y SHALL NOT incluir el secreto, trazas de ejecución ni rutas internas.

#### Scenario: Fallo interno
- **WHEN** el cálculo falla por un error inesperado
- **THEN** la respuesta es de error interno con un código genérico y un mensaje que no revela detalles internos

#### Scenario: El secreto no aparece
- **WHEN** se produce cualquier error con una petición que incluye un secreto
- **THEN** el cuerpo de la respuesta no contiene ese secreto

### Requirement: Compatibilidad con el despliegue
Las dependencias de ejecución del servicio SHALL funcionar con Python 3.12 en Linux x86_64 y SHALL ocupar, instaladas, a lo sumo 400 MB sin comprimir, para dejar margen frente al límite de 500 MB de las funciones de Python de Vercel.

#### Scenario: Tamaño de las dependencias
- **WHEN** se suman los tamaños descomprimidos de las dependencias de ejecución para Linux y Python 3.12
- **THEN** el total es de a lo sumo 400 MB
