import axios from 'axios';

// Create a central axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://met-efgo.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiEnvelope<T> {
  status?: string;
  message?: string;
  data: T;
}

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const token =
      localStorage.getItem('met_auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('met_auth_token');
      localStorage.removeItem('met_auth_session');
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'تعذر الاتصال بالخادم';

    return Promise.reject(new Error(message));
  }
);
