# theory-content Specification

## Purpose
Define cómo el panel teórico obtiene y presenta su contenido (Markdown con fórmulas servido por la API) y qué contenido inicial ofrece, para que el estudiante lea una explicación correcta y bien formada junto al visor.

## Requirements

### Requirement: Contenido obtenido de la API
El panel teórico SHALL solicitar el contenido a la consulta `/api/contenido` al cargar la página y SHALL mostrar las secciones recibidas en el orden indicado por el servidor, cada una con su título y su contenido.

#### Scenario: Secciones en orden
- **WHEN** la API devuelve tres secciones con órdenes 1, 2 y 3
- **THEN** el panel las muestra en ese orden, cada una con su título

#### Scenario: Cambio sin desplegar
- **WHEN** el contenido de una sección cambia en la base de datos
- **THEN** la página lo muestra tras recargarla, sin necesidad de volver a desplegarla

### Requirement: Markdown con formato
El contenido SHALL mostrarse con el formato del Markdown: párrafos, énfasis, listas y citas.

#### Scenario: Formato
- **WHEN** el contenido incluye texto en negrita, una lista y una cita
- **THEN** el panel los muestra como negrita, elementos de lista y bloque de cita

### Requirement: Fórmulas matemáticas
Las fórmulas escritas en el contenido (en línea y en bloque) SHALL mostrarse como notación matemática renderizada, con una alternativa de texto accesible, y SHALL NOT mostrarse como código sin formato.

#### Scenario: Fórmula en línea
- **WHEN** el contenido incluye `$n$` en un párrafo
- **THEN** el panel muestra la variable n como notación matemática dentro del párrafo

#### Scenario: Fórmula en bloque
- **WHEN** el contenido incluye una ecuación en su propia línea entre signos de dólar dobles
- **THEN** el panel la muestra centrada como notación matemática

#### Scenario: Sin código crudo
- **WHEN** se muestra cualquier sección con fórmulas
- **THEN** no aparecen los signos de dólar ni las órdenes de la notación en el texto visible

### Requirement: Sin HTML crudo
El contenido SHALL NOT permitir la ejecución de código ni la inserción de elementos HTML: las etiquetas HTML escritas en el contenido no se interpretan.

#### Scenario: Etiqueta peligrosa
- **WHEN** el contenido incluye una etiqueta de script o una imagen con un atributo de evento
- **THEN** no se ejecuta ningún código ni se inserta ningún elemento activo en la página

### Requirement: Recursos propios para las fórmulas
Los estilos y las fuentes de las fórmulas SHALL servirse desde el propio sitio, sin solicitudes a servidores de terceros.

#### Scenario: Carga sin terceros
- **WHEN** se carga una página con fórmulas y se inspeccionan las solicitudes de red
- **THEN** todas van al mismo origen que la página

### Requirement: Carga y error del contenido
Mientras llega el contenido, el panel SHALL mostrar un indicador de carga; si la consulta falla tras los reintentos, SHALL mostrar un mensaje claro con un botón "Reintentar", sin afectar al visor ni a los selectores.

#### Scenario: Cargando
- **WHEN** el contenido aún no ha llegado
- **THEN** el panel muestra un indicador "Cargando contenido" y conserva su cabecera

#### Scenario: Error
- **WHEN** la consulta del contenido falla con todos los reintentos
- **THEN** el panel muestra un mensaje y el botón "Reintentar", y el visor y los selectores siguen funcionando

#### Scenario: Reintento exitoso
- **WHEN** el usuario pulsa "Reintentar" y la consulta tiene éxito
- **THEN** el mensaje desaparece y se muestran las secciones

### Requirement: Contenido inicial correcto
Las tres secciones iniciales SHALL explicar, con el enfoque de introducción a la química: en "Estructura atómica", el núcleo, el número atómico y la capa de valencia; en "Mecánica Clásica", el modelo de Bohr y el diagrama de Möller y sus límites; y en "Mecánica Cuántica", la función de onda, el orbital como zona de probabilidad, los números cuánticos n, l y m y qué muestra el simulador, y SHALL NOT contener las afirmaciones del texto provisional anterior.

#### Scenario: Conceptos presentes
- **WHEN** se lee el contenido inicial
- **THEN** la sección de estructura atómica menciona número atómico y capa de valencia, la de mecánica clásica menciona Bohr y Möller, y la de mecánica cuántica menciona función de onda, orbital, probabilidad y los números cuánticos n, l y m

#### Scenario: Texto provisional retirado
- **WHEN** se busca en el contenido el texto provisional anterior
- **THEN** no aparecen "99.94", "leptones" ni "hipercrítica"

#### Scenario: m en el simulador
- **WHEN** se lee la sección de mecánica cuántica
- **THEN** indica que el simulador muestra los orbitales con m = 0 del átomo de hidrógeno
