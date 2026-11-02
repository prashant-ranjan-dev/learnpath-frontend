import { createContext, useCallback, useContext, useState } from 'react';
import api, { apiError, store } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => store.getToken());
  const [user, setUser] = useState(() => store.getUser());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadUser = useCallback(async () => {
    // GET /api/user/profile -> {name, email}
    const { data } = await api.get('/api/user/profile');
    store.setUser(data);
    setUser(data);
    return data;
  }, []);

  const persistToken = useCallback((t) => {
    store.setToken(t);
    setToken(t);
  }, []);

  const login = useCallback(
    async (email, password) => {
      setBusy(true);
      setError('');
      try {
        // POST /api/auth/login {email, password} -> {token}
        const { data } = await api.post('/api/auth/login', { email, password });
        persistToken(data.token);
        await loadUser();
        return true;
      } catch (e) {
        setError(apiError(e));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [loadUser, persistToken]
  );

  const signup = useCallback(
    async (name, email, password) => {
      setBusy(true);
      setError('');
      try {
        // POST /api/auth/signup {name, email, password} -> {token}
        const { data } = await api.post('/api/auth/signup', { name, email, password });
        persistToken(data.token);
        await loadUser();
        return true;
      } catch (e) {
        setError(apiError(e));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [loadUser, persistToken]
  );

  /** PUT /api/user/profile {name} -> {name, email} */
  const updateProfile = useCallback(
    async (name) => {
      setBusy(true);
      setError('');
      try {
        const { data } = await api.put('/api/user/profile', { name });
        store.setUser(data);
        setUser(data);
        return true;
      } catch (e) {
        setError(apiError(e));
        return false;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    store.clearToken();
    store.clearUser();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, busy, error, setError, login, signup, updateProfile, loadUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
