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
  allowResultReview?: boolean;
}

export interface ExamGenerateRequest {
  title: string;
  description?: string;
  courseId?: string;
  duration: number;
  passingScore: number;
  allowResultReview?: boolean;
  difficultyMatrix: {
    recognize: number;
    understand: number;
    apply: number;
    analyze: number;
  };
  topics?: string[];
}

export interface ExamResponse extends Exam {
  courseId?: string;
  courseName?: string;
  createdBy?: string;
  generationType?: 'MANUAL' | 'AUTO';
  attemptCount?: number;
  avgScore?: number;
}

const normalizeExam = (exam: any): ExamResponse => ({
  ...exam,
  mode: exam?.generationType === 'AUTO' ? 'MATRIX' : 'MANUAL',
  passingScore: exam?.passingScore ?? 0,
  totalPoints: exam?.totalPoints ?? 0,
  questions: Array.isArray(exam?.questions) ? exam.questions : [],
  isPublished: Boolean(exam?.isPublished),
  allowResultReview: exam?.allowResultReview !== false,
});

const normalizeExamPage = (
  response: ApiResponse<PageResponse<ExamResponse>>
): ApiResponse<PageResponse<ExamResponse>> => ({
  ...response,
  result: response.result
    ? {
        ...response.result,
        content: (response.result.content || []).map(normalizeExam),
      }
    : response.result,
});

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
    return normalizeExamPage(response.data);
  },

  // Get exam by ID
  getById: async (id: string): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.get(`/exams/${id}`);
    return {
      ...response.data,
      result: response.data.result ? normalizeExam(response.data.result) : response.data.result,
    };
  },

  // Create exam (manual selection)
  create: async (data: ExamCreateRequest): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.post('/exams', {
      title: data.title,
      description: data.description,
      courseId: data.courseId,
      duration: data.duration,
      passingScore: data.passingScore,
      generationType: 'MANUAL',
      allowResultReview: data.allowResultReview ?? true,
      questions: (data.questionIds || []).map((questionId, index) => ({
        questionId,
        order: index + 1,
      })),
    });
    return {
      ...response.data,
      result: response.data.result ? normalizeExam(response.data.result) : response.data.result,
    };
  },

  // Generate exam (matrix mode)
  generate: async (data: ExamGenerateRequest): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.post('/exams/generate', {
      title: data.title,
      description: data.description,
      courseId: data.courseId,
      duration: data.duration,
      passingScore: data.passingScore,
      topics: data.topics || [],
      difficultyDistribution: {
        RECOGNIZE: data.difficultyMatrix.recognize || 0,
        UNDERSTAND: data.difficultyMatrix.understand || 0,
        APPLY: data.difficultyMatrix.apply || 0,
        ANALYZE: data.difficultyMatrix.analyze || 0,
      },
      allowResultReview: data.allowResultReview ?? true,
    });
    return {
      ...response.data,
      result: response.data.result ? normalizeExam(response.data.result) : response.data.result,
    };
  },

  // Update exam
  update: async (id: string, data: ExamCreateRequest): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.put(`/exams/${id}`, {
      title: data.title,
      description: data.description,
      courseId: data.courseId,
      duration: data.duration,
      passingScore: data.passingScore,
      generationType: data.mode === 'MATRIX' ? 'AUTO' : 'MANUAL',
      allowResultReview: data.allowResultReview ?? true,
      questions: (data.questionIds || []).map((questionId, index) => ({
        questionId,
        order: index + 1,
      })),
    });
    return {
      ...response.data,
      result: response.data.result ? normalizeExam(response.data.result) : response.data.result,
    };
  },

  // Delete exam
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

  // Get exams by course
  getByCourse: async (courseId: string): Promise<ApiResponse<ExamResponse[]>> => {
    const response = await api.get(`/exams/course/${courseId}`);
    return {
      ...response.data,
      result: (response.data.result || []).map(normalizeExam),
    };
  },

  // Get published exams (for students)
  getPublished: async (): Promise<ApiResponse<ExamResponse[]>> => {
    const response = await api.get('/exams/published');
    return {
      ...response.data,
      result: (response.data.result || []).map(normalizeExam),
    };
  },

  // Publish exam
  publish: async (id: string): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.post(`/exams/${id}/publish`);
    return {
      ...response.data,
      result: response.data.result ? normalizeExam(response.data.result) : response.data.result,
    };
  },

  // Unpublish exam
  unpublish: async (id: string): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.post(`/exams/${id}/unpublish`);
    return {
      ...response.data,
      result: response.data.result ? normalizeExam(response.data.result) : response.data.result,
    };
  },

  // Toggle review visibility for students
  updateReviewVisibility: async (id: string, allowResultReview: boolean): Promise<ApiResponse<ExamResponse>> => {
    const response = await api.patch(`/exams/${id}/review-visibility`, { allowResultReview });
    return {
      ...response.data,
      result: response.data.result ? normalizeExam(response.data.result) : response.data.result,
    };
  },

  // Get my exams (instructor)
  getMyExams: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<ExamResponse>>> => {
    const response = await api.get('/exams/my-exams', { params: { page, size } });
    return normalizeExamPage(response.data);
  },

  // Alias for instructor exams (same as getMyExams)
  getInstructorExams: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<ExamResponse>>> => {
    const response = await api.get('/exams/my-exams', { params: { page, size } });
    return normalizeExamPage(response.data);
  },

  // Get my exam attempts (student)
  getMyAttempts: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/attempts/my-attempts');
    return response.data;
  },
};

export default examService;
