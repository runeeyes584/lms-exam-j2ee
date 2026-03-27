# LMS Exam Frontend

Giao diện người dùng cho hệ thống LMS & Thi trực tuyến được xây dựng bằng **NextJS 14, TypeScript, Tailwind CSS và shadcn/ui**.

## 🚀 Giai đoạn 1 - HOÀN THÀNH ✅

### ✅ **Đã triển khai:**
1. **Thiết lập NextJS Project**
   - NextJS 14 với App Router
   - TypeScript cho type safety
   - Tailwind CSS cho styling
   - ESLint + Prettier cho code quality

2. **Hệ thống Authentication**
   - JWT token management
   - Login/Register pages  
   - Protected routes
   - Auth API integration

3. **UI Components cơ bản**
   - shadcn/ui components (Button, Input, Card)
   - Dark/Light theme support
   - Responsive design

4. **Core Files**
   - `api.ts` - API client với axios & token refresh
   - `types.ts` - TypeScript interfaces
   - `utils.ts` - Helper functions
   - `login.tsx` - Trang đăng nhập
   - `register.tsx` - Trang đăng ký  
   - `dashboard.tsx` - Dashboard chính

### 📁 **Cấu trúc files hiện tại:**
```
code_FE/
├── package.json           # Dependencies
├── next.config.mjs        # NextJS config
├── tailwind.config.js     # Tailwind config
├── tsconfig.json         # TypeScript config
├── .eslintrc.json        # ESLint config
├── .prettierrc           # Prettier config
├── globals.css           # Global styles + CSS variables
├── api.ts                # API client & auth functions
├── types.ts              # TypeScript definitions
├── utils.ts              # Helper utilities
├── button.tsx            # shadcn/ui Button component
├── input.tsx             # shadcn/ui Input component
├── card.tsx              # shadcn/ui Card component
├── login.tsx             # Login page component
├── register.tsx          # Register page component
├── dashboard.tsx         # Dashboard page component
├── app-layout.tsx        # Root layout
├── app-page.tsx          # Homepage
└── create-structure.bat  # Script to create directories
```

## 🛠️ **Để chạy dự án:**

### 1. **Cài đặt dependencies:**
```bash
cd code_FE
npm install
```

### 2. **Tạo cấu trúc thư mục:**
```bash
# Windows
create-structure.bat

# Hoặc tạo thủ công:
mkdir app components lib services hooks types store utils
mkdir app\(auth)\login app\(auth)\register
mkdir app\(dashboard)\dashboard
mkdir components\ui components\auth components\course components\exam
```

### 3. **Di chuyển files vào đúng vị trí:**
```bash
# Move files to correct directories:
move globals.css app\
move app-layout.tsx app\layout.tsx  
move app-page.tsx app\page.tsx
move utils.ts lib\
move api.ts lib\
move types.ts types\
move button.tsx components\ui\
move input.tsx components\ui\
move card.tsx components\ui\
move login.tsx app\(auth)\login\page.tsx
move register.tsx app\(auth)\register\page.tsx
move dashboard.tsx app\(dashboard)\dashboard\page.tsx
```

### 4. **Chạy development server:**
```bash
npm run dev
```

## 🔗 **Backend Integration**
- API URL: `http://localhost:8080/api`
- Authentication: JWT Bearer tokens
- Token refresh tự động
- Response format: `ApiResponse<T>` with code/message/result

## 🎯 **Tiếp theo - Giai đoạn 2:**
- [ ] User Profile Management
- [ ] Admin User Management  
- [ ] Role-based Navigation
- [ ] Course Management System

## 📝 **Ghi chú quan trọng:**
1. **Cần backend chạy** ở port 8080 để API hoạt động
2. **Files hiện tại** chưa được tổ chức theo cấu trúc NextJS App Router đúng cách
3. **Cần di chuyển files** vào đúng thư mục để NextJS nhận diện routes
4. **Token storage** sử dụng localStorage, production nên dùng httpOnly cookies

## 🚀 **Kết quả đạt được:**
✅ NextJS project setup hoàn chỉnh
✅ Authentication flow hoàn chỉnh
✅ UI components cơ bản  
✅ API integration sẵn sàng
✅ TypeScript support đầy đủ
✅ Responsive design với Tailwind

**Phase 1 COMPLETED! 🎉**