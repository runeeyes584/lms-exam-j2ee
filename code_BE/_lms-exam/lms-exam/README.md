# LMS Exam API

Hệ thống quản lý học tập (Learning Management System) - Backend API

## Tech Stack

- **Java 17**
- **Spring Boot 3.1.6**
- **Spring Data MongoDB**
- **MongoDB Atlas**

## Cấu trúc dự án

```
src/main/java/com/lms/exam/
├── config/          # Cấu hình (Security, DB, etc.)
├── controller/      # REST Controllers
├── dto/
│   ├── request/     # Request DTOs
│   └── response/    # Response DTOs
├── exception/       # Custom exceptions & handlers
├── model/           # Domain entities
├── repository/      # MongoDB repositories
├── service/         # Business logic
└── util/            # Utilities
```

## Cài đặt & Chạy

### 1. Yêu cầu

- JDK 17+
- Maven 3.8+
- MongoDB Atlas account (hoặc local MongoDB)

### 2. Cấu hình môi trường

Tạo biến môi trường `MONGODB_URI`:

```powershell
# Windows PowerShell
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@cluster.mongodb.net/lms_exam?retryWrites=true&w=majority"
```

```bash
# Linux/Mac
export MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/lms_exam?retryWrites=true&w=majority"
```

> ⚠️ **Lưu ý**: Password phải được percent-encoded (ví dụ: `*` → `%2A`)

### 3. Chạy ứng dụng

```bash
cd _lms-exam/lms-exam
./mvnw spring-boot:run
```

### 4. Chạy tests

```bash
./mvnw test
```

## API Endpoints

### Reviews API
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/reviews` | Tạo đánh giá mới |
| GET | `/api/reviews?courseId=xxx` | Danh sách đánh giá theo khóa học |
| GET | `/api/reviews/{id}` | Chi tiết đánh giá |
| GET | `/api/reviews/stats?courseId=xxx` | Thống kê đánh giá |
| PUT | `/api/reviews/{id}` | Cập nhật đánh giá |
| DELETE | `/api/reviews/{id}?userId=xxx` | Xóa đánh giá |

### Comments/Q&A API
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/comments` | Tạo comment/câu hỏi |
| GET | `/api/comments?courseId=xxx` | Danh sách comments |
| GET | `/api/comments/{id}` | Chi tiết comment với replies |
| GET | `/api/comments/{id}/replies` | Danh sách replies |
| PUT | `/api/comments/{id}` | Cập nhật comment |
| DELETE | `/api/comments/{id}?userId=xxx` | Xóa comment |

### Analytics API
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/analytics/dashboard` | Tổng quan dashboard |
| GET | `/api/analytics/revenue/monthly?year=2026` | Doanh thu theo tháng |
| GET | `/api/analytics/users/monthly?year=2026` | Users mới theo tháng |
| GET | `/api/analytics/courses/top-enrollment?limit=10` | Top khóa học theo enrollment |
| GET | `/api/analytics/courses/top-revenue?limit=10` | Top khóa học theo doanh thu |
| GET | `/api/analytics/courses/{courseId}` | Thống kê khóa học cụ thể |

## Quy ước & Tài liệu

- [rules.md](./rules.md) - Quy ước chung của dự án
- [thuan-tasks.md](./thuan-tasks.md) - Task list cho Nguyễn Văn Thuận

## Cấu trúc Response

Tất cả API đều trả về format:

```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

## Contributors

- Nguyễn Văn Thuận - Interaction & Analytics module
