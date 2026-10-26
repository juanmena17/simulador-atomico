import { ejecutarConErrorBD } from "../src/lib/db/cliente";
import { cargarOrigenes } from "../src/lib/carga/cargar";
import { leerOrigenes } from "../src/lib/carga/leer-origenes";
import { validarOrigenes } from "../src/lib/carga/validar";

async function main() {
  const origenes = await leerOrigenes();
  validarOrigenes(origenes);
  const resumen = await ejecutarConErrorBD(() => cargarOrigenes(origenes));
  console.log(`Orbitales: ${resumen.orbitales.creados} creados, ${resumen.orbitales.actualizados} actualizados. Secciones: ${resumen.secciones.creadas} creadas, ${resumen.secciones.actualizadas} actualizadas.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Error inesperado durante la carga.");
  process.exitCode = 1;
});
