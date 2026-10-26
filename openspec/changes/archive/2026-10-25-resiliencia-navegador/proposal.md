# Proposal

## Why

Los selectores ya consultan la API (ítem #8), pero hoy un fallo pasajero (por ejemplo, la base o el servicio despertando tras un rato sin uso) deja al estudiante sin explicación: los botones se apagan, nada se muestra y, si falla, la selección vuelve atrás sin ningún mensaje. El ADR 0009 y el ADR 0020 definieron la política: reintentos acotados solo en el navegador, tiempos máximos, mensaje claro con "Reintentar", el orbital anterior siempre visible y el bloqueo de los selectores limitado. El PRD fija además un indicador de carga durante la primera consulta tras inactividad.

## What Changes

- La consulta del orbital pasa a hacerse con una política de reintentos: hasta 2 reintentos con esperas de 0,5 y 1,5 segundos, solo ante fallos de red, tiempos agotados y errores del servidor; nunca ante errores de validación; 8 segundos como máximo por intento y 15 segundos como tope total, tras el cual se abandona y se desbloquean los selectores.
- Mientras se consulta (incluidos los reintentos) se muestra un indicador de carga en el visor y los selectores permanecen bloqueados.
- Si la consulta termina en error, se muestra un mensaje claro y específico según el tipo de fallo, junto a un botón "Reintentar" que repite la última elección con la misma política; el orbital anterior sigue visible, y en la primera carga (sin orbital anterior) el mensaje ocupa el visor.
- Un éxito posterior retira el mensaje de error.
- Los mensajes no contienen datos internos (direcciones, secretos ni trazas).

## Capabilities

### New Capabilities

- `orbital-resilience`: política de reintentos, tiempos máximos, indicador de carga y mensaje de error con "Reintentar" de la consulta de orbitales en el navegador.

### Modified Capabilities

(ninguna: los requisitos de bloqueo y reversión de `orbital-selection` siguen vigentes; este cambio los complementa)

## Impact

- **Código nuevo:** `web/src/lib/seleccion/reintentos.ts`, el indicador y el aviso de error (componentes en `web/src/components/`) y sus pruebas; cambios en `cliente-api.ts` (admitir cancelación y distinguir tiempos agotados) y en `PanelOrbital.tsx`.
- **Dependencias nuevas:** ninguna.
- **Fuera de alcance:** reintentos de la página al servicio de cálculo (prohibidos por el ADR 0020), registro de errores en un servicio externo, cancelación manual de consultas por el usuario y contenido teórico (ítem #10).
- **Referencias:** PRD (casos borde), ADR 0009, 0013, 0019 y 0020; capacidades `orbital-selection` y `page-api`.
