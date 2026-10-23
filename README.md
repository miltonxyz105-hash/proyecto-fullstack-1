# XP LEGACY - Proyecto Full Stack

Plataforma web para gamers: biblioteca de juegos, platinos, reseñas y comunidad.

- **Backend:** FastAPI + Supabase (PostgreSQL)
- **Frontend:** React 19 + Vite + React Router + styled-components

## Estructura del Proyecto

```
proyecto-fullstack-1/
├── backend/                  # API con FastAPI
│   ├── config.py             # Configuración (pydantic-settings) + Twitch/IGDB
│   ├── dependencies/         # Dependencias reutilizables (auth)
│   ├── router/               # Rutas de la API (auth, juegos, reviews, favoritos, games)
│   ├── schemas/              # Esquemas Pydantic (validación de entrada)
│   ├── services/             # Lógica de negocio sobre Supabase
│   ├── tests/                # Suite de integración (pytest + doble de Supabase)
│   ├── database.py           # Conexión a Supabase
│   ├── main.py               # Entrada de la API
│   ├── .env.example          # Plantilla de variables de entorno
│   ├── requirements.txt      # Dependencias Python
│   └── requirements-dev.txt  # Dependencias de desarrollo (tests)
└── frontend/                 # Aplicación React
    ├── src/
    │   ├── api.js            # Cliente axios + refresh de sesión
    │   ├── components/       # Modal, FormControls, StateViews, Layout...
    │   ├── contexts/         # AuthContext + AuthProvider
    │   ├── pages/            # Dashboard, Juegos, Reviews, Favoritos, Perfil, Login, Register
    │   ├── utils/            # apiError (mensajes de error de usuario)
    │   ├── App.jsx           # Rutas protegidas + Toaster + ErrorBoundary
    │   └── main.jsx          # Entrada de React
    ├── .env.example          # Plantilla de variables de entorno
    └── package.json          # Dependencias JavaScript
```

## Instalación y Ejecución

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
cp .env.example .env         # y rellena SUPABASE_URL y SUPABASE_KEY
uvicorn main:app --reload
```

La API quedará en `http://localhost:8000` (documentación interactiva en `/docs`).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # y ajusta VITE_API_URL si la API corre en local
npm run dev
```

La app quedará en `http://localhost:5173`.

### Tests del backend

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

Los tests usan un doble de Supabase en memoria: no requieren red ni
credenciales reales.

## Variables de entorno

| Variable | Lado | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `SUPABASE_URL` | backend | ✅ | URL del proyecto Supabase |
| `SUPABASE_KEY` | backend | ✅ | Clave del servidor (service_role o anon) |
| `CORS_ORIGINS` | backend | ❌ | Orígenes permitidos, separados por coma |
| `TWITCH_CLIENT_ID` | backend | ❌ | IGDB/Twitch (integración de catálogo) |
| `TWITCH_CLIENT_SECRET` | backend | ❌ | IGDB/Twitch (integración de catálogo) |
| `VITE_API_URL` | frontend | ❌ | URL base de la API |

> **Importante:** cualquier secreto va en `backend/.env` y jamás en el
> frontend. Solo las variables con prefijo `VITE_` llegan al navegador.

## Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/auth/register` | Registro |
| POST | `/auth/login` | Login (devuelve tokens + perfil) |
| POST | `/auth/refresh` | Renueva los tokens |
| GET/PUT | `/auth/me` | Ver / editar el propio perfil |
| GET/POST | `/juegos/` | Biblioteca personal |
| PUT/DELETE | `/juegos/{id}` | Editar / eliminar juego |
| GET | `/reviews/mias` | Reseñas del usuario |
| POST/PUT/DELETE | `/reviews/...` | CRUD de reseñas |
| GET/POST/DELETE | `/favoritos/...` | Favoritos |
| GET | `/games` | Catálogo público de juegos |
| GET | `/health` | Healthcheck |
