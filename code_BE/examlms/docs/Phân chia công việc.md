# 📂 TÀI LIỆU PHÂN CHIA CHỨC NĂNG & YÊU CẦU NGHIỆP VỤ

**Dự án:** Hệ thống Đào tạo & Thi Trực tuyến (E-Learning System)
**Leader:** Lê Anh Tiến
**Tech Stack:** Spring Boot, MongoDB, JWT, ...

---

## QUY ƯỚC CHUNG (QUAN TRỌNG)
1. **Naming Convention:** Tên biến/hàm tiếng Anh 100%. Code sạch, comment rõ ràng các đoạn logic phức tạp.
2. **API Response:** Tuân thủ chuẩn `ApiResponse<T>` (code, message, data) đã thống nhất.
3. **Deadlines:** Các chức năng gắn mác `[KEY FEATURE]` là tính năng ăn điểm, cần ưu tiên hoàn thành để test kỹ.

---

##  ✦ Nguyễn Hồ Ngọc Trúc: QUẢN LÝ NGƯỜI DÙNG & BẢO MẬT (USER & SECURITY)
*Thiên về cấu hình & luồng xác thực.*

### 1. Đăng ký & Đăng nhập (Authentication)
- **Chức năng:** Login/Register, Refresh Token, Logout.
- **Yêu cầu:** Sử dụng **Spring Security + JWT**. Mật khẩu phải mã hóa BCrypt.
- **Logic:** Phân quyền dựa trên Role (ADMIN, INSTRUCTOR, STUDENT).

### 2. Quản lý Hồ sơ cá nhân (Profile)
- **Chức năng:** Xem/Sửa thông tin, Upload Avatar, Đổi mật khẩu.
- **Yêu cầu:** Validate dữ liệu đầu vào (email đúng định dạng, pass mạnh). Upload ảnh lưu vào folder static hoặc Cloudinary (nếu có).

### 3. Quy trình Duyệt Giảng viên (Instructor Approval)
- **Chức năng:** User gửi request nâng cấp tài khoản -> Admin xem danh sách -> Duyệt/Từ chối.
- **Logic:** Khi duyệt thành công, hệ thống tự động đổi Role user từ STUDENT -> INSTRUCTOR.

---

##  ✦ Trương Vĩnh Phúc: QUẢN LÝ NỘI DUNG ĐÀO TẠO (COURSE MASTER)
*Thiên về CRUD và cấu trúc dữ liệu.*

### 1. Quản lý Khóa học (Course CRUD)
- **Chức năng:** Thêm/Sửa/Xóa khóa học (Tên, mô tả, giá tiền, ảnh bìa).
- **Yêu cầu:** Soft-delete (Xóa mềm - chỉ đổi trạng thái `is_deleted = true`, không xóa DB).

### 2. Xây dựng Chương trình học (Curriculum) [KEY FEATURE]
- **Chức năng:** Tạo cấu trúc cây: `Khóa học` -> `Chương (Chapter)` -> `Bài học (Lesson)`.
- **Yêu cầu DB:** Thiết kế bảng quan hệ 1-n chuẩn.
- **Logic:** Hỗ trợ sắp xếp thứ tự bài học (OrderIndex).

### 3. Quản lý Tài nguyên (Media Resources)
- **Chức năng:** Upload Video và Tài liệu (PDF/Docx) cho bài học.
- **Yêu cầu:** Video nhúng link (Youtube/Vimeo) hoặc upload file. Tài liệu cho phép download.

---

## ✦ Lê Anh Tiến: KHẢO THÍ & NGÂN HÀNG CÂU HỎI (EXAM ENGINE)
*Thiên về Thuật toán & Logic xử lý dữ liệu.*

### 1. Quản lý Ngân hàng câu hỏi
- **Chức năng:** CRUD câu hỏi (Trắc nghiệm 1 đáp án, nhiều đáp án).
- **Yêu cầu:** **Import câu hỏi từ file Excel** (Sử dụng thư viện Apache POI). Đây là tính năng ghi điểm cao. `[KEY FEATURE]`

### 2. Sinh Đề thi (Exam Generator) [KEY FEATURE]
- **Chức năng:** Tạo đề thi từ ngân hàng câu hỏi.
- **Logic:**
    - Mode 1: Chọn thủ công từng câu.
    - Mode 2 (Khó): **Random ngẫu nhiên** theo ma trận (VD: Lấy 5 câu Dễ + 3 câu Khó trong chủ đề Java).

### 3. Chấm điểm tự động (Auto-Grading)
- **Chức năng:** API nhận bài làm -> So khớp đáp án -> Trả về điểm số & Lời giải chi tiết.
- **Yêu cầu:** Tính toán chính xác, lưu lịch sử bài làm (ExamHistory) để review lại.

---

##  ✦ Nguyễn Hùng Sơn: TRẢI NGHIỆM HỌC TẬP (STUDENT JOURNEY)
*Thiên về xử lý Trạng thái (State).*

