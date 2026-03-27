import api from '@/lib/api';
import type { ApiResponse, ExamAttempt, StudentAnswer, AttemptStatus } from '@/types/types';
import type { PageResponse } from './courseService';

export interface ExamAttemptResponse extends ExamAttempt {
  examTitle?: string;
  studentName?: string;
  scoreOnTen?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  completionSeconds?: number;
  questionResults?: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  questionContent: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  earnedScore: number;
  maxScore: number;
  explanation?: string;
}

export interface ExamSubmitRequest {
  answers: StudentAnswer[];
}

export const attemptService = {
  // Start exam attempt
  start: async (examId: string): Promise<ApiResponse<ExamAttemptResponse>> => {
    const response = await api.post(`/exams/${examId}/start`);
    return response.data;
  },

  // Save progress (auto-save answers)
  saveProgress: async (
    attemptId: string,
    answers: StudentAnswer[]
  ): Promise<ApiResponse<ExamAttemptResponse>> => {
    const response = await api.put(`/attempts/${attemptId}/progress`, answers);
    return response.data;
  },

  // Submit exam
  submit: async (
    attemptId: string,
    data: ExamSubmitRequest
  ): Promise<ApiResponse<ExamAttemptResponse>> => {
    const response = await api.post(`/attempts/${attemptId}/submit`, data);
    return response.data;
  },

  // Get attempt by ID
  getById: async (attemptId: string): Promise<ApiResponse<ExamAttemptResponse>> => {
    const response = await api.get(`/attempts/${attemptId}`);
    return response.data;
  },

  // Get my attempts (student)
  getMyAttempts: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<ExamAttemptResponse>>> => {
    const response = await api.get('/attempts/my-attempts', { params: { page, size } });
    return response.data;
  },

  // Get attempts by exam (instructor)
  getByExam: async (
    examId: string,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PageResponse<ExamAttemptResponse>>> => {
    const response = await api.get(`/exams/${examId}/attempts`, { params: { page, size } });
    return response.data;
  },

  // Review attempt (after submission)
  review: async (attemptId: string): Promise<ApiResponse<ExamAttemptResponse>> => {
    const response = await api.get(`/attempts/${attemptId}/review`);
    return response.data;
  },
};

export default attemptService;
