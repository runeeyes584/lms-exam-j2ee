'use client';

import { authApi, tokenStorage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest, RegisterRequest, RegistrationInitResponse, User } from '@/types/types';
import { isSuccess } from '@/types/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegistrationInitResponse | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    setError,
    login: loginStore,
    logout: logoutStore,
  } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (token && !user) {
        try {
          setLoading(true);
          const response = await authApi.getCurrentUser();
          if (isSuccess(response.code)) {
            setUser(response.result);
            if (typeof window !== 'undefined') {
              localStorage.setItem('lms_user', JSON.stringify(response.result));
            }
          } else {
            tokenStorage.clearTokens();
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          tokenStorage.clearTokens();
          setUser(null);
        } finally {
          setLoading(false);
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Login request:', credentials);
      const response = await authApi.login(credentials);
      console.log('Login response:', response);
      
      if (isSuccess(response.code)) {
        const { accessToken, refreshToken, user: userData } = response.result;
        console.log('Login success, user:', userData);
        tokenStorage.setTokens({ accessToken, refreshToken });
        loginStore(userData);
        
        // Store user in localStorage for dashboard
        if (typeof window !== 'undefined') {
          localStorage.setItem('lms_user', JSON.stringify(userData));
        }
        
        toast.success(`Chào mừng ${userData.fullName}!`);
        
        // Redirect to dashboard after login
        router.push('/dashboard');
      } else {
        console.error('Login failed with code:', response.code, response.message);
        setError(response.message);
        toast.error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<RegistrationInitResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.register(data);
      
      if (isSuccess(response.code)) {
        toast.success('Đã gửi mã OTP đến email của bạn.');
        return response.result;
      } else {
        setError(response.message);
        toast.error(response.message || 'Đăng ký thất bại');
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authApi.logout();
      logoutStore();
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lms_user');
      }
      
      toast.success('Đăng xuất thành công');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state anyway
      logoutStore();
      tokenStorage.clearTokens();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (isSuccess(response.code)) {
        setUser(response.result);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lms_user', JSON.stringify(response.result));
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isLoading || !isInitialized,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
