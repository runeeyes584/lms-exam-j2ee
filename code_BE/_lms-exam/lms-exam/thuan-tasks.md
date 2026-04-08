# ✅ KẾ HOẠCH TRIỂN KHAI - NGUYỄN VĂN THUẬN (TƯƠNG TÁC & THỐNG KÊ)

Mục tiêu: liệt kê rõ các nhiệm vụ, API, dữ liệu và tiêu chí nghiệm thu phần ``Interaction & Analytics`` để bạn thực hiện tuần tự.

---

## 1. Tổng quan & phạm vi
- Phần trách nhiệm: Reviews (đánh giá), Q&A (hỏi đáp), Dashboard thống kê, endpoints hỗ trợ giao diện admin và báo cáo.
- Ưu tiên: Dashboard (KEY FEATURE), Reviews, Q&A.

---

## 2. Deliverables (các việc phải xong)
- [x] Thiết kế schema MongoDB cho `reviews`, `comments`, `analytics` (nếu cần collection riêng).
- [x] API CRUD cho Reviews: create, list (with pagination), delete (soft), avg rating per course.
- [x] API cho Q&A: post question/comment, reply (nested), list comments by lesson with pagination.
- [x] Dashboard APIs: revenue/month, top 5 courses, new users count — tối ưu bằng aggregation pipeline.
- [x] Validation + DTOs cho tất cả request/response.
- [x] Unit tests cho services + integration tests cho controllers (smoke tests).
- [x] Postman/Insomnia collection hoặc docs tóm tắt endpoints.

---

## 3. API Spec (ĐÃ TRIỂN KHAI)

### 🔗 Base URL: `http://localhost:8080/api`

---

### Reviews (Đánh giá khóa học)

| Method | Endpoint | Mô tả | Body/Params |
|--------|----------|-------|-------------|
| POST | `/reviews` | Tạo đánh giá mới | `{ courseId, userId, userName, userAvatar, rating(1-5), comment }` |
| GET | `/reviews/course/{courseId}` | Lấy danh sách đánh giá | `?page=0&size=10` |
| GET | `/reviews/course/{courseId}/stats` | Thống kê avg rating | - |
| GET | `/reviews/{id}` | Lấy chi tiết 1 review | - |
| PUT | `/reviews/{id}` | Cập nhật review | `{ userId, rating, comment }` |
| DELETE | `/reviews/{id}?userId=xxx` | Xóa mềm review | Query: userId |

### Q&A / Comments (Hỏi đáp)

| Method | Endpoint | Mô tả | Body/Params |
|--------|----------|-------|-------------|
| POST | `/comments` | Tạo comment/reply | `{ courseId, lessonId, userId, userName, content, parentId? }` |
| GET | `/comments/course/{courseId}` | Lấy comments theo khóa học | `?lessonId=xxx&page=0&size=20` |
| GET | `/comments/{id}` | Lấy comment + replies | - |
| GET | `/comments/{id}/replies` | Lấy danh sách replies | - |
| PUT | `/comments/{id}` | Cập nhật comment | `{ userId, content }` |
| DELETE | `/comments/{id}?userId=xxx` | Xóa mềm comment | Query: userId |

### Analytics / Dashboard (Thống kê)

| Method | Endpoint | Mô tả | Params |
|--------|----------|-------|--------|
| GET | `/analytics/dashboard` | Tổng quan hệ thống | - |
| GET | `/analytics/revenue` | Doanh thu theo tháng | `?year=2026` |
| GET | `/analytics/new-users` | User mới theo tháng | `?year=2026` |
| GET | `/analytics/top-courses` | Top khóa học | `?limit=10` |

---

### 🧪 TEST IDs (Sample Data đã seed)

