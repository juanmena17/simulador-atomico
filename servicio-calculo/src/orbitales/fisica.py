# Copia literal de D:\DMC\Projects\visualAtoms\src\visualatoms\physics.py.
"""Funciones vectorizadas para orbitales hidrogenoides en unidades atómicas."""

from math import factorial

import numpy as np
from scipy.integrate import cumulative_trapezoid
from scipy.special import genlaguerre, lpmv


def _validate_quantum_numbers(n, l, m):
    """Valida los números cuánticos y devuelve enteros Python."""
    if not isinstance(n, (int, np.integer)) or not isinstance(l, (int, np.integer)):
        raise ValueError("n y l deben ser enteros")
    if not isinstance(m, (int, np.integer)):
        raise ValueError("m debe ser entero")
    n, l, m = int(n), int(l), int(m)
    if n < 1:
        raise ValueError("n debe cumplir n >= 1")
    if not 0 <= l <= n - 1:
        raise ValueError("l debe cumplir 0 <= l <= n - 1")
    if abs(m) > l:
        raise ValueError("m debe cumplir |m| <= l")
    return n, l, m


def _validate_z(Z):
    if not np.isscalar(Z) or not np.isfinite(Z) or Z <= 0:
        raise ValueError("Z debe ser un escalar positivo")
    return float(Z)


def radial(n, l, r, Z=1.0):
    """Calcula la función radial normalizada ``R_nl(r)``."""
    n, l, _ = _validate_quantum_numbers(n, l, 0)
    Z = _validate_z(Z)
    r = np.asarray(r, dtype=float)
    if np.any(r < 0):
        raise ValueError("r debe ser no negativo")
    rho = 2.0 * Z * r / n
    prefactor = np.sqrt(
        (2.0 * Z / n) ** 3
        * factorial(n - l - 1)
        / (2.0 * n * factorial(n + l))
    )
    laguerre = genlaguerre(n - l - 1, 2 * l + 1)(rho)
    return prefactor * np.exp(-rho / 2.0) * rho**l * laguerre


def angular_density(l, m, theta):
    """Calcula ``|Y_lm(theta)|^2`` usando Legendre asociada ``lpmv``."""
    _, l, m = _validate_quantum_numbers(1 if l == 0 else l + 1, l, m)
    theta = np.asarray(theta, dtype=float)
    normalization = (2 * l + 1) / (4 * np.pi) * factorial(l - abs(m)) / factorial(l + abs(m))
    return normalization * lpmv(abs(m), l, np.cos(theta)) ** 2


def psi(n, l, m, r, theta, phi, Z=1.0):
    """Calcula el orbital complejo ``psi_nlm(r, theta, phi)``."""
    n, l, m = _validate_quantum_numbers(n, l, m)
    theta, phi = np.asarray(theta, dtype=float), np.asarray(phi, dtype=float)
    angular = np.sqrt(
        (2 * l + 1) / (4 * np.pi)
        * factorial(l - abs(m))
        / factorial(l + abs(m))
    ) * lpmv(abs(m), l, np.cos(theta)) * np.exp(1j * m * phi)
    return radial(n, l, r, Z) * angular


def density(n, l, m, r, theta, Z=1.0):
    """Calcula la densidad ``|psi_nlm|^2``, independiente de ``phi``."""
    n, l, m = _validate_quantum_numbers(n, l, m)
    return radial(n, l, r, Z) ** 2 * angular_density(l, m, theta)


def density_cylindrical(n, l, m, rho_cyl, z, Z=1.0):
    """Calcula la densidad en el plano meridiano ``(rho_cyl, z)``."""
    rho_cyl = np.asarray(rho_cyl, dtype=float)
    z = np.asarray(z, dtype=float)
    r = np.hypot(rho_cyl, z)
    theta = np.arctan2(rho_cyl, z)
    return density(n, l, m, r, theta, Z)


def radial_extent(n, l, Z=1.0, fraction=0.999):
    """Devuelve el radio que contiene ``fraction`` de la probabilidad radial."""
    n, l, _ = _validate_quantum_numbers(n, l, 0)
    Z = _validate_z(Z)
    if not 0 < fraction < 1:
        raise ValueError("fraction debe estar estrictamente entre 0 y 1")
    r_max = max(40.0 * n * n / Z, 40.0 / Z)
    r = np.linspace(0.0, r_max, 30001)
    probability = r**2 * radial(n, l, r, Z) ** 2
    cumulative = cumulative_trapezoid(probability, r, initial=0.0)
    cumulative /= cumulative[-1]
    return float(np.interp(fraction, cumulative, r))


def cumulative_isovalue(n, l, m, fraction, Z=1.0, grid=300):
    """Calcula el umbral de densidad que acumula ``fraction`` de probabilidad.

    La integración usa celdas uniformes centradas en una malla del semiplano
    ``rho_cyl >= 0`` y el peso de revolución ``2*pi*rho_cyl``.
    """
    n, l, m = _validate_quantum_numbers(n, l, m)
    Z = _validate_z(Z)
    if not 0 < fraction < 1:
        raise ValueError("fraction debe estar estrictamente entre 0 y 1")
    if isinstance(grid, (int, np.integer)):
        if grid < 20:
            raise ValueError("grid debe ser al menos 20")
        nr = nz = int(grid)
    else:
        try:
            nr, nz = map(int, grid)
        except (TypeError, ValueError):
            raise ValueError("grid debe ser un entero o una pareja de enteros") from None
    extent = radial_extent(n, l, Z, fraction=0.999999)
    dr = extent / nr
    dz = 2.0 * extent / nz
    rho = (np.arange(nr) + 0.5) * dr
    z = -extent + (np.arange(nz) + 0.5) * dz
    rho_mesh, z_mesh = np.meshgrid(rho, z, indexing="ij")
    values = density_cylindrical(n, l, m, rho_mesh, z_mesh, Z)
    weights = 2.0 * np.pi * rho_mesh * dr * dz
    order = np.argsort(values.ravel())[::-1]
    sorted_values = values.ravel()[order]
    # Masa de probabilidad de cada celda = densidad * volumen de revolución.
    cumulative = np.cumsum(sorted_values * weights.ravel()[order])
    total = cumulative[-1]
    target = fraction * total
    index = int(np.searchsorted(cumulative, target, side="left"))
    return float(sorted_values[min(index, sorted_values.size - 1)])
