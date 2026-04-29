// API Services for Backend Integration
export * from './auth.service';
export * from './product.service';
export * from './category.service';
export * from './brand.service';
export * from './cart.service';
export * from './order.service';
export * from './payment.service';
export * from './user.service';

// Re-export the axios instance as default
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor: attach accessToken
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    error.displayMessage = backendMessage;
    return Promise.reject(error);
  }
);

export default api;