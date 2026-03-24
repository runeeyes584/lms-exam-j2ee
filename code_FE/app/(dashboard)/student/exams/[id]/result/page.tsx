'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import {
  CheckCircle, XCircle, Clock, ArrowLeft,
  Trophy, RotateCcw, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { attemptService, ExamAttemptResponse, QuestionResult } from '@/services/attemptService';
import { isSuccess } from '@/types/types';

export default function ExamResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<ExamAttemptResponse | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const attemptId = searchParams.get('attemptId');

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    if (!attemptId || attemptId === 'mock') {
      setAttempt(getMockAttempt());
      setLoading(false);
      return;
    }
    try {
      const response = await attemptService.review(attemptId);
      if (isSuccess(response.code) && response.result) {
        setAttempt(response.result);
      } else {
        setAttempt(getMockAttempt());
      }
    } catch (error) {
      setAttempt(getMockAttempt());
    } finally {
      setLoading(false);
    }
  };

  const getMockAttempt = (): ExamAttemptResponse => ({
    id: 'mock',
    examId: params.id,
    examTitle: 'Kiểm tra Java cơ bản',
    studentId: '1',
    answers: {},
    startTime: new Date(Date.now() - 30 * 60000).toISOString(),
    endTime: new Date().toISOString(),
    totalScore: 75,
    percentage: 75,
    status: 'AUTO_GRADED',
    passed: true,
    questionResults: [
      { questionId: 'q1', questionContent: 'Java là ngôn ngữ lập trình gì?', selectedOptionIds: ['Both compiled and interpreted'], correctOptionIds: ['Both compiled and interpreted'], isCorrect: true, earnedScore: 10, maxScore: 10, explanation: 'Java được biên dịch sang bytecode rồi thực thi bởi JVM.' },
      { questionId: 'q2', questionContent: 'OOP bao gồm những tính chất nào?', selectedOptionIds: ['Encapsulation'], correctOptionIds: ['Encapsulation', 'Inheritance', 'Polymorphism'], isCorrect: false, earnedScore: 0, maxScore: 10, explanation: 'OOP gồm 4 tính chất: Encapsulation, Inheritance, Polymorphism, Abstraction.' },
      { questionId: 'q3', questionContent: 'React là một framework?', selectedOptionIds: ['False'], correctOptionIds: ['False'], isCorrect: true, earnedScore: 5, maxScore: 5, explanation: 'React là một thư viện (library), không phải framework.' },
      { questionId: 'q4', questionContent: 'Closures trong JavaScript là gì?', selectedOptionIds: ['Loop'], correctOptionIds: ['Function within function'], isCorrect: false, earnedScore: 0, maxScore: 15, explanation: 'Closure là hàm có thể truy cập biến từ scope bên ngoài ngay cả sau khi scope đó đã kết thúc.' },
      { questionId: 'q5', questionContent: 'Spring Boot là gì?', selectedOptionIds: ['Java framework'], correctOptionIds: ['Java framework'], isCorrect: true, earnedScore: 10, maxScore: 10, explanation: 'Spring Boot là framework Java giúp tạo ứng dụng Spring nhanh chóng.' },
    ],
  });

  if (authLoading || loading) return <PageLoading message="Đang tải kết quả..." />;
  if (!attempt) return null;

  const totalMax = attempt.questionResults?.reduce((s, q) => s + q.maxScore, 0) || 100;
  const correct = attempt.questionResults?.filter(q => q.isCorrect).length || 0;
  const total = attempt.questionResults?.length || 0;
  const duration = attempt.endTime && attempt.startTime
    ? Math.round((new Date(attempt.endTime).getTime() - new Date(attempt.startTime).getTime()) / 60000)
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Result Hero */}
      <Card className={`overflow-hidden border-0 shadow-lg ${attempt.passed ? 'bg-gradient-to-br from-green-50 to-emerald-100' : 'bg-gradient-to-br from-red-50 to-rose-100'}`}>
        <CardContent className="p-8 text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${attempt.passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {attempt.passed
              ? <Trophy className="h-10 w-10 text-green-600" />
              : <XCircle className="h-10 w-10 text-red-500" />
            }
          </div>
          <h1 className={`mb-2 text-3xl font-bold ${attempt.passed ? 'text-green-700' : 'text-red-700'}`}>
            {attempt.passed ? 'Chúc mừng! Bạn đã đạt!' : 'Chưa đạt yêu cầu'}
          </h1>
          <p className="mb-6 text-gray-600">{attempt.examTitle}</p>

          <div className="mb-6 inline-block">
            <span className={`text-6xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-500'}`}>
              {attempt.percentage}%
            </span>
            <p className="mt-1 text-gray-500">{attempt.totalScore} / {totalMax} điểm</p>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-xl bg-white/60 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{correct}/{total}</p>
              <p className="text-xs text-gray-500">Câu đúng</p>
            </div>
            <div className="text-center border-x">
              <p className="text-2xl font-bold text-gray-800">{attempt.percentage}%</p>
              <p className="text-xs text-gray-500">Điểm số</p>
            </div>
            <div className="text-center">
              {duration !== null
                ? <><p className="text-2xl font-bold text-gray-800">{duration}'</p><p className="text-xs text-gray-500">Thời gian</p></>
                : <><p className="text-2xl font-bold text-gray-800">--</p><p className="text-xs text-gray-500">Thời gian</p></>
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/student/exams" className="flex-1">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />Về danh sách thi
          </Button>
        </Link>
        {!attempt.passed && (
          <Link href={`/student/exams/${params.id}/take`} className="flex-1">
            <Button className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />Thi lại
            </Button>
          </Link>
        )}
        <Link href="/student/courses" className="flex-1">
          <Button variant="outline" className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />Khóa học
          </Button>
        </Link>
      </div>

      {/* Question Review */}
      {attempt.questionResults && attempt.questionResults.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Review đáp án chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {attempt.questionResults.map((q, idx) => {
              const isExpanded = expandedQuestion === q.questionId;
              return (
                <div key={q.questionId} className="p-4">
                  <button
                    className="flex w-full items-start gap-3 text-left"
                    onClick={() => setExpandedQuestion(isExpanded ? null : q.questionId)}
                  >
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${q.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                      {q.isCorrect
                        ? <CheckCircle className="h-4 w-4 text-green-600" />
                        : <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                          Câu {idx + 1}: {q.questionContent}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-sm font-bold ${q.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                            {q.earnedScore}/{q.maxScore}
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 ml-9 space-y-2 text-sm">
                      <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Bạn chọn: </span>
                          <span className={`font-medium ${q.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                            {q.selectedOptionIds.join(', ') || '(Không trả lời)'}
                          </span>
                        </div>
                        {!q.isCorrect && q.correctOptionIds.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Đáp án đúng: </span>
                            <span className="font-medium text-green-700">{q.correctOptionIds.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      {q.explanation && (
                        <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3">
                          <p className="text-xs font-medium text-blue-700 mb-1">Giải thích:</p>
                          <p className="text-gray-700">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
