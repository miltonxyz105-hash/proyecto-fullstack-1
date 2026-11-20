import axios from 'axios'
// IMPORTANTE: Asegúrate de que esta ruta apunte a tu configuración de Supabase
import { supabase } from './supabaseClient' 

const api = axios.create({
  baseURL: 'https://proyecto-fullstack-1-moip.onrender.com'
})

// 1. Interceptor de PETICIONES (Saca el token directo de Supabase, es más seguro que localStorage)
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  
  if (data?.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
})

// 2. Interceptor de RESPUESTAS (La "aduana" que atrapa el 401 y renueva el token sin molestar)
api.interceptors.response.use(
  (response) => {
    return response; // Todo salió bien (200 OK)
  },
  async (error) => {
    const originalRequest = error.config;

    // Si da error 401 (token vencido) y no hemos intentado renovarlo aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !data.session) {
          throw new Error("No se pudo renovar la sesión");
        }

        // Le ponemos el nuevo token a la petición que falló
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        
        // Disparamos la petición de nuevo
        return api(originalRequest);
        
      } catch (refreshError) {
        // Si falló la renovación (ej. pasó un mes), mandamos al login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);


// ==========================================
// TUS RUTAS (Se quedan exactamente igual, ¡no tocas nada!)
// ==========================================

// AUTH
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const getMyUser = () => api.get('/auth/me')

// USUARIOS
export const getUsuarios = () => api.get('/usuarios/')
export const createUsuario = (data) => api.post('/usuarios/', data)
export const getUsuarioById = (id) => api.get(`/usuarios/${id}`)
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data)
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

// JUEGOS
export const getJuegos = () => api.get('/juegos/')
export const getJuegoById = (id) => api.get(`/juegos/${id}`)
export const createJuego = (data) => api.post('/juegos/', data)
export const updateJuego = (id, data) => api.put(`/juegos/${id}`, data)
export const deleteJuego = (id) => api.delete(`/juegos/${id}`)

// REVIEWS
export const getReviewsDeJuego = (juegoId) => api.get(`/reviews/juego/${juegoId}`)
export const getMisReviews = () => api.get('/reviews/mias')
export const getReviewById = (id) => api.get(`/reviews/${id}`)
export const createReview = (data) => api.post('/reviews/', data)
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data)
export const deleteReview = (id) => api.delete(`/reviews/${id}`)

// FAVORITOS
export const getMisFavoritos = () => api.get('/favoritos/')
export const esFavorito = (juegoId) => api.get(`/favoritos/juego/${juegoId}`)
export const agregarFavorito = (data) => api.post('/favoritos/', data)
export const eliminarFavorito = (juegoId) => api.delete(`/favoritos/${juegoId}`)

// TAREAS
export const getTareas = () => api.get('/tareas/')
export const createTarea = (data) => api.post('/tareas/', data)
export const updateTarea = (id, data) => api.put(`/tareas/${id}`, data)
export const deleteTarea = (id) => api.delete(`/tareas/${id}`)

// CATÁLOGO RAWG
export const buscarCatalogo = (query) => api.get(`/catalogo/buscar?q=${query}`);

export default api;