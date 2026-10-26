# Spec Delta

## MODIFIED Requirements

### Requirement: Tarjeta de números cuánticos
La tarjeta bajo el visor SHALL mostrar los valores n, l y m del orbital seleccionado (inicialmente n = 1, l = 0 y m = 0), con controles para elegir n y l según la capacidad de selección de orbitales y sin ningún control para m, que se muestra fijo en 0.

#### Scenario: Valores iniciales
- **WHEN** la página se abre
- **THEN** la tarjeta muestra "n = 1", "l = 0" y "m = 0"

#### Scenario: Valores del orbital elegido
- **WHEN** el estudiante elige otro orbital y este se muestra
- **THEN** la tarjeta muestra los valores de n y l de ese orbital y "m = 0"

#### Scenario: Sin control de m
- **WHEN** se inspeccionan los controles de la tarjeta
- **THEN** hay controles para n y para l y ninguno para m

#### Scenario: Sin interacción
- **WHEN** el usuario hace clic sobre el texto de los valores de la tarjeta, fuera de los botones de los selectores
- **THEN** los valores no cambian
