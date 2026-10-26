# Evidencia: verificación de punta a punta de los selectores (tarea 3.1)

Servidor de producción de Next.js (`next start`, puerto 3400) con la API y la base PostgreSQL local con los 15 orbitales cargados (el servicio de cálculo no hizo falta). Navegador: Edge sin ventana controlado por su protocolo de depuración; clics sobre los botones reales de la página, con `fetch` envuelto para retrasar o fallar respuestas.

| Comprobación | Resultado |
|---|---|
| Estado inicial | n = 1 y l = 0 elegidos; visor "Orbital con n = 1 y l = 0"; 4 botones deshabilitados (l = 1 a 4) |
| Bloqueo durante una consulta lenta (1,5 s) | los 10 botones deshabilitados; con clics extra durante el bloqueo se hizo 1 sola llamada |
| Tras la respuesta | visor "n = 3 y l = 0"; solo quedan deshabilitados l = 3 y l = 4 |
| Elegir l = 2 (d) | visor "n = 3 y l = 2"; tarjeta "CAPA M", "ORBITAL d", "FIJO EN 0" |
| Respuesta 502 de la API al elegir n = 5 | selección vuelve a n = 3 y l = 2; el visor mantiene el orbital; botones habilitados; un `console.error` genérico |
| Recorrido por las 15 combinaciones con clics | el visor mostró cada una correctamente; 38 llamadas en total en toda la sesión |
| Orientación conservada | tras arrastrar el orbital y cambiar de orbital se mantiene la misma inclinación (`pagina-1366x768-tras-arrastre-y-cambio.png`) |
| Página a 1280×720, 1366×768 y 1920×1080 | la tarjeta con selectores cabe sin desbordar (su altura pasó de 7,5 a 9 rem) |

Límites: los clics se hicieron por la interfaz del navegador y no con la mano de una persona; con una respuesta tardía sin indicador de carga (ítem #9) el estudiante solo ve que los botones se apagan.
