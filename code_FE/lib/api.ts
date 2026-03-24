import axios from 'axios';
import type { ApiResponse, AuthTokens, AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage utilities
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'lms_access_token',
  REFRESH_TOKEN: 'lms_refresh_token',
} as const;

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },
  
  setTokens: (tokens: AuthTokens): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },
  
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  },
};

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post<ApiResponse<AuthTokens>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );
          
          if (response.data.code === 1000) {
            tokenStorage.setTokens(response.data.result);
            originalRequest.headers.Authorization = `Bearer ${response.data.result.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          tokenStorage.clearTokens();
          window.location.href = '/login';
        }
      } else {
        tokenStorage.clearTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  logout: async (): Promise<ApiResponse<null>> => {
    const refreshToken = tokenStorage.getRefreshToken();
    const response = await api.post('/auth/logout', { refreshToken });
    tokenStorage.clearTokens();
    return response.data;
  },
  
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

export default api;