# 📚 Tài Liệu Hướng Dẫn API Endpoints - Hệ Thống LMS Exam Backend

Tài liệu này tổng hợp **toàn bộ** danh sách các API endpoints của hệ thống Back-end dựa trên Swagger API Docs tự động thu thập từ Server đang chạy.

**Base URL:** `http://localhost:8080`
**Authentication:** Yêu cầu JWT Token truyền trong Header `Authorization: Bearer <token>` hoặc đối với tài liệu đang test có thể cần Header `X-User-Id`.

---

## 1. Module: Exam Attempts

### 1.1 Save progress
- **Endpoint:** `PUT /api/attempts/{attemptId}/progress`
- **Mô tả:** Auto-save answers while taking exam. Call this periodically.
- **Parameters:**
  - `attemptId` (path): Bắt buộc - 
- **Request Body Example:**
```json
[
  {
    "questionId": "string",
    "selectedOptions": [
      0
    ],
    "fillAnswer": "string"
  }
]
```

### 1.2 Start exam
- **Endpoint:** `POST /api/exams/{examId}/start`
- **Mô tả:** Begin a new exam attempt. Timer starts immediately.
- **Parameters:**
  - `examId` (path): Bắt buộc - 
  - `X-User-Id` (header): Tùy chọn - 

### 1.3 Submit exam
- **Endpoint:** `POST /api/attempts/{attemptId}/submit`
- **Mô tả:** Submit exam for grading. Auto-grades immediately for MC/TF/Fill-in questions.
- **Parameters:**
  - `attemptId` (path): Bắt buộc - 
- **Request Body Example:**
```json
{
  "answers": [
    {
      "questionId": {},
      "selectedOptions": {},
      "fillAnswer": {}
    }
  ]
}
```

### 1.4 Get all attempts for exam (Instructor)
- **Endpoint:** `GET /api/exams/{examId}/attempts`
- **Mô tả:** View all student attempts for a specific exam
- **Parameters:**
  - `examId` (path): Bắt buộc - 
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 

### 1.5 Get attempt details
- **Endpoint:** `GET /api/attempts/{attemptId}`
- **Mô tả:** View attempt details including answers and scores
- **Parameters:**
  - `attemptId` (path): Bắt buộc - 

### 1.6 Review exam results
- **Endpoint:** `GET /api/attempts/{attemptId}/review`
- **Mô tả:** View detailed results including correct answers and explanations
- **Parameters:**
  - `attemptId` (path): Bắt buộc - 
  - `X-User-Id` (header): Tùy chọn - 

### 1.7 Get my exam attempts
- **Endpoint:** `GET /api/attempts/my-attempts`
- **Mô tả:** Get all attempts by current student
- **Parameters:**
  - `X-User-Id` (header): Tùy chọn - 
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 

---
## 2. Module: Exam Management

