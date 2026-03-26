// API Base Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// API Response Codes (Backend has inconsistency: some use 0, some use 1000)
// ApiResponseUtil.success() uses ResponseCode.SUCCESS = 0
// ApiResponse.success() uses code = 1000
export const ResponseCode = {
  SUCCESS: 1000,      // Most APIs use this
  SUCCESS_ALT: 0,     // Some APIs (auth) use this
  ERROR: 9999,
  VALIDATION_ERROR: 1001,
  UNAUTHORIZED: 1002,
  FORBIDDEN: 1003,
  NOT_FOUND: 1004,
} as const;

// Helper to check if response is successful (handles both 0 and 1000)
export const isSuccess = (code: number | string | undefined | null): boolean => {
  const normalizedCode = Number(code);
  return (
    normalizedCode === ResponseCode.SUCCESS ||
    normalizedCode === ResponseCode.SUCCESS_ALT ||
    normalizedCode === 200 ||
    normalizedCode === 201
  );
};

// API Response Type (Backend standard)
export interface ApiResponse<T> {
  code: number;      // 0 or 1000 = Success, 9999 = Error
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

export interface RegistrationInitResponse {
  email: string;
  resendCooldownSeconds: number;
  expiresInSeconds: number;
}

export interface VerifyRegistrationOtpRequest {
  email: string;
  otp: string;
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
export type DifficultyLevel = 'RECOGNIZE' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  topic?: string;
  topics: string[];
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
