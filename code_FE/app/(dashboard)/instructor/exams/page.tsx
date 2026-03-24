'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText, Search, Plus, Edit, Trash2, Eye, Clock, Users, X, Check, Shuffle, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { examService, ExamResponse, ExamCreateRequest, ExamGenerateRequest } from '@/services/examService';
import { questionService, QuestionResponse } from '@/services/questionService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';

// Modal tạo đề thi
interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ExamModal({ isOpen, onClose, onSuccess }: ExamModalProps) {
  const [mode, setMode] = useState<'MANUAL' | 'MATRIX'>('MANUAL');
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: 60,
    passingScore: 60,
    courseId: '',
    // Matrix mode
    easyCount: 5,
    mediumCount: 10,
    hardCount: 5,
  });

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen]);

  const fetchQuestions = async () => {
    try {
      const response = await questionService.getMyQuestions(0, 200);
      if (response.code === ResponseCode.SUCCESS) {
        setQuestions(response.result?.content || []);
      }
    } catch (error) {
      // Mock data
      setQuestions([
        { id: '1', type: 'MULTIPLE_CHOICE', topic: 'Java', difficulty: 'EASY', points: 10, content: 'Java là gì?', options: [], createdAt: '', updatedAt: '' },
        { id: '2', type: 'MULTIPLE_CHOICE', topic: 'Java', difficulty: 'MEDIUM', points: 10, content: 'OOP là gì?', options: [], createdAt: '', updatedAt: '' },
        { id: '3', type: 'MULTIPLE_CHOICE', topic: 'Java', difficulty: 'HARD', points: 15, content: 'Thread pool?', options: [], createdAt: '', updatedAt: '' },
      ]);
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên đề thi');
      return;
    }

    if (mode === 'MANUAL' && selectedQuestions.length === 0) {
      toast.error('Vui lòng chọn ít nhất một câu hỏi');
      return;
    }

    setSaving(true);
    try {
      let response;

      if (mode === 'MANUAL') {
        const data: ExamCreateRequest = {
          title: form.title,
          description: form.description,
          duration: form.duration,
          passingScore: form.passingScore,
          mode: 'MANUAL',
          questionIds: selectedQuestions,
          courseId: form.courseId || undefined,
        };
        response = await examService.create(data);
      } else {
        const data: ExamGenerateRequest = {
          title: form.title,
          description: form.description,
          duration: form.duration,
          passingScore: form.passingScore,
          courseId: form.courseId || undefined,
          difficultyMatrix: {
            easy: form.easyCount,
            medium: form.mediumCount,
            hard: form.hardCount,
          },
        };
        response = await examService.generate(data);
      }

      if (response.code === ResponseCode.SUCCESS) {
        toast.success('Tạo đề thi thành công!');
        onSuccess();
        onClose();
        // Reset
        setForm({ title: '', description: '', duration: 60, passingScore: 60, courseId: '', easyCount: 5, mediumCount: 10, hardCount: 5 });
        setSelectedQuestions([]);
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (d: string) => {
    if (d === 'EASY') return 'bg-green-100 text-green-700';
    if (d === 'MEDIUM') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Tạo đề thi mới</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setMode('MANUAL')}
              className={`flex flex-1 items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                mode === 'MANUAL' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ListChecks className={`h-6 w-6 ${mode === 'MANUAL' ? 'text-blue-600' : 'text-gray-400'}`} />
              <div className="text-left">
                <p className={`font-medium ${mode === 'MANUAL' ? 'text-blue-700' : 'text-gray-700'}`}>Chọn thủ công</p>
                <p className="text-xs text-gray-500">Tự chọn câu hỏi từ ngân hàng</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode('MATRIX')}
              className={`flex flex-1 items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                mode === 'MATRIX' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Shuffle className={`h-6 w-6 ${mode === 'MATRIX' ? 'text-blue-600' : 'text-gray-400'}`} />
              <div className="text-left">
                <p className={`font-medium ${mode === 'MATRIX' ? 'text-blue-700' : 'text-gray-700'}`}>Ma trận độ khó</p>
                <p className="text-xs text-gray-500">Tự động chọn theo tỷ lệ</p>
              </div>
            </button>
          </div>

          {/* Basic Info */}
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
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Mô tả ngắn về đề thi..."
            />
          </div>

          {/* Manual Mode: Question Selection */}
          {mode === 'MANUAL' && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Chọn câu hỏi ({selectedQuestions.length} đã chọn)
              </label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm câu hỏi..."
                className="mb-2"
              />
              <div className="max-h-60 overflow-y-auto rounded-lg border">
                {filteredQuestions.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">Không có câu hỏi nào</p>
                ) : (
                  filteredQuestions.map(q => (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestion(q.id)}
                      className={`flex cursor-pointer items-center gap-3 border-b p-3 last:border-0 hover:bg-gray-50 ${
                        selectedQuestions.includes(q.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        selectedQuestions.includes(q.id) ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
                      }`}>
                        {selectedQuestions.includes(q.id) && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{q.content}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`rounded px-1.5 py-0.5 text-xs ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty === 'EASY' ? 'Dễ' : q.difficulty === 'MEDIUM' ? 'TB' : 'Khó'}
                          </span>
                          <span className="text-xs text-gray-500">{q.topic}</span>
                          <span className="text-xs text-gray-500">{q.points} điểm</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Matrix Mode */}
          {mode === 'MATRIX' && (
            <div>
              <label className="mb-2 block text-sm font-medium">Ma trận độ khó</label>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium text-green-700">Dễ</p>
                  <Input
                    type="number"
                    value={form.easyCount}
                    onChange={(e) => setForm(prev => ({ ...prev, easyCount: Number(e.target.value) }))}
                    min={0}
                  />
                  <p className="mt-1 text-xs text-gray-500">câu hỏi</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium text-yellow-700">Trung bình</p>
                  <Input
                    type="number"
                    value={form.mediumCount}
                    onChange={(e) => setForm(prev => ({ ...prev, mediumCount: Number(e.target.value) }))}
                    min={0}
                  />
                  <p className="mt-1 text-xs text-gray-500">câu hỏi</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium text-red-700">Khó</p>
                  <Input
                    type="number"
                    value={form.hardCount}
                    onChange={(e) => setForm(prev => ({ ...prev, hardCount: Number(e.target.value) }))}
                    min={0}
                  />
                  <p className="mt-1 text-xs text-gray-500">câu hỏi</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Tổng: <strong>{form.easyCount + form.mediumCount + form.hardCount}</strong> câu hỏi sẽ được chọn ngẫu nhiên
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang tạo...' : 'Tạo đề thi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InstructorExamsPage() {
  const { isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await examService.getMyExams(0, 100);
      if (response.code === ResponseCode.SUCCESS) {
        setExams(response.result?.content || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      // Mock data for demo
      setExams([
        { id: '1', title: 'Kiểm tra Java cơ bản', description: 'Kiểm tra kiến thức Java Module 1', duration: 45, passingScore: 70, mode: 'MANUAL', questions: [], totalPoints: 100, isPublished: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), attemptCount: 25, avgScore: 78 },
        { id: '2', title: 'Thi giữa kỳ React', description: 'Bài thi giữa kỳ môn React', duration: 90, passingScore: 60, mode: 'MATRIX', questions: [], totalPoints: 150, isPublished: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), attemptCount: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đề thi này?')) return;
    try {
      const response = await examService.delete(examId);
      if (response.code === ResponseCode.SUCCESS) {
        setExams(prev => prev.filter(e => e.id !== examId));
        toast.success('Đã xóa đề thi');
      } else {
        toast.error(response.message || 'Không thể xóa đề thi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa đề thi');
    }
  };

  const togglePublish = async (exam: ExamResponse) => {
    try {
      const response = exam.isPublished 
        ? await examService.unpublish(exam.id)
        : await examService.publish(exam.id);
      
      if (response.code === ResponseCode.SUCCESS) {
        setExams(prev => prev.map(e => e.id === exam.id ? { ...e, isPublished: !e.isPublished } : e));
        toast.success(exam.isPublished ? 'Đã ẩn đề thi' : 'Đã xuất bản đề thi');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách đề thi..." />;

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'published' && exam.isPublished) || (filter === 'draft' && !exam.isPublished);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đề thi</h1>
          <p className="mt-2 text-gray-600">Tạo và quản lý các đề thi</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Tạo đề thi</Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="text" placeholder="Tìm kiếm đề thi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tất cả' : f === 'published' ? 'Đã xuất bản' : 'Nháp'}
            </Button>
          ))}
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <EmptyState icon={FileText} title="Chưa có đề thi nào" description={searchQuery ? 'Không tìm thấy đề thi phù hợp' : 'Bắt đầu tạo đề thi đầu tiên'} action={!searchQuery ? <Button onClick={() => setModalOpen(true)}>Tạo đề thi</Button> : undefined} />
      ) : (
        <div className="space-y-4">
          {filteredExams.map(exam => (
            <Card key={exam.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${exam.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {exam.isPublished ? 'Đã xuất bản' : 'Nháp'}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {exam.mode === 'MANUAL' ? 'Chọn thủ công' : 'Ma trận'}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-500">{exam.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{exam.duration} phút</span>
                      <span>Điểm đạt: {exam.passingScore}%</span>
                      <span>Tổng điểm: {exam.totalPoints}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{exam.attemptCount || 0} lượt thi</span>
                      {exam.avgScore !== undefined && <span>Điểm TB: {exam.avgScore}%</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/instructor/exams/${exam.id}`}>
                      <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />Xem</Button>
                    </Link>
                    <Link href={`/instructor/exams/${exam.id}/edit`}>
                      <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Sửa</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => togglePublish(exam)}>
                      {exam.isPublished ? 'Ẩn' : 'Xuất bản'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(exam.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal tạo đề thi */}
      <ExamModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchExams}
      />
    </div>
  );
}
