# Project Structure for LMS Frontend

This file documents the required directory structure:

```
code_FE/
├── app/                     # NextJS App Router
│   ├── (auth)/              # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/         # Dashboard route group
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   └── page.tsx
│   │   └── exams/
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── auth/
│   ├── course/
│   ├── exam/
│   └── common/
├── lib/
│   ├── utils.ts
│   ├── auth.ts
│   └── api.ts
├── services/
├── hooks/
├── types/
├── store/
└── utils/
```

## Next Steps
1. Create directory structure manually
2. Add core components
3. Setup authentication system