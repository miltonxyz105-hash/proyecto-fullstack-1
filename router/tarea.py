from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


from services.tarea_service import (
    crear_tarea, 
    obtener_tareas, 
    eliminar_tarea,
    actualizar_tarea
)
from schemas.tarea_schema import CrearTarea, actualizarTarea
from database import supabase


router = APIRouter(
    prefix="/tareas",
    tags=["tareas"]
)

security = HTTPBearer()


@router.post("/")
def crear_nueva_tarea(
    tarea: CrearTarea,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    
    token = credentials.credentials
    # Aquí puedes agregar lógica para verificar el token y obtener el usuario_id
    # Por ejemplo, podrías decodificar el token JWT para obtener el usuario_id
    # Supongamos que obtienes el usuario_id de alguna manera, por ejemplo:
    
    user = supabase.auth.get_user(token)

    usuario_id = user.user.id 

    res = crear_tarea(
        tarea.titulo,
        tarea.descripcion,
        usuario_id
    )

    return {
        "message": "Tarea Creada",
        "data": res.data
    }

@router.get("/")
def listas_creadas(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    user = supabase.auth.get_user(token)

    usuario_id = user.user.id 

    res = obtener_tareas(usuario_id)

    return {
        "message": "Tareas Obtenidas",
        "data": res.data
    }

@router.delete("/{tarea_id}")
def borrar_tarea(
    tarea_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    user = supabase.auth.get_user(token)

    usuario_id = user.user.id 

    res = eliminar_tarea(tarea_id, usuario_id)

    return {
        "message": "Tarea Eliminada",
        "data": res.data
    }

@router.put("/{tarea_id}")
def editar_tarea(
    tarea_id: int,
    tarea: actualizarTarea,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    user = supabase.auth.get_user(token)

    usuario_id = user.user.id 

    res = actualizar_tarea(
        tarea_id,
        tarea.titulo,
        tarea.descripcion,
        usuario_id
    )

    return {
        "message": "Tarea Actualizada",
        "data": res.data
    }