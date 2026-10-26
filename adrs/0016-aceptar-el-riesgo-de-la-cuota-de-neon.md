# ADR 0016: Cuota gratuita de Neon: aceptar el riesgo y vigilarlo

## Estado

Aceptado. Complementa al ADR 0002 y al ADR 0013.

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo A1) señaló que el plan gratuito de Neon ofrece 100 horas de cómputo al mes y que mantener la base despierta todo el mes consume unas 180. Al agotarse, Neon suspende la base hasta el mes siguiente, y caen a la vez el visor (los orbitales) y el panel de texto teórico, ambos servidos desde Neon.

El ADR 0013 reduce el consumo: las respuestas inmutables se guardan en el navegador y en el CDN, por lo que Neon se consulta menos y se suspende más a menudo. No elimina el riesgo si hay visitas repartidas durante todo el día. El uso inicial esperado es bajo (PRD).

## Decisión

Se **acepta el riesgo** de agotar la cuota de cómputo de Neon y se **vigila**: el consumo se revisa en el panel de Neon, y se registra como riesgo técnico abierto en el Tech Design. No se añade ningún respaldo ni duplicación de datos en esta versión.

## Alternativas consideradas

- **Respaldo del texto teórico dentro de la página** — era viable y mantiene la lectura funcionando si Neon falla. No se eligió porque el texto viviría en dos lugares y se añadiría duplicación por un riesgo que aún no se ha visto.
- **Respaldo del texto y de los 15 orbitales con la página** — era viable y mantiene el sitio entero sin Neon. No se eligió porque pesa más, duplica datos y se acerca a la opción descartada en el ADR 0009.

## Consecuencias

- No hay trabajo adicional ni duplicación de datos.
- Si la cuota se agota, el sitio deja de mostrar orbitales y texto hasta el mes siguiente, salvo lo que esté en caché del navegador o del CDN.
- Hay que revisar el consumo con regularidad y definir una señal de alerta (por ejemplo, un umbral de horas consumidas).
- Si el problema ocurre, los respaldos descritos arriba quedan como salida.
