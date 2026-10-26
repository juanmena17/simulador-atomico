"""Validación del dominio de orbitales soportado por el servicio."""

import numbers


class OrbitalInvalidoError(ValueError):
    """Indica que un número cuántico está fuera del dominio soportado."""


def _entero(valor, nombre):
    if isinstance(valor, bool) or not isinstance(valor, numbers.Integral):
        raise OrbitalInvalidoError(f"{nombre} inválido: {valor!r}; debe ser entero")
    return int(valor)


def validar_orbital(n, l):
    """Valida y devuelve ``(n, l, 0)`` para un orbital permitido."""
    n = _entero(n, "n")
    l = _entero(l, "l")
    if not 1 <= n <= 5:
        raise OrbitalInvalidoError(f"n inválido: {n}; debe estar entre 1 y 5")
    if not 0 <= l < n:
        raise OrbitalInvalidoError(f"l inválido: {l}; debe estar entre 0 y n-1")
    return n, l, 0
