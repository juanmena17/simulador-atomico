"""Densidad y extracción determinista de curvas de nivel orbitales."""

from __future__ import annotations

import numpy as np
from skimage import measure

from . import fisica
from .dominio import validar_orbital

N_MALLA = 110
N_REBANADAS_ENVOLVENTE = 44
N_REBANADAS_NUCLEO = 22
FRACCION_ENVOLVENTE = 0.90
FRACCION_NUCLEO = 0.12


def malla_densidad(n, l, puntos=N_MALLA):
    """Devuelve extensión, eje y densidad 3D para m=0."""
    n, l, m = validar_orbital(n, l)
    extent = fisica.radial_extent(n, l, fraction=0.985)
    eje = np.linspace(-extent, extent, puntos)
    x, y, z = np.meshgrid(eje, eje, eje, indexing="ij")
    r = np.sqrt(x * x + y * y + z * z) + 1e-12
    theta = np.arccos(np.clip(z / r, -1.0, 1.0))
    return float(extent), eje, fisica.density(n, l, m, r, theta)


def umbral(densidad, dv, fraccion):
    """Obtiene el umbral cuya masa acumulada alcanza ``fraccion``."""
    if not 0 < fraccion < 1:
        raise ValueError("fraccion debe estar estrictamente entre 0 y 1")
    ordenada = np.sort(np.asarray(densidad).ravel())[::-1]
    acumulada = np.cumsum(ordenada * dv)
    acumulada /= acumulada[-1]
    indice = np.searchsorted(acumulada, fraccion, side="left")
    return float(ordenada[min(indice, ordenada.size - 1)])


def loops_for(densidad, eje, umbral_nivel, rebanadas):
    """Extrae curvas de nivel en planos z, como arrays ``(puntos, 3)``."""
    cantidad = len(eje)
    resultado = []
    for k in np.linspace(2, cantidad - 3, rebanadas).astype(int):
        curvas = measure.find_contours(densidad[:, :, k], umbral_nivel)
        for curva in curvas:
            if len(curva) < 6:
                continue
            u = np.interp(curva[:, 0], np.arange(cantidad), eje)
            v = np.interp(curva[:, 1], np.arange(cantidad), eje)
            resultado.append(np.c_[u, v, np.full(len(curva), eje[k])])
    return resultado


def anillos(n, l):
    """Calcula los anillos de envolvente y núcleo del orbital ``(n, l)``."""
    extent, eje, densidad = malla_densidad(n, l)
    dv = float((eje[1] - eje[0]) ** 3)
    envolvente = loops_for(
        densidad, eje, umbral(densidad, dv, FRACCION_ENVOLVENTE),
        N_REBANADAS_ENVOLVENTE,
    )
    nucleo = loops_for(
        densidad, eje, umbral(densidad, dv, FRACCION_NUCLEO),
        N_REBANADAS_NUCLEO,
    )
    return extent, envolvente, nucleo
