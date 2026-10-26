import numpy as np

from orbitales.formato import codificar, decodificar, remuestrear


def test_recuperacion_de_curvas_y_longitudes():
    curvas = [
        np.c_[np.cos(np.linspace(0, 2 * np.pi, 40)), np.sin(np.linspace(0, 2 * np.pi, 40)), np.zeros(40)],
        np.zeros((3, 3)),
    ]
    extension = 2.0
    grupo = codificar(curvas, extension)
    recuperadas = decodificar(grupo, extension)
    esperada = remuestrear(curvas[0], extension)
    assert sum(grupo["l"]) == sum(len(curva) for curva in recuperadas)
    assert np.max(np.abs(recuperadas[0] - esperada)) <= extension / 32767


def test_formato_vacio():
    assert codificar([], 1.0) == {"p": "", "l": []}
    assert decodificar({"p": "", "l": []}, 1.0) == []
