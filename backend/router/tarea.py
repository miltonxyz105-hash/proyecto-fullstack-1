from fastapi import APIRouter, Depends

from dependencies.auth import obtener_usuario_id

from services.tarea_service import (
    crear_tarea, 
    obtener_tareas, 
    eliminar_tarea,
    actualizar_tarea
)
from schemas.tarea_schema import CrearTarea, actualizarTarea


router = APIRouter(
    prefix="/tareas",
    tags=["tareas"]
)


@router.post("/")
def crear_nueva_tarea(
    tarea: CrearTarea,
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = crear_tarea(
        tarea.titulo,
        tarea.descripcion,
        usuario_id,
        estado=tarea.estado,
        fecha_limite=tarea.fecha_limite
    )

    return {
        "message": "Tarea Creada",
        "data": res.data
    }


@router.get("/")
def listar_tareas(
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = obtener_tareas(usuario_id)

    return {
        "message": "Tareas Obtenidas",
        "data": res.data
    }


@router.delete("/{tarea_id}")
def borrar_tarea(
    tarea_id: int,
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = eliminar_tarea(tarea_id, usuario_id)

    return {
        "message": "Tarea Eliminada",
        "data": res.data
    }


@router.put("/{tarea_id}")
def editar_tarea(
    tarea_id: int,
    tarea: actualizarTarea,
    usuario_id: str = Depends(obtener_usuario_id)
):
    res = actualizar_tarea(
        tarea_id,
        tarea.titulo,
        tarea.descripcion,
        usuario_id,
        estado=tarea.estado,
        fecha_limite=tarea.fecha_limite
    )

    return {
        "message": "Tarea Actualizada",
        "data": res.data
    }