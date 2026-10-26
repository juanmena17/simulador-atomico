# ADR 0001: Componentes del sistema: dos proyectos en Vercel

## Estado

Aceptado

## Contexto

El PRD exige una página web de escritorio con un visor 3D del orbital, y que los cálculos se hagan en un servidor para que el estudiante no dependa de la potencia de su computador. El despliegue debe hacerse en Vercel con el plan gratuito y la persistencia en PostgreSQL sobre Neon. El producto no debe depender de recursos de terceros: todo, incluidos estilos y fuentes, se sirve desde el propio servidor.

El código existente en `D:\DMC\Projects\visualAtoms` está escrito en Python (`physics.py`, `fields.py`, `slices.py`, `rings.py`) y resuelve el cálculo de los orbitales hidrogenoides y la extracción de anillos por rebanadas. El visor de escritorio con PyVista no es reutilizable en la web.

## Decisión

El sistema se compone de dos proyectos independientes en Vercel: un proyecto de **página web** (interfaz y visor) y un proyecto de **servicio de cálculo** en Python que reutiliza el código existente. La página consulta al servicio de cálculo para obtener los datos de cada orbital.

## Alternativas consideradas

- **Un solo proyecto Vercel con la página y una función en Python** — era viable y más simple: un repositorio, un despliegue y sin comunicación entre servicios. No se eligió porque se prefirió separar las responsabilidades y desplegar cada componente por separado.
- **Todo en TypeScript, reescribiendo el cálculo dentro del proyecto de la página** — eliminaba el límite de tamaño de las funciones en Python y dejaba un solo lenguaje. No se eligió porque se pierde el código ya probado y habría que volver a validar la física.

## Consecuencias

- Cada componente se despliega, se prueba y falla de forma independiente; el servicio de cálculo puede cambiar sin tocar la página.
- El código Python existente se reutiliza sin reescribirlo.
- Hay que configurar y mantener dos proyectos en Vercel, con sus variables y despliegues.
- La comunicación entre la página y el servicio añade una llamada de red y exige decidir cómo se resuelve el acceso entre ambos proyectos (origen cruzado y contrato de la interfaz); queda para las decisiones de contratos de API y de resiliencia.
- El servicio de cálculo hereda el límite de tamaño y de tiempo de las funciones de Vercel en el plan gratuito, con NumPy, SciPy y scikit-image como dependencias: debe verificarse en el despliegue.
