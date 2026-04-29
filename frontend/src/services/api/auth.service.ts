import api from './index';

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
    try {
      console.log('🔐 Attempting login to:', `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/login`);
      const response = await api.post('/auth/login', data);
      console.log('✅ Login successful:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('📝 Attempting registration to:', `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/register`);
      console.log('📝 Registration data:', { ...data, password: '***' });
      const response = await api.post('/auth/register', data);
      console.log('✅ Registration successful:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Google OAuth
  googleAuth: async (credential: string): Promise<AuthResponse> => {
    try {
      console.log('🔐 Attempting Google OAuth');
      const response = await api.post('/auth/google', { credential });
      console.log('✅ Google OAuth successful');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Google OAuth error:', error.response?.data || error.message);
      throw error;
    }
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