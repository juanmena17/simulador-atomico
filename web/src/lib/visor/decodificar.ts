import type { GrupoAnillos, GrupoDecodificado } from "./tipos";

const ESCALA = 32767;

function decodificarBase64(base64: string): Uint8Array {
  if (base64.length === 0) return new Uint8Array(0);

  if (typeof globalThis.atob === "function") {
    const binario = globalThis.atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
    return bytes;
  }

  const constructorBuffer = (globalThis as typeof globalThis & {
    Buffer?: { from(valor: string, codificacion: "base64"): Uint8Array };
  }).Buffer;
  if (constructorBuffer) return new Uint8Array(constructorBuffer.from(base64, "base64"));
  throw new Error("No hay un decodificador base64 disponible en este entorno");
}

export function decodificarGrupo(grupo: GrupoAnillos): GrupoDecodificado {
  const bytes = decodificarBase64(grupo.p);
  const puntosEsperados = grupo.l.reduce((total, longitud) => total + longitud, 0);
  const bytesEsperados = puntosEsperados * 3 * 2;
  if (bytes.length !== bytesEsperados) {
    throw new Error(
      `Datos de orbital inválidos: se esperaban ${bytesEsperados} bytes y se recibieron ${bytes.length}`,
    );
  }

  const anillos: Float32Array[] = [];
  const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let byte = 0;
  for (const longitud of grupo.l) {
    if (!Number.isInteger(longitud) || longitud < 0) {
      throw new Error(`Longitud de anillo inválida: ${longitud}`);
    }
    const anillo = new Float32Array(longitud * 3);
    for (let i = 0; i < anillo.length; i += 1) {
      anillo[i] = vista.getInt16(byte, true) / ESCALA;
      byte += 2;
    }
    anillos.push(anillo);
  }
  return { anillos };
}
