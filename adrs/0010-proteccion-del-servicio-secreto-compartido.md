# ADR 0010: Protección del servicio de cálculo: secreto compartido

## Estado

Aceptado

## Contexto

El servicio de cálculo es un proyecto de Vercel con una dirección pública (ADR 0001), aunque por el ADR 0003 solo debe usarlo la página, de servidor a servidor. Sin protección, cualquiera que descubra la dirección podría pedirle cálculos y consumir la cuota gratuita de Vercel.

El riesgo es acotado: el servicio solo calcula orbitales con n hasta 5 y rechaza todo lo que esté fuera de rango (ADR 0003 y ADR 0007).

## Decisión

La página envía un **secreto compartido** en cada llamada interna al servicio de cálculo, y el servicio rechaza toda petición que no lo lleve o que lleve uno incorrecto. El secreto se guarda como variable de entorno en los dos proyectos de Vercel, nunca en el repositorio.

## Alternativas consideradas

- **Protección de despliegue de Vercel** — era viable y no requiere código adicional. No se eligió porque no se comprobó qué ofrece el plan gratuito y puede complicar la llamada de servidor a servidor.
- **Sin protección, solo con la validación de rangos** — era viable y lo más simple. No se eligió porque cualquiera podría usar la cuota gratuita del servicio.

## Consecuencias

- Es simple, no depende de funciones de pago de Vercel y cierra el riesgo principal: el uso del servicio por terceros.
- Si el secreto se filtra, hay que cambiarlo a la vez en los dos proyectos y volver a desplegarlos.
- El secreto debe gestionarse en cada entorno (desarrollo y producción) y nunca debe aparecer en el código ni en los registros.
- Protege contra el uso externo del servicio, pero no limita la cantidad de llamadas que haga la propia página; el volumen de uso queda sujeto a la cuota del plan gratuito.
