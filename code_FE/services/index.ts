// Export all services from a single entry point

export { default as userService, type UserProfileResponse } from './userService';

export {
    chapterService, default as courseService, lessonService, type ChapterRequest,
    type ChapterResponse, type CourseRequest,
    type CourseResponse, type LessonRequest,
    type LessonResponse,
    type PageResponse
} from './courseService';

export {
    default as questionService, type ExcelImportResponse, type QuestionCreateRequest,
    type QuestionOptionRequest,
    type QuestionResponse
} from './questionService';

export {
    default as examService,
    type ExamCreateRequest,
    type ExamGenerateRequest,
    type ExamResponse
} from './examService';

export {
    default as attemptService,
    type ExamAttemptResponse, type ExamSubmitRequest, type QuestionResult
} from './attemptService';

export {
    default as gradingService,
    type GradingDetailResponse, type ManualGradeRequest, type QuestionGrade,
    type QuestionGradeRequest
} from './gradingService';

export {
    default as enrollmentService,
    progressService,
    type EnrollmentRequest,
    type EnrollmentResponse, type ProgressResponse, type ProgressUpdateRequest
} from './enrollmentService';

export {
    default as adminService,
    analyticsService,
    type AdminUserResponse, type CourseStats, type DashboardStats, type InstructorApprovalRequest,
    type InstructorApprovalResponse, type RevenueData
} from './adminService';

export {
    default as commentService, mapCommentToDiscussion,
    mapReviewToViewModel,
    normalizeReviewStats, reviewService, type CommentRequest,
    type CommentResponse,
    type DiscussionViewModel,
    type ReviewRequest,
    type ReviewResponse, type ReviewStats, type ReviewViewModel
} from './commentService';

export {
    certificateService, healthService, default as mediaService, paymentService, type MediaResourceResponse,
    type PaymentResult
} from './mediaService';

