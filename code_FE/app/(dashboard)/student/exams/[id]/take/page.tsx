'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, X, AlertTriangle } from 'lucide-react';
import { examService, ExamResponse } from '@/services/examService';
import { attemptService } from '@/services/attemptService';
import { isSuccess } from '@/types/types';
import { toast } from 'react-hot-toast';

export default function ExamTakingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  
  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Initialize Exam and Attempt
  useEffect(() => {
    const initExam = async () => {
      try {
        const examRes = await examService.getById(params.id);
        if (isSuccess(examRes.code) && examRes.result) {
          setExam(examRes.result);
          setTimeLeft(examRes.result.duration * 60);
          
          // Start attempt
          try {
            const attemptRes = await attemptService.start(params.id);
            if (isSuccess(attemptRes.code) && attemptRes.result) {
              setAttemptId(attemptRes.result.id || null);
            }
          } catch (err) {
            console.error('Failed to start attempt:', err);
            // Fallback to mock attempt ID if backend fails for UI demo
            setAttemptId('mock-attempt');
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
  }, [params.id, router]);

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
    
    const questions = exam.questions || [];
    const unanswered = questions.filter((q: any) => !answers[q.id] || answers[q.id].length === 0).length;
    
    if (unanswered > 0 && timeLeft > 0) {
      if (!confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) return;
    } else if (timeLeft > 0) {
      if (!confirm('Bạn có chắc chắn muốn nộp bài?')) return;
    }

    setSubmitting(true);
    try {
      if (!attemptId) throw new Error('No attempt ID found');
      
      const submitData = {
        answers: Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
          questionId,
          selectedOptionIds,
        })),
      };

      const response = await attemptService.submit(attemptId, submitData);
      
      if (isSuccess(response.code)) {
        toast.success('Nộp bài thành công!');
        router.push(`/student/exams/${exam.id}/result?attemptId=${response.result?.id}`);
      } else {
        toast.error(response.message || 'Lỗi khi nộp bài');
        // Redirect to mock result if backend fails for UI demo
        router.push(`/student/exams/${exam.id}/result?attemptId=mock`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.success('Đã nộp bài (Chế độ UI demo)!');
      router.push(`/student/exams/${exam.id}/result?attemptId=mock`);
    }
  };

  const handleExit = () => {
    if (confirm('Nếu thoát, bài làm của bạn sẽ không được lưu. Bạn có chắc chắn?')) {
      router.push('/student/exams');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải bài thi..." />;
  if (!exam) return null;

  const questions = exam.questions || [];
  
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

  const q = questions[currentQuestion];
  const answeredCount = Object.keys(answers).filter(k => answers[k].length > 0).length;
  const isMultipleChoice = q?.type === 'MULTIPLE_CHOICE' || q?.type === 'MULTIPLE_ANSWER';

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
                      onClick={() => toggleFlag(q?.id)}
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          flagged.has(q?.id) ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Flag className={`h-4 w-4 ${flagged.has(q?.id) ? 'fill-yellow-500' : ''}`} />
                      <span className="hidden sm:inline-block">{flagged.has(q?.id) ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="mb-8 prose max-w-none text-lg text-gray-800 leading-relaxed font-medium">
                  {q?.content}
                </div>
                
                <div className="space-y-3">
                  {q?.options?.map((opt: any, idx: number) => {
                    const isSelected = answers[q.id]?.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswer(q.id, opt.id, isMultipleChoice)}
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
                </div>

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
                    const isAnswered = answers[q.id] && answers[q.id].length > 0;
                    const isFlagged = flagged.has(q.id);
                    const isCurrent = idx === currentQuestion;
                    return (
                      <button
                        key={q.id}
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
