import axios from 'axios';

const AUTH_STORAGE_KEYS = ['token', 'user'] as const;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      window.location.href = '/login';
    }

    if (error.response?.data) {
      const { data } = error.response;

      if (typeof data.stack === 'string') {
        delete data.stack;
      }

      if (typeof data === 'object' && !data.message && !data.errors) {
        data.message = 'Something went wrong. Please try again.';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
