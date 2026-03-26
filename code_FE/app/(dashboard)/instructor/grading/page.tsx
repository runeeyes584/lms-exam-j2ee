'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenCheck, Clock, Search, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { examService, ExamResponse } from '@/services/examService';
import { attemptService } from '@/services/attemptService';
import { isSuccess } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

type InstructorExamWithStats = ExamResponse & {
  participantCount: number;
  submissionCount: number;
  avgScore: number;
};

export default function GradingPage() {
  const { isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exams, setExams] = useState<InstructorExamWithStats[]>([]);

  useEffect(() => {
    void fetchInstructorExams();
  }, []);

  const fetchInstructorExams = async () => {
    try {
      const examsResponse = await examService.getMyExams(0, 200);
      if (!isSuccess(examsResponse.code)) {
        setExams([]);
        return;
      }

      const baseExams = examsResponse.result?.content || [];

      const examStats = await Promise.all(
        baseExams.map(async exam => {
          const attemptsResponse = await attemptService.getByExam(exam.id, 0, 500);
          const attempts = isSuccess(attemptsResponse.code) ? attemptsResponse.result?.content || [] : [];
          const submittedAttempts = attempts.filter(item => item.status !== 'IN_PROGRESS' && item.status !== 'ONGOING');
          const participantCount = new Set(submittedAttempts.map(item => item.studentId)).size;
          const avgScore = submittedAttempts.length
            ? Math.round(
                (submittedAttempts.reduce((sum, item) => sum + Number(item.scoreOnTen ?? 0), 0) /
                  submittedAttempts.length) *
                  100
              ) / 100
            : 0;

          return {
            ...exam,
            participantCount,
            submissionCount: submittedAttempts.length,
            avgScore,
          } satisfies InstructorExamWithStats;
        })
      );

      setExams(examStats);
    } catch (error) {
      console.error('Error fetching grading exams:', error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = useMemo(
    () =>
      exams.filter(exam => {
        const keyword = searchQuery.toLowerCase();
        return exam.title.toLowerCase().includes(keyword) || (exam.description || '').toLowerCase().includes(keyword);
      }),
    [exams, searchQuery]
  );

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách bài kiểm tra..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chấm điểm</h1>
        <p className="mt-2 text-gray-600">Chọn bài kiểm tra để xem bảng điểm sinh viên đã tham gia</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm bài kiểm tra..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredExams.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="Chưa có bài kiểm tra nào"
          description="Bạn chưa tạo đề thi hoặc chưa có dữ liệu tham gia làm bài"
        />
      ) : (
        <div className="space-y-3">
          {filteredExams.map(exam => (
            <Card key={exam.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {exam.isPublished ? 'Đã xuất bản' : 'Nháp'}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-500">{exam.description || 'Không có mô tả'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration} phút
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {exam.participantCount} học viên
                      </span>
                      <span>{exam.submissionCount} lượt nộp bài</span>
                      <span>Điểm TB: {exam.avgScore}/10</span>
                    </div>
                  </div>
                  <Link href={`/instructor/grading/${exam.id}`}>
                    <Button>Xem bảng điểm</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
