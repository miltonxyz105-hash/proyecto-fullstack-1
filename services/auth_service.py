from database import supabase


def registrar_usuario(nombre: str, edad: int, email: str, password: str):

# crea usuario en auth de supabase
    auth_res = supabase.auth.sign_up({
        "email": email,  
        "password": password
    })
    
#obtener uid
    auth_id = auth_res.user.id

#guardar en tabla de usuarios
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

