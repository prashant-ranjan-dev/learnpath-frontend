import axios from 'axios';

/**
 * Base URL of the LearnPath Spring Boot backend (backend_improvements branch).
 * Configured via .env — see .env.example.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const TOKEN_KEY = 'lp_token';
const USER_KEY = 'lp_user';

export const store = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  setUser: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clearUser: () => localStorage.removeItem(USER_KEY),
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  if (config.skipAuth) return config;
  const token = store.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 on a logged-in session means the token expired/invalid — reset.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      store.getToken() &&
      !error.config?.skipAuthRedirect &&
      !window.location.pathname.startsWith('/login')
    ) {
      store.clearToken();
      store.clearUser();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/** Extract a readable message from a backend error ({error, detail, message}). */
export function apiError(error) {
  if (!error?.response) {
    return 'Cannot reach the backend. Is it running on ' + API_BASE_URL + ' ?';
  }
  const data = error.response.data || {};
  return data.detail || data.message || data.error || `Request failed (${error.response.status})`;
}

/** Record which quiz belongs to which module (no backend field for this). */
export const quizRef = {
  key: (moduleId) => `lp_quiz_for_module_${moduleId}`,
  set: (moduleId, quizId) => localStorage.setItem(quizRef.key(moduleId), String(quizId)),
  get: (moduleId) => localStorage.getItem(quizRef.key(moduleId)),
};

export default api;
