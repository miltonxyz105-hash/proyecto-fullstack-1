from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from models.usuario import Usuario
from database import supabase 
import bcrypt

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)

security = HTTPBearer()


@router.get("/")
def ver_usuario(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    user = supabase.auth.get_user(token)

    usuario_id = user.user.id

    res = supabase.table("usuarios").select("*").eq("auth_id", usuario_id).execute()

    return {
        "usuarios": res.data
    }

@router.post("/")
def crear_usuario(usuario: Usuario):
    password_encriptada = bcrypt.hashpw(usuario.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    data= {
        "nombre": usuario.nombre,
        "edad": usuario.edad,
        "email": usuario.email,
        "password": password_encriptada
    }

    res = supabase.table("usuarios").insert(data).execute()

    return {
        "mensaje": "usuario guardado",
        "data": res.data
    }

@router.get("/{id}")
def obtener_usuario(id: int):

    res = supabase.table("usuarios").select("*").eq("id", id).execute()

    return {
        "usuario": res.data
    }

@router.put("/{id}")
def actualizar_usuario(id: int, usuario: Usuario):

    data = {
        "nombre": usuario.nombre,
        "edad": usuario.edad,
        "email": usuario.email
    }

    res = supabase.table("usuarios").update(data).eq("id", id).execute()

    return {
        "mensaje": "usuario actualizado",
        "data": res.data
    }

@router.delete("/{id}")
def eliminar_usuario(id: int):

    res = supabase.table("usuarios").delete().eq("id", id).execute()

    return {
        "mensaje": "usuario eliminado",
        "data": res.data
    }