### 1. Ghi danh & Thanh toán (Enrollment)
- **Chức năng:** User bấm "Mua khóa học" -> Hệ thống check ví/quyền -> Thêm vào danh sách khóa học của tôi (`MyCourses`).
- **Yêu cầu:** Xử lý Transaction DB cẩn thận, tránh lỗi trừ tiền nhưng không vào khóa học.

### 2. Theo dõi Tiến độ (Progress Tracking) [KEY FEATURE]
- **Chức năng:** Lưu vết tiến độ học.
- **Logic:**
    - Đánh dấu "Đã hoàn thành" khi xem hết video.
    - Tính % hoàn thành khóa học (VD: 50/100 bài = 50%).
    - API lưu thời gian xem video (last_watched_second).

### 3. Cấp chứng chỉ (Certificate) [ KEY FEATURE]
- **Chức năng:** Tự động gen file PDF chứng chỉ khi User hoàn thành 100% khóa học.
- **Yêu cầu:** Dùng thư viện (iText/Jasper) chèn Tên User + Ngày tháng vào mẫu chứng chỉ có sẵn.

---

##  ✦ Nguyễn Văn Thuận: TƯƠNG TÁC & THỐNG KÊ (INTERACTION & ANALYTICS)
*Thiên về SQL Query & Reporting.*

### 1. Hệ thống Đánh giá (Review)
- **Chức năng:** User đánh giá sao (1-5) và comment.
- **Logic:** Chỉ User đã mua khóa học mới được đánh giá. Tính điểm trung bình (Avg Rating) update lại vào bảng Course.

### 2. Hỏi đáp (Q&A)
- **Chức năng:** Comment thảo luận trong bài học.
- **Yêu cầu:** Hỗ trợ trả lời (Reply) comment (Cấu trúc comment cha-con).

### 3. Dashboard Thống kê [KEY FEATURE]
- **Chức năng:** API trả về số liệu cho Admin vẽ biểu đồ.
- **Yêu cầu:** Viết Native Query tối ưu để lấy:
    - Doanh thu theo tháng.
    - Top 5 khóa học bán chạy nhất.
    - Số lượng học viên mới đăng ký.
---
##  ✦ Quy tắc coding, đặt tên dữ liệu
**Quy tắc coding**: NGUYÊN TẮC BẤT DI BẤT DỊCH (GENERAL RULES)
1.  **Language:** Code 100% tiếng Anh (Tên biến, hàm, comment logic).
2.  **No Hard-code:** Không gán cứng các giá trị (URL, API Key, thông báo lỗi) trong code. Phải đưa vào `application.properties` (BE) hoặc `.env` (FE).
3.  **Clean Code:** Xóa hết `console.log`, `System.out.println` và code thừa trước khi Commit.

**Đặt tên thành phần**
1. **Class/Interface**: PascalCase (VD: UserService, CourseRepository).
2. **Method/Variable**: camelCase (VD: findUserById, totalPrice).
3. **Constant**: SCREAMING_SNAKE_CASE (VD: MAX_UPLOAD_SIZE = 1024).
4. **Database** Table: snake_case (VD: user_courses, exam_questions).

**API Response Standard**
```java
public class ApiResponse<T> {
    private int code;      // 1000: Success, 9999: Error...
    private String message; // "Thành công", "Lỗi hệ thống"...
    private T result;       // Dữ liệu trả về (Object, List,...)
}
```
**Cấu trúc hệ thống**
1. Front-end:
```text
src/
├── app/                  # App Router (Mỗi folder là một Route)
│   ├── (auth)/login/     # Route group (gom nhóm, không ảnh hưởng URL)
│   ├── dashboard/page.tsx
│   └── layout.tsx        # Layout chính
├── components/           # UI Components
│   ├── ui/               # Các component nhỏ (Button, Input - shadcn/ui)
│   └── business/         # Các component nghiệp vụ (CourseCard, ExamForm)
├── lib/                  # Cấu hình (Axios instance, Utils)
├── services/             # Gọi API (Tách biệt hoàn toàn với Component)
│   ├── authService.ts
│   └── courseService.ts
├── types/                # Định nghĩa Interface/Type (TypeScript)
│   └── backend.d.ts      # Type map với DTO của Backend
└── styles/               # Global css (Tailwind)
```

2. Back-end:
```text
src/
├── config/           # Cấu hình (Security, Swagger, Cors...)
├── controller/       # Chỉ nhận Request & trả về Response
├── dto/              # Data Transfer Object (Request/Response)
│   ├── request/      # Các class nhận dữ liệu từ FE (VD: LoginRequest)
│   └── response/     # Các class trả dữ liệu về FE (VD: CourseResponse)
├── entity/           # Các class ánh xạ với Database (JPA)
├── repository/       # Giao tiếp với Database
├── service/          # Chứa toàn bộ Logic nghiệp vụ (Business Logic)
│   └── impl/         # Implementation của Service interface
├── exception/        # Custom Exception & Global Handler
└── utils/            # Các hàm tiện ích dùng chung (Date, String...)
```
**📝 Ghi chú:**
- Mọi thắc mắc về nghiệp vụ vui lòng ping trực tiếp Tiến để giải quyết.
- Pull Request (PR) phải pass qua review mới được merge vào nhánh chính.