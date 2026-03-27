'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { Save, ArrowLeft, Check, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { examService, ExamCreateRequest } from '@/services/examService';
import { questionService, QuestionResponse } from '@/services/questionService';
import { isSuccess, type DifficultyLevel } from '@/types/types';
import { toast } from 'react-hot-toast';

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  RECOGNIZE: 'Nhận biết',
  UNDERSTAND: 'Thông hiểu',
  APPLY: 'Vận dụng',
  ANALYZE: 'Phân tích',
};

export default function EditExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [form, setForm] = useState<ExamCreateRequest>({
    title: '',
    description: '',
    duration: 60,
    passingScore: 60,
    allowResultReview: true,
    mode: 'MANUAL',
    questionIds: [],
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const getQuestionTopic = (question: QuestionResponse) => question.topic || question.topics?.[0] || '';

  const fetchData = async () => {
    try {
      // Fetch exam details
      const examRes = await examService.getById(params.id);
      if (isSuccess(examRes.code) && examRes.result) {
        const exam = examRes.result;
        setForm({
          title: exam.title,
          description: exam.description || '',
          duration: exam.duration,
          passingScore: exam.passingScore,
          allowResultReview: exam.allowResultReview !== false,
          mode: exam.mode,
          questionIds: exam.questions?.map((q: any) => q.questionId || q.id).filter(Boolean) || [],
          courseId: exam.courseId,
        });
      }

      // Fetch all questions for selection if mode is MANUAL
      const questionsRes = await questionService.getMyQuestions(0, 200);
      if (isSuccess(questionsRes.code)) {
        setQuestions(questionsRes.result?.content || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải thông tin đề thi');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (id: string) => {
    setForm(prev => {
      const currentIds = prev.questionIds || [];
      const newIds = currentIds.includes(id)
        ? currentIds.filter(qId => qId !== id)
        : [...currentIds, id];
      return { ...prev, questionIds: newIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên đề thi');
      return;
    }

    if (form.mode === 'MANUAL' && (!form.questionIds || form.questionIds.length === 0)) {
      toast.error('Vui lòng chọn ít nhất một câu hỏi');
      return;
    }

    setSaving(true);
    try {
      const response = await examService.update(params.id, form);
      if (isSuccess(response.code)) {
        toast.success('Cập nhật đề thi thành công!');
        router.push('/instructor/exams');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getQuestionTopic(q).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (d: string) => {
    if (d === 'RECOGNIZE') return 'bg-slate-100 text-slate-700';
    if (d === 'UNDERSTAND') return 'bg-blue-100 text-blue-700';
    if (d === 'APPLY') return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  if (authLoading || loading) return <PageLoading message="Đang tải thông tin đề thi..." />;

  const selectedCount = form.questionIds?.length || 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/instructor/exams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đề thi</h1>
            <p className="text-sm text-gray-500">Cập nhật thông tin và danh sách câu hỏi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {form.mode === 'MANUAL' ? 'Chọn thủ công' : 'Ma trận ngẫu nhiên'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Tên đề thi *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ví dụ: Kiểm tra Java Module 1"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Thời gian (phút)</label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  min={5}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Điểm đạt (%)</label>
                <Input
                  type="number"
                  value={form.passingScore}
                  onChange={(e) => setForm(prev => ({ ...prev, passingScore: Number(e.target.value) }))}
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Mô tả ngắn về đề thi..."
              />
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
              <input
                type="checkbox"
                checked={form.allowResultReview !== false}
                onChange={(e) => setForm(prev => ({ ...prev, allowResultReview: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Cho phép học viên xem review kết quả chi tiết</p>
                <p className="text-xs text-gray-600">Nếu tắt, học viên chỉ thấy điểm tổng quan sau khi nộp bài</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {form.mode === 'MANUAL' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Danh sách câu hỏi
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Đã chọn {selectedCount} câu hỏi
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm câu hỏi để thêm..."
                className="mb-4"
              />
              <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                {filteredQuestions.length === 0 ? (
                  <p className="p-8 text-center text-sm text-gray-500">
                    Không có câu hỏi nào. Bạn cần tạo câu hỏi trước trong Ngân hàng câu hỏi.
                  </p>
                ) : (
                  filteredQuestions.map(q => {
                    const isSelected = form.questionIds?.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestion(q.id)}
                        className={`flex cursor-pointer items-center gap-4 border-b p-4 last:border-0 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isSelected ? 'font-medium text-blue-900' : 'text-gray-900'}`}>{q.content}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                              {DIFFICULTY_LABELS[q.difficulty]}
                            </span>
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              Chủ đề: {getQuestionTopic(q)}
                            </span>
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {q.points} điểm
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {form.mode === 'MATRIX' && (
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 border border-yellow-200">
                <p className="font-medium mb-1">Đề thi sinh tự động (Ma trận)</p>
                <p>Đề thi này được sinh ngẫu nhiên dựa trên ma trận độ khó. Bạn không thể thay đổi danh sách câu hỏi cụ thể, chỉ có thể cập nhật thông tin cơ bản của đề thi.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border">
          <Link href="/instructor/exams">
            <Button type="button" variant="outline">Hủy bỏ</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
