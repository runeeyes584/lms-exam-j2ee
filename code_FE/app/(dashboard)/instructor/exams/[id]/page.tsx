'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Edit, FileText, Users } from 'lucide-react';
import { examService, ExamResponse } from '@/services/examService';
import { attemptService, ExamAttemptResponse } from '@/services/attemptService';
import { questionService } from '@/services/questionService';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

export default function InstructorExamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [attempts, setAttempts] = useState<ExamAttemptResponse[]>([]);
  const [resolvedQuestions, setResolvedQuestions] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [examRes, attemptsRes] = await Promise.all([
          examService.getById(params.id),
          attemptService.getByExam(params.id, 0, 200),
        ]);

        if (!isSuccess(examRes.code) || !examRes.result) {
          router.push('/instructor/exams');
          return;
        }

        setExam(examRes.result);
        const examQuestions = examRes.result.questions || [];
        const orderedExamQuestions = [...examQuestions].sort(
          (a: any, b: any) => Number(a?.order ?? 0) - Number(b?.order ?? 0)
        );

        const questionDetails = await Promise.allSettled(
          orderedExamQuestions.map(async (questionRef: any) => {
            const questionId = questionRef?.questionId || questionRef?.id;
            if (!questionId) return questionRef;
            const questionRes = await questionService.getById(questionId);
            if (isSuccess(questionRes.code) && questionRes.result) {
              return {
                ...questionRef,
                ...questionRes.result,
                id: questionId,
              };
            }
            return questionRef;
          })
        );

        setResolvedQuestions(
          questionDetails.map((item, index) =>
            item.status === 'fulfilled'
              ? item.value
              : { ...orderedExamQuestions[index] }
          )
        );

        if (isSuccess(attemptsRes.code)) {
          setAttempts(attemptsRes.result?.content || []);
        }
      } catch (error) {
        console.error('Error loading exam detail:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [params.id, router]);

  const avgScore = useMemo(() => {
    if (attempts.length === 0) return 0;
    const sum = attempts.reduce((acc, attempt) => acc + Number(attempt.percentage || 0), 0);
    return Math.round(sum / attempts.length);
  }, [attempts]);

  if (loading) return <PageLoading message="Đang tải chi tiết đề thi..." />;
  if (!exam) return null;

  const questions = resolvedQuestions.length > 0 ? resolvedQuestions : exam.questions || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/instructor/exams">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{exam.description || 'Không có mô tả đề thi'}</p>
          </div>
        </div>
        <Link href={`/instructor/exams/${exam.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />Chỉnh sửa đề thi
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />Thời gian làm bài
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{exam.duration} phút</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />Câu hỏi
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{questions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />Lượt thi / Điểm TB
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{attempts.length} / {avgScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />Review kết quả
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {exam.allowResultReview !== false ? 'Bật' : 'Tắt'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách câu hỏi trong đề</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Đề thi chưa có câu hỏi"
              description="Hãy vào chế độ chỉnh sửa để thêm câu hỏi vào đề thi."
            />
          ) : (
            <div className="space-y-3">
              {questions.map((question: any, index: number) => (
                <div key={question.questionId || question.id || `${index}`} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-700">Câu {index + 1}</span>
                    {question.difficulty && (
                      <span className="rounded bg-gray-100 px-2 py-0.5">{question.difficulty}</span>
                    )}
                    <span className="rounded bg-gray-100 px-2 py-0.5">{question.points || 0} điểm</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {question.content || `Không tải được nội dung câu hỏi (${question.questionId || question.id})`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
