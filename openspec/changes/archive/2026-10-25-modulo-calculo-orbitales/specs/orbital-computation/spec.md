# Spec Delta

## Purpose

Define el cálculo de un orbital hidrogenoide con m = 0 y la forma en que se entregan sus anillos (envolvente y núcleo), para que el servicio y el visor reciban datos correctos, compactos, deterministas y versionados.

## ADDED Requirements

### Requirement: Dominio válido de entrada
El cálculo SHALL aceptar únicamente un n entero de 1 a 5 y un l entero de 0 a n − 1, con m = 0 fijo, y SHALL rechazar cualquier otra entrada con un error identificable que indique qué valor es inválido.

#### Scenario: Combinación válida
- **WHEN** se pide el orbital con n = 3 y l = 2
- **THEN** el cálculo devuelve un resultado sin error

#### Scenario: l incompatible con n
- **WHEN** se pide el orbital con n = 1 y l = 1
- **THEN** el cálculo se rechaza con un error de entrada inválida

#### Scenario: Valores fuera de rango o no enteros
- **WHEN** se pide n = 0, n = 6, l = -1, o valores no enteros
- **THEN** el cálculo se rechaza con un error de entrada inválida

### Requirement: Forma coherente con la teoría
Para cada una de las 15 combinaciones (n, l), el orbital calculado SHALL tener n − l − 1 nodos radiales y l nodos angulares, y su densidad de probabilidad SHALL integrar a 1 con un error de a lo sumo 0,5 %.

#### Scenario: Nodos del orbital 3p
- **WHEN** se calcula el orbital con n = 3 y l = 1
- **THEN** la función radial cambia de signo exactamente 1 vez y la parte angular se anula exactamente 1 vez entre los polos

#### Scenario: Normalización
- **WHEN** se integra la densidad de cualquiera de los 15 orbitales
- **THEN** el resultado es 1 con un error relativo de a lo sumo 0,5 %

### Requirement: Contenido del resultado
El resultado SHALL incluir los valores n y l, una versión del algoritmo, la extensión del orbital en radios de Bohr y dos grupos de anillos: envolvente y núcleo.

#### Scenario: Campos presentes
- **WHEN** se calcula cualquier orbital válido
- **THEN** el resultado contiene n, l, la versión, la extensión y los grupos envolvente y núcleo

### Requirement: Anillos de revolución
Cada anillo SHALL ser una curva cerrada contenida en un plano perpendicular al eje z, y para m = 0 SHALL ser una circunferencia centrada en el eje; su radio puede variar a lo sumo 2 % del radio medio o 1,5 celdas de la malla, lo que sea mayor, porque un anillo muy pequeño no puede ser más preciso que la malla. Ningún anillo SHALL contener valores no finitos ni segmentos de longitud cero.

#### Scenario: Circunferencias en los 15 orbitales
- **WHEN** se calculan los anillos de cualquiera de los 15 orbitales
- **THEN** en cada anillo la distancia de sus puntos al eje z varía a lo sumo 2 % del radio medio o 1,5 celdas de la malla, lo que sea mayor

#### Scenario: Sin valores inválidos
- **WHEN** se calculan los anillos de cualquiera de los 15 orbitales
- **THEN** no hay valores no finitos ni dos puntos consecutivos idénticos

### Requirement: Formato compacto
Las coordenadas de los anillos SHALL entregarse normalizadas al intervalo de −1 a 1 respecto de la extensión, cuantizadas a enteros de 16 bits con signo, codificadas en base64, junto con la lista de longitudes de cada anillo.

#### Scenario: Recuperación de las coordenadas
- **WHEN** se decodifican las coordenadas de un resultado
- **THEN** la cantidad de puntos coincide con la suma de las longitudes y cada coordenada se recupera con un error de a lo sumo 1/32767 de la extensión respecto de la curva original

### Requirement: Resultado determinista y versionado
Con la misma entrada y la misma versión del algoritmo, el resultado SHALL ser idéntico byte a byte entre ejecuciones, y la versión SHALL cambiar cada vez que cambien los parámetros del algoritmo.

#### Scenario: Repetición
- **WHEN** se calcula dos veces el mismo orbital
- **THEN** ambos resultados son idénticos

### Requirement: Tamaño y tiempo acotados
El resultado serializado de cualquier orbital SHALL ocupar a lo sumo 150 KB, y el cálculo de un orbital SHALL completarse en menos de 2 segundos en un computador de escritorio de gama media.

#### Scenario: Tamaño máximo
- **WHEN** se serializa a texto el resultado de cada uno de los 15 orbitales
- **THEN** ninguno supera 150 KB

#### Scenario: Tiempo de cálculo
- **WHEN** se calcula cada uno de los 15 orbitales
- **THEN** cada cálculo termina en menos de 2 segundos

### Requirement: Dependencias mínimas
El cálculo SHALL funcionar solo con NumPy, SciPy y scikit-image, sin requerir PyVista, matplotlib ni OpenCV.

#### Scenario: Importación sin bibliotecas gráficas
- **WHEN** se importa el módulo y se calcula un orbital
- **THEN** ninguna de las bibliotecas PyVista, matplotlib ni OpenCV queda cargada
