from database import supabase


def agregar_favorito(juego_id: int, usuario_id: str):
    data = {
        "juego_id": juego_id,
        "usuario_id": usuario_id
    }

    res = supabase.table("favoritos").insert(data).execute()

    return res


def obtener_favoritos(usuario_id: str):
    res = (
        supabase
        .table("favoritos")
        .select("*")
        .eq("usuario_id", usuario_id)
        .execute()
    )

    return res


def eliminar_favorito(juego_id: int, usuario_id: str):
    res = (
        supabase
        .table("favoritos")
        .delete()
        .eq("juego_id", juego_id)
        .eq("usuario_id", usuario_id)
        .execute()
    )

    return res
