import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  borrarSesion,
  getMyUser,
  guardarSesion,
  login as loginRequest,
  obtenerAccessToken,
  register as registerRequest,
} from '../api';
import { AuthContext } from './AuthContext';

/**
 * Gestiona la sesión de forma centralizada.
 *
 * - `handleLogin` guarda los tokens y el usuario en un único paso.
 * - Al montar, restaura la sesión desde localStorage validando el token.
 * - Si el backend responde 401 (y el refresh automático de `api.js` ya
 *   falló), se limpia la sesión y se emite `session-expired`.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    borrarSesion();
    setUser(null);
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    const res = await loginRequest({ email, password });
    guardarSesion(res.data);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  /** Devuelve el mensaje de éxito para mostrarlo en la UI. */
  const handleRegister = useCallback(async (nombre, edad, email, password) => {
    const res = await registerRequest({ nombre, edad, email, password });
    return res.data;
  }, []);

  /** Vuelve a pedir el perfil al backend (tras editar o al refrescar). */
  const refreshUser = useCallback(async () => {
    const res = await getMyUser();
    setUser(res.data);
    return res.data;
  }, []);

  useEffect(() => {
    let cancelado = false;

    const cargarSesion = async () => {
      if (obtenerAccessToken()) {
        try {
          const res = await getMyUser();
          if (!cancelado) setUser(res.data);
        } catch {
          // Sesión inválida: el interceptor ya intentó refrescarla.
          borrarSesion();
          if (!cancelado) setUser(null);
        }
      }
      if (!cancelado) setLoading(false);
    };

    const onSessionExpired = () => {
      borrarSesion();
      setUser(null);
    };

    cargarSesion();
    window.addEventListener('session-expired', onSessionExpired);

    return () => {
      cancelado = true;
      window.removeEventListener('session-expired', onSessionExpired);
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, handleLogin, handleRegister, handleLogout, refreshUser }),
    [user, loading, handleLogin, handleRegister, handleLogout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
