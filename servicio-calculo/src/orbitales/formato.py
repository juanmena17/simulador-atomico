"""Formato compacto y reversible para curvas de nivel."""

from __future__ import annotations

import base64

import numpy as np

ESCALA_CUANTIZACION = 32767
FACTOR_PUNTOS = 105
MIN_PUNTOS = 10
MAX_PUNTOS = 72


def remuestrear(curva, extension):
    """Remuestrea linealmente una curva sobre su longitud de arco."""
    curva = np.asarray(curva, dtype=float)
    segmentos = np.linalg.norm(np.diff(curva, axis=0), axis=1)
    perimetro = float(segmentos.sum())
    if perimetro <= 0:
        return None
    cantidad = int(np.clip(round(perimetro / extension * FACTOR_PUNTOS), MIN_PUNTOS, MAX_PUNTOS))
    arco = np.r_[0.0, np.cumsum(segmentos)]
    posiciones = np.linspace(0.0, perimetro, cantidad)
    return np.c_[[np.interp(posiciones, arco, curva[:, i]) for i in range(3)]].T


def codificar(curvas, extension):
    """Codifica curvas en int16 little-endian y base64."""
    puntos, longitudes = [], []
    for curva in curvas:
        remuestreada = remuestrear(curva, extension)
        if remuestreada is None:
            continue
        puntos.append(remuestreada)
        longitudes.append(len(remuestreada))
    if not puntos:
        return {"p": "", "l": []}
    normalizados = np.vstack(puntos) / extension
    cuantizados = np.clip(
        np.round(normalizados * ESCALA_CUANTIZACION),
        -ESCALA_CUANTIZACION,
        ESCALA_CUANTIZACION,
    ).astype("<i2")
    return {
        "p": base64.b64encode(cuantizados.tobytes()).decode("ascii"),
        "l": longitudes,
    }


def decodificar(grupo, extension):
    """Decodifica un grupo y devuelve curvas en unidades físicas."""
    if not grupo["l"]:
        return []
    datos = base64.b64decode(grupo["p"].encode("ascii"))
    puntos = np.frombuffer(datos, dtype="<i2").reshape(-1, 3)
    puntos = puntos.astype(float) * (extension / ESCALA_CUANTIZACION)
    curvas, inicio = [], 0
    for longitud in grupo["l"]:
        fin = inicio + int(longitud)
        curvas.append(puntos[inicio:fin].copy())
        inicio = fin
    if inicio != len(puntos):
        raise ValueError("las longitudes no coinciden con los puntos codificados")
    return curvas
