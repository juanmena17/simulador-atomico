# Evidencia: resiliencia verificada en un navegador real (tarea 3.1)

Servidor de producción de Next.js con la API real; navegador Edge sin ventana controlado por su protocolo de depuración. Los tiempos son del reloj del navegador.

| Escenario | Qué se hizo | Resultado medido |
|---|---|---|
| Base de datos inalcanzable de verdad | Servidor arrancado con una base en un puerto cerrado; carga inicial | La API responde 503 (`bd_no_disponible`); 3 peticiones (t = 0,37 s, 0,91 s y 2,44 s: esperas de ≈0,5 s y ≈1,5 s); indicador de carga y 10 selectores bloqueados durante los reintentos; a los ≈2,5 s aparece "Los datos no están disponibles en este momento." con "Reintentar" ocupando el visor (primera carga, sin orbital anterior) y los selectores se liberan |
| Servidor que no responde | `fetch` colgado que solo termina si se aborta; se elige n = 2 | 1.ª petición a 0 ms, abandonada a los 8 s; 2.ª petición a 8,5 s; a los **15,08 s** aparece "El servidor tardó demasiado en responder.", la selección vuelve a n = 1 y el orbital anterior (1s) sigue visible; selectores bloqueados durante todo el tiempo |
| Fallo pasajero | 2 respuestas 502 y luego la API real | Peticiones a 1, 505 y 2010 ms; se muestra el orbital n = 2, l = 0 sin ningún aviso |
| Fallo persistente y "Reintentar" | 3 respuestas 502; luego API sana y clic en "Reintentar" | Aviso "El servicio de cálculo no está disponible en este momento." con el orbital anterior visible; tras "Reintentar" se muestra n = 2, l = 1 y el aviso desaparece |

Capturas: `primera-carga-base-caida.png` y `fallo-persistente-con-orbital-anterior.png`.

Límites: el servidor que no responde y los fallos pasajeros se simularon reemplazando `fetch` en la página; la base de datos inalcanzable es un fallo real. Los clics se enviaron por el protocolo de depuración, no con la mano de una persona.
