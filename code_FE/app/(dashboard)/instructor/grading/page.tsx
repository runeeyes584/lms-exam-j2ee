'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, Edit, Eye, Filter, GraduationCap, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gradingService } from '@/services/gradingService';
import { examService } from '@/services/examService';
import { ExamAttemptResponse as AttemptResponse } from '@/services/attemptService';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'react-hot-toast';

export default function GradingPage() {
  const { isLoading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState<AttemptResponse[]>([]);
  const [examTitles, setExamTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const [attemptsResponse, examsResponse] = await Promise.all([
        gradingService.getPending(0, 200),
        examService.getMyExams(0, 200),
      ]);

      if (isSuccess(attemptsResponse.code)) {
        setAttempts(attemptsResponse.result?.content || []);
      } else {
        setAttempts([]);
      }

      if (isSuccess(examsResponse.code)) {
        setExamTitles(
          Object.fromEntries((examsResponse.result?.content || []).map(exam => [exam.id, exam.title]))
        );
      } else {
        setExamTitles({});
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
      setAttempts([]);
      setExamTitles({});
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (attemptId: string) => {
    try {
      const response = await gradingService.finalize(attemptId);
      if (isSuccess(response.code)) {
        setAttempts(prev => prev.filter(attempt => attempt.id !== attemptId));
        toast.success('Đã hoàn thành chấm điểm');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const enrichedAttempts = useMemo(
    () =>
      attempts.map(attempt => ({
        ...attempt,
        examTitle: examTitles[attempt.examId] || `Đề thi ${attempt.examId}`,
        studentLabel: `Học viên ${attempt.studentId.slice(-6)}`,
      })),
    [attempts, examTitles]
  );

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách chấm điểm..." />;

  const filteredAttempts = enrichedAttempts.filter(attempt => {
    const matchesSearch =
      attempt.studentLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'pending' && attempt.status === 'SUBMITTED') ||
      (filter === 'graded' && (attempt.status === 'AUTO_GRADED' || attempt.status === 'MANUAL_GRADED'));
    return matchesSearch && matchesFilter;
  });

  const pendingCount = attempts.filter(attempt => attempt.status === 'SUBMITTED').length;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      SUBMITTED: <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700"><Clock className="h-3 w-3" />Chờ chấm</span>,
      AUTO_GRADED: <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"><CheckCircle className="h-3 w-3" />Tự động</span>,
      MANUAL_GRADED: <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"><CheckCircle className="h-3 w-3" />Đã chấm</span>,
      ONGOING: <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700"><Clock className="h-3 w-3" />Đang làm</span>,
    };
    return badges[status] || <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chấm điểm</h1>
          <p className="mt-2 text-gray-600">Dữ liệu đang lấy từ API grading thật của backend</p>
        </div>
        {pendingCount > 0 && (
          <div className="rounded-lg bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
            <strong>{pendingCount}</strong> bài thi đang chờ chấm
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input type="text" placeholder="Tìm kiếm học viên, đề thi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'graded'] as const).map(value => (
                <Button key={value} variant={filter === value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(value)}>
                  {value === 'all' ? 'Tất cả' : value === 'pending' ? 'Chờ chấm' : 'Đã chấm'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredAttempts.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Chưa có bài thi nào" description="API grading chưa trả về attempt nào cần hiển thị" />
      ) : (
        <div className="space-y-3">
          {filteredAttempts.map(attempt => (
            <Card key={attempt.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{attempt.studentLabel}</span>
                      {getStatusBadge(attempt.status)}
                    </div>
                    <p className="text-sm text-gray-500">{attempt.examTitle}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Mã học viên: {attempt.studentId}</span>
                      <span>Điểm: <strong>{Number(attempt.totalScore || 0)}</strong></span>
                      <span>Nộp: {new Date(attempt.submittedAt || attempt.endTime || attempt.startTime).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/instructor/grading/${attempt.id}`}>
                      <Button variant={attempt.status === 'SUBMITTED' ? 'default' : 'outline'} size="sm">
                        {attempt.status === 'SUBMITTED' ? <><Edit className="mr-2 h-4 w-4" />Chấm điểm</> : <><Eye className="mr-2 h-4 w-4" />Xem chi tiết</>}
                      </Button>
                    </Link>
                    {attempt.status === 'SUBMITTED' && (
                      <Button variant="outline" size="sm" onClick={() => handleFinalize(attempt.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />Hoàn thành
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
