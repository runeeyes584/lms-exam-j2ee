import api from '@/lib/api';
import type { ApiResponse, User } from '@/types/types';
import type { PageResponse } from './courseService';

export interface AdminUserResponse extends User {
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  enrolledCoursesCount?: number;
  createdCoursesCount?: number;
}

export interface InstructorApprovalRequest {
  qualifications: string;
  experience: string;
  specialization: string;
  documents?: string[];
}

export interface InstructorApprovalResponse {
  id: string;
  user: User;
  qualifications: string;
  experience: string;
  specialization: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalExams: number;
  totalAttempts: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  activeUsersThisWeek: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  enrollments: number;
}

export interface CourseStats {
  courseId: string;
  courseName: string;
  enrollments: number;
  revenue: number;
  rating: number;
  completionRate: number;
}

export const adminService = {
  // User Management
  getAllUsers: async (
    page = 0,
    size = 10,
    role?: string,
    status?: string
  ): Promise<ApiResponse<PageResponse<AdminUserResponse>>> => {
    const response = await api.get('/admin/users', {
      params: { page, size, role, status },
    });
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<AdminUserResponse>> => {
    const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<ApiResponse<AdminUserResponse>> => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Instructor Approval
  getInstructorRequests: async (status?: string): Promise<ApiResponse<InstructorApprovalResponse[]>> => {
    const response = await api.get('/instructor-requests', { params: { status } });
    return response.data;
  },

  submitInstructorRequest: async (data: InstructorApprovalRequest): Promise<ApiResponse<InstructorApprovalResponse>> => {
    const response = await api.post('/instructor-requests', data);
    return response.data;
  },

  approveInstructor: async (requestId: string): Promise<ApiResponse<InstructorApprovalResponse>> => {
    const response = await api.post(`/instructor-requests/${requestId}/approve`);
    return response.data;
  },

  rejectInstructor: async (requestId: string, reason?: string): Promise<ApiResponse<InstructorApprovalResponse>> => {
    const response = await api.post(`/instructor-requests/${requestId}/reject`, { reason });
    return response.data;
  },
};

// Analytics Service
export const analyticsService = {
  // Get dashboard stats
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  // Get revenue by year
  getRevenue: async (year: number): Promise<ApiResponse<RevenueData[]>> => {
    const response = await api.get('/analytics/revenue', { params: { year } });
    return response.data;
  },

  // Get new users by year
  getNewUsers: async (year: number): Promise<ApiResponse<{ month: string; count: number }[]>> => {
    const response = await api.get('/analytics/new-users', { params: { year } });
    return response.data;
  },

  // Get top courses
  getTopCourses: async (limit = 10): Promise<ApiResponse<CourseStats[]>> => {
    const response = await api.get('/analytics/top-courses', { params: { limit } });
    return response.data;
  },

  // Get top revenue courses
  getTopRevenueCourses: async (limit = 10): Promise<ApiResponse<CourseStats[]>> => {
    const response = await api.get('/analytics/courses/top-revenue', { params: { limit } });
    return response.data;
  },

  // Get course analytics
  getCourseAnalytics: async (courseId: string): Promise<ApiResponse<CourseStats>> => {
    const response = await api.get(`/analytics/courses/${courseId}`);
    return response.data;
  },
};

export default adminService;
