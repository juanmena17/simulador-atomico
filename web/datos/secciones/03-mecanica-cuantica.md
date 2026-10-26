---
clave: mecanica-cuantica
orden: 3
titulo: Mecánica Cuántica
---
La **mecánica cuántica** describe al electrón con una **función de onda**, $\psi$. Su cuadrado, $|\psi|^2$, indica la **probabilidad** de encontrar al electrón en cada punto: no hay una trayectoria, sino una nube de probabilidad. Un **orbital** es la región del espacio donde es más probable encontrarlo.

Para el átomo de hidrógeno se resuelve la ecuación de Schrödinger independiente del tiempo:

$$
\hat{H}\,\psi = E\,\psi
$$

Sus soluciones, $\psi_{nlm}$, quedan definidas por tres **números cuánticos**:

- $n$ (principal, $1, 2, 3, \dots$): la capa, el tamaño del orbital y su energía.
- $l$ (azimutal, de $0$ a $n-1$): la forma del orbital. Se nombra con letras: $s$ ($l = 0$), $p$ ($1$), $d$ ($2$), $f$ ($3$) y $g$ ($4$).
- $m$ (magnético, de $-l$ a $l$): la orientación del orbital en el espacio.

Cada orbital tiene $n - l - 1$ nodos radiales (superficies esféricas donde la probabilidad es cero) y $l$ nodos angulares. En el hidrógeno la energía solo depende de $n$ y coincide con el valor de Bohr, pero la imagen del electrón es distinta: una nube de probabilidad, no una órbita.

**En el simulador**, cada orbital se dibuja con anillos: son cortes de la superficie que encierra la zona donde se concentra el $90\,\%$ de la probabilidad, y los anillos naranjas del interior delimitan la zona de mayor densidad. Se muestran los orbitales con $m = 0$ del átomo de hidrógeno (un solo electrón). Gira el orbital con el ratón para ver su forma completa.
