import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">LMS Exam</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Hệ thống Quản lý Học tập & Thi trực tuyến
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Sản phẩm</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/courses" className="text-sm text-gray-600 hover:text-gray-900">
                  Khóa học
                </Link>
              </li>
              <li>
                <Link href="/exams" className="text-sm text-gray-600 hover:text-gray-900">
                  Đề thi
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
                  Bảng giá
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Hỗ trợ</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm text-gray-600 hover:text-gray-900">
                  Tài liệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Pháp lý</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-gray-600">
            © {currentYear} LMS Exam System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
