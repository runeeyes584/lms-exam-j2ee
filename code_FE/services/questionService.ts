import api from '@/lib/api';
import type { ApiResponse, Question, QuestionType, DifficultyLevel } from '@/types/types';
import type { PageResponse } from './courseService';

export interface QuestionOptionRequest {
  text: string;
  isCorrect: boolean;
}

export interface QuestionCreateRequest {
  type: QuestionType;
  topic: string;
  difficulty: DifficultyLevel;
  points: number;
  content: string;
  options: QuestionOptionRequest[];
  explanation?: string;
}

export interface QuestionResponse extends Question {
  createdBy?: string;
}

export interface ExcelImportResponse {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: string[];
}

export const questionService = {
  // Get all questions with pagination
  getAll: async (
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Promise<ApiResponse<PageResponse<QuestionResponse>>> => {
    const response = await api.get('/questions', {
      params: { page, size, sortBy, direction },
    });
    return response.data;
  },

  // Get question by ID
  getById: async (id: string): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Create question
  create: async (data: QuestionCreateRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.post('/questions', data);
    return response.data;
  },

  // Update question
  update: async (id: string, data: QuestionCreateRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  // Delete question
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  // Search by topics
  searchByTopics: async (topics: string[]): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get('/questions/search/topics', {
      params: { topics: topics.join(',') },
    });
    return response.data;
  },

  // Search by difficulty
  searchByDifficulty: async (difficulty: DifficultyLevel): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get('/questions/search/difficulty', {
      params: { difficulty },
    });
    return response.data;
  },

  // Search by type
  searchByType: async (type: QuestionType): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get('/questions/search/type', {
      params: { type },
    });
    return response.data;
  },

  // Advanced search
  advancedSearch: async (
    topics?: string[],
    difficulty?: DifficultyLevel
  ): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get('/questions/search/advanced', {
      params: {
        topics: topics?.join(','),
        difficulty,
      },
    });
    return response.data;
  },

  // Get my questions (instructor)
  getMyQuestions: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<QuestionResponse>>> => {
    const response = await api.get('/questions/my-questions', {
      params: { page, size },
    });
    return response.data;
  },

  // Import from Excel
  importFromExcel: async (file: File): Promise<ApiResponse<ExcelImportResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/questions/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default questionService;
