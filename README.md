# XP LEGACY - Proyecto Full Stack

Aplicación de gestión de juegos con FastAPI (Backend) y React (Frontend).

## Estructura del Proyecto

```
proyecto-fullstack-1/
├── backend/              # API con FastAPI
│   ├── dependencies/     # Dependencias reutilizables
│   ├── models/           # Modelos de datos
│   ├── router/           # Rutas de la API
│   ├── schemas/          # Esquemas Pydantic
│   ├── services/         # Lógica de negocio
│   ├── database.py       # Conexión a Supabase
│   ├── main.py           # Entrada de la API
│   ├── requirements.txt  # Dependencias Python
│   └── .env.example      # Ejemplo de variables de entorno
└── frontend/             # Aplicación React
    ├── public/           # Archivos públicos
    ├── src/              # Código fuente
    │   ├── contexts/     # Contextos React
    │   ├── pages/        # Páginas
    │   ├── App.jsx       # Componente principal
    │   └── main.jsx      # Entrada de React
    └── package.json      # Dependencias JavaScript
```

## Instalación y Ejecución

### Backend
1. Ir a la carpeta `backend/`
2. Crear un entorno virtual: `python -m venv venv`
3. Activar el entorno virtual:
   - Windows: `venv\Scripts\activate`
4. Instalar dependencias: `pip install -r requirements.txt`
5. Copiar `.env.example` a `.env` y configurar tus credenciales de Supabase
6. Ejecutar: `uvicorn main:app --reload`

### Frontend
1. Ir a la carpeta `frontend/`
2. Instalar dependencias: `npm install`
3. Ejecutar: `npm run dev`

## Tecnologías
- **Backend**: FastAPI, Supabase
- **Frontend**: React, Vite, Styled Components, React Router
- **Base de Datos**: Supabase PostgreSQL
