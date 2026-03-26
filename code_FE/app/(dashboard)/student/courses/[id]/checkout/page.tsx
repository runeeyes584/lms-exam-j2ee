'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { ArrowLeft, CreditCard, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { courseService, CourseResponse } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { paymentService } from '@/services';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    fetchCourseDetails();
  }, [params.id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await courseService.getById(params.id);
      if (response.code === ResponseCode.SUCCESS && response.result) {
        setCourse(response.result);
      } else {
        toast.error('Không tìm thấy thông tin khóa học');
        router.back();
      }
    } catch (error) {
      console.error('Error finding course:', error);
      setCourse({
        id: params.id,
        title: 'Lập trình ReactJS từ cơ bản đến nâng cao',
        description: 'Khóa học giúp bạn nắm vững React hooks, NextJS, Server Components.',
        price: 599000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        instructorId: 'ins-1',
        tags: [],
        isPublished: true,
        instructor: {
          id: 'ins-1',
          fullName: 'Nguyễn Văn A',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVNPayCheckout = async () => {
    if (!user || !course) return;

    setProcessing(true);

    try {
      if (!course.price || course.price <= 0) {
        await enrollmentService.enroll({
          userId: user.id,
          courseId: course.id,
        });

        setPaymentSuccess(true);
        toast.success('Đăng ký khóa học thành công!');
        return;
      }

      const paymentUrl = await paymentService.createPayment(user.id, course.id);
      if (!paymentUrl || typeof paymentUrl !== 'string') {
        throw new Error('Không nhận được đường dẫn thanh toán VNPay');
      }

      window.location.href = paymentUrl;
    } catch (error) {
      console.error('VNPay checkout error:', error);
      toast.error('Có lỗi xảy ra khi tạo giao dịch thanh toán');
      setProcessing(false);
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang chuẩn bị trang thanh toán..." />;
  if (!course) return null;

  if (paymentSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Card className="border-green-100 shadow-lg">
          <CardContent className="p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Thanh toán thành công!</h1>
            <p className="mx-auto mb-8 max-w-md text-gray-600">
              Cảm ơn bạn đã mua khóa học <strong>{course.title}</strong>. Hóa đơn điện tử đã được gửi tới email của bạn.
            </p>
            <Link href={`/student/courses/${course.id}`}>
              <Button size="lg" className="w-full px-8 sm:w-auto">
                Vào học ngay
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/student/courses/${course.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán khóa học</h1>
          <p className="text-sm text-gray-500">Hoàn tất thủ tục đăng ký để bắt đầu học tập</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader className="border-b bg-gray-50 pb-4">
              <CardTitle className="text-lg">Chi tiết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-blue-100">
                  {course.coverImage ? (
                    <img src={course.coverImage} className="h-full w-full object-cover" alt={course.title} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-2 text-center text-xs font-bold uppercase text-white">
                      LMS Course
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold leading-tight text-gray-900">{course.title}</h3>
                  <p className="mb-1 text-sm text-gray-600">
                    Giảng viên: <span className="font-medium text-gray-900">{course.instructor?.fullName}</span>
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-lg font-bold text-blue-600">
                    {course.price ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Thanh toán an toàn
              </h4>
              <p className="text-sm text-gray-600">
                LMS System sử dụng mã hóa SSL 256-bit đảm bảo an toàn tuyệt đối cho các giao dịch thanh toán. Thông tin thẻ của bạn không được lưu trữ trên server của chúng tôi.
              </p>

              <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                <Info className="h-5 w-5 shrink-0 text-blue-500" />
                <div>Sau khi thanh toán thành công, khóa học sẽ được thêm vào thư viện "Khóa học của tôi" và bạn có thể bắt đầu học ngay lập tức.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-24 border-blue-200 shadow-md">
            <CardHeader className="border-b bg-white pb-4">
              <CardTitle className="text-lg">Tóm tắt thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Giá gốc:</span>
                  <span>{course.price ? `${course.price.toLocaleString('vi-VN')} đ` : '0 đ'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Giảm giá:</span>
                  <span>0 đ</span>
                </div>
                <div className="mt-4 flex justify-between border-t pt-4 text-xl font-bold text-gray-900">
                  <span>Tổng thanh toán:</span>
                  <span>{course.price ? `${course.price.toLocaleString('vi-VN')} đ` : '0 đ'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleVNPayCheckout}
                  disabled={processing}
                  className="h-14 w-full bg-[#005baa] text-base font-bold shadow-sm transition-colors hover:bg-[#004e92]"
                >
                  {processing ? 'Đang xử lý giao dịch...' : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Thanh toán qua VNPay
                    </span>
                  )}
                </Button>

                <p className="mt-4 px-2 text-center text-xs text-gray-500">
                  Bằng việc hoàn tất thanh toán, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 opacity-70">
                  <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-600">VNPay</div>
                  <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-600">Visa</div>
                  <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-600">Master</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
