import { createContext, useContext } from 'react';

/** Contexto de autenticación. El provider vive en `AuthProvider.jsx`. */
export const AuthContext = createContext(null);

/** Hook de acceso a la sesión. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
