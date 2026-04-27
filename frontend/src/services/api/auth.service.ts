import api from '../../lib/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  emirate?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    emirate?: string;
    is_active: boolean;
    email_verified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Auth API calls
export const authService = {
  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  // Google OAuth
  googleAuth: async (credential: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/google', { credential });
    return response.data.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  // Refresh token (handled automatically by axios interceptor)
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  }
};