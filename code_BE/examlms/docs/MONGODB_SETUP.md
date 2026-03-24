# MongoDB Setup Instructions

## 📋 Hướng dẫn cấu hình MongoDB Cloud Atlas

### Bước 1: Lấy Connection String từ MongoDB Atlas
1. Đăng nhập vào [MongoDB Atlas](https://cloud.mongodb.com/)
2. Chọn Cluster của bạn
3. Nhấn **Connect** → **Connect your application**
4. Copy connection string (format: `mongodb+srv://...`)

### Bước 2: Cập nhật application.properties
Mở file `src/main/resources/application.properties` và thay thế:

```properties
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
spring.data.mongodb.database=examlms
```

**Thay thế:**
- `<username>`: MongoDB username
- `<password>`: MongoDB password  
- `<cluster-url>`: Cluster address (vd: cluster0.abc123.mongodb.net)
- `<database>`: Tên database (đề xuất: examlms)

### Bước 3: Verify Connection
Chạy ứng dụng và test endpoint:
```bash
mvnw spring-boot:run
```

Truy cập: http://localhost:8080/api/health

Nếu thấy `"database": "Connected"` → Thành công! ✅

### Bước 4: Swagger UI (Optional)
Sau khi chạy, truy cập: http://localhost:8080/swagger-ui.html
để xem API documentation

---

## ⚠️ Lưu ý bảo mật
- **KHÔNG commit** file application.properties với credentials thật vào Git
- Sử dụng environment variables hoặc `.env` file cho production
- Whitelist IP của bạn trong MongoDB Atlas Network Access
