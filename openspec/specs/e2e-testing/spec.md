# e2e-testing Specification

## Purpose
Define la prueba de extremo a extremo que protege el flujo crítico del simulador (ver la página, leer el contenido teórico y cambiar de orbital) y cómo debe ejecutarse para no afectar datos reales.

## Requirements

### Requirement: Prueba E2E del flujo crítico
El repositorio SHALL incluir una prueba de Playwright en `web/test/` que abra la página en un navegador real y compruebe el flujo crítico: panel teórico con tres secciones, orbital inicial visible y cambio de orbital mediante los selectores.

#### Scenario: Página inicial
- **WHEN** se abre la página
- **THEN** se muestran las tres secciones teóricas con sus títulos, hay al menos una fórmula renderizada, no hay avisos de error y el visor indica el orbital con `n = 1` y `l = 0`

#### Scenario: Cambio de orbital
- **WHEN** el usuario elige `n = 3` y luego `l = 2`
- **THEN** el visor indica el orbital con `n = 3` y `l = 2`, y el valor mostrado en las tarjetas coincide

#### Scenario: Combinaciones no válidas
- **WHEN** está seleccionado `n = 1`
- **THEN** los botones de `l` mayores que 0 están deshabilitados

### Requirement: La prueba puede fallar
La prueba SHALL detectar una regresión: al romper deliberadamente una de las condiciones que verifica, la ejecución debe terminar en fallo con el paso afectado indicado.

#### Scenario: Fallo deliberado
- **WHEN** se altera temporalmente el texto del título de una sección o la etiqueta del visor
- **THEN** la prueba falla indicando el paso, y al restaurarlo vuelve a pasar

### Requirement: Entorno de ejecución seguro
La prueba SHALL ejecutarse contra la aplicación local o contra una URL indicada en `E2E_BASE_URL`, no SHALL escribir datos y no SHALL requerir credenciales en archivos del repositorio.

#### Scenario: URL externa
- **WHEN** se define `E2E_BASE_URL`
- **THEN** la prueba usa esa URL y no levanta servidor local

#### Scenario: Sin URL externa
- **WHEN** no se define `E2E_BASE_URL`
- **THEN** Playwright levanta la aplicación local con el comando y puerto reales del proyecto antes de ejecutar la prueba
