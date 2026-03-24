import api from '@/lib/api';
import type { ApiResponse, Exam, ExamMode, DifficultyLevel } from '@/types/types';
import type { PageResponse } from './courseService';

export interface ExamCreateRequest {
  title: string;
  description?: string;
  courseId?: string;
  duration: number; // minutes
  passingScore: number; // percentage
  mode: ExamMode;
  questionIds?: string[]; // for MANUAL mode
  isPublished?: boolean;
}

export interface ExamGenerateRequest {
  title: string;
  description?: string;
  courseId?: string;
  duration: number;
  passingScore: number;
  difficultyMatrix: {
    easy: number;
    medium: number;
    hard: number;
  };
  topics?: string[];
}

export interface ExamResponse extends Exam {
  courseId?: string;
  courseName?: string;
  createdBy?: string;
  attemptCount?: number;
  avgScore?: number;
}

export const examService = {
  // Get all exams with pagination
  getAll: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<ApiResponse<PageResponse<ExamResponse>>> => {
    const response = await api.get('/exams', {
      params: { page, size, sortBy, direction },
    });
    return response.data;
  },

  // Get exam by ID
  getById: async (id: string): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  // Create exam (manual selection)
  create: async (data: ExamCreateRequest): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.post('/exams', data);
    return response.data;
  },

  // Generate exam (matrix mode)
  generate: async (data: ExamGenerateRequest): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.post('/exams/generate', data);
    return response.data;
  },

  // Update exam
  update: async (id: string, data: ExamCreateRequest): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.put(`/exams/${id}`, data);
    return response.data;
  },

  // Delete exam
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

  // Get exams by course
  getByCourse: async (courseId: string): Promise<ApiResponse<ExamResponse[]>> => {
    const response = await api.get(`/exams/course/${courseId}`);
    return response.data;
  },

  // Get published exams (for students)
  getPublished: async (): Promise<ApiResponse<ExamResponse[]>> => {
    const response = await api.get('/exams/published');
    return response.data;
  },

  // Publish exam
  publish: async (id: string): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.post(`/exams/${id}/publish`);
    return response.data;
  },

  // Unpublish exam
  unpublish: async (id: string): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.post(`/exams/${id}/unpublish`);
    return response.data;
  },

  // Get my exams (instructor)
  getMyExams: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<ExamResponse>>> => {
    const response = await api.get('/exams/my-exams', { params: { page, size } });
    return response.data;
  },

  // Alias for instructor exams (same as getMyExams)
  getInstructorExams: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<ExamResponse>>> => {
    const response = await api.get('/exams/my-exams', { params: { page, size } });
    return response.data;
  },

  // Get my exam attempts (student)
  getMyAttempts: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/attempt/my-attempts');
    return response.data;
  },
};

export default examService;
