from fastapi import APIRouter, Depends, HTTPException

from dependencies.auth import obtener_usuario_id
from schemas.favoritos_schema import CrearFavorito
from services.favoritos_service import (
    agregar_favorito,
    eliminar_favorito,
    obtener_favoritos,
    obtener_favoritos_de_juego,
)
from services.juegos_service import obtener_juego

router = APIRouter(prefix="/favoritos", tags=["favoritos"])


def _validar_juego_propio(juego_id: int, usuario_id: str) -> None:
    """Un favorito solo puede apuntar a un juego de la propia biblioteca."""
    if not obtener_juego(juego_id, usuario_id).data:
        raise HTTPException(
            status_code=404,
            detail="Ese juego no está en tu biblioteca.",
        )


@router.post("/")
def crear_favorito(
    favorito: CrearFavorito,
    usuario_id: str = Depends(obtener_usuario_id),
):
    _validar_juego_propio(favorito.juego_id, usuario_id)

    if obtener_favoritos_de_juego(favorito.juego_id, usuario_id).data:
        raise HTTPException(
            status_code=409,
            detail="Ese juego ya está en tus favoritos.",
        )

    res = agregar_favorito(favorito.juego_id, usuario_id)

    return {
        "message": "Juego agregado a favoritos",
        "data": res.data,
    }


@router.get("/")
def listar_favoritos(usuario_id: str = Depends(obtener_usuario_id)):
    res = obtener_favoritos(usuario_id)

    return {
        "message": "Favoritos obtenidos exitosamente",
        "data": res.data or [],
    }


@router.get("/juego/{juego_id}")
def ver_si_es_favorito(
    juego_id: int,
    usuario_id: str = Depends(obtener_usuario_id),
):
    res = obtener_favoritos_de_juego(juego_id, usuario_id)

    return {
        "message": "Favorito verificado",
        "data": res.data or [],
    }


@router.delete("/{juego_id}")
def borrar_favorito(
    juego_id: int,
    usuario_id: str = Depends(obtener_usuario_id),
):
    res = eliminar_favorito(juego_id, usuario_id)

    if not res.data:
        raise HTTPException(status_code=404, detail="Ese juego no está en tus favoritos.")

    return {
        "message": "Juego eliminado de favoritos",
        "data": res.data,
    }