```
USERS:
  - Student1: 507f1f77bcf86cd799439011 (enrolled 2 courses) ✅ Dùng để test
  - Student2: 507f1f77bcf86cd799439012 (enrolled 1 course)
  - Teacher:  507f1f77bcf86cd799439013

COURSES:
  - Java Spring Boot: 607f1f77bcf86cd799439001 ✅ Dùng để test
  - React Fullstack:  607f1f77bcf86cd799439002
  - Python DS:        607f1f77bcf86cd799439003

LESSONS:
  - Lesson 1: 707f1f77bcf86cd799439001
  - Lesson 2: 707f1f77bcf86cd799439002
```

---

### 📝 Postman Test Examples

**1. Tạo Review:**
```
POST http://localhost:8080/api/reviews
Content-Type: application/json

{
  "courseId": "607f1f77bcf86cd799439001",
  "userId": "507f1f77bcf86cd799439011",
  "userName": "Nguyễn Văn A",
  "userAvatar": "https://example.com/avatar.jpg",
  "rating": 5,
  "comment": "Khóa học rất hay và bổ ích!"
}
```

**2. Lấy danh sách Reviews:**
```
GET http://localhost:8080/api/reviews/course/607f1f77bcf86cd799439001?page=0&size=10
```

**3. Lấy thống kê Reviews:**
```
GET http://localhost:8080/api/reviews/course/607f1f77bcf86cd799439001/stats
```

**4. Tạo Comment:**
```
POST http://localhost:8080/api/comments
Content-Type: application/json

{
  "courseId": "607f1f77bcf86cd799439001",
  "lessonId": "707f1f77bcf86cd799439001",
  "userId": "507f1f77bcf86cd799439011",
  "userName": "Nguyễn Văn A",
  "content": "Thầy ơi cho em hỏi về phần này..."
}
```

**5. Tạo Reply:**
```
POST http://localhost:8080/api/comments
Content-Type: application/json

{
  "courseId": "607f1f77bcf86cd799439001",
  "lessonId": "707f1f77bcf86cd799439001",
  "userId": "507f1f77bcf86cd799439013",
  "userName": "Teacher Lê Văn C",
  "content": "Em xem lại phần video phút 5:30 nhé",
  "parentId": "<COMMENT_ID_TỪ_BƯỚC_4>"
}
```

**6. Dashboard:**
```
GET http://localhost:8080/api/analytics/dashboard
```

**7. Doanh thu theo năm:**
```
GET http://localhost:8080/api/analytics/revenue?year=2026
```

**8. Top khóa học:**
```
GET http://localhost:8080/api/analytics/top-courses?limit=5
```

---

## 4. Data model sketches (Mongo)
- reviews: { _id, courseId, userId, userName, userAvatar, rating, comment, createdAt, updatedAt, isDeleted, deletedBy, deletedAt }
- comments: { _id, courseId, lessonId, userId, userName, content, parentId|null, replyCount, createdAt, updatedAt, isDeleted, deletedBy, deletedAt }
- analytics (optional): pre-aggregated docs for heavy queries

---

## 5. Validation & Business Rules
- Reviews: user chỉ được review nếu đã mua khóa học (check service stub).
- Rating must be integer 1..5.
- Comments: parentId phải tồn tại và cùng lesson.
- Soft-delete: giữ audit fields (deletedBy, deletedAt).

---

## 6. Non-functional & performance
- Paginaton bất kỳ list lớn (cursor hoặc page-based). Default size = 20.
- Indexes: index `courseId` on `reviews`, `lessonId` and `parentId` on `comments`.
- Dashboard queries: dùng aggregation framework, cache kết quả 1-5 phút nếu cần.

---

## 7. Tests & QA
- Unit tests (service logic) cho: avg rating, create comment/reply, validation.
- Integration test (start app with in-memory Mongo / test Atlas hoặc local) cho endpoints chính.
- Acceptance criteria: các endpoint trả code success, dữ liệu lưu đúng, avg rating chính xác sau 3 insert mẫu.

---

## 8. Milestones & timeline (gợi ý)
- Day 1-2: Schema + repository + basic service for Reviews.
- Day 3-4: Controller Reviews + tests + Postman collection.
- Day 5-7: Comments/Q&A (nested replies) + tests.
- Day 8-10: Dashboard aggregations + performance checks.

