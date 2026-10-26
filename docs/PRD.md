---
title: "Simulador atómico"
---

# PRD: Simulador atómico

## Problema

Los modelos clásicos del átomo (Moller y Bohr) <!-- REVISAR: confirmar el nombre de los modelos; el nombre habitual junto a Bohr es Rutherford --> presentan al electrón como una partícula que gira en órbitas, como un planeta. Los estudiantes de introducción a la química y los aficionados a la estructura atómica se quedan con esa imagen. Los diagramas estáticos de libros, diapositivas y videos no muestran que el átomo real es una nube de probabilidad con forma tridimensional. Sin poder ver y girar esa forma, cuesta entender por qué el modelo clásico no alcanza y qué aporta la mecánica cuántica.

## Usuario objetivo

- **Principal:** estudiante de química o de introducción a la química, que estudia números cuánticos y orbitales. Hoy aprende con libros, YouTube, clases y diapositivas, y usaría el simulador desde una página web en un computador de escritorio.
- **Secundario:** aficionado a la estructura atómica. Sus necesidades no deciden el diseño.
- **Fuera de foco:** físicos o usuarios que buscan el tratamiento físico-matemático. Pueden usarlo, pero el producto no se diseña para ellos ni hace énfasis en esa parte.

## Objetivo / resultado esperado

Que el estudiante pueda reconocer la forma de los orbitales s, p, d y f y relacionarla con los números cuánticos n y l, y que comprenda que la estructura atómica real no es como la describe la mecánica clásica.

Señal de que funciona: el simulador muestra la estructura atómica correctamente, es decir, con formas y números cuánticos coherentes con la teoría. Medir si el estudiante aprendió (notas, entrevistas, exámenes) queda fuera de esta versión.

## Alcance (qué sí incluye esta versión)

- Página web para computador de escritorio, con el diseño aprobado (referencia: `design/stitch/ultima_v4/`), que se escala y se adapta a distintos tamaños de pantalla de escritorio. <!-- REVISAR: el diseño de Stitch tiene ancho fijo de 1920 px; hay que hacerlo responsivo al implementar -->
- Panel izquierdo con texto teórico en tres secciones: Estructura atómica, Mecánica Clásica y Mecánica Cuántica. El contenido lo redactan los autores del proyecto; se define más adelante.
- Visor tridimensional del orbital que el usuario puede girar libremente en los tres ejes con el ratón.
- Selección de los números cuánticos n y l. El número m queda fijo en 0 y no se puede cambiar, y no hay selector de modo; la etiqueta "n, l, m" se muestra con m = 0.
- Orbitales s, p, d y f de un átomo hidrogenoide (un solo electrón), con m = 0 y n hasta 5: un orbital por cada una de las 15 combinaciones (n, l).
- Los cálculos de los orbitales se hacen en un servidor: el usuario introduce la configuración y recibe el resultado, sin depender de la potencia de su computador. Los resultados ya calculados se guardan y se reutilizan.
- Aprovechar lo ya construido en `D:\DMC\Projects\visualAtoms`, limitado al cálculo de los orbitales (módulo mínimo, sin el visor de escritorio).

## No alcance (qué explícitamente no incluye esta versión)

- Enlaces y moléculas.
- Controles de brillo y velocidad de giro, y otros ajustes avanzados de visualización.
- Medir el aprendizaje del estudiante (notas, entrevistas, exámenes).
- Tratamiento físico-matemático detallado de la mecánica cuántica.
- Átomos con más de un electrón y otros elementos: solo el átomo hidrogenoide.
- Selector de m y selector del modo complejo o real: solo se muestran orbitales con m = 0.
- Versión para teléfono o tableta.
- Cuentas de usuario, guardado de progreso, ejercicios o cuestionarios.
- Idiomas distintos del español.
- Animación de transiciones entre estados y recorrido automático. <!-- REVISAR: no se confirmó explícitamente; se deja fuera por ser de nivel avanzado -->
- Exportar imágenes o video. <!-- REVISAR: no se confirmó explícitamente -->
- Funciones adicionales de contenido didáctico más allá de la sección teórica: es lo máximo que se hace para evitar interpretaciones erróneas de la nube de probabilidad.

## Criterios de éxito

- Para las 15 combinaciones (n, l) con n ≤ 5, la forma del orbital con m = 0 coincide con la referencia teórica (número de lóbulos y nodos esperado).
- Un orbital que ya está en caché aparece en menos de 1 segundo al cambiar n o l; la primera consulta tras un periodo sin uso puede tardar hasta 5 segundos, con un indicador de carga.
- El orbital se puede girar libremente en los tres ejes con el ratón.
- Solo se pueden elegir combinaciones (n, l) válidas.

## Casos borde a contemplar

- **Combinación inválida:** se bloquea. El usuario no puede seleccionarla; por ejemplo, con n = 1 solo se puede elegir l = 0.
- **Pantalla distinta de 1920×1080:** el diseño se escala y se adapta en pantallas de escritorio. No se diseña una versión para teléfono.
- **Servidor lento o sin conexión:** la página reintenta hasta 2 veces y, si el fallo continúa, muestra un mensaje claro con el botón "Reintentar" y mantiene visible el orbital anterior. Mientras una consulta está en curso, los selectores quedan deshabilitados, y se desbloquean al terminar o a los 15 segundos como máximo.
- **Orbitales de n alto (4 y 5):** el cálculo es más pesado y ocurre en el servidor; la página muestra un indicador de carga mientras espera.

## Supuestos y riesgos abiertos

- **Supuesto:** basta mostrar el orbital del átomo hidrogenoide para que el estudiante comprenda el modelo cuántico.
- **Supuesto:** los estudiantes usan un computador de escritorio con un navegador moderno y conexión a internet.
- **Supuesto:** el texto teórico lo redactan los autores del proyecto, con un nivel apto para introducción a la química. <!-- REVISAR: pendiente de definir quién lo redacta y cuándo -->
- **Dependencias externas:** el producto no debe depender de recursos de terceros; todo lo necesario (incluidos estilos y fuentes) se sirve desde el propio servidor.
- **Riesgo, rendimiento:** concentrar el cálculo en el servidor lo hace más pesado cuando muchos estudiantes lo usan a la vez. Se asume que el uso inicial es bajo. <!-- REVISAR: no se definió la cantidad de usuarios simultáneos esperada -->
- **Riesgo, cuota gratuita:** si se agota la cuota del plan gratuito de la base de datos, el sitio deja de mostrar orbitales y texto hasta el mes siguiente. Se acepta y se vigila.
- **Riesgo, mala interpretación:** el estudiante puede creer que el orbital es una cáscara física y no una nube de probabilidad. La mitigación se limita a la sección teórica del panel izquierdo; se acepta como el máximo posible en esta versión.
- **Riesgo, alcance:** la tentación de añadir funciones avanzadas ya descartadas (brillo, velocidad de giro, enlaces). Quedan fuera por ahora.
- **Nota:** el PRD es un borrador estructurado; la revisión real (ambigüedades, números, bordes) sigue siendo del humano.
