import { createContext, useContext, useState, useEffect } from "react";
import { login, register, getMyUser } from "../api";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Iniciar sesión: FastAPI valida -> Supabase guarda/renueva tokens -> /auth/me trae nombre y rol
  const handleLogin = async (email, password) => {
    try {
      const res = await login({ email, password });
      const { access_token, refresh_token } = res.data;

      // Sincronizamos los tokens con Supabase para que api.js pueda leerlos y renovarlos solo
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) throw sessionError;

      // Pedimos /auth/me para que el estado 'user' ya tenga 'nombre' y 'rol' desde el primer segundo
      const meRes = await getMyUser();
      setUser(meRes.data);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };

  // 2. Registrar un usuario
  const handleRegister = async (nombre, edad, email, password) => {
    try {
      await register({ nombre, edad, email, password });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
    }
  };

  // 3. Cerrar sesión en Supabase y limpiar todo
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  // 4. Al recargar la página, verificamos si Supabase tiene sesión (o la renueva automáticamente)
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data?.session) {
          const res = await getMyUser();
          setUser(res.data);
        }
      } catch (error) {
        console.error("Sesión expirada o inválida:", error);
        await handleLogout();
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}