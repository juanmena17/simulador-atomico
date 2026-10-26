"""Servicio HTTP interno para el cálculo de orbitales."""

from __future__ import annotations

import hmac
import os
import re
import sys
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


RUTA_SRC = Path(__file__).resolve().parent / "src"
if str(RUTA_SRC) not in sys.path:
    sys.path.insert(0, str(RUTA_SRC))

from orbitales import OrbitalInvalidoError, calcular_orbital

PATRON_ENTERO = re.compile(r"[+-]?\d+")
app = FastAPI()


def _error(codigo: str, mensaje: str, estado: int) -> JSONResponse:
    return JSONResponse(
        status_code=estado,
        content={"error": {"codigo": codigo, "mensaje": mensaje}},
    )


def _convertir_entero(valor: str | None, nombre: str) -> int:
    if valor is None or not PATRON_ENTERO.fullmatch(valor):
        recibido = "faltante" if valor is None else f"{valor!r}"
        raise OrbitalInvalidoError(f"{nombre} inválido: {recibido}; debe ser entero")
    return int(valor)


def _autorizado(request: Request) -> JSONResponse | None:
    secreto_actual = os.environ.get("SECRETO_SERVICIO", "")
    if not secreto_actual:
        return _error(
            "servicio_sin_secreto",
            "El servicio no tiene un secreto configurado",
            503,
        )

    presentado = request.headers.get("X-Servicio-Secreto")
    if presentado is None:
        return _error("no_autorizado", "Se requiere autorización", 401)

    valores_validos = [secreto_actual]
    secreto_anterior = os.environ.get("SECRETO_SERVICIO_ANTERIOR", "")
    if secreto_anterior:
        valores_validos.append(secreto_anterior)
    presentado_bytes = presentado.encode("utf-8")
    if not any(
        hmac.compare_digest(presentado_bytes, valor.encode("utf-8"))
        for valor in valores_validos
    ):
        return _error("no_autorizado", "Se requiere autorización", 401)
    return None


@app.get("/orbital")
def obtener_orbital(request: Request, n: str | None = None, l: str | None = None):
    respuesta_autorizacion = _autorizado(request)
    if respuesta_autorizacion is not None:
        return respuesta_autorizacion

    try:
        numero_principal = _convertir_entero(n, "n")
        numero_angular = _convertir_entero(l, "l")
        return calcular_orbital(numero_principal, numero_angular)
    except OrbitalInvalidoError as exc:
        return _error("orbital_invalido", str(exc), 400)
    except Exception:
        return _error("error_interno", "Error interno del servicio", 500)


@app.exception_handler(StarletteHTTPException)
async def manejar_error_http(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return _error("no_encontrado", "Ruta no encontrada", 404)
    if exc.status_code == 405:
        return _error("metodo_no_permitido", "Método no permitido", 405)
    return _error("error_interno", "Error interno del servicio", 500)


@app.exception_handler(RequestValidationError)
async def manejar_error_validacion(request: Request, exc: RequestValidationError):
    return _error("orbital_invalido", "Parámetros de orbital inválidos", 400)


@app.exception_handler(Exception)
async def manejar_error_interno(request: Request, exc: Exception):
    return _error("error_interno", "Error interno del servicio", 500)
