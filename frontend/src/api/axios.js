import axios from 'axios';
// IMPORTANTE: Ajusta esta ruta según dónde tengas tu archivo de Supabase en el frontend
import { supabase } from '../supabaseClient'; 

// Creamos la instancia de axios
const api = axios.create({
  baseURL: 'http://localhost:8000', // La URL de tu backend FastAPI
});

// 1. INTERCEPTOR DE PETICIONES (Agrega el token a cada llamada)
api.interceptors.request.use(async (config) => {
  // Obtenemos la sesión actual
  const { data } = await supabase.auth.getSession();
  
  if (data?.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 2. INTERCEPTOR DE RESPUESTAS (Atrapa el 401 y renueva el token)
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (200 OK), pasa directo
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y NO hemos reintentado ya esta petición
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos para no entrar en un bucle infinito

      try {
        // getSession() detecta si el token expiró y lo renueva automáticamente por detrás
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !data.session) {
          throw new Error("No se pudo renovar la sesión");
        }

        // Actualizamos el header con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        
        // Reintentamos la petición original
        return api(originalRequest);
        
      } catch (refreshError) {
        // Si la renovación falla (ej. el usuario estuvo inactivo por semanas), lo enviamos al login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Si es otro tipo de error (ej. 403, 404, 500), lo dejamos pasar para manejarlo en el componente
    return Promise.reject(error);
  }
);

export default api;