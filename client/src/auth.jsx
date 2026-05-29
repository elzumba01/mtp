import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar si hay token
  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.get('/auth/me')
      .then(d => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const d = await api.post('/auth/login', { email, password });
    setToken(d.token); setUser(d.user); return d.user;
  }
  async function register(payload) {
    const d = await api.post('/auth/register', payload);
    setToken(d.token); setUser(d.user); return d.user;
  }
  function logout() { setToken(null); setUser(null); }

  function roleHome(u = user) {
    if (!u) return '/';
    return { admin: '/admin', verificador: '/verificador', usuario: '/u' }[u.role] || '/';
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, roleHome }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
