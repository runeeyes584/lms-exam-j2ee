'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, X, AlertTriangle } from 'lucide-react';
import { examService, ExamResponse } from '@/services/examService';
import { attemptService } from '@/services/attemptService';
import { questionService } from '@/services/questionService';
import { isSuccess } from '@/types/types';
import { toast } from 'react-hot-toast';

interface ResolvedExamQuestion {
  id: string;
  questionId: string;
  order?: number;
  content?: string;
  points?: number;
  type?: string;
  options?: Array<{ id: string; text?: string; content?: string }>;
}

export default function ExamTakingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading } = useAuth();
  
  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [resolvedQuestions, setResolvedQuestions] = useState<ResolvedExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [fillAnswers, setFillAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);

  const existingAttemptId = searchParams.get('attemptId');

  const getQuestionId = (question: any) => String(question?.questionId || question?.id || '');
  const getOptionToken = (index: number) => `opt:${index}`;
  const getOptionIndexFromToken = (token: string) => {
    if (!token.startsWith('opt:')) return -1;
    const value = Number(token.slice(4));
    return Number.isInteger(value) ? value : -1;
  };

  // Initialize Exam and Attempt
  useEffect(() => {
    const initExam = async () => {
      try {
        const examRes = await examService.getById(params.id);
        if (isSuccess(examRes.code) && examRes.result) {
          setExam(examRes.result);
          setTimeLeft(examRes.result.duration * 60);

          const examQuestions = examRes.result.questions || [];
          const orderedExamQuestions = [...examQuestions].sort(
            (a: any, b: any) => Number(a?.order ?? 0) - Number(b?.order ?? 0)
          );
          const questionDetails = await Promise.allSettled(
            orderedExamQuestions.map(async (questionRef: any) => {
              const questionId = questionRef?.questionId || questionRef?.id;
              if (!questionId) return null;

              // Some exam payloads already include full question data.
              if (questionRef?.content && Array.isArray(questionRef?.options) && questionRef.options.length > 0) {
                return {
                  ...questionRef,
                  id: String(questionId),
                  questionId: String(questionId),
                } as ResolvedExamQuestion;
              }

              const questionRes = await questionService.getById(String(questionId));
              if (isSuccess(questionRes.code) && questionRes.result) {
                return {
                  ...questionRef,
                  ...questionRes.result,
                  id: String(questionId),
                  questionId: String(questionId),
                  options: (questionRes.result.options || []).map((opt: any) => ({
                    ...opt,
                    id: String(opt.id),
                  })),
                } as ResolvedExamQuestion;
              }

              return {
                ...questionRef,
                id: String(questionId),
                questionId: String(questionId),
              } as ResolvedExamQuestion;
            })
          );

          const mappedQuestions = questionDetails
            .map(item => (item.status === 'fulfilled' ? item.value : null))
            .filter(Boolean) as ResolvedExamQuestion[];

          setResolvedQuestions(mappedQuestions);

          if (existingAttemptId) {
            setAttemptId(existingAttemptId);
            try {
              const attemptRes = await attemptService.getById(existingAttemptId);
              if (isSuccess(attemptRes.code) && attemptRes.result?.answers) {
                const rawAnswers = attemptRes.result.answers as Record<string, any>;
                const initialAnswers: Record<string, string[]> = {};
                const initialFillAnswers: Record<string, string> = {};
                Object.entries(rawAnswers).forEach(([questionId, value]) => {
                  const normalizedQuestionId = String(questionId);
                  const question = mappedQuestions.find(item => getQuestionId(item) === normalizedQuestionId);
                  const options = question?.options || [];
                  const selected = value?.selectedOptionIds || value?.selectedOptions || [];
                  const selectedTokens = (Array.isArray(selected) ? selected : [])
                    .map((v: any) => {
                      const asNumber = typeof v === 'number' ? v : Number(v);
                      if (Number.isInteger(asNumber) && asNumber >= 0 && asNumber < options.length) {
                        return getOptionToken(asNumber);
                      }
                      const indexById = options.findIndex((opt: any) => String(opt?.id ?? opt?.optionId ?? '') === String(v));
                      return indexById >= 0 ? getOptionToken(indexById) : null;
                    })
                    .filter(Boolean) as string[];
                  initialAnswers[normalizedQuestionId] = selectedTokens;
                  if (typeof value?.fillAnswer === 'string') {
                    initialFillAnswers[normalizedQuestionId] = value.fillAnswer;
                  }
                });
                setAnswers(initialAnswers);
                setFillAnswers(initialFillAnswers);
              }
            } catch (error) {
              console.error('Error loading existing attempt answers:', error);
            }
          } else {
            const attemptRes = await attemptService.start(params.id);
            if (isSuccess(attemptRes.code) && attemptRes.result?.id) {
              setAttemptId(attemptRes.result.id);
            } else {
              toast.error(attemptRes.message || 'Không thể bắt đầu bài thi');
              router.push(`/student/exams/${params.id}/start` as any);
            }
          }
        } else {
          toast.error('Không tìm thấy đề thi');
          router.push('/student/exams');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast.error('Lỗi khi tải đề thi');
        router.push('/student/exams');
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [params.id, router, existingAttemptId]);

  // Timer
  useEffect(() => {
    if (loading || !exam || submitting) return;
    
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, exam, submitting]);

  useEffect(() => {
    if (!attemptId || !exam || submitting) return;

    const autosave = setInterval(async () => {
      const allQuestionIds = Array.from(new Set([...Object.keys(answers), ...Object.keys(fillAnswers)]));
      const sourceQuestions = resolvedQuestions.length > 0 ? resolvedQuestions : ((exam.questions || []) as any[]);
      const questionById = new Map(sourceQuestions.map((question: any) => [getQuestionId(question), question]));
      const answerPayload = allQuestionIds.map(questionId => ({
        questionId: String(questionId),
        selectedOptionIds: (answers[questionId] || [])
          .map(token => {
            const optionIndex = getOptionIndexFromToken(token);
            if (optionIndex < 0) return null;
            const question = questionById.get(String(questionId));
            const option = question?.options?.[optionIndex];
            return String(option?.id ?? optionIndex);
          })
          .filter((value): value is string => Boolean(value)),
        selectedOptions: (answers[questionId] || [])
          .map(getOptionIndexFromToken)
          .filter(index => index >= 0),
        fillAnswer: fillAnswers[questionId] || undefined,
      }));
      if (answerPayload.length === 0) return;
      try {
        setSavingProgress(true);
        await attemptService.saveProgress(attemptId, answerPayload);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSavingProgress(false);
      }
    }, 15000);

    return () => clearInterval(autosave);
  }, [attemptId, answers, fillAnswers, exam, submitting]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        return {
          ...prev,
          [questionId]: current.includes(optionId)
            ? current.filter(id => id !== optionId)
            : [...current, optionId],
        };
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const toggleFlag = (questionId: string) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (submitting || !exam) return;
    
    const questions = resolvedQuestions.length > 0 ? resolvedQuestions : ((exam.questions || []) as any[]);
    const unanswered = questions.filter((question: any) => !isQuestionAnswered(question)).length;
    
    if (unanswered > 0 && timeLeft > 0) {
      if (!confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) return;
    } else if (timeLeft > 0) {
      if (!confirm('Bạn có chắc chắn muốn nộp bài?')) return;
    }

    setSubmitting(true);
    try {
      if (!attemptId) throw new Error('No attempt ID found');
      const questionById = new Map(questions.map((question: any) => [getQuestionId(question), question]));
      const submitData = {
        answers: Array.from(new Set([...Object.keys(answers), ...Object.keys(fillAnswers)])).map(questionId => ({
          questionId: String(questionId),
          selectedOptionIds: (answers[questionId] || [])
            .map(token => {
              const optionIndex = getOptionIndexFromToken(token);
              if (optionIndex < 0) return null;
              const question = questionById.get(String(questionId));
              const option = question?.options?.[optionIndex];
              return String(option?.id ?? optionIndex);
            })
            .filter((value): value is string => Boolean(value)),
          selectedOptions: (answers[questionId] || [])
            .map(getOptionIndexFromToken)
            .filter(index => index >= 0),
          fillAnswer: fillAnswers[questionId] || undefined,
        })),
      };

      const response = await attemptService.submit(attemptId, submitData);
      
      if (isSuccess(response.code)) {
        toast.success('Nộp bài thành công!');
        router.push(`/student/exams/${exam.id}/result?attemptId=${response.result?.id}`);
      } else {
        toast.error(response.message || 'Lỗi khi nộp bài');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillAnswer = (questionId: string, value: string) => {
    setFillAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isQuestionAnswered = (question: any) => {
    const questionId = String(question?.questionId || question?.id || '');
    if (!questionId) return false;

    const questionType = String(question?.type || '').toUpperCase();
    if (questionType === 'FILL_IN') {
      return Boolean(fillAnswers[questionId]?.trim());
    }

    return Boolean(answers[questionId] && answers[questionId].length > 0);
  };

  const handleExit = () => {
    if (confirm('Nếu thoát, bài làm của bạn sẽ không được lưu. Bạn có chắc chắn?')) {
      router.push('/student/exams');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải bài thi..." />;
  if (!exam) return null;

  const questions = resolvedQuestions.length > 0 ? resolvedQuestions : ((exam.questions || []) as any[]);
  
  if (questions.length === 0) {
    return (
        <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Đề thi chưa có câu hỏi</h2>
            <p className="text-gray-500 mb-6">Đề thi này hiện tại chưa được cấu hình câu hỏi nội dung. Vui lòng liên hệ giảng viên.</p>
            <Button onClick={() => router.push('/student/exams')}>Quay lại danh sách</Button>
        </div>
    );
  }

  const q = questions[currentQuestion] as any;
  const currentQuestionId = getQuestionId(q);
  const answeredCount = questions.filter((question: any) => isQuestionAnswered(question)).length;
  const questionType = String(q?.type || '').toUpperCase();
  const isFillIn = questionType === 'FILL_IN';
  const isMultipleChoice = questionType === 'MULTIPLE_CHOICE' || questionType === 'MULTI_CHOICE';

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow py-3 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleExit} className="rounded-full p-2 hover:bg-gray-100 text-gray-500 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="font-bold text-gray-900 line-clamp-1">{exam.title}</h1>
              <p className="text-xs text-gray-500">{questions.length} câu hỏi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className={`flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 font-mono text-base sm:text-lg font-semibold ${
              timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
            {savingProgress && <span className="hidden text-xs text-gray-500 sm:inline">Đang lưu đáp án...</span>}
            <Button onClick={handleSubmit} disabled={submitting} className="font-medium bg-blue-600 hover:bg-blue-700">
              <Send className="mr-2 h-4 w-4 hidden sm:inline-block" />
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 sm:p-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Question Panel */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50 py-4 px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      {currentQuestion + 1}
                    </span>
                    <span className="text-gray-700 font-medium">/ {questions.length}</span>
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {q?.points} điểm
                    </span>
                    <button
                      onClick={() => currentQuestionId && toggleFlag(currentQuestionId)}
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          currentQuestionId && flagged.has(currentQuestionId) ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Flag className={`h-4 w-4 ${currentQuestionId && flagged.has(currentQuestionId) ? 'fill-yellow-500' : ''}`} />
                      <span className="hidden sm:inline-block">{currentQuestionId && flagged.has(currentQuestionId) ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="mb-8 prose max-w-none text-lg text-gray-800 leading-relaxed font-medium">
                  {q?.content}
                </div>
                
                {isFillIn ? (
                  <div className="space-y-2">
                    <label htmlFor="fill-answer" className="text-sm font-medium text-gray-600">
                      Nhập câu trả lời của bạn
                    </label>
                    <textarea
                      id="fill-answer"
                      value={fillAnswers[currentQuestionId] || ''}
                      onChange={e => currentQuestionId && handleFillAnswer(currentQuestionId, e.target.value)}
                      placeholder="Nhập đáp án..."
                      className="min-h-[140px] w-full rounded-xl border border-gray-300 p-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {q?.options?.map((opt: any, idx: number) => {
                      const optionToken = getOptionToken(idx);
                      const isSelected = currentQuestionId ? (answers[currentQuestionId] || []).includes(optionToken) : false;
                      return (
                        <button
                          key={optionToken}
                          onClick={() => currentQuestionId && handleAnswer(currentQuestionId, optionToken, isMultipleChoice)}
                          disabled={!currentQuestionId}
                          className={`flex w-full items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                            isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`flex h-7 w-7 mt-0.5 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                            isSelected ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-400 text-gray-500'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className={`text-base leading-relaxed ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                            {opt.content || opt.text}
                          </span>
                        </button>
                      );
                    })}
                    {(!q?.options || q.options.length === 0) && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                        Câu hỏi này chưa có danh sách đáp án để chọn.
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(i => Math.max(0, i - 1))}
                    disabled={currentQuestion === 0}
                    className="w-32"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Câu trước
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(i => Math.min(questions.length - 1, i + 1))}
                    disabled={currentQuestion === questions.length - 1}
                    className="w-32"
                  >
                    Câu sau <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigator Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-sm border-gray-200">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base">Mục lục câu hỏi</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Tiến độ</span>
                    <span className="font-semibold text-blue-700">{answeredCount}/{questions.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(answeredCount/questions.length)*100}%` }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {questions.map((q: any, idx: number) => {
                    const questionId = String(q?.questionId || q?.id || '');
                    const isAnswered = isQuestionAnswered(q);
                    const isFlagged = questionId ? flagged.has(questionId) : false;
                    const isCurrent = idx === currentQuestion;
                    return (
                      <button
                        key={questionId || `question-${idx}`}
                        onClick={() => setCurrentQuestion(idx)}
                        className={`relative flex h-9 w-full items-center justify-center rounded-md text-sm font-medium transition-all ${
                          isCurrent ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300 ring-offset-1' :
                          isAnswered ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                          'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-500"></span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-5 space-y-2 text-xs text-gray-600 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-blue-100" /> Đã trả lời
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-gray-100 border border-gray-200" /> Chưa trả lời
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative h-4 w-4 rounded bg-gray-100 border border-gray-200">
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    </span> Đánh dấu xem lại
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
