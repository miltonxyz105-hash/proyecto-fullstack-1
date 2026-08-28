from database import supabase

def obtener_juegos(usuario_id: str):
    res = (
        supabase
        .table("juegos")
        .select("*")
        .eq("usuario_id", usuario_id)
        .execute()
    )
    return res

def obtener_juego(juego_id: int, usuario_id: str):
    res = (
        supabase
        .table("juegos")
        .select("*")
        .eq("id", juego_id)
        .eq("usuario_id", usuario_id)
        .execute()
    )
    return res

def crear_juego(
    nombre: str,
    genero: str,
    plataforma: str,
    horas_jugadas: int,
    estado: str,
    usuario_id: str,
    fecha_inicio: str = None,
    fecha_fin: str = None,
    porcentaje_completado: int = 0,
    platinado: bool = False,
    logros: str = None,
    comentario_personal: str = None
):
    data = {
        "nombre": nombre,
        "genero": genero,
        "plataforma": plataforma,
        "horas_jugadas": horas_jugadas,
        "estado": estado,
        "usuario_id": usuario_id,
        "fecha_inicio": fecha_inicio,
        "fecha_fin": fecha_fin,
        "porcentaje_completado": porcentaje_completado,
        "platinado": platinado,
        "logros": logros,
        "comentario_personal": comentario_personal
    }
    res = supabase.table("juegos").insert(data).execute()
    return res

def actualizar_juego(
    juego_id: int,
    usuario_id: str,
    nombre: str = None,
    genero: str = None,
    plataforma: str = None,
    horas_jugadas: int = None,
    estado: str = None,
    fecha_inicio: str = None,
    fecha_fin: str = None,
    porcentaje_completado: int = None,
    platinado: bool = None,
    logros: str = None,
    comentario_personal: str = None
):
    data ={}
    if nombre is not None:
        data["nombre"] = nombre
    if genero is not None:
        data["genero"] = genero
    if plataforma is not None:
        data["plataforma"] = plataforma
    if horas_jugadas is not None:
        data["horas_jugadas"] = horas_jugadas
    if estado is not None:
        data["estado"] = estado
    if fecha_inicio is not None:
        data["fecha_inicio"] = fecha_inicio
    if fecha_fin is not None:
        data["fecha_fin"] = fecha_fin
    if porcentaje_completado is not None:
        data["porcentaje_completado"] = porcentaje_completado
    if platinado is not None:
        data["platinado"] = platinado
    if logros is not None:
        data["logros"] = logros
    if comentario_personal is not None:
        data["comentario_personal"] = comentario_personal

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