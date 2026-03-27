'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Edit, Eye, Search, Users } from 'lucide-react';
import { examService } from '@/services/examService';
import { attemptService, ExamAttemptResponse } from '@/services/attemptService';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

type ScoreboardAttempt = ExamAttemptResponse & {
  submittedLabel: string;
};

export default function ExamScoreboardPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [attempts, setAttempts] = useState<ScoreboardAttempt[]>([]);

  useEffect(() => {
    void fetchScoreboard();
  }, [params.id]);

  const fetchScoreboard = async () => {
    try {
      const [examResponse, attemptsResponse] = await Promise.all([
        examService.getById(params.id),
        attemptService.getByExam(params.id, 0, 500),
      ]);

      if (isSuccess(examResponse.code) && examResponse.result) {
        setExamTitle(examResponse.result.title);
      } else {
        setExamTitle(`Đề thi ${params.id}`);
      }

      const rawAttempts = isSuccess(attemptsResponse.code) ? attemptsResponse.result?.content || [] : [];
      const submittedAttempts = rawAttempts.filter(item => item.status !== 'IN_PROGRESS' && item.status !== 'ONGOING');

      setAttempts(
        submittedAttempts
          .map(item => ({
            ...item,
            submittedLabel: new Date(item.submittedAt || item.endTime || item.startTime).toLocaleString('vi-VN'),
          }))
          .sort((a, b) => {
            const aTime = new Date(a.submittedAt || a.endTime || a.startTime).getTime();
            const bTime = new Date(b.submittedAt || b.endTime || b.startTime).getTime();
            return bTime - aTime;
          })
      );
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
      setAttempts([]);
      setExamTitle(`Đề thi ${params.id}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts = useMemo(
    () =>
      attempts.filter(item => {
        const keyword = searchQuery.toLowerCase();
        const studentName = (item.studentName || '').toLowerCase();
        const studentId = (item.studentId || '').toLowerCase();
        return studentName.includes(keyword) || studentId.includes(keyword);
      }),
    [attempts, searchQuery]
  );

  if (loading) return <PageLoading message="Đang tải bảng điểm..." />;

  const avgScore =
    attempts.length > 0
      ? Math.round((attempts.reduce((sum, item) => sum + Number(item.scoreOnTen ?? 0), 0) / attempts.length) * 100) / 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/instructor/grading">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bảng điểm</h1>
            <p className="mt-1 text-gray-600">{examTitle}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Số học viên tham gia</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{new Set(attempts.map(item => item.studentId)).size}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Lượt nộp bài</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{attempts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Điểm trung bình</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{avgScore}/10</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách kết quả</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo học viên..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredAttempts.length === 0 ? (
            <EmptyState icon={Users} title="Chưa có dữ liệu bảng điểm" description="Chưa có sinh viên nào nộp bài cho đề thi này" />
          ) : (
            <div className="space-y-3">
              {filteredAttempts.map((attempt, index) => (
                <div key={attempt.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                        <span className="font-semibold text-gray-900">{attempt.studentName || `Học viên ${attempt.studentId.slice(-6)}`}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${attempt.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {attempt.status === 'SUBMITTED' ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          {attempt.status === 'SUBMITTED' ? 'Chờ chấm' : 'Đã chấm'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Mã học viên: {attempt.studentId}</p>
                      <p className="mt-1 text-sm text-gray-500">Nộp bài: {attempt.submittedLabel}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Điểm</p>
                        <p className="text-xl font-bold text-gray-900">{Number(attempt.scoreOnTen ?? 0).toFixed(2)}/10</p>
                        <p className="text-xs text-gray-500">{Number(attempt.percentage ?? 0).toFixed(2)}%</p>
                      </div>
                      <Link href={`/instructor/grading/attempt/${attempt.id}`}>
                        <Button variant={attempt.status === 'SUBMITTED' ? 'default' : 'outline'}>
                          {attempt.status === 'SUBMITTED' ? <><Edit className="mr-2 h-4 w-4" />Chấm điểm</> : <><Eye className="mr-2 h-4 w-4" />Xem chi tiết</>}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
