'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'STUDENT',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    const result = await registerUser({
      ...registerData,
      role: 'STUDENT',
    });
    if (!result) {
      return;
    }
    const emailParam = encodeURIComponent(result.email);
    const cooldownParam = encodeURIComponent(String(result.resendCooldownSeconds || 60));
    router.push(`/verify-otp?email=${emailParam}&cooldown=${cooldownParam}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            LMS Exam System
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Hệ thống Quản lý Học tập & Thi trực tuyến
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng ký tài khoản</CardTitle>
            <CardDescription>
              Tạo tài khoản mới để bắt đầu học tập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  className="mt-1"
                  placeholder="Nhập họ và tên"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="mt-1"
                  placeholder="Nhập email của bạn"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <PasswordInput
                  id="password"
                  {...register('password')}
                  className="mt-1"
                  placeholder="Tạo mật khẩu"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <PasswordInput
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className="mt-1"
                  placeholder="Nhập lại mật khẩu"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                Vai trò tài khoản mặc định là <strong>Học viên</strong>. Nếu muốn trở thành giảng viên, bạn có thể gửi yêu cầu sau khi đăng nhập.
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
