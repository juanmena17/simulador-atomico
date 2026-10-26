# Spec Delta

## Purpose

Define cómo el estudiante elige el orbital que quiere ver: qué combinaciones de n y l puede seleccionar, cómo se consulta y se muestra el orbital elegido y qué ocurre mientras se espera o si la consulta falla.

## ADDED Requirements

### Requirement: Estado inicial
Al abrir la página, la selección SHALL ser n = 1 y l = 0 (con m = 0), y SHALL mostrarse el orbital correspondiente en cuanto llegue de la API.

#### Scenario: Primera carga
- **WHEN** se abre la página
- **THEN** la selección es n = 1 y l = 0 y el visor muestra el orbital 1s cuando la API responde

### Requirement: Solo combinaciones válidas
El estudiante SHALL poder elegir n de 1 a 5 y l de 0 a 4 (s, p, d, f y g), y SHALL NOT poder seleccionar una combinación que no cumpla l < n: las opciones que la producirían quedan deshabilitadas.

#### Scenario: l no disponible
- **WHEN** la selección es n = 2
- **THEN** los valores de l iguales o mayores que 2 están deshabilitados

#### Scenario: n no disponible
- **WHEN** la selección es l = 3
- **THEN** los valores de n iguales o menores que 3 están deshabilitados

#### Scenario: Sin consultas inválidas
- **WHEN** el estudiante interactúa con los selectores
- **THEN** la página nunca solicita a la API una combinación inválida

### Requirement: Elegir un orbital
Al elegir un valor válido de n o de l, la página SHALL solicitar a la API el orbital correspondiente con la versión vigente del algoritmo y SHALL mostrarlo en el visor cuando llegue, actualizando los valores de n, l y m y las etiquetas de capa y de tipo de orbital de la tarjeta.

#### Scenario: Cambio de l
- **WHEN** la selección es n = 3 y l = 0 y el estudiante elige l = 2
- **THEN** la página solicita el orbital n = 3 y l = 2 y, al recibirlo, el visor lo muestra y la tarjeta indica "l = 2" y "ORBITAL d"

#### Scenario: Orientación conservada
- **WHEN** el estudiante gira el orbital y elige otro
- **THEN** el nuevo orbital se muestra con la orientación a la que había girado

### Requirement: m fijo
El valor de m SHALL mostrarse siempre como 0 y SHALL NOT existir ningún control para cambiarlo.

#### Scenario: Sin control de m
- **WHEN** se inspeccionan los controles de la tarjeta
- **THEN** existen controles para n y para l y ninguno para m

### Requirement: Bloqueo durante la consulta
Mientras una consulta de orbital está en curso, todos los selectores SHALL estar deshabilitados y SHALL haber como máximo una consulta en curso; al terminar la consulta, con éxito o con error, los selectores SHALL volver a su estado normal.

#### Scenario: Consulta en curso
- **WHEN** el estudiante elige un orbital y la respuesta aún no llega
- **THEN** todos los botones de n y de l están deshabilitados y no se envía otra consulta

#### Scenario: Consulta terminada
- **WHEN** la respuesta llega
- **THEN** los selectores vuelven a estar disponibles, respetando las combinaciones válidas

### Requirement: Fallo de la consulta
Si la consulta falla, la selección SHALL volver a los valores del orbital que se estaba mostrando, ese orbital SHALL seguir visible y los selectores SHALL habilitarse de nuevo.

#### Scenario: Error de la API
- **WHEN** la API responde con un error al elegir un orbital
- **THEN** la selección vuelve a la anterior, el visor sigue mostrando el orbital previo y los selectores se habilitan

### Requirement: Selectores accesibles
Los selectores SHALL ser controles nativos operables con el teclado, con un nombre accesible que indique qué valor eligen y su estado seleccionado.

#### Scenario: Teclado
- **WHEN** el estudiante recorre la página con la tecla de tabulación y pulsa Intro o espacio sobre una opción habilitada
- **THEN** la opción se selecciona igual que con el ratón
