import api from '@/lib/api';
import type { ApiResponse, User, UpdateProfileRequest, ChangePasswordRequest } from '@/types/types';

export interface UserProfileResponse extends User {
  enrolledCoursesCount?: number;
  createdCoursesCount?: number;
}

export const userService = {
  // Get current user profile
  getProfile: async (): Promise<ApiResponse<UserProfileResponse>> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfileResponse>> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/users/me/change-password', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<ApiResponse<UserProfileResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default userService;
