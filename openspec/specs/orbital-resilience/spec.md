# orbital-resilience Specification

## Purpose

Define cómo reacciona la página ante fallos y esperas al pedir un orbital: cuántas veces y cuándo reintenta, cuánto espera como máximo, qué muestra mientras tanto y qué ofrece al usuario cuando no se logra.

## Requirements

### Requirement: Reintentos acotados
Ante un fallo de red, un tiempo agotado o un error del servidor, la página SHALL reintentar la consulta hasta 2 veces, esperando 0,5 segundos antes del primer reintento y 1,5 segundos antes del segundo, y SHALL hacer como máximo 3 intentos por consulta.

#### Scenario: Fallo pasajero
- **WHEN** el primer intento falla con un error del servidor y el segundo tiene éxito
- **THEN** se muestra el orbital tras el segundo intento, habiendo esperado 0,5 segundos entre ambos, sin mostrar ningún error

#### Scenario: Fallo persistente
- **WHEN** los tres intentos fallan
- **THEN** no se hace un cuarto intento y se muestra el mensaje de error, habiendo esperado 0,5 y 1,5 segundos entre los intentos

### Requirement: Sin reintentos para errores de validación
La página SHALL NOT reintentar cuando la API rechaza la consulta por una combinación inválida o por una versión no vigente, ni cuando la respuesta no tiene la forma esperada.

#### Scenario: Combinación rechazada
- **WHEN** la API responde que el orbital es inválido
- **THEN** se hace un solo intento y se muestra el error

### Requirement: Tiempo máximo por intento
Cada intento SHALL abandonarse si no ha terminado a los 8 segundos, y ese abandono SHALL tratarse como un tiempo agotado reintentable.

#### Scenario: Servidor que no responde
- **WHEN** un intento no recibe respuesta
- **THEN** se abandona a los 8 segundos y, si quedan reintentos, se espera y se intenta de nuevo

### Requirement: Tope total
La consulta completa, incluidos los reintentos y las esperas, SHALL terminar a los 15 segundos como máximo desde que empezó: pasado ese tiempo se abandona el intento en curso, no se inician más, se muestra el error y los selectores se desbloquean.

#### Scenario: Servidor siempre lento
- **WHEN** ningún intento recibe respuesta
- **THEN** a los 15 segundos de empezar la consulta se muestra el mensaje de error y los selectores vuelven a estar disponibles

### Requirement: Indicador de carga
Mientras una consulta de orbital está en curso, incluidos los reintentos, el visor SHALL mostrar un indicador de carga anunciado a las tecnologías de apoyo, y SHALL retirarlo al terminar con éxito o con error.

#### Scenario: Durante la consulta
- **WHEN** una consulta está en curso
- **THEN** se muestra un indicador de carga con el texto "Cargando orbital" y los selectores están deshabilitados

#### Scenario: Al terminar
- **WHEN** la consulta termina, con éxito o con error
- **THEN** el indicador desaparece

### Requirement: Mensaje de error con Reintentar
Cuando una consulta termina sin éxito, la página SHALL mostrar un mensaje claro, en español y específico del tipo de fallo (sin conexión, servicio no disponible, datos no disponibles, tiempo agotado u otro), anunciado a las tecnologías de apoyo, con un botón "Reintentar"; el orbital que se estaba mostrando SHALL seguir visible.

#### Scenario: Error con orbital anterior
- **WHEN** falla una consulta mientras se muestra un orbital
- **THEN** aparece el mensaje con el botón "Reintentar" y el orbital anterior sigue visible

#### Scenario: Error en la primera carga
- **WHEN** falla la consulta inicial y no hay orbital que mostrar
- **THEN** el visor muestra solo el mensaje de error con el botón "Reintentar"

### Requirement: Reintentar manual
Al pulsar "Reintentar", la página SHALL repetir la consulta del orbital que había fallado con la misma política de reintentos, y un éxito SHALL retirar el mensaje de error y mostrar el orbital.

#### Scenario: Reintento exitoso
- **WHEN** el usuario pulsa "Reintentar" y la consulta tiene éxito
- **THEN** desaparece el mensaje y se muestra el orbital pedido

### Requirement: Mensajes sin datos internos
Los mensajes de error SHALL NOT contener direcciones, secretos, códigos de estado internos ni trazas.

#### Scenario: Contenido del mensaje
- **WHEN** se muestra cualquier mensaje de error
- **THEN** no incluye direcciones de servidores, secretos ni trazas de ejecución