### 2.1 Get exam by ID
- **Endpoint:** `GET /api/exams/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 2.2 Update exam
- **Endpoint:** `PUT /api/exams/{id}`
- **Mô tả:** Update an unpublished exam
- **Parameters:**
  - `id` (path): Bắt buộc - 
- **Request Body Example:**
```json
{
  "title": "string",
  "description": "string",
  "courseId": "string",
  "duration": 0,
  "passingScore": 0.0,
  "questions": [
    {
      "questionId": {},
      "order": {}
    }
  ],
  "generationType": "MANUAL"
}
```

### 2.3 Delete exam
- **Endpoint:** `DELETE /api/exams/{id}`
- **Mô tả:** Delete an unpublished exam
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 2.4 Get all exams with pagination
- **Endpoint:** `GET /api/exams`
- **Parameters:**
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 
  - `sortBy` (query): Tùy chọn - 
  - `direction` (query): Tùy chọn - 

### 2.5 Create exam manually
- **Endpoint:** `POST /api/exams`
- **Mô tả:** Create an exam by manually selecting questions
- **Parameters:**
  - `X-User-Id` (header): Tùy chọn - 
- **Request Body Example:**
```json
{
  "title": "string",
  "description": "string",
  "courseId": "string",
  "duration": 0,
  "passingScore": 0.0,
  "questions": [
    {
      "questionId": {},
      "order": {}
    }
  ],
  "generationType": "MANUAL"
}
```

### 2.6 Unpublish exam
- **Endpoint:** `POST /api/exams/{id}/unpublish`
- **Mô tả:** Make exam unavailable for students
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 2.7 Publish exam
- **Endpoint:** `POST /api/exams/{id}/publish`
- **Mô tả:** Make exam available for students
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 2.8 Auto-generate exam
- **Endpoint:** `POST /api/exams/generate`
- **Mô tả:** Generate exam automatically based on difficulty matrix and topics
- **Parameters:**
  - `X-User-Id` (header): Tùy chọn - 
- **Request Body Example:**
```json
{
  "title": "string",
  "description": "string",
  "courseId": "string",
  "duration": 0,
  "passingScore": 0.0,
  "topics": [
    "string"
  ],
  "difficultyDistribution": {}
}
```

### 2.9 Get all published exams
- **Endpoint:** `GET /api/exams/published`

### 2.10 Get exams created by current user
- **Endpoint:** `GET /api/exams/my-exams`
- **Parameters:**
  - `X-User-Id` (header): Tùy chọn - 
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 

### 2.11 Get exams by course
- **Endpoint:** `GET /api/exams/course/{courseId}`
- **Parameters:**
  - `courseId` (path): Bắt buộc - 

---
## 3. Module: Manual Grading

### 3.1 Grade a single question
- **Endpoint:** `POST /api/grading/question`
- **Mô tả:** Manually grade or override score for a single question
- **Parameters:**
  - `attemptId` (query): Bắt buộc - 
  - `X-User-Id` (header): Tùy chọn - 
- **Request Body Example:**
```json
{
  "questionId": "string",
  "score": 0.0,
  "feedback": "string",
  "accepted": true
}
```

### 3.2 Finalize grading
- **Endpoint:** `POST /api/grading/finalize/{attemptId}`
- **Mô tả:** Mark grading as complete and calculate final score
- **Parameters:**
  - `attemptId` (path): Bắt buộc - 
  - `X-User-Id` (header): Tùy chọn - 

### 3.3 Grade multiple questions at once
- **Endpoint:** `POST /api/grading/attempt`
- **Mô tả:** Grade multiple questions in a single request
- **Parameters:**
  - `X-User-Id` (header): Tùy chọn - 
- **Request Body Example:**
```json
{
  "attemptId": "string",
  "questionScores": {}
}
```

### 3.4 Get attempts needing grading
- **Endpoint:** `GET /api/grading/pending`
- **Mô tả:** Get all submitted attempts that need manual grading review
- **Parameters:**
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 

### 3.5 Get attempts needing grading for specific exam
- **Endpoint:** `GET /api/grading/pending/exam/{examId}`
- **Mô tả:** Get submitted attempts for a specific exam
- **Parameters:**
  - `examId` (path): Bắt buộc - 
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 

### 3.6 Get grading details
- **Endpoint:** `GET /api/grading/details/{attemptId}`
- **Mô tả:** Get detailed grading information including all questions and answers
- **Parameters:**
  - `attemptId` (path): Bắt buộc - 

---
## 4. Module: Question Management

### 4.1 Get question by ID
- **Endpoint:** `GET /api/questions/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 4.2 Update a question
- **Endpoint:** `PUT /api/questions/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 
- **Request Body Example:**
```json
{
  "type": "SINGLE_CHOICE",
  "content": "string",
  "imageUrl": "string",
  "options": [
    {
      "text": {},
      "imageUrl": {},
      "isCorrect": {}
    }
  ],
  "correctAnswer": "string",
  "explanation": "string",
  "difficulty": "RECOGNIZE",
  "topics": [
    "string"
  ],
  "points": 0.0
}
```

### 4.3 Delete a question
- **Endpoint:** `DELETE /api/questions/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 4.4 Get all questions with pagination
- **Endpoint:** `GET /api/questions`
- **Parameters:**
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 
  - `sortBy` (query): Tùy chọn - 
  - `direction` (query): Tùy chọn - 

### 4.5 Create a new question
- **Endpoint:** `POST /api/questions`
- **Parameters:**
  - `X-User-Id` (header): Tùy chọn - 
- **Request Body Example:**
```json
{
  "type": "SINGLE_CHOICE",
  "content": "string",
  "imageUrl": "string",
  "options": [
    {
      "text": {},
      "imageUrl": {},
      "isCorrect": {}
    }
  ],
  "correctAnswer": "string",
  "explanation": "string",
  "difficulty": "RECOGNIZE",
  "topics": [
    "string"
  ],
  "points": 0.0
}
```

