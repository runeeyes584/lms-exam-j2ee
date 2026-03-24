import api from '@/lib/api';
import type { ApiResponse, Course } from '@/types/types';

export interface CourseRequest {
  title: string;
  description: string;
  price: number;
  coverImage?: string;
  tags?: string[];
  isPublished?: boolean;
}

export interface CourseResponse extends Course {
  instructor?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  enrollmentCount?: number;
  rating?: number;
  chaptersCount?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const courseService = {
  // Get all courses (public)
  getAll: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<CourseResponse>>> => {
    const response = await api.get('/v1/courses', { params: { page, size } });
    return response.data;
  },

  // Get course by ID
  getById: async (id: string): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.get(`/v1/courses/${id}`);
    return response.data;
  },

  // Create course (Instructor)
  create: async (data: CourseRequest): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.post('/v1/courses', data);
    return response.data;
  },

  // Update course (Instructor)
  update: async (id: string, data: CourseRequest): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.put(`/v1/courses/${id}`, data);
    return response.data;
  },

  // Delete course (Instructor)
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/v1/courses/${id}`);
    return response.data;
  },

  // Get instructor's courses
  getMyCourses: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<CourseResponse>>> => {
    const response = await api.get('/v1/courses/my-courses', { params: { page, size } });
    return response.data;
  },
};

// Chapter Service
export interface ChapterRequest {
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface ChapterResponse {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessonsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const chapterService = {
  // Get chapters by course
  getByCourse: async (courseId: string): Promise<ApiResponse<ChapterResponse[]>> => {
    const response = await api.get(`/v1/courses/${courseId}/chapters`);
    return response.data;
  },

  // Create chapter
  create: async (data: ChapterRequest): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.post('/v1/chapters', data);
    return response.data;
  },

  // Update chapter
  update: async (id: string, data: ChapterRequest): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.put(`/v1/chapters/${id}`, data);
    return response.data;
  },

  // Delete chapter
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/v1/chapters/${id}`);
    return response.data;
  },
};

// Lesson Service
export interface LessonRequest {
  chapterId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  orderIndex: number;
  duration?: number;
}

export interface LessonResponse {
  id: string;
  chapterId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  orderIndex: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export const lessonService = {
  // Get lessons by chapter
  getByChapter: async (chapterId: string): Promise<ApiResponse<LessonResponse[]>> => {
    const response = await api.get(`/v1/chapters/${chapterId}/lessons`);
    return response.data;
  },

  // Create lesson
  create: async (data: LessonRequest): Promise<ApiResponse<LessonResponse>> => {
    const response = await api.post('/v1/lessons', data);
    return response.data;
  },

  // Update lesson
  update: async (id: string, data: LessonRequest): Promise<ApiResponse<LessonResponse>> => {
    const response = await api.put(`/v1/lessons/${id}`, data);
    return response.data;
  },

  // Delete lesson
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/v1/lessons/${id}`);
    return response.data;
  },
};

export default courseService;
