import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

// Register validation schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số')
    .regex(/[@$!%*?&#]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&#)'),
  confirmPassword: z
    .string()
    .min(1, 'Xác nhận mật khẩu là bắt buộc'),
  fullName: z
    .string()
    .min(1, 'Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),
  phoneNumber: z
    .string()
    .regex(/^0[0-9]{9}$/, 'Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx)')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh không hợp lệ (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(255, 'Địa chỉ không được quá 255 ký tự')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  schoolId: z
    .string()
    .regex(/^[A-Za-z0-9]{4,20}$/, 'Mã trường phải có 4-20 ký tự chữ và số')
    .optional()
    .or(z.literal('')),
});

// Change password validation schema
export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(1, 'Mật khẩu cũ là bắt buộc'),
  newPassword: z
    .string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số')
    .regex(/[@$!%*?&#]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z
    .string()
    .min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
