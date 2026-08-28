from fastapi import APIRouter, Depends

from dependencies.auth import obtener_usuario_id
from schemas.favoritos_schema import CrearFavorito
from services.favoritos_service import (
    agregar_favorito,
    eliminar_favorito,
    obtener_favoritos,
    obtener_favoritos_de_juego
)

router = APIRouter(
    prefix="/favoritos",
    tags=["favoritos"]
)


@router.post("/")
def crear_favorito(
    favorito: CrearFavorito,
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = agregar_favorito(favorito.juego_id, usuario_id)

    return {
        "message": "Juego agregado a favoritos",
        "data": res.data
    }


@router.get("/")
def listar_favoritos(
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = obtener_favoritos(usuario_id)

    return {
        "message": "Favoritos obtenidos exitosamente",
        "data": res.data
    }


@router.get("/juego/{juego_id}")
def ver_si_es_favorito(
    juego_id: int,
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = obtener_favoritos_de_juego(juego_id, usuario_id)

    return {
        "message": "Favorito verificado",
        "data": res.data
    }


@router.delete("/{juego_id}")
def borrar_favorito(
    juego_id: int,
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = eliminar_favorito(juego_id, usuario_id)

    return {
        "message": "Juego eliminado de favoritos",
        "data": res.data
    }
