"""Fachada pública para el cálculo y empaquetado de un orbital."""

from .anillos import (
    FRACCION_ENVOLVENTE,
    FRACCION_NUCLEO,
    N_MALLA,
    N_REBANADAS_ENVOLVENTE,
    N_REBANADAS_NUCLEO,
    anillos,
)
from .dominio import validar_orbital
from .formato import FACTOR_PUNTOS, MAX_PUNTOS, MIN_PUNTOS, ESCALA_CUANTIZACION, codificar

VERSION_ALGORITMO = "1"
FRACCION_EXTENSION = 0.985
PARAMETROS_ALGORITMO = {
    "N_MALLA": N_MALLA,
    "N_REBANADAS_ENVOLVENTE": N_REBANADAS_ENVOLVENTE,
    "N_REBANADAS_NUCLEO": N_REBANADAS_NUCLEO,
    "FRACCION_ENVOLVENTE": FRACCION_ENVOLVENTE,
    "FRACCION_NUCLEO": FRACCION_NUCLEO,
    "FRACCION_EXTENSION": FRACCION_EXTENSION,
    "FACTOR_PUNTOS": FACTOR_PUNTOS,
    "MIN_PUNTOS": MIN_PUNTOS,
    "MAX_PUNTOS": MAX_PUNTOS,
    "ESCALA_CUANTIZACION": ESCALA_CUANTIZACION,
}


def calcular_orbital(n, l):
    """Calcula y devuelve un orbital en el formato JSON del servicio."""
    n, l, _ = validar_orbital(n, l)
    extension, envolvente, nucleo = anillos(n, l)
    return {
        "n": n,
        "l": l,
        "version": VERSION_ALGORITMO,
        "extension": round(float(extension), 3),
        "envolvente": codificar(envolvente, extension),
        "nucleo": codificar(nucleo, extension),
    }
