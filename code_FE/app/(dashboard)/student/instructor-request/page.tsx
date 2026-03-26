'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, FileText, GraduationCap, Send, Sparkles, Upload, Users, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

export default function InstructorRequestPage() {
  const { user, isLoading } = useAuth();
  const [note, setNote] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return <PageLoading message="Đang tải..." />;
  }

  if (!user) {
    return null;
  }

  if (user.role !== 'STUDENT') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký giảng viên</CardTitle>
          <CardDescription>Trang này chỉ dành cho học viên</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cvFile && cvFile.size > 5 * 1024 * 1024) {
      toast.error('CV tối đa 5MB');
      return;
    }

    setSubmitting(true);
    try {
      const response = await adminService.submitInstructorRequest({
        note: note.trim() || undefined,
        cvFile: cvFile || undefined,
      });
      if (isSuccess(response.code)) {
        toast.success('Đã gửi yêu cầu đăng ký giảng viên');
        setSubmitted(true);
      } else {
        toast.error(response.message || 'Không thể gửi yêu cầu');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const extension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(extension)) {
      toast.error('Chỉ chấp nhận file PDF, DOC, DOCX');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('CV tối đa 5MB');
      event.target.value = '';
      return;
    }

    setCvFile(selectedFile);
  };

  const removeCvFile = () => {
    setCvFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký giảng viên</h1>
          <p className="mt-2 text-gray-600">Tham gia cộng đồng giảng dạy của LMS Exam</p>
        </div>
        <Link href="/settings">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại cài đặt
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-6 text-white">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Community Program
          </div>
          <h2 className="text-2xl font-bold">Xây dựng lớp học của riêng bạn trên LMS Exam</h2>
          <p className="mt-2 max-w-3xl text-sm text-blue-50">
            Sau khi được phê duyệt, bạn có thể tạo khóa học, tổ chức bài thi và theo dõi tiến độ học viên trực tiếp trên hệ thống.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Quy trình xét duyệt</CardTitle>
            <CardDescription>Minh bạch và phản hồi nhanh</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Bước 1: Gửi yêu cầu</p>
                <p className="text-sm text-gray-600">Cung cấp mô tả ngắn về kinh nghiệm hoặc chuyên môn.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <Users className="mt-0.5 h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Bước 2: Admin đánh giá</p>
                <p className="text-sm text-gray-600">Đội ngũ quản trị kiểm tra hồ sơ trong 2-5 ngày làm việc.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Bước 3: Kích hoạt vai trò giảng viên</p>
                <p className="text-sm text-gray-600">Bạn có thể bắt đầu tạo nội dung và mở khóa học.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Yêu cầu xét duyệt giảng viên
            </CardTitle>
            <CardDescription>
              Viết ngắn gọn kinh nghiệm hoặc định hướng giảng dạy của bạn để admin xét duyệt nhanh hơn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                Yêu cầu của bạn đã được gửi thành công. Vui lòng chờ admin xét duyệt.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Ghi chú (không bắt buộc)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={7}
                    maxLength={500}
                    placeholder="Ví dụ: Tôi có 3 năm kinh nghiệm giảng dạy Java/Spring Boot, từng xây dựng khóa học nền tảng cho sinh viên năm nhất..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{note.length}/500 ký tự</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Đính kèm CV (tùy chọn)</label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-700">
                    <Upload className="h-4 w-4" />
                    Tải CV lên (PDF, DOC, DOCX - tối đa 5MB)
                    <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleCvChange} />
                  </label>
                  {cvFile && (
                    <div className="mt-2 flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 text-blue-800">
                        <FileText className="h-4 w-4" />
                        <span className="max-w-[380px] truncate">{cvFile.name}</span>
                      </div>
                      <button type="button" onClick={removeCvFile} className="text-gray-500 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting} className="h-11">
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
