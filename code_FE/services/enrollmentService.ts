import api from '@/lib/api';
import type { ApiResponse } from '@/types/types';

export interface EnrollmentRequest {
  userId: string;
  courseId: string;
}

export interface EnrollmentResponse {
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  courseName?: string;
  courseImage?: string;
  instructorName?: string;
  progress?: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: string;
}

export interface CourseMemberResponse {
  userId: string;
  fullName?: string;
  email?: string;
  enrolledAt: string;
  progressPercent: number;
}

export interface ProgressUpdateRequest {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastWatchedSecond?: number;
}

export interface ProgressResponse {
  userId?: string;
  courseId: string;
  completedLessons?: number | string[];
  completedLessonIds?: string[];
  totalLessons: number;
  progressPercent?: number;
  progressPercentage?: number;
  totalWatchTime?: number;
  lastAccessedAt?: string;
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
    return {
      ...response.data,
      result: (response.data.result || []).map((item: any) => ({
        ...item,
        progressPercent: Number(item.progressPercent ?? 0),
        progress: Number(item.progressPercent ?? 0),
        completedLessons: 0,
        totalLessons: 0,
      })),
    };
  },

  // Get my enrollments
  getMyEnrollments: async (userId: string): Promise<ApiResponse<EnrollmentResponse[]>> => {
    return enrollmentService.getByUser(userId);
  },

  // Get course members (instructor)
  getCourseMembers: async (courseId: string, instructorId?: string): Promise<ApiResponse<CourseMemberResponse[]>> => {
    const endpoint = instructorId
      ? `/enrollments/instructor/${instructorId}/course/${courseId}/members`
      : `/enrollments/course/${courseId}/members`;
    const response = await api.get(endpoint);
    return {
      ...response.data,
      result: (response.data.result || []).map((item: any) => ({
        ...item,
        progressPercent: Number(item.progressPercent ?? 0),
      })),
    };
  },
};

export const progressService = {
  // Update progress
  update: async (data: ProgressUpdateRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/progress', {
      userId: data.userId,
      courseId: data.courseId,
      lessonId: data.lessonId,
      completed: data.completed,
      lastWatchedSecond: data.lastWatchedSecond ?? 0,
    });
    return response.data;
  },

  // Get progress
  get: async (userId: string, courseId: string): Promise<ApiResponse<ProgressResponse>> => {
    const response = await api.get(`/progress/${userId}/${courseId}`);
    return response.data;
  },
};

export default enrollmentService;
