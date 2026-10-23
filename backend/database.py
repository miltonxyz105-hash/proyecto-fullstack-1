"""Cliente de Supabase (solo uso en el servidor)."""

from supabase import create_client

from config import get_settings

settings = get_settings()

if not settings.supabase_url or not settings.supabase_key:
    raise RuntimeError(
        "Faltan SUPABASE_URL o SUPABASE_KEY. "
        "Copia backend/.env.example a backend/.env y rellena tus credenciales."
    )

supabase = create_client(settings.supabase_url, settings.supabase_key)
