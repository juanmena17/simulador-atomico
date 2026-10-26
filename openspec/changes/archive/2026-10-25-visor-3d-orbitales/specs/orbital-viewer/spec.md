# Spec Delta

## Purpose

Define cómo el visor muestra un orbital en tres dimensiones a partir de sus anillos y cómo el usuario lo gira con el ratón, con un rendimiento fluido y sin controles adicionales.

## ADDED Requirements

### Requirement: Dibujo fiel de los anillos
El visor SHALL dibujar todos los anillos de los dos grupos del orbital (envolvente y núcleo), recuperando sus coordenadas del formato compacto con un error de a lo sumo 1/32767 de la extensión, y la cantidad de anillos dibujados SHALL coincidir con la de las listas de longitudes.

#### Scenario: Cantidad de anillos
- **WHEN** se muestra un orbital con 30 anillos en la envolvente y 4 en el núcleo
- **THEN** el visor dibuja 34 anillos cerrados

#### Scenario: Coordenadas recuperadas
- **WHEN** se decodifican las coordenadas de un grupo
- **THEN** la cantidad de puntos es igual a la suma de las longitudes y cada coordenada difiere del valor original en a lo sumo 1/32767

### Requirement: Aspecto tridimensional
El visor SHALL proyectar los anillos con perspectiva, dibujar primero los más lejanos y luego los más cercanos, y variar la intensidad del color según la profundidad, de modo que se perciba la forma tridimensional.

#### Scenario: Orden por profundidad
- **WHEN** se dibuja un orbital en una orientación dada
- **THEN** los anillos de mayor profundidad se dibujan antes que los más cercanos

#### Scenario: Intensidad por profundidad
- **WHEN** se comparan un anillo lejano y uno cercano
- **THEN** el cercano se dibuja con mayor intensidad que el lejano

### Requirement: Giro libre en los tres ejes
Al arrastrar con el botón principal del ratón sobre el visor, el orbital SHALL girar de forma continua alrededor de cualquiera de los tres ejes, y los giros sucesivos SHALL acumularse sin distorsionar la forma ni limitar el ángulo.

#### Scenario: Giro horizontal y vertical
- **WHEN** el usuario arrastra horizontalmente y luego verticalmente
- **THEN** el orbital gira alrededor del eje vertical y luego del horizontal de la pantalla, en el sentido del arrastre

#### Scenario: Giro alrededor del eje de la vista
- **WHEN** el usuario arrastra en círculo cerca del borde del visor
- **THEN** el orbital gira alrededor del eje perpendicular a la pantalla

#### Scenario: Acumulación sin distorsión
- **WHEN** el usuario realiza muchos arrastres seguidos en direcciones distintas
- **THEN** la orientación sigue siendo un giro puro (los ejes permanecen perpendiculares y de longitud uno) y la forma del orbital no se deforma

### Requirement: Sin movimiento propio
El visor SHALL permanecer inmóvil mientras el usuario no lo gira, sin giro automático ni animaciones, y SHALL NOT ofrecer controles de brillo, velocidad de giro ni deslizadores de ejes.

#### Scenario: Reposo
- **WHEN** el usuario no interactúa con el visor
- **THEN** el visor no se redibuja ni cambia de orientación

### Requirement: Adaptación al tamaño
El visor SHALL ocupar todo el espacio de su contenedor, redibujarse cuando este cambie de tamaño y mantener nítido el trazo en pantallas de alta densidad, conservando el orbital centrado y completo dentro del área visible.

#### Scenario: Cambio de tamaño
- **WHEN** el contenedor del visor cambia de tamaño
- **THEN** el orbital se redibuja centrado y completo en la nueva área

### Requirement: Conservación de la orientación al cambiar de orbital
Al recibir un orbital distinto, el visor SHALL dibujarlo con la misma orientación que tenía el anterior.

#### Scenario: Cambio de orbital
- **WHEN** el usuario gira el orbital y luego se muestra otro orbital
- **THEN** el nuevo orbital se dibuja con la orientación a la que había girado el usuario

### Requirement: Estado sin orbital
Si no se proporciona ningún orbital, el visor SHALL mostrar el área vacía sin errores y sin dibujar figuras.

#### Scenario: Sin datos
- **WHEN** el visor se muestra sin orbital
- **THEN** no se dibuja ningún anillo y no se produce ningún error

### Requirement: Descripción accesible
El área del visor SHALL exponer una descripción textual que indique el orbital mostrado (n y l) o que no hay ninguno.

#### Scenario: Descripción
- **WHEN** se muestra el orbital n = 3 y l = 2
- **THEN** el visor tiene una descripción que menciona n = 3 y l = 2

### Requirement: Rendimiento fluido
Para los orbitales con n de hasta 4, el visor SHALL mantener al menos 30 cuadros por segundo durante el giro en un computador de escritorio de gama media, es decir, redibujar cada cuadro en menos de 33 milisegundos.

#### Scenario: Tiempo por cuadro
- **WHEN** se mide el tiempo de redibujado durante un giro continuo del orbital de n = 4 con más anillos
- **THEN** el promedio por cuadro es menor que 33 milisegundos

### Requirement: Solo recursos propios
El visor SHALL dibujar con el lienzo 2D del navegador, sin bibliotecas gráficas ni recursos de terceros.

#### Scenario: Sin dependencias gráficas
- **WHEN** se inspeccionan las dependencias de ejecución del visor
- **THEN** no hay bibliotecas de gráficos 3D ni de dibujo adicionales
