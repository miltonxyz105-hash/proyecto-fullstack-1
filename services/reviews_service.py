from database import supabase


def crear_review(
    juego_id: int,
    usuario_id: str,
    puntuacion: int,
    comentario: str
):
    data = {
        "juego_id": juego_id,
        "usuario_id": usuario_id,
        "puntuacion": puntuacion,
        "comentario": comentario
    }

    res = supabase.table("reviews").insert(data).execute()

    return res


def obtener_reviews_por_juego(juego_id: int):
    res = (
        supabase
        .table("reviews")
        .select("*")
        .eq("juego_id", juego_id)
        .execute()
    )

    return res


def obtener_reviews_usuario(usuario_id: str):
    res = (
        supabase
        .table("reviews")
        .select("*")
        .eq("usuario_id", usuario_id)
        .execute()
    )

    return res


def actualizar_review(
    review_id: int,
    usuario_id: str,
    puntuacion: int,
    comentario: str
):
    data = {
        "puntuacion": puntuacion,
        "comentario": comentario
    }

    res = (
        supabase
        .table("reviews")
        .update(data)
        .eq("id", review_id)
        .eq("usuario_id", usuario_id)
        .execute()
    )

    return res


def eliminar_review(review_id: int, usuario_id: str):
    res = (
        supabase
        .table("reviews")
        .delete()
        .eq("id", review_id)
        .eq("usuario_id", usuario_id)
        .execute()
    )

    return res
