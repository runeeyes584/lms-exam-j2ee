# 📋 PLAN: EXAM ENGINE & QUESTION BANK SYSTEM

**Status:** Phase 2 Complete (30% done - 13/43 todos)  
**Last Updated:** 2026-03-23

## ✅ COMPLETED PHASES

### Phase 0: Setup & MongoDB Configuration ✓
- ✅ MongoDB Cloud Atlas connection (kaleidoscope.az65wnr.mongodb.net)
- ✅ Dependencies: Apache POI, Validation, Lombok, Swagger
- ✅ CORS configuration
- ✅ Security configuration (temporarily public for testing)
- ✅ MongoConfig class for explicit connection

### Phase 1: Database & Core Entities ✓
- ✅ 10 Entity classes (Question, Exam, ExamAttempt + enums)
- ✅ 3 Repository interfaces with custom queries
- ✅ 9 DTO classes (5 Request + 4 Response + ApiResponse)

### Phase 2: Question Management ✓
- ✅ QuestionService with CRUD operations
- ✅ QuestionController with REST API
- ✅ Validation logic (type-specific validation)
- ✅ Search & filter (topics, difficulty, type)
- ✅ **TESTED:** All endpoints working with MongoDB Cloud

**Working APIs:**
- POST /api/questions - Create ✓
- GET /api/questions - List with pagination ✓
- GET /api/questions/{id} - Get by ID
- PUT /api/questions/{id} - Update
- DELETE /api/questions/{id} - Delete
- GET /api/questions/search/* - Various search filters

---

## 🎯 PROBLEM STATEMENT
Xây dựng REST API Backend cho hệ thống Khảo thí & Ngân hàng câu hỏi bao gồm:
- Quản lý ngân hàng câu hỏi với nhiều loại (trắc nghiệm, đúng/sai, tự luận-điền đáp án)
- Import câu hỏi từ Excel (hỗ trợ ảnh dưới dạng link)
- Sinh đề thi tự động theo ma trận (độ khó: nhận biết/thông hiểu/vận dụng/vận dụng cao + chủ đề)
- Chấm điểm tự động với giới hạn thời gian, lưu lịch sử, xem lại bài làm
- GV có thể chấm câu tự luận thủ công

**Note:** Sử dụng MongoDB Cloud Atlas. Frontend sẽ được phát triển sau.

## 🏗️ ARCHITECTURE OVERVIEW

### Tech Stack
**Backend:**
- Spring Boot 4.0.4 + MongoDB Cloud Atlas
- Spring Security + JWT (đã có sẵn)
- Apache POI (import Excel)
- Java 17
- Maven

**Frontend:** (Sẽ làm sau - không trong scope hiện tại)

### MongoDB Configuration
- **Database:** MongoDB Cloud Atlas
- **Connection:** Via application.properties (spring.data.mongodb.uri)
- **Authentication:** Username/Password hoặc Connection String

### Database Schema (MongoDB Collections)
```
questions: {
  _id, type (SINGLE_CHOICE|MULTIPLE_CHOICE|TRUE_FALSE|FILL_IN),
  content, imageUrl, 
  options: [{text, imageUrl, isCorrect}],
  correctAnswer (for fill-in), explanation,
  difficulty (RECOGNIZE|UNDERSTAND|APPLY|ANALYZE),
  topics: [String], points,
  createdBy, createdAt, updatedAt
}

exams: {
  _id, title, description, courseId,
  duration (minutes), passingScore, totalPoints,
  questions: [{questionId, order}],
  generationType (MANUAL|AUTO),
  isPublished, createdBy, createdAt
}

exam_attempts: {
  _id, examId, studentId, 
  startTime, endTime, submittedAt,
  answers: [{questionId, selectedOptions/fillAnswer}],
  totalScore, autoGradedScore, manualGradedScore,
  status (IN_PROGRESS|SUBMITTED|GRADED),
  gradedBy, gradedAt
}
```

## 📦 PROJECT STRUCTURE

### Backend Structure
```
src/main/java/kaleidoscope/j2ee/examlms/
├── config/
│   └── ExcelImportConfig.java (POI config)
├── controller/
│   ├── QuestionController.java
│   ├── ExamController.java
│   └── ExamAttemptController.java
├── dto/
│   ├── request/
│   │   ├── QuestionCreateRequest.java
│   │   ├── ExamCreateRequest.java
│   │   ├── ExamGenerateRequest.java (cho auto-generate)
│   │   ├── ExamSubmitRequest.java
│   │   └── ManualGradeRequest.java
│   └── response/
│       ├── QuestionResponse.java
│       ├── ExamResponse.java
│       ├── ExamAttemptResponse.java
│       └── ExamResultResponse.java
├── entity/
│   ├── Question.java
│   ├── QuestionOption.java (embedded)
│   ├── Exam.java
│   └── ExamAttempt.java
├── repository/
│   ├── QuestionRepository.java
│   ├── ExamRepository.java
│   └── ExamAttemptRepository.java
├── service/
│   ├── QuestionService.java
│   ├── ExamService.java
│   ├── ExamAttemptService.java
│   ├── ExcelImportService.java
│   └── ExamGeneratorService.java
├── exception/
│   ├── QuestionNotFoundException.java
│   ├── ExamNotFoundException.java
│   └── InvalidExcelFormatException.java
└── utils/
    └── ExamGradingUtil.java
```

### API Endpoints Design
```
Questions API:
GET    /api/questions              - List all questions (with filters)
GET    /api/questions/{id}         - Get question by ID
POST   /api/questions              - Create new question
PUT    /api/questions/{id}         - Update question
DELETE /api/questions/{id}         - Delete question
POST   /api/questions/import       - Import from Excel

Exams API:
GET    /api/exams                  - List all exams
GET    /api/exams/{id}             - Get exam details
POST   /api/exams                  - Create exam manually
POST   /api/exams/generate         - Auto-generate exam
PUT    /api/exams/{id}             - Update exam
DELETE /api/exams/{id}             - Delete exam
POST   /api/exams/{id}/publish     - Publish exam

Exam Attempts API:
POST   /api/exams/{id}/start       - Start exam (create attempt)
PUT    /api/attempts/{id}/progress - Save progress
POST   /api/attempts/{id}/submit   - Submit exam
GET    /api/attempts               - Get my attempts (student)
GET    /api/attempts/{id}          - Get attempt details
GET    /api/exams/{id}/attempts    - Get all attempts (instructor)
POST   /api/attempts/{id}/grade    - Manual grading (instructor)
GET    /api/attempts/{id}/review   - Review results (student)
```

## 📝 IMPLEMENTATION TODOS (BACKEND ONLY)

### Phase 0: Project Setup & MongoDB Configuration
- [ ] Configure MongoDB Cloud connection in application.properties
- [ ] Add required dependencies (MongoDB, Apache POI, Validation)
- [ ] Setup CORS configuration for future frontend
- [ ] Verify MongoDB connection

### Phase 1: Database & Core Entities (Backend Foundation)
- [x] Define project structure
- [ ] Create MongoDB entities (Question, Exam, ExamAttempt)
- [ ] Setup repositories with basic queries
- [ ] Create DTO classes (Request/Response)
- [ ] Setup ApiResponse wrapper

### Phase 2: Question Bank Management
- [ ] Implement QuestionService (CRUD operations)
- [ ] Create QuestionController with REST endpoints
- [ ] Add validation for question data
- [ ] Implement search/filter by topic, difficulty
- [ ] Add pagination support

### Phase 3: Excel Import Feature [KEY FEATURE]
- [ ] Add Apache POI dependency to pom.xml
- [ ] Design Excel template format (with examples)
- [ ] Implement ExcelImportService
  - Parse Excel rows to Question entities
  - Validate data (required fields, imageUrl format)
  - Handle errors gracefully
- [ ] Create import endpoint
- [ ] Test with sample Excel files

### Phase 4: Exam Generator [KEY FEATURE]
- [ ] Implement ExamService (CRUD for exams)
- [ ] Create manual exam creation (select questions)
- [ ] Implement ExamGeneratorService
  - Build matrix-based random selection algorithm
  - Support filters: difficulty levels + topics
  - Ensure no duplicate questions
- [ ] Create exam generation endpoint
- [ ] Add exam publish/unpublish functionality

### Phase 5: Exam Taking & Auto-Grading
- [ ] Implement ExamAttemptService
  - Start exam (create attempt, set timer)
  - Save progress (auto-save answers)
  - Submit exam
- [ ] Create auto-grading logic (ExamGradingUtil)
  - Calculate scores for MC/True-False/Fill-in
  - Mark manual-grading-required for essay questions
- [ ] Implement exam attempt endpoints
- [ ] Add time limit validation

### Phase 6: Manual Grading & Review
- [ ] Create endpoint for instructors to view attempts
- [ ] Implement manual grading for fill-in answers
- [ ] Add review endpoint (student view results)
- [ ] Show correct answers & explanations

### Phase 7: Testing & Documentation
- [ ] Test all API endpoints with Postman/Thunder Client
- [ ] Test Excel import with various formats
- [ ] Test exam generation with different matrices
- [ ] Test auto-grading accuracy
- [ ] Test timer validation & auto-submit logic
- [ ] Add comprehensive error handling
- [ ] Create API documentation (Postman collection or Swagger)
- [ ] Create sample Excel template file
- [ ] Update README with API usage examples

## 🔑 KEY FEATURES CHECKLIST
- [ ] Import questions from Excel (Apache POI)
- [ ] Auto-generate exams by matrix (difficulty + topics)
- [ ] Auto-grading with timer
- [ ] Manual grading for fill-in questions
- [ ] Exam history & review

## 📌 NOTES & CONSIDERATIONS

### Excel Import Format
```
Column A: Question Content (Text)
Column B: Question Type (SINGLE_CHOICE|MULTIPLE_CHOICE|TRUE_FALSE|FILL_IN)
Column C: Image URL (Optional)
Column D: Option 1 Text
Column E: Option 1 Image URL (Optional)
Column F: Option 1 Is Correct (TRUE/FALSE)
... repeat for options 2, 3, 4
Column M: Correct Answer (for FILL_IN type)
Column N: Explanation
Column O: Difficulty (RECOGNIZE|UNDERSTAND|APPLY|ANALYZE)
Column P: Topics (comma-separated)
Column Q: Points
```

### Security Considerations
- Only ADMIN & INSTRUCTOR can create/edit questions and exams
- Students can only view published exams and their own attempts
- Prevent exam cheating:
  - Shuffle questions & options order (optional)
  - Disable copy-paste
  - Track tab switching (optional)

### Performance Optimization
- Index MongoDB collections by: courseId, topics, difficulty
- Cache frequently accessed questions
- Paginate question lists & exam attempts

### Future Enhancements (Out of Scope)
- Question versioning (track edits)
- Exam templates (reusable matrices)
- Analytics dashboard (most missed questions, avg scores)
- Proctoring features (webcam, screen recording)