---

## 9. Checkpoints trước khi merge
- Code passes `mvn clean package` và tests.
- No hard-coded secrets; use env vars.
- API docs / Postman collection included.
- PR descriptions and acceptance criteria filled.

---

## Next step
Nếu ok, mình sẽ bắt đầu: tạo DTOs, repository, service skeleton cho `reviews` và `comments` — bạn muốn mình tự implement endpoints cơ bản luôn hay để bạn code phần business logic chính?

---

## Logic BẮT BUỘC (KIỂM SOÁT KHI TRIỂN KHAI)
Những luật này phải được implement và có test xác nhận trước khi merge feature Reviews vào nhánh chính.

1. User đã mua khóa học -> mới được review
  - Kiểm tra trong service: gọi `EnrollmentService`/`OrderRepository` để xác thực quyền trước khi tạo review.
  - Nếu chưa mua -> trả `403 Forbidden` với thông báo rõ.

2. Một user chỉ được 1 review cho 1 course
  - Thiết lập unique index trên collection `reviews`: `db.reviews.createIndex({ courseId: 1, userId: 1 }, { unique: true })`.
  - Trước khi insert, service nên kiểm tra tồn tại; xử lý `DuplicateKeyException` trả `409 Conflict`.

3. Sau insert/update/delete review -> cập nhật `avgRating` và `ratingCount` trên document `course`
  - Option A (đơn giản, chính xác): Sau mỗi thay đổi, chạy aggregation để tính lại avg & count rồi update `courses`.
  - Option B (hiệu năng cao): Lưu `ratingSum` + `ratingCount` trên `course` và cập nhật bằng update-pipeline atomic; với update cần biết `oldRating` (dùng transaction hoặc đọc trước cập nhật trong cùng transaction).
  - Yêu cầu: phải có unit test/ integration test xác nhận avgRating đúng sau các thao tác insert/update/delete.

4. Tính nhất quán & đồng thời
  - Nếu sử dụng Option A, không cần transaction nhưng tốn CPU/IO khi nhiều writes.
  - Nếu sử dụng Option B hoặc multi-doc updates, dùng MongoDB transaction (sử dụng `ClientSession`) để đảm bảo atomic giữa `reviews` và `courses`.

5. Kiểm tra dữ liệu đầu vào
  - `rating` phải integer trong [1,5].
  - `comment` có length giới hạn (ví dụ max 2000 chars).
  - `parentId` (cho comment/reply) phải hợp lệ và cùng `lessonId`.

6. Soft-delete & audit
  - Xóa review/comment phải là soft-delete (`isDeleted=true`) và ghi `deletedBy`, `deletedAt`.
  - Các API list phải lọc `isDeleted=false` mặc định.

7. Indexes & hiệu năng
  - Tạo index: `reviews.courseId`, `reviews.userId`, `comments.lessonId`, `comments.parentId`.
  - Dashboard: dùng aggregation và thêm cache/TTL nếu truy vấn nặng.

8. Test cases tối thiểu phải cover
  - Tạo review khi user chưa mua -> trả 403.
  - Tạo 2 review cùng user+course -> trả 409 (unique index).
  - Tạo review (mới) -> avgRating và ratingCount của course cập nhật đúng.
  - Cập nhật review (thay rating) -> avgRating cập nhật đúng.
  - Xóa review (soft) -> avgRating và count cập nhật đúng.

9. Logging & Error Handling
  - Log có context `userId`, `courseId`, `reviewId` cho các lỗi nghiêm trọng.
  - Trả lỗi chuẩn `ApiResponse` với code/message rõ ràng.

---

Ghi chú: nếu bạn muốn, tôi có thể implement sẵn flow service + repository + controller cho Reviews theo Option A (aggregation) để nhanh test; sau đó tối ưu sang Option B nếu cần throughput cao.

