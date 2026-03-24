// API Base Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// API Response Type (Backend standard)
export interface ApiResponse<T> {
  code: number;      // 1000 = Success, 9999 = Error
  message: string;
  result: T;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: 'STUDENT' | 'INSTRUCTOR';
}

// User Types (Match Backend DTOs)
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  schoolId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth Response từ Backend
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Update Profile Request
export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  schoolId?: string;
}

// Change Password Request
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructorId: string;
  instructor?: User;
  coverImage?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

// Question Types
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  topic: string;
  difficulty: DifficultyLevel;
  points: number;
  content: string;
  options: QuestionOption[];
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

// Exam Types
export type ExamMode = 'MANUAL' | 'MATRIX';

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  passingScore: number; // percentage
  mode: ExamMode;
  questions: Question[];
  totalPoints: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Exam Attempt Types
export type AttemptStatus = 'ONGOING' | 'SUBMITTED' | 'AUTO_GRADED' | 'MANUAL_GRADED';

export interface StudentAnswer {
  questionId: string;
  selectedOptionIds: string[];
  isCorrect?: boolean;
  earnedScore?: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  exam?: Exam;
  studentId: string;
  student?: User;
  answers: Record<string, StudentAnswer>;
  startTime: string;
  endTime?: string;
  totalScore: number;
  percentage: number;
  status: AttemptStatus;
  passed: boolean;
}