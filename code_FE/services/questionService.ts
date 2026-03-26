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
  imageUrl?: string;
  options: QuestionOptionRequest[];
  correctAnswer?: string;
  explanation?: string;
}

export interface QuestionResponse extends Question {
  createdBy?: string;
}

export interface ExcelImportResponse {
  totalRows: number;
  successCount: number;
  failureCount: number;  // BE uses failureCount, not failedCount
  errors: string[];
  createdQuestionIds?: string[];
}

const normalizeQuestion = (question: any): QuestionResponse => {
  const topics = Array.isArray(question?.topics)
    ? question.topics
    : question?.topic
      ? [question.topic]
      : [];

  return {
    ...question,
    topics,
    topic: question?.topic || topics[0] || '',
  };
};

const normalizePage = (
  response: ApiResponse<PageResponse<QuestionResponse>>
): ApiResponse<PageResponse<QuestionResponse>> => {
  if (!response.result) {
    return response;
  }

  return {
    ...response,
    result: {
      ...response.result,
      content: (response.result.content || []).map(normalizeQuestion),
    },
  };
};

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
    return normalizePage(response.data);
  },

  // Get question by ID
  getById: async (id: string): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.get(`/questions/${id}`);
    return {
      ...response.data,
      result: response.data.result ? normalizeQuestion(response.data.result) : response.data.result,
    };
  },

  // Create question
  create: async (data: QuestionCreateRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.post('/questions', {
      ...data,
      topics: data.topic ? [data.topic] : [],
    });
    return {
      ...response.data,
      result: response.data.result ? normalizeQuestion(response.data.result) : response.data.result,
    };
  },

  // Update question
  update: async (id: string, data: QuestionCreateRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.put(`/questions/${id}`, {
      ...data,
      topics: data.topic ? [data.topic] : [],
    });
    return {
      ...response.data,
      result: response.data.result ? normalizeQuestion(response.data.result) : response.data.result,
    };
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
    return {
      ...response.data,
      result: (response.data.result || []).map(normalizeQuestion),
    };
  },

  // Search by difficulty
  searchByDifficulty: async (difficulty: DifficultyLevel): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get('/questions/search/difficulty', {
      params: { difficulty },
    });
    return {
      ...response.data,
      result: (response.data.result || []).map(normalizeQuestion),
    };
  },

  // Search by type
  searchByType: async (type: QuestionType): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get('/questions/search/type', {
      params: { type },
    });
    return {
      ...response.data,
      result: (response.data.result || []).map(normalizeQuestion),
    };
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
    return {
      ...response.data,
      result: (response.data.result || []).map(normalizeQuestion),
    };
  },

  // Get my questions (instructor)
  getMyQuestions: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<QuestionResponse>>> => {
    console.log('[questionService] getMyQuestions called, page:', page, 'size:', size);
    const response = await api.get('/questions/my-questions', {
      params: { page, size },
    });
    console.log('[questionService] getMyQuestions response:', response.data);
    return normalizePage(response.data);
  },

  // Import from Excel
  importFromExcel: async (file: File): Promise<ApiResponse<ExcelImportResponse>> => {
    console.log('[questionService] importFromExcel called, file:', file.name);
    const formData = new FormData();
    formData.append('file', file);
    console.log('[questionService] Sending FormData to /questions/import/excel');
    const response = await api.post('/questions/import/excel', formData);
    console.log('[questionService] importFromExcel response:', response.data);
    return response.data;
  },
};

export default questionService;
