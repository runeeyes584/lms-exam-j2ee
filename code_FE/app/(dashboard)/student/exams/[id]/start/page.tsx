'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, FileText, PlayCircle } from 'lucide-react';
import { examService } from '@/services/examService';
import { attemptService } from '@/services/attemptService';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

export default function ExamStartPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [exam, setExam] = useState<any>(null);

  useEffect(() => {
    const loadExam = async () => {
      try {
        const response = await examService.getById(params.id);
        if (isSuccess(response.code) && response.result) {
          setExam(response.result);
        } else {
          toast.error('Không tìm thấy đề thi');
          router.push('/student/exams');
        }
      } catch (error) {
        console.error('Error loading exam:', error);
        toast.error('Không thể tải thông tin đề thi');
        router.push('/student/exams');
      } finally {
        setLoading(false);
      }
    };
    void loadExam();
  }, [params.id, router]);

  const handleStartExam = async () => {
    if (!confirmed) {
      toast.error('Vui lòng xác nhận đã đọc hướng dẫn trước khi bắt đầu');
      return;
    }
    setStarting(true);
    try {
      const response = await attemptService.start(params.id);
      if (isSuccess(response.code) && response.result?.id) {
        router.push(`/student/exams/${params.id}/take?attemptId=${response.result.id}`);
      } else {
        toast.error(response.message || 'Không thể bắt đầu bài thi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể bắt đầu bài thi');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <PageLoading message="Đang tải hướng dẫn bài thi..." />;
  if (!exam) return null;

  const totalQuestions = exam.questions?.length || 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sẵn sàng làm bài?</h1>
          <p className="mt-2 text-gray-600">Đọc kỹ hướng dẫn trước khi bắt đầu thi</p>
        </div>
        <Link href="/student/exams">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Quay lại</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{exam.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{exam.description || 'Không có mô tả đề thi.'}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-gray-50 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2 font-semibold text-gray-800"><Clock className="h-4 w-4" />Thời gian</div>
              <p>{exam.duration} phút</p>
            </div>
            <div className="rounded-lg border bg-gray-50 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2 font-semibold text-gray-800"><FileText className="h-4 w-4" />Số câu</div>
              <p>{totalQuestions} câu hỏi</p>
            </div>
            <div className="rounded-lg border bg-gray-50 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2 font-semibold text-gray-800"><CheckCircle2 className="h-4 w-4" />Điểm đạt</div>
              <p>{exam.passingScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn làm bài</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /><span>Thời gian sẽ bắt đầu ngay khi bạn nhấn &quot;Bắt đầu thi&quot;.</span></div>
          <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /><span>Đáp án sẽ tự lưu định kỳ khi bạn làm bài.</span></div>
          <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /><span>Khi hết giờ, hệ thống sẽ tự động nộp bài.</span></div>
          <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /><span>Không tải lại trang hoặc đóng trình duyệt trong lúc làm bài.</span></div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-md border p-3">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            <span className="text-sm font-medium">Tôi đã đọc và hiểu hướng dẫn làm bài</span>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleStartExam} disabled={starting || !confirmed}>
          <PlayCircle className="mr-2 h-4 w-4" />
          {starting ? 'Đang bắt đầu...' : 'Bắt đầu thi'}
        </Button>
      </div>
    </div>
  );
}