### 4.6 Import questions from Excel file
- **Endpoint:** `POST /api/questions/import/excel`
- **Mô tả:** Upload an Excel file (.xlsx) to bulk import questions. Returns success/failure counts and error details.
- **Parameters:**
  - `X-User-Id` (header): Tùy chọn - 
- **Request Body:** Form-Data (Upload File)

### 4.7 Search questions by type
- **Endpoint:** `GET /api/questions/search/type`
- **Parameters:**
  - `type` (query): Bắt buộc - 

### 4.8 Search questions by topics
- **Endpoint:** `GET /api/questions/search/topics`
- **Parameters:**
  - `topics` (query): Bắt buộc - 

### 4.9 Search questions by difficulty level
- **Endpoint:** `GET /api/questions/search/difficulty`
- **Parameters:**
  - `difficulty` (query): Bắt buộc - 

### 4.10 Advanced search by topics and difficulty
- **Endpoint:** `GET /api/questions/search/advanced`
- **Parameters:**
  - `topics` (query): Bắt buộc - 
  - `difficulty` (query): Bắt buộc - 

### 4.11 Get questions created by current user
- **Endpoint:** `GET /api/questions/my-questions`
- **Parameters:**
  - `X-User-Id` (header): Tùy chọn - 
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 

---
## 5. Module: admin-user-controller

### 5.1 /api/admin/users/{id}/status
- **Endpoint:** `PATCH /api/admin/users/{id}/status`
- **Parameters:**
  - `id` (path): Bắt buộc - 
- **Request Body Example:**
```json
{
  "isActive": true
}
```

### 5.2 /api/admin/users/{id}/role
- **Endpoint:** `PATCH /api/admin/users/{id}/role`
- **Parameters:**
  - `id` (path): Bắt buộc - 
- **Request Body Example:**
```json
{
  "role": "ADMIN"
}
```

### 5.3 /api/admin/users
- **Endpoint:** `GET /api/admin/users`
- **Parameters:**
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 
  - `role` (query): Tùy chọn - 
  - `isActive` (query): Tùy chọn - 

---
## 6. Module: analytics-controller

### 6.1 /api/analytics/top-courses
- **Endpoint:** `GET /api/analytics/top-courses`
- **Parameters:**
  - `limit` (query): Tùy chọn - 

### 6.2 /api/analytics/revenue
- **Endpoint:** `GET /api/analytics/revenue`
- **Parameters:**
  - `year` (query): Tùy chọn - 

### 6.3 /api/analytics/new-users
- **Endpoint:** `GET /api/analytics/new-users`
- **Parameters:**
  - `year` (query): Tùy chọn - 

### 6.4 /api/analytics/dashboard
- **Endpoint:** `GET /api/analytics/dashboard`

### 6.5 /api/analytics/courses/{courseId}
- **Endpoint:** `GET /api/analytics/courses/{courseId}`
- **Parameters:**
  - `courseId` (path): Bắt buộc - 

### 6.6 /api/analytics/courses/top-revenue
- **Endpoint:** `GET /api/analytics/courses/top-revenue`
- **Parameters:**
  - `limit` (query): Tùy chọn - 

---
## 7. Module: auth-controller

### 7.1 /api/auth/register
- **Endpoint:** `POST /api/auth/register`
- **Request Body Example:**
```json
{
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```

### 7.2 /api/auth/refresh
- **Endpoint:** `POST /api/auth/refresh`
- **Request Body Example:**
```json
{
  "refreshToken": "string"
}
```

### 7.3 /api/auth/logout
- **Endpoint:** `POST /api/auth/logout`
- **Request Body Example:**
```json
{
  "refreshToken": "string"
}
```

### 7.4 /api/auth/login
- **Endpoint:** `POST /api/auth/login`
- **Request Body Example:**
```json
{
  "email": "string",
  "password": "string"
}
```

---
## 8. Module: certificate-controller

### 8.1 /api/certificates/{userId}/{courseId}
- **Endpoint:** `GET /api/certificates/{userId}/{courseId}`
- **Parameters:**
  - `userId` (path): Bắt buộc - 
  - `courseId` (path): Bắt buộc - 

### 8.2 /api/certificates/{courseId}/download
- **Endpoint:** `GET /api/certificates/{courseId}/download`
- **Parameters:**
  - `courseId` (path): Bắt buộc - 

### 8.3 /api/certificates/my
- **Endpoint:** `GET /api/certificates/my`

---
## 9. Module: chapter-controller

