"""Suite de integración de la API XP Legacy (sin red, sin Supabase real)."""

from tests.conftest import crear_juego

CREDENCIALES = {
    "nombre": "Ana Gamer",
    "edad": 28,
    "email": "ana@xp.com",
    "password": "secreta123",
}


# ============================================================
# Salud y catálogo
# ============================================================
def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_catalogo_games(client):
    res = client.get("/games")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert res.json()


# ============================================================
# Autenticación
# ============================================================
def test_registro_sin_confirmacion_de_email(client):
    res = client.post("/auth/register", json=CREDENCIALES)
    assert res.status_code == 200
    body = res.json()
    assert body["requires_email_confirmation"] is False
    assert "Ya puedes iniciar sesión" in body["message"]


def test_registro_con_confirmacion_de_email(client, fake_supabase):
    fake_supabase.store.requiere_confirmacion = True
    res = client.post("/auth/register", json=CREDENCIALES)
    assert res.status_code == 200
    body = res.json()
    assert body["requires_email_confirmation"] is True
    assert "Revisa tu correo" in body["message"]


def test_registro_email_duplicado_devuelve_mensaje_amigable(client):
    client.post("/auth/register", json=CREDENCIALES)
    res = client.post("/auth/register", json=CREDENCIALES)
    assert res.status_code == 400
    assert res.json()["detail"] == "Ya existe una cuenta con ese correo electrónico."


def test_registro_password_corta_es_rechazado(client):
    res = client.post(
        "/auth/register", json={**CREDENCIALES, "password": "123"}
    )
    assert res.status_code == 422


