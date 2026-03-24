'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { GraduationCap, Search, CheckCircle, Clock, Eye, Edit, Filter } from 'lucide-react';
import Link from 'next/link';
import { gradingService } from '@/services/gradingService';
import { AttemptResponse } from '@/services/attemptService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';

export default function GradingPage() {
  const { isLoading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState<AttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await gradingService.getPending(0, 100);
      if (response.code === ResponseCode.SUCCESS) {
        setAttempts(response.result?.content || []);
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
      // Mock data for demo
      setAttempts([
        { id: '1', examId: '1', studentId: '1', studentName: 'Nguyễn Văn A', examTitle: 'Kiểm tra Java cơ bản', answers: [], startTime: new Date().toISOString(), endTime: new Date().toISOString(), totalScore: 75, percentage: 75, status: 'AUTO_GRADED', passed: true },
        { id: '2', examId: '1', studentId: '2', studentName: 'Trần Thị B', examTitle: 'Kiểm tra Java cơ bản', answers: [], startTime: new Date().toISOString(), endTime: new Date().toISOString(), totalScore: 60, percentage: 60, status: 'SUBMITTED', passed: false },
        { id: '3', examId: '2', studentId: '3', studentName: 'Lê Văn C', examTitle: 'Thi giữa kỳ React', answers: [], startTime: new Date().toISOString(), endTime: new Date().toISOString(), totalScore: 0, percentage: 0, status: 'SUBMITTED', passed: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (attemptId: string) => {
    try {
      const response = await gradingService.finalize(attemptId);
      if (response.code === ResponseCode.SUCCESS) {
        setAttempts(prev => prev.map(a => 
          a.id === attemptId ? { ...a, status: 'MANUAL_GRADED' } : a
        ));
        toast.success('Đã hoàn thành chấm điểm');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách chấm điểm..." />;

  const filteredAttempts = attempts.filter(a => {
    const matchesSearch = 
      (a.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (a.examTitle?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && a.status === 'SUBMITTED') || 
      (filter === 'graded' && (a.status === 'AUTO_GRADED' || a.status === 'MANUAL_GRADED'));
    return matchesSearch && matchesFilter;
  });

  const pendingCount = attempts.filter(a => a.status === 'SUBMITTED').length;

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
          <p className="mt-2 text-gray-600">Chấm điểm và xem kết quả thi của học viên</p>
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
              {(['all', 'pending', 'graded'] as const).map(f => (
                <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                  {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ chấm' : 'Đã chấm'}
                  {f === 'pending' && pendingCount > 0 && <span className="ml-1 rounded-full bg-yellow-500 px-1.5 text-xs text-white">{pendingCount}</span>}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredAttempts.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Chưa có bài thi nào" description={searchQuery ? 'Không tìm thấy bài thi phù hợp' : 'Chưa có bài thi cần chấm điểm'} />
      ) : (
        <div className="space-y-3">
          {filteredAttempts.map(attempt => (
            <Card key={attempt.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{attempt.studentName}</span>
                      {getStatusBadge(attempt.status)}
                      {attempt.status !== 'ONGOING' && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {attempt.passed ? 'Đạt' : 'Chưa đạt'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{attempt.examTitle}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Điểm: <strong>{attempt.totalScore || 0}</strong> ({attempt.percentage || 0}%)</span>
                      <span>Nộp: {new Date(attempt.endTime || attempt.startTime).toLocaleString('vi-VN')}</span>
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
