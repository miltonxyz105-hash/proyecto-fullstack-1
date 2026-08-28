from database import supabase


def registrar_usuario(nombre: str, edad: int, email: str, password: str):
    auth_res = supabase.auth.sign_up({
        "email": email,
        "password": password
    })

    if auth_res.user is None:
        raise RuntimeError(
            "No se pudo completar el registro. Verifica que la contrasena "
            "cumpla los requisitos de Supabase (min 6 caracteres) y que el "
            "email sea valido. Si la confirmacion por email esta activada, "
            "el usuario se crea pero requiere validacion antes de iniciar sesion."
        )

    auth_id = auth_res.user.id

    data = {
        "auth_id": auth_id,
        "nombre": nombre,
        "edad": edad,
        "email": email
    }

    db_res = supabase.table("usuarios").insert(data).execute()

    return db_res


def login_usuario(email: str, password: str):

    res = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })

    return res