### 9.1 /api/v1/chapters/{id}
- **Endpoint:** `PUT /api/v1/chapters/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 
- **Request Body Example:**
```json
{
  "courseId": "string",
  "title": "string",
  "orderIndex": 0
}
```

### 9.2 /api/v1/chapters/{id}
- **Endpoint:** `DELETE /api/v1/chapters/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 9.3 /api/v1/chapters
- **Endpoint:** `POST /api/v1/chapters`
- **Request Body Example:**
```json
{
  "courseId": "string",
  "title": "string",
  "orderIndex": 0
}
```

### 9.4 /api/v1/courses/{courseId}/chapters
- **Endpoint:** `GET /api/v1/courses/{courseId}/chapters`
- **Parameters:**
  - `courseId` (path): Bắt buộc - 

---
## 10. Module: comment-controller

### 10.1 /api/comments/{id}
- **Endpoint:** `GET /api/comments/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 10.2 /api/comments/{id}
- **Endpoint:** `PUT /api/comments/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 
- **Request Body Example:**
```json
{}
```

### 10.3 /api/comments/{id}
- **Endpoint:** `DELETE /api/comments/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 
  - `userId` (query): Bắt buộc - 

### 10.4 /api/comments
- **Endpoint:** `POST /api/comments`
- **Request Body Example:**
```json
{
  "courseId": "string",
  "lessonId": "string",
  "userId": "string",
  "userName": "string",
  "content": "string",
  "parentId": "string"
}
```

### 10.5 /api/comments/{id}/replies
- **Endpoint:** `GET /api/comments/{id}/replies`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 10.6 /api/comments/course/{courseId}
- **Endpoint:** `GET /api/comments/course/{courseId}`
- **Parameters:**
  - `courseId` (path): Bắt buộc - 
  - `lessonId` (query): Tùy chọn - 
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 

---
## 11. Module: course-controller

### 11.1 /api/v1/courses/{id}
- **Endpoint:** `GET /api/v1/courses/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 11.2 /api/v1/courses/{id}
- **Endpoint:** `PUT /api/v1/courses/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 
- **Request Body Example:**
```json
{
  "title": "string",
  "description": "string",
  "price": 0.0,
  "coverImage": "string",
  "instructorId": "string"
}
```

### 11.3 /api/v1/courses/{id}
- **Endpoint:** `DELETE /api/v1/courses/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 11.4 /api/v1/courses
- **Endpoint:** `GET /api/v1/courses`

### 11.5 /api/v1/courses
- **Endpoint:** `POST /api/v1/courses`
- **Request Body Example:**
```json
{
  "title": "string",
  "description": "string",
  "price": 0.0,
  "coverImage": "string",
  "instructorId": "string"
}
```

---
## 12. Module: enrollment-controller

### 12.1 /api/enrollments
- **Endpoint:** `POST /api/enrollments`
- **Request Body Example:**
```json
{
  "userId": "string",
  "courseId": "string"
}
```

### 12.2 /api/enrollments/{userId}
- **Endpoint:** `GET /api/enrollments/{userId}`
- **Parameters:**
  - `userId` (path): Bắt buộc - 

---
## 13. Module: health-check-controller

### 13.1 /api/health
- **Endpoint:** `GET /api/health`

---
## 14. Module: instructor-approval-request-controller

### 14.1 /api/instructor-requests
- **Endpoint:** `GET /api/instructor-requests`
- **Parameters:**
  - `status` (query): Tùy chọn - 

### 14.2 /api/instructor-requests
- **Endpoint:** `POST /api/instructor-requests`
- **Request Body Example:**
```json
{
  "note": "string"
}
```

### 14.3 /api/instructor-requests/{id}/reject
- **Endpoint:** `POST /api/instructor-requests/{id}/reject`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 14.4 /api/instructor-requests/{id}/approve
- **Endpoint:** `POST /api/instructor-requests/{id}/approve`
- **Parameters:**
  - `id` (path): Bắt buộc - 

---
## 15. Module: lesson-controller

### 15.1 /api/v1/lessons/{id}
- **Endpoint:** `PUT /api/v1/lessons/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 
- **Request Body Example:**
```json
{
  "chapterId": "string",
  "title": "string",
  "content": "string",
  "orderIndex": 0
}
```

### 15.2 /api/v1/lessons/{id}
- **Endpoint:** `DELETE /api/v1/lessons/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 15.3 /api/v1/lessons
- **Endpoint:** `POST /api/v1/lessons`
- **Request Body Example:**
```json
{
  "chapterId": "string",
  "title": "string",
  "content": "string",
  "orderIndex": 0
}
```

