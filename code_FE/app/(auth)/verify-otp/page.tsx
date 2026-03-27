'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { isSuccess } from '@/types/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const DEFAULT_RESEND_SECONDS = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = useMemo(() => (searchParams.get('email') || '').trim(), [searchParams]);
  const initialCooldown = useMemo(() => {
    const value = Number(searchParams.get('cooldown') || DEFAULT_RESEND_SECONDS);
    if (Number.isNaN(value) || value <= 0) {
      return DEFAULT_RESEND_SECONDS;
    }
    return value;
  }, [searchParams]);

  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(initialCooldown);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setSecondsLeft(initialCooldown);
  }, [initialCooldown]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      toast.error('Không tìm thấy email đăng ký. Vui lòng đăng ký lại.');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error('Vui lòng nhập OTP gồm 6 chữ số.');
      return;
    }

    try {
      setIsVerifying(true);
      const response = await authApi.verifyRegistrationOtp({ email, otp });
      if (isSuccess(response.code)) {
        toast.success('Xác thực OTP thành công. Vui lòng đăng nhập.');
        router.push('/login');
        return;
      }
      toast.error(response.message || 'Xác thực OTP thất bại.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Xác thực OTP thất bại.';
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || secondsLeft > 0) {
      return;
    }

    try {
      setIsResending(true);
      const response = await authApi.resendRegistrationOtp(email);
      if (isSuccess(response.code)) {
        const cooldown = response.result?.resendCooldownSeconds || DEFAULT_RESEND_SECONDS;
        setSecondsLeft(cooldown);
        toast.success('Đã gửi lại mã OTP.');
        return;
      }
      toast.error(response.message || 'Không thể gửi lại OTP.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Không thể gửi lại OTP.';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">LMS Exam System</h1>
          <p className="mt-2 text-sm text-gray-600">Nhập OTP để hoàn tất đăng ký</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Xác thực OTP</CardTitle>
            <CardDescription>
              {email
                ? `Mã OTP đã được gửi đến ${email}`
                : 'Không tìm thấy email đăng ký. Vui lòng quay lại trang đăng ký.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Mã OTP (6 chữ số)
                </label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 text-center text-lg tracking-[0.25em]"
                  placeholder="000000"
                  disabled={!email || isVerifying}
                />
              </div>

              <Button type="submit" className="w-full" disabled={!email || isVerifying}>
                {isVerifying ? 'Đang xác thực...' : 'Xác thực OTP'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              {secondsLeft > 0 ? `Gửi lại mã sau ${secondsLeft}s` : 'Bạn có thể gửi lại mã OTP'}
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={handleResend}
              disabled={!email || secondsLeft > 0 || isResending}
            >
              {isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sai email?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Đăng ký lại
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
