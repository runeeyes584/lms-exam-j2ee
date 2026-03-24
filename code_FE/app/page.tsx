'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, FileText, Award } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mb-6 flex justify-center">
            <BookOpen className="h-20 w-20 text-blue-600" />
          </div>
          
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            LMS Exam System
          </h1>
          
          <p className="mb-8 text-xl text-gray-600">
            Hệ thống Quản lý Học tập & Thi trực tuyến
          </p>
          
          <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-500">
            Nền tảng học tập hiện đại giúp bạn quản lý khóa học, tạo đề thi, 
            theo dõi tiến độ học tập một cách dễ dàng và hiệu quả.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated && user ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Vào Dashboard
                  </Link>
                </Button>
                <p className="text-sm text-gray-600">
                  Xin chào, <span className="font-semibold">{user.fullName}</span>!
                </p>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register">
                    Bắt đầu ngay
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">
                    Đăng nhập
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Tính năng nổi bật
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-blue-100 p-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Quản lý Khóa học
              </h3>
              <p className="text-gray-600">
                Tạo và quản lý khóa học với nội dung phong phú, có cấu trúc
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Hệ thống Thi
              </h3>
              <p className="text-gray-600">
                Tạo đề thi linh hoạt, tự động chấm điểm nhanh chóng
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-purple-100 p-4">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Theo dõi Tiến độ
              </h3>
              <p className="text-gray-600">
                Giám sát tiến độ học tập và kết quả thi chi tiết
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-yellow-100 p-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Chứng chỉ
              </h3>
              <p className="text-gray-600">
                Nhận chứng chỉ hoàn thành khóa học có giá trị
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2024 LMS Exam System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}