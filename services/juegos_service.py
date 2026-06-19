from database import supabase

def crear_juego(
    nombre: str,
    genero: str,
    plataforma: str,
    horas_jugadas: int,
    estado: str,
    usuario_id: str
):
    
    data = {
        "nombre": nombre,
        "genero": genero,
        "plataforma": plataforma,
        "horas_jugadas": horas_jugadas,
        "estado": estado,
        "usuario_id": usuario_id
    }
    res = supabase.table("juegos").insert(data).execute()

    return res

def actualizar_juego(
    juego_id: int,
    nombre: str,
    genero: str,
    plataforma: str,
    horas_jugadas: int,
    estado: str,
    usuario_id: str
):

    data = {
        "nombre": nombre,
        "genero": genero,
        "plataforma": plataforma,
        "horas_jugadas": horas_jugadas,
        "estado": estado
    }

    res = (
        supabase
        .table("juegos")
        .update(data)
        .eq("id", juego_id)
        .eq("usuario_id", usuario_id)
        .execute()
    )

    return res

def eliminar_juego(juego_id: int, usuario_id: str):

    res = (
        supabase
        .table("juegos")
        .delete()
        .eq("id", juego_id)
        .eq("usuario_id", usuario_id)
        .execute()
    )

    return res
