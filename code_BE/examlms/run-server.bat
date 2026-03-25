@echo off
REM Set Environment Variables and Run Spring Boot Application
REM Created: 2026-03-24

echo ========================================
echo LMS Exam J2EE - Starting Application
echo ========================================
echo.

REM Read .env file and set environment variables
echo Loading environment variables from .env file...

REM MongoDB Configuration
set MONGODB_URI=mongodb+srv://Kaleidoscope:453145@kaleidoscope.az65wnr.mongodb.net/examlms?retryWrites=true^&w=majority^&appName=kaleidoscope
set MONGODB_DATABASE=examlms

REM JWT Configuration
set JWT_SECRET=YourSuperSecretKeyForJWT2024MustBeAtLeast256BitsLongForHS256Algorithm
set JWT_EXPIRATION=86400000

REM Server Configuration
set SERVER_PORT=8080

REM CORS Configuration
set CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000

REM File Upload Configuration
set MAX_FILE_SIZE=10MB
set MAX_REQUEST_SIZE=10MB

REM Logging Level
set LOGGING_LEVEL=DEBUG

REM VNPay Payment Gateway Configuration
set VNPAY_TMN_CODE=Z1Y39S2J
set VNPAY_HASH_SECRET=B0VFLDZ1BL7IJW0JG0PCN9BJ2685C5K8
set VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
set VNPAY_RETURN_URL=http://localhost:3000/vnpay/return

echo Environment variables loaded successfully!
echo.
echo Starting Spring Boot application...
echo Server will be available at: http://localhost:8080
echo Swagger UI: http://localhost:8080/swagger-ui.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Run Spring Boot application
call mvnw.cmd spring-boot:run

pause
