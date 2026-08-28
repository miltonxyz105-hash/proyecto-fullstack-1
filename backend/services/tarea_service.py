from database import supabase

def crear_tarea(titulo: str, descripcion: str, usuario_id: str, estado: str = "pendiente", fecha_limite: str = None):
    data = {
        "titulo": titulo,
        "descripcion": descripcion,
        "estado": estado,
        "fecha_limite": fecha_limite,
        "usuario_id": usuario_id
    }
    res = supabase.table("tareas").insert(data).execute()

    return res 


def obtener_tareas(usuario_id: str):
    res = (
        supabase
        .table("tareas")
        .select("*")
        .eq("usuario_id", usuario_id)
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


def actualizar_tarea(tarea_id: int, titulo: str, descripcion: str, usuario_id: str, estado: str = "pendiente", fecha_limite: str = None):
    data = {
        "titulo": titulo,
        "descripcion": descripcion,
        "estado": estado,
        "fecha_limite": fecha_limite
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