// Export all services from a single entry point

export { default as userService, type UserProfileResponse } from './userService';

export {
  default as courseService,
  chapterService,
  lessonService,
  type CourseRequest,
  type CourseResponse,
  type ChapterRequest,
  type ChapterResponse,
  type LessonRequest,
  type LessonResponse,
  type PageResponse,
} from './courseService';

export {
  default as questionService,
  type QuestionCreateRequest,
  type QuestionOptionRequest,
  type QuestionResponse,
  type ExcelImportResponse,
} from './questionService';

export {
  default as examService,
  type ExamCreateRequest,
  type ExamGenerateRequest,
  type ExamResponse,
} from './examService';

export {
  default as attemptService,
  type ExamAttemptResponse,
  type QuestionResult,
  type ExamSubmitRequest,
} from './attemptService';

export {
  default as gradingService,
  type GradingDetailResponse,
  type QuestionGrade,
  type QuestionGradeRequest,
  type ManualGradeRequest,
} from './gradingService';

export {
  default as enrollmentService,
  progressService,
  type EnrollmentRequest,
  type EnrollmentResponse,
  type ProgressUpdateRequest,
  type ProgressResponse,
} from './enrollmentService';

export {
  default as adminService,
  analyticsService,
  type AdminUserResponse,
  type InstructorApprovalRequest,
  type InstructorApprovalResponse,
  type DashboardStats,
  type RevenueData,
  type CourseStats,
} from './adminService';

export {
  default as commentService,
  reviewService,
  type CommentRequest,
  type CommentResponse,
  type ReviewRequest,
  type ReviewResponse,
  type ReviewStats,
} from './commentService';

export {
  default as mediaService,
  certificateService,
  paymentService,
  healthService,
  type MediaResourceResponse,
  type PaymentResult,
} from './mediaService';
