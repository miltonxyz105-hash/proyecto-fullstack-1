"""Configuración común de pytest.

Las variables de entorno se definen ANTES de importar la app porque
`database.py` valida sus credenciales en el momento de la importación.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

os.environ.setdefault("SUPABASE_URL", "https://test-project.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "test-service-key")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5173")
