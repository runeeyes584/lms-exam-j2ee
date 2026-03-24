import api from '@/lib/api';
import type { ApiResponse } from '@/types/types';
import type { ExamAttemptResponse } from './attemptService';
import type { PageResponse } from './courseService';

export interface GradingDetailResponse {
  attemptId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: string;
  passed: boolean;
  questionGrades: QuestionGrade[];
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface QuestionGrade {
  questionId: string;
  questionContent: string;
  questionType: string;
  maxPoints: number;
  earnedPoints: number;
  selectedOptions: string[];
  correctOptions: string[];
  isCorrect: boolean;
  feedback?: string;
}

export interface QuestionGradeRequest {
  attemptId: string;
  questionId: string;
  score: number;
  feedback?: string;
}

export interface ManualGradeRequest {
  attemptId: string;
  questionGrades: {
    questionId: string;
    score: number;
    feedback?: string;
  }[];
}

export const gradingService = {
  // Get pending attempts for grading
  getPending: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<ExamAttemptResponse>>> => {
    const response = await api.get('/grading/pending', { params: { page, size } });
    return response.data;
  },

  // Get pending attempts by exam
  getPendingByExam: async (
    examId: string,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PageResponse<ExamAttemptResponse>>> => {
    const response = await api.get(`/grading/pending/exam/${examId}`, { params: { page, size } });
    return response.data;
  },

  // Get grading details
  getDetails: async (attemptId: string): Promise<ApiResponse<GradingDetailResponse>> => {
    const response = await api.get(`/grading/details/${attemptId}`);
    return response.data;
  },

  // Grade single question
  gradeQuestion: async (data: QuestionGradeRequest): Promise<ApiResponse<GradingDetailResponse>> => {
    const response = await api.post('/grading/question', data);
    return response.data;
  },

  // Grade entire attempt (manual)
  gradeAttempt: async (data: ManualGradeRequest): Promise<ApiResponse<ExamAttemptResponse>> => {
    const response = await api.post('/grading/attempt', data);
    return response.data;
  },

  // Finalize grading
  finalize: async (attemptId: string): Promise<ApiResponse<ExamAttemptResponse>> => {
    const response = await api.post(`/grading/finalize/${attemptId}`);
    return response.data;
  },
};

export default gradingService;
