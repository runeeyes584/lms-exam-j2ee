# lms-exam-j2ee
# Đồ Án Môn Học: Hệ Thống LMS + Exam Online

## Giới thiệu
Đây là đồ án môn học cho môn sử dụng J2EE với đề tài "Hệ thống LMS + exam online". Dự án được xây dựng trên nền tảng Java Spring Boot, hướng tới việc quản lý học tập (LMS) và tổ chức thi trực tuyến (Exam Online).

## Tính năng chính
- Quản lý người dùng (Sinh viên, Giảng viên, Quản trị viên)
- Quản lý khóa học, bài giảng, tài liệu
- Đăng ký và tham gia khóa học
- Quản lý bài kiểm tra, đề thi, ngân hàng câu hỏi
- Làm bài thi trực tuyến, chấm điểm tự động
- Thống kê kết quả học tập và thi cử
- Quản lý thông báo, tin tức

## Công nghệ sử dụng
- Java 17+
- Spring Boot
- Spring Data JPA
- Spring Security
- Thymeleaf (hoặc React/Vue cho frontend nếu có)
- Maven/Gradle

## Cấu trúc thư mục
- `src/main/java` - Mã nguồn backend
- `src/main/resources` - Cấu hình, template, static files
- `src/test/java` - Unit test
- `README.md` - Tài liệu dự án

## Hướng dẫn cài đặt
1. Clone repository:
	```bash
	git clone <repo-url>
	```
2. Cấu hình database trong `application.properties`
3. Chạy ứng dụng:
	```bash
	./mvnw spring-boot:run
	```
4. Truy cập hệ thống tại: `http://localhost:8080`

## Đóng góp
- Fork repository, tạo branch mới và gửi pull request
- Báo lỗi hoặc đề xuất tính năng qua Issues

## Thông tin liên hệ
- Giảng viên hướng dẫn: 
- Nhóm thực hiện: 

## License
Xem file LICENSE để biết thêm chi tiết.
