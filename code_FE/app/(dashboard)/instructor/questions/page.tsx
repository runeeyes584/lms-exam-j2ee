'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardList, Search, Plus, Edit, Trash2, Filter, Upload, FileSpreadsheet, X, Check } from 'lucide-react';
import { questionService, QuestionResponse, QuestionCreateRequest } from '@/services/questionService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';
import type { DifficultyLevel, QuestionType } from '@/types/types';

// Modal tạo/sửa câu hỏi
interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editQuestion?: QuestionResponse | null;
}

function QuestionModal({ isOpen, onClose, onSuccess, editQuestion }: QuestionModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    type: QuestionType;
    topic: string;
    difficulty: DifficultyLevel;
    points: number;
    content: string;
    options: { text: string; isCorrect: boolean }[];
  }>({
    type: 'MULTIPLE_CHOICE',
    topic: '',
    difficulty: 'MEDIUM',
    points: 10,
    content: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  });

  useEffect(() => {
    if (editQuestion) {
      setForm({
        type: editQuestion.type,
        topic: editQuestion.topic,
        difficulty: editQuestion.difficulty,
        points: editQuestion.points,
        content: editQuestion.content,
        options: editQuestion.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
      });
    } else {
      setForm({
        type: 'MULTIPLE_CHOICE',
        topic: '',
        difficulty: 'MEDIUM',
        points: 10,
        content: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      });
    }
  }, [editQuestion, isOpen]);

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => {
        if (i === index) {
          return { ...opt, [field]: value };
        }
        // Với single choice, bỏ chọn các option khác
        if (field === 'isCorrect' && value === true && prev.type !== 'MULTIPLE_CHOICE') {
          return { ...opt, isCorrect: false };
        }
        return opt;
      }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.content.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (!form.topic.trim()) {
      toast.error('Vui lòng nhập chủ đề');
      return;
    }
    if (!form.options.some(o => o.isCorrect)) {
      toast.error('Vui lòng chọn ít nhất một đáp án đúng');
      return;
    }
    if (form.options.filter(o => o.text.trim()).length < 2) {
      toast.error('Vui lòng nhập ít nhất 2 đáp án');
      return;
    }

    setSaving(true);
    try {
      const data: QuestionCreateRequest = {
        type: form.type,
        topic: form.topic,
        difficulty: form.difficulty,
        points: form.points,
        content: form.content,
        options: form.options.filter(o => o.text.trim()).map(o => ({
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      };

      let response;
      if (editQuestion) {
        response = await questionService.update(editQuestion.id, data);
      } else {
        response = await questionService.create(data);
      }

      if (response.code === ResponseCode.SUCCESS) {
        toast.success(editQuestion ? 'Đã cập nhật câu hỏi!' : 'Đã tạo câu hỏi mới!');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{editQuestion ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới'}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Loại câu hỏi</label>
              <select
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as QuestionType }))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều lựa chọn</option>
                <option value="TRUE_FALSE">Đúng/Sai</option>
                <option value="FILL_IN">Điền khuyết</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Độ khó</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Chủ đề *</label>
              <Input
                value={form.topic}
                onChange={(e) => setForm(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Ví dụ: Java Basics"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Điểm</label>
              <Input
                type="number"
                value={form.points}
                onChange={(e) => setForm(prev => ({ ...prev, points: Number(e.target.value) }))}
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nội dung câu hỏi *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Đáp án (tick chọn đáp án đúng)</label>
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOptionChange(idx, 'isCorrect', !opt.isCorrect)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 ${
                      opt.isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
                    }`}
                  >
                    {opt.isCorrect && <Check className="h-4 w-4" />}
                  </button>
                  <Input
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                    placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, options: [...prev.options, { text: '', isCorrect: false }] }))}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              + Thêm đáp án
            </button>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : editQuestion ? 'Cập nhật' : 'Tạo câu hỏi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  const { isLoading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [importing, setImporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<QuestionResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await questionService.getMyQuestions(0, 100);
      if (response.code === ResponseCode.SUCCESS) {
        setQuestions(response.result?.content || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Mock data for demo
      setQuestions([
        { id: '1', type: 'MULTIPLE_CHOICE', topic: 'Java Basics', difficulty: 'EASY', points: 10, content: 'Java là ngôn ngữ lập trình gì?', options: [{ id: '1', text: 'Compiled', isCorrect: false }, { id: '2', text: 'Interpreted', isCorrect: false }, { id: '3', text: 'Both', isCorrect: true }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', type: 'TRUE_FALSE', topic: 'React', difficulty: 'MEDIUM', points: 5, content: 'React là một framework?', options: [{ id: '1', text: 'True', isCorrect: false }, { id: '2', text: 'False', isCorrect: true }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '3', type: 'MULTIPLE_CHOICE', topic: 'JavaScript', difficulty: 'HARD', points: 15, content: 'Closures trong JavaScript là gì?', options: [{ id: '1', text: 'Function within function', isCorrect: true }, { id: '2', text: 'Loop', isCorrect: false }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      const response = await questionService.delete(questionId);
      if (response.code === ResponseCode.SUCCESS) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        toast.success('Đã xóa câu hỏi');
      } else {
        toast.error(response.message || 'Không thể xóa câu hỏi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa câu hỏi');
    }
  };

  const handleEdit = (question: QuestionResponse) => {
    setEditQuestion(question);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditQuestion(null);
    setModalOpen(true);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    setImporting(true);
    try {
      const response = await questionService.importFromExcel(file);
      if (response.code === ResponseCode.SUCCESS) {
        const result = response.result;
        toast.success(`Import thành công ${result.successCount}/${result.totalRows} câu hỏi`);
        if (result.failedCount > 0) {
          console.error('Import errors:', result.errors);
        }
        // Refresh list
        fetchQuestions();
      } else {
        toast.error(response.message || 'Import thất bại');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể import file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải ngân hàng câu hỏi..." />;

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase()) || q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchesType = typeFilter === 'all' || q.type === typeFilter;
    return matchesSearch && matchesDifficulty && matchesType;
  });

  const getDifficultyBadge = (difficulty: DifficultyLevel) => {
    const colors: Record<DifficultyLevel, string> = { EASY: 'bg-green-100 text-green-700', MEDIUM: 'bg-yellow-100 text-yellow-700', HARD: 'bg-red-100 text-red-700' };
    const labels: Record<DifficultyLevel, string> = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' };
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[difficulty]}`}>{labels[difficulty]}</span>;
  };

  const getTypeBadge = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = { MULTIPLE_CHOICE: 'Trắc nghiệm', TRUE_FALSE: 'Đúng/Sai', FILL_IN: 'Điền khuyết' };
    return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{labels[type]}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
          <p className="mt-2 text-gray-600">Quản lý tất cả câu hỏi của bạn</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? <Upload className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
            {importing ? 'Đang import...' : 'Import Excel'}
          </Button>
          <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" />Tạo câu hỏi</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input type="text" placeholder="Tìm kiếm câu hỏi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value as DifficultyLevel | 'all')} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="all">Tất cả độ khó</option>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as QuestionType | 'all')} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="all">Tất cả loại</option>
              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
              <option value="TRUE_FALSE">Đúng/Sai</option>
              <option value="FILL_IN">Điền khuyết</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredQuestions.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Chưa có câu hỏi nào" description={searchQuery ? 'Không tìm thấy câu hỏi phù hợp' : 'Bắt đầu tạo câu hỏi đầu tiên'} action={!searchQuery ? <Button onClick={handleCreate}>Tạo câu hỏi</Button> : undefined} />
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-500">#{idx + 1}</span>
                      {getDifficultyBadge(q.difficulty)}
                      {getTypeBadge(q.type)}
                      <span className="text-sm text-gray-500">{q.points} điểm</span>
                      <span className="text-sm text-gray-400">• {q.topic}</span>
                    </div>
                    <p className="text-gray-900 line-clamp-2">{q.content}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {q.options.slice(0, 4).map(opt => (
                        <span key={opt.id} className={`rounded px-2 py-1 text-xs ${opt.isCorrect ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {opt.text.substring(0, 30)}{opt.text.length > 30 ? '...' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(q)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
        Tổng cộng: <strong>{filteredQuestions.length}</strong> câu hỏi
      </div>

      {/* Modal tạo/sửa câu hỏi */}
      <QuestionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditQuestion(null); }}
        onSuccess={fetchQuestions}
        editQuestion={editQuestion}
      />
    </div>
  );
}
