# ADR 0003: Contratos de API: el navegador solo habla con la página

## Estado

Aceptado

## Contexto

El sistema tiene dos proyectos en Vercel (página web y servicio de cálculo, ADR 0001) y una base de datos en Neon con orbitales calculados y contenido teórico (ADR 0002). El PRD exige que los cálculos se hagan en un servidor y que el producto no dependa de recursos de terceros. Cuando el estudiante elige n, l y m, el visor necesita recibir los anillos de ese orbital, ya sea desde la caché de Neon o desde un cálculo nuevo. El panel izquierdo necesita el contenido teórico.

El PRD también exige que no se puedan seleccionar combinaciones (n, l) inválidas.

## Decisión

El navegador se comunica **únicamente con la página web**, a través de sus rutas de API. La página consulta a Neon y, cuando falta un orbital, llama al servicio de cálculo de forma interna, de servidor a servidor. El servicio de cálculo no se usa directamente desde el navegador.

Contratos (esquema inicial, a refinar al implementar):

- **Consulta de orbital** (página, pública): recibe n, l, m y modo (complejo o real). Devuelve la extensión del orbital y los anillos en el formato compacto que ya usa `export_web.py` (enteros de 16 bits en base64, con la longitud de cada anillo).
- **Consulta de contenido teórico** (página, pública): devuelve las secciones del panel izquierdo en orden, con título y texto.
- **Cálculo de orbital** (servicio, interno): mismos parámetros y misma respuesta que la consulta de orbital. Solo lo llama la página.
- **Errores:** una combinación (n, l, m) inválida o fuera de rango se rechaza con un código y un mensaje claros, antes de calcular. Un fallo de cálculo o de la base de datos devuelve un código distinto, que la página muestra al usuario sin romper el visor.

La página es dueña del contrato público; el servicio de cálculo es dueño del contrato interno.

## Alternativas consideradas

- **El navegador llama directamente al servicio de cálculo** — era viable y ahorra un salto de red. No se eligió porque obliga a habilitar el acceso entre dos orígenes (CORS) y deja el servicio de cálculo expuesto al público.
- **Cálculo previo, sin llamada al servicio en uso (la página solo lee Neon)** — era viable y eliminaba los tiempos de espera y el límite de ejecución de Vercel. No se eligió porque el cálculo dejaría de ocurrir cuando el usuario elige la configuración, que es lo que pide el PRD, y porque dejaba al segundo proyecto de Vercel sin sentido.

## Consecuencias

- El navegador conoce una sola dirección, sin CORS, y el servicio de cálculo queda detrás de la página.
- El contrato público se puede cambiar sin tocar al servicio de cálculo, y viceversa, mientras se respete el contrato interno.
- Un orbital que no está en la caché pasa por dos saltos de servidor (página y servicio), lo que suma tiempo a esa primera consulta y debe vigilarse frente al límite de ejecución del plan gratuito de Vercel.
- El servicio de cálculo es un proyecto de Vercel con una dirección pública: debe protegerse para que solo la página lo use. Cómo se protege queda como decisión pendiente (resiliencia y seguridad).
- La validación de combinaciones se repite en la página y en el servicio, para que ninguna de las dos acepte datos inválidos.
