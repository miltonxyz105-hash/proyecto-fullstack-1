from database import supabase

def crear_tarea(titulo: str, descripcion: str, usuario_id: str):
    data = {
        "titulo": titulo,
        "descripcion": descripcion,
        "usuario_id": usuario_id
    }
    res = supabase.table("tareas").insert(data).execute()

    return res 

def obtener_tareas(usuario_id: str):

    res = (
        supabase
        .table("tareas")
        .select("*")
        .eq("usuario_id" , usuario_id)
        .execute()
        )

    return res

def eliminar_tarea(tarea_id: int, usuario_id: str):

    res = (
        supabase
        .table("tareas")
        .delete()
        .eq("id", tarea_id)
        .eq("usuario_id", usuario_id)
        .execute()
    )

    return res

def actualizar_tarea(
        tarea_id: int,
        titulo: str,
        descripcion: str,
        usuario_id: str
        ):

    data = {
        "titulo": titulo,
        "descripcion": descripcion
    }

    res = (
        supabase
        .table("tareas")
        .update(data)
        .eq("id", tarea_id)
        .eq("usuario_id", usuario_id)
        .execute()
    )

    return res