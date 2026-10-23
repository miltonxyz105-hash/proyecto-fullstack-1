from fastapi import APIRouter, Depends, HTTPException

from dependencies.auth import obtener_usuario_id
from schemas.reviews_schema import ActualizarReview, CrearReview
from services.juegos_service import obtener_juego
from services.reviews_service import (
    actualizar_review,
    crear_review,
    eliminar_review,
    obtener_review,
    obtener_reviews_por_juego,
    obtener_reviews_usuario,
)

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/mias")
def listar_mis_reviews(usuario_id: str = Depends(obtener_usuario_id)):
    res = obtener_reviews_usuario(usuario_id)
    return {
        "message": "Reviews del usuario obtenidas exitosamente",
        "data": res.data or [],
    }


@router.get("/juego/{juego_id}")
def listar_reviews_de_juego(
    juego_id: int,
    usuario_id: str = Depends(obtener_usuario_id),
):
    res = obtener_reviews_por_juego(juego_id, usuario_id)
    return {
        "message": "Reviews obtenidas exitosamente",
        "data": res.data or [],
    }


@router.get("/{review_id}")
def ver_review(review_id: int, usuario_id: str = Depends(obtener_usuario_id)):
    res = obtener_review(review_id, usuario_id)

    if not res.data:
        raise HTTPException(status_code=404, detail="Review no encontrada.")

    return {
        "message": "Review obtenida exitosamente",
        "data": res.data[0],
    }


@router.post("/")
def crear_nueva_review(
    review: CrearReview,
    usuario_id: str = Depends(obtener_usuario_id),
):
    # La review solo puede apuntar a un juego de la propia biblioteca.
    juego = obtener_juego(review.juego_id, usuario_id)
    if not juego.data:
        raise HTTPException(
            status_code=404,
            detail="Ese juego no está en tu biblioteca. Añádelo antes de reseñarlo.",
        )

    res = crear_review(
        juego_id=review.juego_id,
        usuario_id=usuario_id,
        puntuacion=review.puntuacion,
        comentario=review.comentario,
    )

    return {
        "message": "Review creada exitosamente",
        "data": res.data,
    }


@router.put("/{review_id}")
def editar_review(
    review_id: int,
    review: ActualizarReview,
    usuario_id: str = Depends(obtener_usuario_id),
):
    res = actualizar_review(
        review_id=review_id,
        usuario_id=usuario_id,
        puntuacion=review.puntuacion,
        comentario=review.comentario,
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="Review no encontrada.")

    return {
        "message": "Review actualizada exitosamente",
        "data": res.data,
    }


@router.delete("/{review_id}")
def borrar_review(
    review_id: int,
    usuario_id: str = Depends(obtener_usuario_id),
):
    res = eliminar_review(review_id, usuario_id)

    if not res.data:
        raise HTTPException(status_code=404, detail="Review no encontrada.")

    return {
        "message": "Review eliminada exitosamente",
        "data": res.data,
    }
