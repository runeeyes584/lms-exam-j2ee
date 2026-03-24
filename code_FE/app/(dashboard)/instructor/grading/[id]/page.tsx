'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Save,
  Send,
  User,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gradingService, GradingDetailResponse } from '@/services/gradingService';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

export default function GradingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<GradingDetailResponse | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  useEffect(() => {
    void fetchDetail();
  }, [params.id]);

  const fetchDetail = async () => {
    try {
      const response = await gradingService.getDetails(params.id);
      if (isSuccess(response.code) && response.result) {
        setDetail(response.result);

        const initScores: Record<string, number> = {};
        const initFeedbacks: Record<string, string> = {};
        response.result.questionGrades.forEach(question => {
          initScores[question.questionId] = question.earnedPoints;
          initFeedbacks[question.questionId] = question.feedback || '';
        });

        setScores(initScores);
        setFeedbacks(initFeedbacks);
      } else {
        setDetail(null);
      }
    } catch (error) {
      console.error('Error fetching grading detail:', error);
      setDetail(null);
      toast.error('Khong the tai chi tiet bai thi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (finalize = false) => {
    if (!detail) return;

    setSaving(true);
    try {
      const response = await gradingService.gradeAttempt({
        attemptId: params.id,
        questionScores: Object.fromEntries(
          Object.entries(scores).map(([questionId, score]) => [questionId, Number(score)])
        ),
      });

      if (!isSuccess(response.code)) {
        toast.error(response.message || 'Co loi xay ra');
        return;
      }

      if (finalize) {
        const finalizeResponse = await gradingService.finalize(params.id);
        if (isSuccess(finalizeResponse.code)) {
          toast.success('Da hoan thanh cham diem');
          router.push('/instructor/grading');
        } else {
          toast.error(finalizeResponse.message || 'Khong the hoan thanh cham diem');
        }
        return;
      }

      toast.success('Da luu diem');
      await fetchDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Khong the luu diem');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <PageLoading message="Dang tai bai thi..." />;
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
        Khong tai duoc chi tiet bai thi tu backend.
      </div>
    );
  }

  const fillInQuestions = detail.questionGrades.filter(question => question.questionType === 'FILL_IN');
  const autoGradedQuestions = detail.questionGrades.filter(question => question.questionType !== 'FILL_IN');
  const currentTotal = Object.values(scores).reduce((sum, score) => sum + Number(score || 0), 0);
  const percentage = detail.maxScore > 0 ? Math.round((currentTotal / detail.maxScore) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/instructor/grading">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cham diem bai thi</h1>
            <p className="text-sm text-gray-500">{detail.examTitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Luu nhap
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            <Send className="mr-2 h-4 w-4" />
            {saving ? 'Dang luu...' : 'Hoan thanh cham'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                {detail.studentName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{detail.studentName}</p>
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <User className="h-3 w-3" />
                  {detail.studentEmail}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  Nop luc: {new Date(detail.submittedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="mb-1 text-sm text-gray-500">Diem hien tai</p>
            <p className="text-4xl font-bold text-blue-600">{currentTotal}</p>
            <p className="text-sm text-gray-500">
              / {detail.maxScore} ({percentage}%)
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${percentage >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {autoGradedQuestions.length > 0 && (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Cau hoi cham tu dong ({autoGradedQuestions.length} cau)
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {autoGradedQuestions.map((question, index) => (
              <div key={question.questionId} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Cau {index + 1}</span>
                      {question.isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {question.isCorrect ? 'Dung' : 'Sai'}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-800">{question.questionContent}</p>
                    <div className="space-y-1 text-xs">
                      <p className="text-gray-500">
                        Hoc vien chon:{' '}
                        <span className="font-medium text-gray-700">
                          {question.selectedOptions.join(', ') || '(Khong tra loi)'}
                        </span>
                      </p>
                      {!question.isCorrect && question.correctOptions.length > 0 && (
                        <p className="text-green-600">
                          Dap an dung: <span className="font-medium">{question.correctOptions.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-lg font-bold ${question.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                      {question.earnedPoints}
                    </span>
                    <span className="text-sm text-gray-400">/{question.maxPoints}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {fillInQuestions.length > 0 && (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Cau hoi tu luan - can cham thu cong ({fillInQuestions.length} cau)
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {fillInQuestions.map((question, index) => (
              <div key={question.questionId} className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Cau tu luan {index + 1}</span>
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Cham thu cong</span>
                </div>
                <p className="mb-3 font-medium text-gray-800">{question.questionContent}</p>

                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                  <p className="mb-1 text-xs font-medium text-gray-500">Cau tra loi cua hoc vien:</p>
                  <p className="whitespace-pre-wrap text-sm text-gray-800">
                    {question.selectedOptions[0] || <span className="italic text-gray-400">(Khong co cau tra loi)</span>}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-[140px,1fr]">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Diem</label>
                    <InputScore
                      value={scores[question.questionId] ?? 0}
                      max={question.maxPoints}
                      onChange={value =>
                        setScores(prev => ({
                          ...prev,
                          [question.questionId]: value,
                        }))
                      }
                    />
                    <p className="mt-1 text-xs text-gray-500">Toi da {question.maxPoints} diem</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Nhan xet</label>
                    <textarea
                      value={feedbacks[question.questionId] || ''}
                      onChange={e =>
                        setFeedbacks(prev => ({
                          ...prev,
                          [question.questionId]: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="Nhan xet cho cau tra loi nay..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InputScore({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      max={max}
      step="0.5"
      value={value}
      onChange={e => onChange(Math.max(0, Math.min(max, Number(e.target.value))))}
      className="w-full rounded-md border px-3 py-2 text-sm"
    />
  );
}
