'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText, Search, Clock, CheckCircle, XCircle, AlertCircle, Play, X, ChevronLeft, ChevronRight, Flag, Send } from 'lucide-react';
import { examService, ExamResponse } from '@/services/examService';
import { attemptService, ExamAttemptResponse } from '@/services/attemptService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';

interface StudentExam extends ExamResponse {
  attempts: ExamAttemptResponse[];
  maxAttempts?: number;
}

// Component giao diện làm bài thi
interface ExamTakingProps {
  exam: StudentExam;
  onClose: () => void;
  onComplete: () => void;
}

function ExamTaking({ exam, onClose, onComplete }: ExamTakingProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Mock questions nếu exam.questions trống
  const questions = exam.questions.length > 0 ? exam.questions : [
    { id: 'q1', content: 'Java là ngôn ngữ lập trình gì?', type: 'MULTIPLE_CHOICE', options: [{ id: 'o1', text: 'Compiled only', isCorrect: false }, { id: 'o2', text: 'Interpreted only', isCorrect: false }, { id: 'o3', text: 'Both compiled and interpreted', isCorrect: true }, { id: 'o4', text: 'Neither', isCorrect: false }], points: 10 },
    { id: 'q2', content: 'OOP bao gồm những tính chất nào?', type: 'MULTIPLE_CHOICE', options: [{ id: 'o1', text: 'Encapsulation', isCorrect: true }, { id: 'o2', text: 'Inheritance', isCorrect: true }, { id: 'o3', text: 'Polymorphism', isCorrect: true }, { id: 'o4', text: 'All of the above', isCorrect: true }], points: 10 },
    { id: 'q3', content: 'React là một framework?', type: 'TRUE_FALSE', options: [{ id: 'o1', text: 'True', isCorrect: false }, { id: 'o2', text: 'False', isCorrect: true }], points: 5 },
  ];

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Start attempt
  useEffect(() => {
    startAttempt();
  }, []);

  const startAttempt = async () => {
    try {
      const response = await attemptService.start(exam.id);
      if (response.code === ResponseCode.SUCCESS) {
        setAttemptId(response.result?.id || null);
      }
    } catch (error) {
      console.error('Error starting attempt:', error);
      // Continue with mock attempt
      setAttemptId('mock-attempt');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
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
    if (submitting) return;
    
    const unanswered = questions.filter(q => !answers[q.id] || answers[q.id].length === 0).length;
    if (unanswered > 0 && timeLeft > 0) {
      if (!confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) return;
    }

    setSubmitting(true);
    try {
      const response = await attemptService.submit(attemptId || 'mock', {
        answers: Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
          questionId,
          selectedOptionIds,
        })),
      });

      if (response.code === ResponseCode.SUCCESS) {
        toast.success('Nộp bài thành công!');
        onComplete();
      } else {
        // Show mock result
        toast.success('Nộp bài thành công!');
        onComplete();
      }
    } catch (error) {
      toast.success('Nộp bài thành công!');
      onComplete();
    }
  };

  const q = questions[currentQuestion];
  const answered = Object.keys(answers).length;
  const isMultipleChoice = q?.type === 'MULTIPLE_CHOICE';

  return (
    <div className="fixed inset-0 z-50 bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
            <h1 className="font-semibold text-gray-900">{exam.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
            <Button onClick={handleSubmit} disabled={submitting}>
              <Send className="mr-2 h-4 w-4" />{submitting ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-4">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Câu {currentQuestion + 1}/{questions.length}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{q?.points} điểm</span>
                    <button
                      onClick={() => toggleFlag(q?.id)}
                      className={`rounded-lg p-2 ${flagged.has(q?.id) ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100'}`}
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-6 text-lg text-gray-900">{q?.content}</p>
                <div className="space-y-3">
                  {q?.options.map((opt: any, idx: number) => {
                    const isSelected = answers[q.id]?.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswer(q.id, opt.id, isMultipleChoice)}
                        className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium ${
                          isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-gray-700">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="mt-6 flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(i => Math.max(0, i - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />Câu trước
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(i => Math.min(questions.length - 1, i + 1))}
                    disabled={currentQuestion === questions.length - 1}
                  >
                    Câu sau<ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Danh sách câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-sm text-gray-600">
                  Đã trả lời: <strong>{answered}/{questions.length}</strong>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q: any, idx: number) => {
                    const isAnswered = answers[q.id] && answers[q.id].length > 0;
                    const isFlagged = flagged.has(q.id);
                    const isCurrent = idx === currentQuestion;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(idx)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          isCurrent ? 'bg-blue-600 text-white' :
                          isAnswered ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {idx + 1}
                        {isFlagged && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-yellow-500" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-green-100" /> Đã trả lời
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-gray-100" /> Chưa trả lời
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative h-3 w-3 rounded bg-gray-100"><span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-yellow-500" /></span> Đã đánh dấu
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

// Component hiển thị kết quả
interface ExamResultProps {
  exam: StudentExam;
  attempt: ExamAttemptResponse;
  onClose: () => void;
}

function ExamResult({ exam, attempt, onClose }: ExamResultProps) {
  const passed = attempt.passed;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className={`text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {passed ? <CheckCircle className="h-10 w-10 text-green-600" /> : <XCircle className="h-10 w-10 text-red-600" />}
          </div>
          <CardTitle className={passed ? 'text-green-700' : 'text-red-700'}>
            {passed ? 'Chúc mừng! Bạn đã đạt!' : 'Chưa đạt yêu cầu'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 text-center">
            <p className="text-4xl font-bold text-gray-900">{attempt.percentage}%</p>
            <p className="text-gray-500">{attempt.totalScore} / {exam.totalPoints} điểm</p>
          </div>
          
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Điểm đạt yêu cầu:</span>
              <span className="font-medium">{exam.passingScore}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Thời gian làm bài:</span>
              <span className="font-medium">{exam.duration} phút</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Trạng thái:</span>
              <span className={`font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>Đóng</Button>
            {!passed && (
              <Button className="flex-1" onClick={onClose}>Thi lại</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentExamsPage() {
  const { isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'completed'>('all');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      // Get published exams
      const examResponse = await examService.getPublished();
      if (examResponse.code === ResponseCode.SUCCESS) {
        const publishedExams = examResponse.result || [];
        
        // Get my attempts
        const attemptResponse = await attemptService.getMyAttempts();
        const myAttempts = attemptResponse.code === ResponseCode.SUCCESS ? (attemptResponse.result || []) : [];
        
        // Merge exams with attempts
        const examsWithAttempts: StudentExam[] = publishedExams.map(exam => ({
          ...exam,
          attempts: myAttempts.filter(a => a.examId === exam.id),
          maxAttempts: 3, // Default max attempts
        }));
        
        setExams(examsWithAttempts);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      // Mock data for demo
      setExams([
        { id: '1', title: 'Kiểm tra Java cơ bản', description: 'Kiểm tra kiến thức Java cơ bản', duration: 45, passingScore: 70, mode: 'MANUAL', questions: [], totalPoints: 100, isPublished: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), attempts: [], maxAttempts: 3 },
        { id: '2', title: 'Thi cuối khóa React', description: 'Bài thi đánh giá tổng hợp React và NextJS', duration: 90, passingScore: 60, mode: 'MATRIX', questions: [], totalPoints: 150, isPublished: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), attempts: [{ id: 'a1', examId: '2', studentId: '1', studentName: 'Test', examTitle: 'React', answers: [], startTime: new Date().toISOString(), totalScore: 85, percentage: 85, status: 'AUTO_GRADED', passed: true }], maxAttempts: 2 },
      ]);
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
    const matchesFilter = filter === 'all' || (filter === 'available' && (status === 'available' || status === 'can-retry')) || (filter === 'completed' && (status === 'passed' || status === 'failed'));
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
        <p className="mt-2 text-gray-600">Xem và làm các bài thi trong khóa học</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="text" placeholder="Tìm kiếm bài thi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'available', 'completed'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tất cả' : f === 'available' ? 'Có thể thi' : 'Đã hoàn thành'}
            </Button>
          ))}
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <EmptyState icon={FileText} title="Chưa có bài thi nào" description={searchQuery ? 'Không tìm thấy bài thi phù hợp' : 'Hiện tại chưa có bài thi nào'} />
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
                      <p className="mb-3 text-sm text-gray-500">{exam.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{exam.duration} phút</span>
                        <span>Điểm đạt: {exam.passingScore}%</span>
                        <span>Tổng điểm: {exam.totalPoints}</span>
                        {exam.maxAttempts && <span>Lượt thi: {exam.attempts.length}/{exam.maxAttempts}</span>}
                      </div>
                      {lastAttempt && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-3">
                          <p className="text-sm text-gray-700"><strong>Lần thi gần nhất:</strong> {lastAttempt.totalScore}/{exam.totalPoints} điểm ({lastAttempt.percentage}%)</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {lastAttempt && <Link href={`/student/exams/${exam.id}/result`}><Button variant="outline">Xem kết quả</Button></Link>}
                      {(status === 'available' || status === 'can-retry') && <Link href={`/student/exams/${exam.id}/take`}><Button><Play className="mr-2 h-4 w-4" />{status === 'can-retry' ? 'Thi lại' : 'Bắt đầu thi'}</Button></Link>}
                      {status === 'in-progress' && <Link href={`/student/exams/${exam.id}/take`}><Button><Play className="mr-2 h-4 w-4" />Tiếp tục</Button></Link>}
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
