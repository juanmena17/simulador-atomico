# Evidencia: rendimiento y comportamiento del visor en un navegador real (tareas 6.1 y 6.2)

Navegador: Microsoft Edge sin ventana (modo sin GPU, `--disable-gpu`), controlado por su protocolo de depuración. Página: ruta de desarrollo `/dev/visor` del servidor de desarrollo de Next.js, abierta como `localhost` (con `127.0.0.1` Next.js bloquea los recursos de desarrollo y el componente no se hidrata).

## Tiempo de dibujo por cuadro (`medir=1`)

Promedio de 240 cuadros seguidos con giro continuo sobre un lienzo de 1000×700 (proyección, ordenamiento y dibujo de todos los anillos con halo). No incluye la composición final del navegador.

| orbital | n | l | milisegundos por cuadro | cuadros por segundo equivalentes |
|---|---:|---:|---:|---:|
| 1s | 1 | 0 | 0.367 | 2,725 |
| 2s | 2 | 0 | 0.456 | 2,193 |
| 2p | 2 | 1 | 0.337 | 2,967 |
| 3s | 3 | 0 | 1.187 | 842 |
| 3p | 3 | 1 | 0.433 | 2,309 |
| 3d | 3 | 2 | 0.490 | 2,041 |
| 4s | 4 | 0 | 0.795 | 1,258 |
| 4p | 4 | 1 | 0.578 | 1,730 |
| 4d | 4 | 2 | 0.603 | 1,658 |
| 4f | 4 | 3 | 0.632 | 1,582 |
| 5s | 5 | 0 | 0.936 | 1,068 |
| 5p | 5 | 1 | 0.770 | 1,299 |
| 5d | 5 | 2 | 0.817 | 1,224 |
| 5f | 5 | 3 | 0.836 | 1,196 |
| 5g | 5 | 4 | 0.780 | 1,282 |

Peor caso: **1.187 ms por cuadro**; el criterio es menos de 33 ms (30 cuadros por segundo) para n ≤ 4, y también lo cumplen los orbitales con n = 5.

## Comportamiento verificado con el ratón real

- **Reposo:** en 3 segundos sin interacción, 0 solicitudes de redibujado (`requestAnimationFrame`).
- **Arrastre:** dos arrastres sintéticos del ratón (200 px a la derecha y 100 px hacia arriba, en pasos) producen 50 redibujados y cambian el 12,7 % de los píxeles del visor (`antes-arrastre.png` y `despues-arrastre.png`).
- **Capturas:** `resumen.png` reúne los orbitales 1s, 2p, 3d, 4f y 5g en la orientación inicial y el 3d con giros de 90° sobre el eje X, 90° sobre el eje Y y 60° sobre el eje Z.

## Límites de esta evidencia

- El tiempo medido es el de dibujo; la composición y la presentación en pantalla dependen de la tarjeta gráfica y del navegador y no se midieron.
- Los arrastres son sintéticos (enviados por el protocolo de depuración), no una persona con un ratón; la sensación del giro debe validarla el usuario.
- No se probó con pantallas táctiles ni de alta densidad (se usó una densidad de 1).
