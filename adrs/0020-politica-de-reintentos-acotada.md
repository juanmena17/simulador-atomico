# ADR 0020: Política de reintentos acotada, en una sola capa

## Estado

Aceptado. Complementa al ADR 0009 (resiliencia) y al ADR 0019 (selectores bloqueados).

## Contexto

La revisión adversarial (`REVISION-ADVERSARIAL.md`, hallazgo A7) señaló que el ADR 0009 decía "reintentar una o dos veces" sin precisar qué errores se reintentan, cuánto espera cada intento ni cuánto tarda en total. Con los selectores bloqueados mientras una consulta está en curso (ADR 0019), un fallo prolongado dejaría la interfaz bloqueada. Además, si varias capas reintentan (el navegador a la página y la página al servicio de cálculo), los reintentos se multiplican. Tampoco estaba cubierta la primera carga, cuando no hay un orbital anterior que mantener.

## Decisión

La política de reintentos se aplica **solo en el navegador**:

- Se reintenta hasta **2 veces**, únicamente ante fallos de red o errores del servidor; los errores de validación (por ejemplo una combinación de n y l inválida) no se reintentan.
- Las esperas entre intentos son de **0,5 y 1,5 segundos**, y cada intento tiene un tiempo máximo de **8 segundos**.
- La página **no reintenta** sus llamadas al servicio de cálculo, para que los reintentos no se multipliquen.
- El bloqueo de los selectores (ADR 0019) dura como máximo unos **15 segundos**; pasado ese tiempo se desbloquean y se muestra el error con el botón "Reintentar".
- En la **primera carga**, sin orbital anterior que mantener, se muestra el mensaje de error con el botón "Reintentar".

Los valores numéricos son una propuesta inicial que se ajusta al probar.

## Alternativas consideradas

- **Un solo reintento inmediato, sin esperas** — era viable y la política más simple. No se eligió porque no cubre los fallos que tardan unos segundos en pasar, como el despertar de Neon.
- **No precisar nada, como estaba** — era viable y no exigía trabajo. No se eligió porque la interfaz podía quedar bloqueada y los reintentos podían multiplicarse.

## Consecuencias

- El tiempo máximo de espera y de bloqueo es acotado y predecible, y no hay multiplicación de reintentos entre capas.
- Si el servicio de cálculo falla dentro de la página, el error sube al navegador, que es quien decide si reintenta; un fallo del servicio puede tardar un poco más en notificarse.
- Los números fijados (2 reintentos, esperas de 0,5 y 1,5 s, 8 s por intento, 15 s de bloqueo) no salen del PRD y pueden ser inadecuados; deben validarse con pruebas reales.
- La página debe distinguir tipos de error (red, servidor y validación) para decidir qué se reintenta.
