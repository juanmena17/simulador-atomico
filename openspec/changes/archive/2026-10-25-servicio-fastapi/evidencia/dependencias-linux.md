# Evidencia: tamaño de las dependencias para Linux (tarea 3.2)

Medido descargando las ruedas de `requirements.txt` con `pip download --only-binary=:all:` para `manylinux` x86_64, CPython 3.12, y sumando el tamaño descomprimido de cada rueda (no se ejecutó nada en Linux). Es el tamaño de las dependencias de ejecución, no del paquete completo de Vercel, que además incluye el código del servicio.

| paquete | versión | rueda (MB) | descomprimido (MB) |
|---|---|---:|---:|
| scipy | 1.18.1 | 33.71 | 106.75 |
| numpy | 2.5.4 | 15.95 | 53.78 |
| scikit_image | 0.26.0 | 12.93 | 28.34 |
| pillow | 13.0.0 | 6.81 | 19.46 |
| networkx | 3.7 | 2.04 | 6.96 |
| pydantic_core | 2.50.1 | 2.06 | 4.96 |
| pydantic | 2.14.1 | 0.47 | 1.87 |
| tifffile | 2026.10.15 | 0.26 | 1.19 |
| imageio | 2.38.1 | 0.31 | 1.15 |
| fastapi | 0.162.0 | 0.14 | 0.85 |
| anyio | 4.15.1 | 0.13 | 0.51 |
| packaging | 26.3 | 0.12 | 0.48 |
| idna | 3.20 | 0.07 | 0.33 |
| starlette | 1.10.0 | 0.08 | 0.26 |
| opentelemetry_api | 1.45.1 | 0.06 | 0.19 |
| typing_extensions | 4.16.0 | 0.04 | 0.17 |
| typing_inspection | 0.4.4 | 0.01 | 0.05 |
| annotated_types | 0.8.0 | 0.01 | 0.03 |
| lazy_loader | 0.6 | 0.01 | 0.02 |
| annotated_doc | 0.0.5 | 0.01 | 0.01 |

| **total** | | **75.23** | **227.39** |

Límite de funciones de Python en Vercel (plan gratuito): 500 MB sin comprimir. Límite de diseño del proyecto: 400 MB. Resultado: **227.4 MB** (45 % del límite de Vercel; cumple el límite de 400 MB).
