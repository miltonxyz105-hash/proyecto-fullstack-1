from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise RuntimeError("Faltan SUPABASE_URL o SUPABASE_KEY en el archivo .env")

supabase = create_client(url, key)
