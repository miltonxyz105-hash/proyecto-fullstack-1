from fastapi import APIRouter, Depends

from dependencies.auth import obtener_usuario_id

from schemas.juegos_schema import Crearjuego, Actualizarjuego
from services.juegos_service import (
    actualizar_juego,
    crear_juego,
    eliminar_juego,
    obtener_juego,
    obtener_juegos
)

router = APIRouter(
    prefix="/juegos",
    tags=["juegos"]
)

@router.get("/")
def listar_juegos(usuario_id: str = Depends(obtener_usuario_id)):
    res = obtener_juegos(usuario_id)
    return {
        "message": "Juegos obtenidos exitosamente",
        "data": res.data
    }

@router.get("/{juego_id}")
def ver_juego(juego_id: int,usuario_id: str = Depends(obtener_usuario_id)):
    res = obtener_juego(juego_id, usuario_id)

    return {
        "message": "Juego obtenido exitosamente",
        "data": res.data
    }

@router.post("/")

def crear_nuevo_juego(juego: Crearjuego,usuario_id: str = Depends
(obtener_usuario_id)):
    res = crear_juego(
        nombre = juego.nombre,
        genero = juego.genero,
        plataforma = juego.plataforma,
        horas_jugadas = juego.horas_jugadas,
        estado = juego.estado,
        usuario_id = usuario_id,
        fecha_inicio = juego.fecha_inicio,
        fecha_fin = juego.fecha_fin,
        porcentaje_completado = juego.porcentaje_completado,
        platinado = juego.platinado,
        logros = juego.logros,
        comentario_personal = juego.comentario_personal
    )
    return {
        "message": "Juego creado exitosamente",
        "data": res.data   
        }

@router.put("/{juego_id}")
def editar_juego(juego_id: int,juego: Actualizarjuego,usuario_id: str = 
Depends(obtener_usuario_id)):
    res = actualizar_juego(
        juego_id=juego_id,
        usuario_id=usuario_id,
        nombre=juego.nombre,
        genero=juego.genero,
        plataforma=juego.plataforma,
        horas_jugadas=juego.horas_jugadas,
        estado=juego.estado,
        fecha_inicio=juego.fecha_inicio,
        fecha_fin=juego.fecha_fin,
        porcentaje_completado=juego.porcentaje_completado,
        platinado=juego.platinado,
        logros=juego.logros,
        comentario_personal=juego.comentario_personal
    )
    return {
        "message": "Juego actualizado exitosamente",
        "data": res.data
    }

@router.delete("/{juego_id}")
def borrar_juego(juego_id: int,usuario_id: str = 
Depends(obtener_usuario_id)):
    res = eliminar_juego(juego_id, usuario_id)
    return {
        "message": "Juego eliminado exitosamente",
        "data": res.data
    }