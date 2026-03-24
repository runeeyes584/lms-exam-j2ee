import api from '@/lib/api';
import type { ApiResponse } from '@/types/types';

export interface EnrollmentRequest {
  userId: string;
  courseId: string;
}

export interface EnrollmentResponse {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  courseImage?: string;
  instructorName?: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: string;
}

export interface ProgressUpdateRequest {
  courseId: string;
  lessonId: string;
  completed: boolean;
  watchTime?: number;
}

export interface ProgressResponse {
  userId: string;
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  progressPercentage: number;
  totalWatchTime: number;
  lastAccessedAt: string;
}

export const enrollmentService = {
  // Enroll in course
  enroll: async (data: EnrollmentRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/enrollments', data);
    return response.data;
  },

  // Get user enrollments
  getByUser: async (userId: string): Promise<ApiResponse<EnrollmentResponse[]>> => {
    const response = await api.get(`/enrollments/${userId}`);
    return response.data;
  },

  // Get my enrollments
  getMyEnrollments: async (): Promise<ApiResponse<EnrollmentResponse[]>> => {
    const response = await api.get('/enrollments/my');
    return response.data;
  },
};

export const progressService = {
  // Update progress
  update: async (data: ProgressUpdateRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/progress', data);
    return response.data;
  },

  // Get progress
  get: async (userId: string, courseId: string): Promise<ApiResponse<ProgressResponse>> => {
    const response = await api.get(`/progress/${userId}/${courseId}`);
    return response.data;
  },
};

export default enrollmentService;
