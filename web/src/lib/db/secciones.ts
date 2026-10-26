import { ejecutarConErrorBD, obtenerCliente } from "./cliente";

export type DatosSeccion = {
  clave: string;
  orden: number;
  titulo: string;
  contenido: string;
};

export function listarSecciones() {
  return ejecutarConErrorBD(() => obtenerCliente().seccionTeorica.findMany({ orderBy: { orden: "asc" } }));
}

export function guardarSeccion(datos: DatosSeccion) {
  return ejecutarConErrorBD(() => obtenerCliente().seccionTeorica.upsert({
    where: { clave: datos.clave },
    create: datos,
    update: { orden: datos.orden, titulo: datos.titulo, contenido: datos.contenido },
  }));
}
