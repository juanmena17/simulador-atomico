"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QuantumCard } from "./QuantumCard";
import { ViewerArea } from "./ViewerArea";
import VisorOrbital from "./VisorOrbital";
import { ErrorConsultaOrbital } from "../lib/seleccion/cliente-api";
import { pedirOrbitalConReintentos } from "../lib/seleccion/reintentos";
import { IndicadorCarga } from "./IndicadorCarga";
import { AvisoError } from "./AvisoError";
import { esCombinacionValida } from "../lib/seleccion/combinaciones";
import type { OrbitalApi } from "../lib/visor/tipos";

type Seleccion = { n: number; l: number };
type OrbitalMostrado = Seleccion & { datos: OrbitalApi };
type Consulta = { fase: "ocioso" } | { fase: "cargando" } | { fase: "error"; eleccion: Seleccion; codigo: string };

export function PanelOrbital() {
  const [seleccion, setSeleccion] = useState<Seleccion>({ n: 1, l: 0 });
  const [orbitalMostrado, setOrbitalMostrado] = useState<OrbitalMostrado | null>(null);
  const [consulta, setConsulta] = useState<Consulta>({ fase: "cargando" });
  const montado = useRef(true);
  const enConsultaRef = useRef(false);
  const orbitalMostradoRef = useRef<OrbitalMostrado | null>(null);

  const elegir = useCallback(async (n: number, l: number) => {
    if (!montado.current || enConsultaRef.current || !esCombinacionValida(n, l)) return;
    enConsultaRef.current = true;
    setConsulta({ fase: "cargando" });
    setSeleccion({ n, l });
    try {
      const datos = await pedirOrbitalConReintentos(n, l);
      if (!montado.current) return;
      const mostrado = { n, l, datos };
      orbitalMostradoRef.current = mostrado;
      setOrbitalMostrado(mostrado);
      setConsulta({ fase: "ocioso" });
    } catch (error) {
      if (!montado.current) return;
      const anterior = orbitalMostradoRef.current;
      setSeleccion(anterior ? { n: anterior.n, l: anterior.l } : { n: 1, l: 0 });
      const codigo = error instanceof ErrorConsultaOrbital ? error.codigo : "error_interno";
      setConsulta({ fase: "error", eleccion: { n, l }, codigo });
      console.error("No se pudo cargar el orbital.");
    } finally {
      if (montado.current) {
        enConsultaRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    montado.current = true;
    queueMicrotask(() => { if (montado.current) void elegir(1, 0); });
    return () => { montado.current = false; };
  }, [elegir]);

  return <>
    <ViewerArea>
      <VisorOrbital orbital={orbitalMostrado?.datos ?? null} />
      {consulta.fase === "cargando" && <IndicadorCarga />}
      {consulta.fase === "error" && <AvisoError codigo={consulta.codigo} alReintentar={() => void elegir(consulta.eleccion.n, consulta.eleccion.l)} variante={orbitalMostrado ? "franja" : "central"} />}
    </ViewerArea>
    <QuantumCard n={seleccion.n} l={seleccion.l} m={0} alElegirN={(n) => void elegir(n, seleccion.l)} alElegirL={(l) => void elegir(seleccion.n, l)} deshabilitado={consulta.fase === "cargando"} />
  </>;
}
