from fastapi import APIRouter, Depends

from dependencies.auth import obtener_usuario_id
from schemas.reviews_schema import ActualizarReview, CrearReview
from services.reviews_service import (
    actualizar_review,
    crear_review,
    eliminar_review,
    obtener_reviews_por_juego,
    obtener_reviews_usuario
)

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)


@router.post("/")
def crear_nueva_review(
    review: CrearReview,
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = crear_review(
        juego_id=review.juego_id,
        usuario_id=usuario_id,
        puntuacion=review.puntuacion,
        comentario=review.comentario
    )

    return {
        "message": "Review creada exitosamente",
        "data": res.data
    }


@router.get("/juego/{juego_id}")
def listar_reviews_de_juego(juego_id: int):
    res = obtener_reviews_por_juego(juego_id)

    return {
        "message": "Reviews obtenidas exitosamente",
        "data": res.data
    }


@router.get("/mias")
def listar_mis_reviews(
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = obtener_reviews_usuario(usuario_id)

    return {
        "message": "Reviews del usuario obtenidas exitosamente",
        "data": res.data
    }


@router.put("/{review_id}")
def editar_review(
    review_id: int,
    review: ActualizarReview,
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = actualizar_review(
        review_id=review_id,
        usuario_id=usuario_id,
        puntuacion=review.puntuacion,
        comentario=review.comentario
    )

    return {
        "message": "Review actualizada exitosamente",
        "data": res.data
    }


@router.delete("/{review_id}")
def borrar_review(
    review_id: int,
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = eliminar_review(review_id, usuario_id)

    return {
        "message": "Review eliminada exitosamente",
        "data": res.data
    }
