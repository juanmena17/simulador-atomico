# ADR 0015: FastAPI en el servicio de cálculo (reemplaza al ADR 0007)

## Estado

Aceptado. Reemplaza al ADR 0007, que se conserva como historial.

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo A3) señaló que el motivo del ADR 0007 para no usar un framework (poco margen de tamaño) era falso: según el informe, el límite de las funciones de Python en Vercel es de 500 MB sin comprimir, y NumPy, SciPy y scikit-image ocupan entre 180 y 260 MB, por lo que hay margen. El informe indica además que el estilo de función sin framework está documentado como soporte para proyectos existentes y que, para proyectos nuevos, Vercel recomienda un framework. Esos datos provienen del informe y no se verificaron en la documentación oficial.

Con el ADR 0012, el servicio solo recibe n y l, por lo que la validación es mínima. El servicio expone un único punto de entrada interno (ADR 0003) y exige el secreto compartido (ADR 0010).

## Decisión

El servicio de cálculo se implementa con **FastAPI**: un framework que valida n y l, y devuelve respuestas de error con códigos y mensajes claros, en lugar de una función de Vercel escrita a mano. El punto de entrada, la validación y la verificación del secreto compartido se resuelven con las herramientas del framework.

## Alternativas consideradas

- **Mantener la función de Vercel sin framework, con la simplicidad como motivo** — era viable y el camino con menos peso de código. No se eligió porque obliga a escribir a mano la lectura de parámetros y los errores, y según el informe es el estilo menos recomendado para proyectos nuevos.
- **Flask** — era viable y más liviano que FastAPI. No se eligió porque aporta poco frente a escribir a mano un único punto de entrada y no ofrece la validación automática de FastAPI.

## Consecuencias

- La validación de n y l y las respuestas de error salen casi gratis, y el servicio queda alineado con la recomendación de Vercel para proyectos nuevos, si esta se confirma.
- Se añade una dependencia más al paquete, que debe caber junto a NumPy, SciPy y scikit-image dentro del límite de tamaño; debe comprobarse en el primer despliegue.
- El soporte exacto de FastAPI en Vercel y los límites de tamaño y de tiempo deben verificarse en la documentación oficial antes de implementar.
- Reemplaza la decisión del ADR 0007; su historial se conserva.
