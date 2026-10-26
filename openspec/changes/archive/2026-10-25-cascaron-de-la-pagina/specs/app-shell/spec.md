# Spec Delta

## Purpose

Define la estructura visible de la página del Simulador atómico (cabecera, panel teórico, zona del visor y tarjeta de números cuánticos) y su comportamiento en pantallas de escritorio, como base sobre la que se integran el visor, los selectores y el contenido.

## ADDED Requirements

### Requirement: Estructura general de la página
La página SHALL mostrar una cabecera en la parte superior y, debajo, dos columnas: a la izquierda un panel teórico (aproximadamente 42 % del ancho) y a la derecha una columna (aproximadamente 58 %) con la zona del visor encima y la tarjeta de números cuánticos debajo.

#### Scenario: Pantalla de referencia
- **WHEN** la página se abre en una ventana de 1920×1080
- **THEN** se ven la cabecera, el panel teórico, la zona del visor y la tarjeta de números cuánticos completos, sin desplazar la página

### Requirement: Cabecera con título
La cabecera SHALL mostrar el título "Simulador atómico" y tener una altura de unos 100 px en una ventana de 1920×1080, mayor que la de una barra de navegación común.

#### Scenario: Título visible
- **WHEN** la página termina de cargar
- **THEN** el texto "Simulador atómico" está visible en la cabecera con mayor tamaño que el resto de los textos de la página

### Requirement: Panel teórico con tres secciones
El panel izquierdo SHALL mostrar, en este orden, las secciones "Estructura atómica", "Mecánica Clásica" y "Mecánica Cuántica", y SHALL tener su propia barra de desplazamiento vertical cuando el contenido excede la altura disponible.

#### Scenario: Orden de las secciones
- **WHEN** el usuario mira el panel teórico
- **THEN** las tres secciones aparecen una debajo de otra en el orden indicado, cada una con su título

#### Scenario: Contenido más largo que el panel
- **WHEN** el texto de las secciones es más alto que el panel
- **THEN** el panel se desplaza por dentro con su barra vertical y el resto de la página no se mueve

### Requirement: Zona del visor
La columna derecha SHALL incluir una zona destinada al visor del orbital, con fondo oscuro, que ocupa la altura disponible sobre la tarjeta de números cuánticos. En este cambio la zona se muestra sin ningún orbital dibujado.

#### Scenario: Zona sin orbital
- **WHEN** la página se abre
- **THEN** la zona del visor se muestra con su fondo oscuro y su marco, sin figuras de orbitales

### Requirement: Tarjeta de números cuánticos
La tarjeta bajo el visor SHALL mostrar los valores n = 1, l = 0 y m = 0 como texto de solo lectura, sin controles para cambiarlos.

#### Scenario: Valores iniciales
- **WHEN** la página se abre
- **THEN** la tarjeta muestra "n = 1", "l = 0" y "m = 0"

#### Scenario: Sin interacción
- **WHEN** el usuario hace clic sobre los valores de la tarjeta
- **THEN** los valores no cambian

### Requirement: Adaptación a pantallas de escritorio
La página SHALL adaptarse a ventanas de escritorio de 1280×720 o más, sin desplazamiento horizontal y sin elementos superpuestos. La altura de la página SHALL ajustarse a la ventana, y solo el panel teórico se desplaza por dentro.

#### Scenario: Pantalla más pequeña
- **WHEN** la página se abre en una ventana de 1366×768
- **THEN** no aparece barra de desplazamiento horizontal y ningún elemento oculta a otro

#### Scenario: Pantalla más grande
- **WHEN** la página se abre en una ventana de 2560×1440
- **THEN** la estructura mantiene sus proporciones y ocupa la ventana sin dejar espacios vacíos grandes

### Requirement: Recursos servidos desde el propio sitio
La página SHALL cargar todos sus estilos, fuentes e iconos desde el mismo servidor que la sirve, sin solicitar ningún recurso a servidores de terceros.

#### Scenario: Carga sin terceros
- **WHEN** la página se carga y se inspeccionan las solicitudes de red
- **THEN** todas las solicitudes van al mismo origen que la página

### Requirement: Sin datos científicos inventados
La página SHALL NOT mostrar valores o etiquetas físicas sin respaldo, como porcentajes de coherencia, cuadros por segundo, números de versión, potenciales fijos o la etiqueta "no degenerado".

#### Scenario: Elementos del diseño original omitidos
- **WHEN** la página se abre
- **THEN** no aparecen "COH: 99.98%", "LIVE 60 FPS", "V1.04", "POTENCIAL: -13.6 eV" ni "[NO DEGENERADO]"