### 15.4 /api/v1/chapters/{chapterId}/lessons
- **Endpoint:** `GET /api/v1/chapters/{chapterId}/lessons`
- **Parameters:**
  - `chapterId` (path): Bắt buộc - 

---
## 16. Module: media-controller

### 16.1 /api/v1/lessons/{lessonId}/media/video
- **Endpoint:** `POST /api/v1/lessons/{lessonId}/media/video`
- **Parameters:**
  - `lessonId` (path): Bắt buộc - 
- **Request Body Example:**
```json
{}
```

### 16.2 /api/v1/lessons/{lessonId}/media/document
- **Endpoint:** `POST /api/v1/lessons/{lessonId}/media/document`
- **Parameters:**
  - `lessonId` (path): Bắt buộc - 
- **Request Body:** Form-Data (Upload File)

### 16.3 /api/v1/media/{id}/download
- **Endpoint:** `GET /api/v1/media/{id}/download`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 16.4 /api/v1/lessons/{lessonId}/media
- **Endpoint:** `GET /api/v1/lessons/{lessonId}/media`
- **Parameters:**
  - `lessonId` (path): Bắt buộc - 

### 16.5 /api/v1/media/{id}
- **Endpoint:** `DELETE /api/v1/media/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

---
## 17. Module: progress-controller

### 17.1 /api/progress
- **Endpoint:** `POST /api/progress`
- **Request Body Example:**
```json
{
  "userId": "string",
  "courseId": "string",
  "lessonId": "string",
  "completed": true,
  "lastWatchedSecond": 0
}
```

### 17.2 /api/progress/{userId}/{courseId}
- **Endpoint:** `GET /api/progress/{userId}/{courseId}`
- **Parameters:**
  - `userId` (path): Bắt buộc - 
  - `courseId` (path): Bắt buộc - 

---
## 18. Module: review-controller

### 18.1 /api/reviews/{id}
- **Endpoint:** `GET /api/reviews/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 

### 18.2 /api/reviews/{id}
- **Endpoint:** `PUT /api/reviews/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 
- **Request Body Example:**
```json
{}
```

### 18.3 /api/reviews/{id}
- **Endpoint:** `DELETE /api/reviews/{id}`
- **Parameters:**
  - `id` (path): Bắt buộc - 
  - `userId` (query): Bắt buộc - 

### 18.4 /api/reviews
- **Endpoint:** `POST /api/reviews`
- **Request Body Example:**
```json
{
  "courseId": "string",
  "userId": "string",
  "userName": "string",
  "userAvatar": "string",
  "rating": 0,
  "comment": "string"
}
```

### 18.5 /api/reviews/course/{courseId}
- **Endpoint:** `GET /api/reviews/course/{courseId}`
- **Parameters:**
  - `courseId` (path): Bắt buộc - 
  - `page` (query): Tùy chọn - 
  - `size` (query): Tùy chọn - 

### 18.6 /api/reviews/course/{courseId}/stats
- **Endpoint:** `GET /api/reviews/course/{courseId}/stats`
- **Parameters:**
  - `courseId` (path): Bắt buộc - 

---
## 19. Module: user-controller

### 19.1 /api/users/me
- **Endpoint:** `GET /api/users/me`

### 19.2 /api/users/me
- **Endpoint:** `PUT /api/users/me`
- **Request Body Example:**
```json
{
  "fullName": "string",
  "phoneNumber": "string",
  "dateOfBirth": "string",
  "address": "string",
  "gender": "MALE",
  "schoolId": "string"
}
```

### 19.3 /api/users/me/change-password
- **Endpoint:** `POST /api/users/me/change-password`
- **Request Body Example:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

### 19.4 /api/users/me/avatar
- **Endpoint:** `POST /api/users/me/avatar`
- **Request Body Example:**
```json
{
  "file": "string"
}
```

---
## 20. Module: vn-pay-payment-controller

### 20.1 /api/vnpay/create
- **Endpoint:** `POST /api/vnpay/create`
- **Parameters:**
  - `userId` (query): Bắt buộc - 
  - `courseId` (query): Bắt buộc - 

### 20.2 /api/vnpay/return
- **Endpoint:** `GET /api/vnpay/return`
- **Parameters:**
  - `params` (query): Bắt buộc - 

---