def test_login_devuelve_tokens_y_perfil(client):
    client.post("/auth/register", json=CREDENCIALES)
    res = client.post(
        "/auth/login", json={"email": CREDENCIALES["email"], "password": CREDENCIALES["password"]}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["access_token"].startswith("access-")
    assert body["user"]["nombre"] == "Ana Gamer"
    assert body["user"]["edad"] == 28
    assert body["user"]["email"] == CREDENCIALES["email"]


def test_login_password_incorrecta(client):
    client.post("/auth/register", json=CREDENCIALES)
    res = client.post(
        "/auth/login", json={"email": CREDENCIALES["email"], "password": "otracosa999"}
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Correo o contraseña incorrectos."


def test_me_sin_token(client):
    res = client.get("/auth/me")
    assert res.status_code in (401, 403)


def test_me_con_token_invalido_devuelve_401_y_no_500(client):
    res = client.get("/auth/me", headers={"Authorization": "Bearer token-falso"})
    assert res.status_code == 401
    assert "detail" in res.json()  # sin stacktrace, solo mensaje claro


def test_me_devuelve_perfil(registrado, client):
    res = client.get("/auth/me", headers=registrado()["headers"])
    assert res.status_code == 200
    body = res.json()
    assert body["email"] == CREDENCIALES["email"]
    assert body["nombre"] == "Ana Gamer"
    assert body["edad"] == 28


def test_refresh_renueva_tokens(registrado, client):
    res = client.post(
        "/auth/refresh", json={"refresh_token": registrado()["refresh_token"]}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["access_token"] != registrado()["headers"]["Authorization"][7:]
    assert body["user"]["email"] == CREDENCIALES["email"]


def test_refresh_token_invalido(client):
    res = client.post("/auth/refresh", json={"refresh_token": "refresh-inexistente"})
    assert res.status_code == 401


def test_put_me_edita_solo_el_propio_perfil(registrado, client):
    res = client.put(
        "/auth/me", json={"nombre": "Ana Pro", "edad": 29}, headers=registrado()["headers"]
    )
    assert res.status_code == 200
    assert res.json()["user"]["nombre"] == "Ana Pro"

    res = client.get("/auth/me", headers=registrado()["headers"])
    assert res.json()["nombre"] == "Ana Pro"


def test_put_me_valida_rango_de_edad(registrado, client):
    res = client.put("/auth/me", json={"edad": 999}, headers=registrado()["headers"])
    assert res.status_code == 422


# ============================================================
# Biblioteca de juegos
# ============================================================
def test_biblioteca_crud_completo(registrado, client):
    headers = registrado()["headers"]

    res = client.post(
        "/juegos/",
        json={
            "nombre": "God of War",
            "genero": "Acción",
            "plataforma": "PS5",
            "estado": "jugando",
            "horas_jugadas": 12,
            "porcentaje_completado": 40,
        },
        headers=headers,
    )
    assert res.status_code == 200
    juego = res.json()["data"][0]
    assert juego["estado"] == "jugando"
    assert juego["porcentaje_completado"] == 40

    res = client.get("/juegos/", headers=headers)
    assert res.status_code == 200
    assert len(res.json()["data"]) == 1

    res = client.get(f"/juegos/{juego['id']}", headers=headers)
    assert res.status_code == 200
    assert res.json()["data"]["nombre"] == "God of War"

    res = client.put(
        f"/juegos/{juego['id']}",
        json={"estado": "completado", "porcentaje_completado": 100, "platinado": True},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["data"][0]["platinado"] is True

    res = client.delete(f"/juegos/{juego['id']}", headers=headers)
    assert res.status_code == 200

    res = client.get(f"/juegos/{juego['id']}", headers=headers)
    assert res.status_code == 404


def test_platinado_con_porcentaje_invalido(client, registrado):
    res = client.post(
        "/juegos/",
        json={
            "nombre": "Juego Raro",
            "genero": "Indie",
            "plataforma": "PC",
            "porcentaje_completado": 150,
        },
        headers=registrado()["headers"],
    )
    assert res.status_code == 422


def test_juegos_rechaza_estado_invalido(client, registrado):
    res = client.post(
        "/juegos/",
        json={"nombre": "Zelda", "genero": "Aventura", "plataforma": "Switch", "estado": "volando"},
        headers=registrado()["headers"],
    )
    assert res.status_code == 422


def test_juegos_aislados_entre_usuarios(client, registrado):
    headers_a = registrado()["headers"]
    juego_a = crear_juego(client, headers_a, nombre="Persona 5")

    headers_b = registrado(
        nombre="Beto", email="beto@xp.com", password="clave456789"
    )["headers"]

    res = client.get("/juegos/", headers=headers_b)
    assert res.json()["data"] == []

    res = client.get(f"/juegos/{juego_a['id']}", headers=headers_b)
    assert res.status_code == 404

    res = client.put(
        f"/juegos/{juego_a['id']}", json={"nombre": "Hackeado"}, headers=headers_b
    )
    assert res.status_code == 404

    res = client.delete(f"/juegos/{juego_a['id']}", headers=headers_b)
    assert res.status_code == 404


# ============================================================
# Reseñas
# ============================================================
def test_reviews_mias_responde_200(client, registrado):
    """Regresión del bug: /reviews/mias capturaba /reviews/{review_id}."""
    res = client.get("/reviews/mias", headers=registrado()["headers"])
    assert res.status_code == 200
    assert res.json()["data"] == []


def test_reviews_crud_completo(client, registrado):
    headers = registrado()["headers"]
    juego = crear_juego(client, headers)

    res = client.post(
        "/reviews/",
        json={"juego_id": juego["id"], "puntuacion": 9, "comentario": "Obra maestra."},
        headers=headers,
    )
    assert res.status_code == 200
    review = res.json()["data"][0]
    assert review["puntuacion"] == 9

    res = client.get("/reviews/mias", headers=headers)
    assert res.status_code == 200
    assert len(res.json()["data"]) == 1

    res = client.get(f"/reviews/juego/{juego['id']}", headers=headers)
    assert res.status_code == 200
    assert len(res.json()["data"]) == 1

    res = client.put(
        f"/reviews/{review['id']}",
        json={"puntuacion": 7, "comentario": "Muy bueno, pero largo."},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["data"][0]["puntuacion"] == 7

    res = client.delete(f"/reviews/{review['id']}", headers=headers)
    assert res.status_code == 200

    res = client.get(f"/reviews/{review['id']}", headers=headers)
    assert res.status_code == 404


def test_review_requiere_juego_de_la_propia_biblioteca(client, registrado):
    headers_a = registrado()["headers"]
    juego_a = crear_juego(client, headers_a)

    headers_b = registrado(
        nombre="Beto", email="beto@xp.com", password="clave456789"
    )["headers"]

    res = client.post(
        "/reviews/",
        json={"juego_id": juego_a["id"], "puntuacion": 10, "comentario": "intruso"},
        headers=headers_b,
    )
    assert res.status_code == 404


def test_review_con_puntuacion_fuera_de_rango(client, registrado):
    juego = crear_juego(client, registrado()["headers"])
    res = client.post(
        "/reviews/",
        json={"juego_id": juego["id"], "puntuacion": 11, "comentario": "demasiado"},
        headers=registrado()["headers"],
    )
    assert res.status_code == 422


def test_reviews_no_requieren_token(client):
    assert client.get("/reviews/mias").status_code in (401, 403)


# ============================================================
# Favoritos
# ============================================================
def test_favoritos_crud(client, registrado):
    headers = registrado()["headers"]
    juego = crear_juego(client, headers)

    res = client.post("/favoritos/", json={"juego_id": juego["id"]}, headers=headers)
    assert res.status_code == 200

    res = client.get("/favoritos/", headers=headers)
    assert len(res.json()["data"]) == 1

    res = client.get(f"/favoritos/juego/{juego['id']}", headers=headers)
    assert len(res.json()["data"]) == 1

    res = client.post("/favoritos/", json={"juego_id": juego["id"]}, headers=headers)
    assert res.status_code == 409
    assert "ya está" in res.json()["detail"]

    res = client.delete(f"/favoritos/{juego['id']}", headers=headers)
    assert res.status_code == 200

    res = client.delete(f"/favoritos/{juego['id']}", headers=headers)
    assert res.status_code == 404


def test_favorito_de_juego_ajeno(client, registrado):
    headers_a = registrado()["headers"]
    juego_a = crear_juego(client, headers_a)
    headers_b = registrado(
        nombre="Beto", email="beto@xp.com", password="clave456789"
    )["headers"]

    res = client.post("/favoritos/", json={"juego_id": juego_a["id"]}, headers=headers_b)
    assert res.status_code == 404


# ============================================================
# Seguridad: endpoints eliminados
# ============================================================
def test_endpoints_de_usuarios_anonimos_eliminados(client):
    """Antes: cualquier anónimo podía leer/editar/borrar usuarios por id (IDOR)."""
    assert client.get("/usuarios/").status_code == 404
    assert client.get("/usuarios/1").status_code == 404
    assert client.put("/usuarios/1", json=CREDENCIALES).status_code == 404
    assert client.delete("/usuarios/1").status_code == 404
    assert client.post("/usuarios/", json=CREDENCIALES).status_code == 404


def test_endpoints_de_tareas_eliminados(client, registrado):
    assert client.get("/tareas/", headers=registrado()["headers"]).status_code == 404
    assert client.post(
        "/tareas/", json={"titulo": "x", "descripcion": "y"}, headers=registrado()["headers"]
    ).status_code == 404


def test_endpoints_privados_sin_token(client):
    for ruta in ("/juegos/", "/reviews/mias", "/favoritos/"):
        assert client.get(ruta).status_code in (401, 403), ruta


def test_token_invalido_en_endpoints_privados(client):
    headers = {"Authorization": "Bearer no-existe"}
    for ruta in ("/juegos/", "/reviews/mias", "/favoritos/"):
        res = client.get(ruta, headers=headers)
        assert res.status_code == 401, ruta
        assert "detail" in res.json()
