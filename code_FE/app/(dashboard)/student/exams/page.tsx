'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Clock, FileText, Play, Search, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { examService, ExamResponse } from '@/services/examService';
import { attemptService, ExamAttemptResponse } from '@/services/attemptService';
import { isSuccess } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface StudentExam extends ExamResponse {
  attempts: ExamAttemptResponse[];
  maxAttempts?: number;
}

export default function StudentExamsPage() {
  const { isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'completed'>('all');

  useEffect(() => {
    void fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const [examResponse, attemptResponse] = await Promise.all([
        examService.getPublished(),
        attemptService.getMyAttempts(0, 200),
      ]);

      const publishedExams = isSuccess(examResponse.code) ? examResponse.result || [] : [];
      const myAttempts = isSuccess(attemptResponse.code) ? attemptResponse.result?.content || [] : [];

      setExams(
        publishedExams.map(exam => ({
          ...exam,
          attempts: myAttempts.filter(attempt => attempt.examId === exam.id),
          maxAttempts: 3,
        }))
      );
    } catch (error) {
      console.error('Lỗi tải danh sách bài thi:', error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách bài thi..." />;

  const getExamStatus = (exam: StudentExam) => {
    if (exam.attempts.length === 0) return 'available';
    const lastAttempt = exam.attempts[exam.attempts.length - 1];
    if (lastAttempt.status === 'ONGOING') return 'in-progress';
    if (lastAttempt.passed) return 'passed';
    if (exam.maxAttempts && exam.attempts.length >= exam.maxAttempts) return 'failed';
    return 'can-retry';
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getExamStatus(exam);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'available' && (status === 'available' || status === 'can-retry' || status === 'in-progress')) ||
      (filter === 'completed' && (status === 'passed' || status === 'failed'));
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (exam: StudentExam) => {
    const status = getExamStatus(exam);
    const badges: Record<string, JSX.Element> = {
      passed: <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"><CheckCircle className="h-3 w-3" />Đã đạt</span>,
      failed: <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"><XCircle className="h-3 w-3" />Chưa đạt</span>,
      'in-progress': <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700"><AlertCircle className="h-3 w-3" />Đang làm</span>,
      'can-retry': <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700"><AlertCircle className="h-3 w-3" />Có thể thi lại</span>,
    };
    return badges[status] || <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"><Play className="h-3 w-3" />Sẵn sàng</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bài thi của tôi</h1>
        <p className="mt-2 text-gray-600">Xem trạng thái và làm các bài thi đã được xuất bản</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="text" placeholder="Tìm kiếm bài thi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'available', 'completed'] as const).map(value => (
            <Button key={value} variant={filter === value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(value)}>
              {value === 'all' ? 'Tất cả' : value === 'available' ? 'Có thể thi' : 'Đã hoàn thành'}
            </Button>
          ))}
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <EmptyState icon={FileText} title="Chưa có bài thi nào" description={searchQuery ? 'Không tìm thấy bài thi phù hợp' : 'Hiện tại chưa có bài thi được xuất bản'} />
      ) : (
        <div className="space-y-4">
          {filteredExams.map(exam => {
            const status = getExamStatus(exam);
            const lastAttempt = exam.attempts[exam.attempts.length - 1];
            return (
              <Card key={exam.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                        {getStatusBadge(exam)}
                      </div>
                      <p className="mb-3 text-sm text-gray-500">{exam.description || 'Không có mô tả'}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{exam.duration} phút</span>
                        <span>Điểm đạt: {exam.passingScore}%</span>
                        <span>Tổng điểm: {exam.totalPoints}</span>
                        {exam.maxAttempts && <span>Lượt thi: {exam.attempts.length}/{exam.maxAttempts}</span>}
                      </div>
                      {lastAttempt && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-3">
                          <p className="text-sm text-gray-700">
                            <strong>Lần thi gần nhất:</strong> {Number(lastAttempt.totalScore || 0)} điểm ({Number(lastAttempt.percentage || 0)}%)
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {lastAttempt && (
                        <Link href={`/student/exams/${exam.id}/result?attemptId=${lastAttempt.id}`}>
                          <Button variant="outline">Xem kết quả</Button>
                        </Link>
                      )}
                      {(status === 'available' || status === 'can-retry') && (
                        <Link href={`/student/exams/${exam.id}/take`}>
                          <Button>
                            <Play className="mr-2 h-4 w-4" />
                            {status === 'can-retry' ? 'Thi lại' : 'Bắt đầu thi'}
                          </Button>
                        </Link>
                      )}
                      {status === 'in-progress' && (
                        <Link href={`/student/exams/${exam.id}/take`}>
                          <Button>
                            <Play className="mr-2 h-4 w-4" />
                            Tiếp tục
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
