# ADR 0007: Interfaz HTTP del servicio de cálculo: función de Vercel sin framework

## Estado

Aceptado

## Contexto

El servicio de cálculo es un proyecto de Vercel escrito en Python (ADR 0001 y ADR 0006). Expone un único punto de entrada interno: calcular un orbital a partir de n, l, m y modo, y devolver su extensión y sus anillos (ADR 0003). Solo lo llama la página.

Sus dependencias (NumPy, SciPy y scikit-image) ocupan unos 180 MB instalados y las funciones de Vercel en el plan gratuito tienen un límite de tamaño y de tiempo de ejecución, por lo que el margen es justo.

## Decisión

El servicio se implementa como una **función de Vercel en Python sin framework**: un archivo con la función de entrada que lee los parámetros, valida n, l, m y modo, calcula y responde en el formato compacto del contrato.

## Alternativas consideradas

- **FastAPI** — era viable y ofrece validación y respuestas de error automáticas. No se eligió porque suma tamaño al paquete, que ya tiene poco margen, y el servicio solo tiene un punto de entrada.
- **Flask** — era viable y más liviano que FastAPI. No se eligió porque aporta poco frente a escribir a mano un único punto de entrada.

## Consecuencias

- El paquete es lo más pequeño posible, lo que ayuda a no pasar el límite de tamaño.
- Hay que escribir y probar a mano la lectura de parámetros, la validación y los mensajes de error.
- Si el servicio crece y suma más puntos de entrada, habrá que reconsiderar el uso de un framework.
- El soporte exacto de Python en Vercel y su límite de tamaño deben verificarse en la documentación y en el primer despliegue.
