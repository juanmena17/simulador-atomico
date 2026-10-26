# ADR 0014: Justificación de la separación en dos proyectos de Vercel

## Estado

Aceptado. Complementa al ADR 0001 sin reemplazarlo.

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo A2) señaló que el ADR 0001 elegía dos proyectos en Vercel (página y servicio de cálculo) sin justificarlo: solo decía que se prefería separar las responsabilidades. El informe indica, sin verificarlo este equipo, que Vercel admitiría reunir Next.js y Python en un solo proyecto, lo que evitaría el secreto compartido (ADR 0010) y un despliegue duplicado.

El motivo de fondo del proyecto es que el estudiante no debe depender de la potencia de su computador: el cálculo de los orbitales ocurre en un servidor y la página solo muestra el resultado (PRD).

## Decisión

Se mantienen **dos proyectos** en Vercel, tal como en el ADR 0001. La razón que se registra es que el cálculo vive en un servicio propio en el servidor, separado de la página que ve el estudiante, para que la página no cargue con el cálculo ni con sus dependencias.

## Alternativas consideradas

- **Un solo proyecto con la página y la función en Python** — era viable y evitaba el secreto compartido y un despliegue duplicado. No se eligió porque se prefiere mantener el servicio de cálculo como un componente separado de la página.
- **Dos proyectos con una protección más simple** — era viable y pedía menos trabajo. No se eligió porque el ADR 0010 ya fijó el secreto compartido como medida proporcional.

## Consecuencias

- La página y el servicio se pueden desplegar, probar y cambiar de forma independiente, y las dependencias pesadas del cálculo (NumPy, SciPy y scikit-image) quedan fuera de la página.
- El motivo registrado no es exclusivo de dos proyectos: un cálculo en el servidor también se obtendría con un solo proyecto en Vercel que ejecute el cálculo en su parte de servidor. La separación se justifica por el aislamiento y la independencia, no por la necesidad de calcular en un servidor.
- Se mantienen los costos de la separación: dos despliegues, el secreto compartido del ADR 0010 y dos conjuntos de variables de entorno.
- Si en la implementación la separación resulta costosa, la decisión puede revisarse con un ADR nuevo.
