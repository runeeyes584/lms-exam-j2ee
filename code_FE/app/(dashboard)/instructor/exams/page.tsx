'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Clock,
  Edit,
  Eye,
  FileText,
  ListChecks,
  Plus,
  Copy,
  Search,
  Shuffle,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { courseService, type CourseResponse } from '@/services/courseService';
import { examService, ExamCreateRequest, ExamGenerateRequest, ExamResponse } from '@/services/examService';
import { attemptService } from '@/services/attemptService';
import { questionService, QuestionResponse } from '@/services/questionService';
import { isSuccess, type DifficultyLevel } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'react-hot-toast';

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  RECOGNIZE: 'Nhận biết',
  UNDERSTAND: 'Thông hiểu',
  APPLY: 'Vận dụng',
  ANALYZE: 'Phân tích',
};

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courses: CourseResponse[];
}

function ExamModal({ isOpen, onClose, onSuccess, courses }: ExamModalProps) {
  const [mode, setMode] = useState<'MANUAL' | 'MATRIX'>('MANUAL');
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: 60,
    passingScore: 60,
    courseId: '',
    recognizeCount: 5,
    understandCount: 10,
    applyCount: 5,
    analyzeCount: 5,
  });

  useEffect(() => {
    if (isOpen) {
      void fetchQuestions();
    }
  }, [isOpen]);

  const getQuestionTopic = (question: QuestionResponse) => question.topic || question.topics?.[0] || '';

  const fetchQuestions = async () => {
    try {
      const response = await questionService.getMyQuestions(0, 200);
      if (isSuccess(response.code)) {
        setQuestions(response.result?.content || []);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(questionId => questionId !== id) : [...prev, id]
    );
  };

  const totalMatrixQuestions =
    form.recognizeCount + form.understandCount + form.applyCount + form.analyzeCount;

  const availableTopics = Array.from(new Set(questions.map(q => getQuestionTopic(q)).filter(Boolean))).sort();
  const filteredTopics = availableTopics.filter(topic => topic.toLowerCase().includes(topicSearch.toLowerCase()));

  const availableByDifficulty = questions.filter(q => selectedTopics.length === 0 || selectedTopics.includes(getQuestionTopic(q)));
  const availableCounts = {
    recognize: availableByDifficulty.filter(q => q.difficulty === 'RECOGNIZE').length,
    understand: availableByDifficulty.filter(q => q.difficulty === 'UNDERSTAND').length,
    apply: availableByDifficulty.filter(q => q.difficulty === 'APPLY').length,
    analyze: availableByDifficulty.filter(q => q.difficulty === 'ANALYZE').length,
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => (prev.includes(topic) ? prev.filter(item => item !== topic) : [...prev, topic]));
  };

  const resetForm = () => {
    setMode('MANUAL');
    setForm({
      title: '',
      description: '',
      duration: 60,
      passingScore: 60,
      courseId: '',
      recognizeCount: 5,
      understandCount: 10,
      applyCount: 5,
      analyzeCount: 5,
    });
    setSelectedQuestions([]);
    setSearchQuery('');
    setTopicSearch('');
    setSelectedTopics([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên đề thi');
      return;
    }

    if (!form.courseId) {
      toast.error('Vui lòng chọn khóa học áp dụng');
      return;
    }

    if (mode === 'MANUAL' && selectedQuestions.length === 0) {
      toast.error('Vui lòng chọn ít nhất một câu hỏi');
      return;
    }

    if (mode === 'MATRIX' && totalMatrixQuestions <= 0) {
      toast.error('Vui lòng nhập số lượng câu hỏi cho ma trận');
      return;
    }

    if (mode === 'MATRIX' && selectedTopics.length === 0) {
      toast.error('Vui lòng nhập ít nhất một chủ đề');
      return;
    }

    if (mode === 'MATRIX') {
      if (form.recognizeCount > availableCounts.recognize) {
        toast.error(`Số câu Nhận biết vượt quá ngân hàng (${availableCounts.recognize})`);
        return;
      }
      if (form.understandCount > availableCounts.understand) {
        toast.error(`Số câu Thông hiểu vượt quá ngân hàng (${availableCounts.understand})`);
        return;
      }
      if (form.applyCount > availableCounts.apply) {
        toast.error(`Số câu Vận dụng vượt quá ngân hàng (${availableCounts.apply})`);
        return;
      }
      if (form.analyzeCount > availableCounts.analyze) {
        toast.error(`Số câu Phân tích vượt quá ngân hàng (${availableCounts.analyze})`);
        return;
      }
    }

    setSaving(true);
    try {
      const response =
        mode === 'MANUAL'
          ? await examService.create({
              title: form.title,
              description: form.description,
              duration: form.duration,
              passingScore: form.passingScore,
              mode: 'MANUAL',
              questionIds: selectedQuestions,
              courseId: form.courseId || undefined,
            } satisfies ExamCreateRequest)
          : await examService.generate({
              title: form.title,
              description: form.description,
              duration: form.duration,
              passingScore: form.passingScore,
              courseId: form.courseId || undefined,
              topics: selectedTopics,
              difficultyMatrix: {
                recognize: form.recognizeCount,
                understand: form.understandCount,
                apply: form.applyCount,
                analyze: form.analyzeCount,
              },
            } satisfies ExamGenerateRequest);

      if (isSuccess(response.code)) {
        toast.success('Tạo đề thi thành công');
        resetForm();
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

  const filteredQuestions = questions.filter(question => {
    const keyword = searchQuery.toLowerCase();
    return (
      question.content.toLowerCase().includes(keyword) ||
      getQuestionTopic(question).toLowerCase().includes(keyword)
    );
  });

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    if (difficulty === 'RECOGNIZE') return 'bg-slate-100 text-slate-700';
    if (difficulty === 'UNDERSTAND') return 'bg-blue-100 text-blue-700';
    if (difficulty === 'APPLY') return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Tạo đề thi mới</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <p className="text-xs text-gray-500">Tự động chọn theo phân bố backend</p>
              </div>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Tên đề thi *</label>
              <Input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ví dụ: Kiểm tra Java Module 1"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Khóa học áp dụng *</label>
              <select
                value={form.courseId}
                onChange={e => setForm(prev => ({ ...prev, courseId: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Chọn khóa học</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Thời gian (phút)</label>
              <Input
                type="number"
                value={form.duration}
                onChange={e => setForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                min={5}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Điểm đạt (%)</label>
              <Input
                type="number"
                value={form.passingScore}
                onChange={e => setForm(prev => ({ ...prev, passingScore: Number(e.target.value) }))}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Mô tả</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Mô tả ngắn về đề thi..."
            />
          </div>

          {mode === 'MANUAL' && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Chọn câu hỏi ({selectedQuestions.length} đã chọn)
              </label>
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm câu hỏi..."
                className="mb-2"
              />
              <div className="max-h-60 overflow-y-auto rounded-lg border">
                {filteredQuestions.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">Không có câu hỏi nào</p>
                ) : (
                  filteredQuestions.map(question => (
                    <div
                      key={question.id}
                      onClick={() => toggleQuestion(question.id)}
                      className={`flex cursor-pointer items-center gap-3 border-b p-3 last:border-0 hover:bg-gray-50 ${
                        selectedQuestions.includes(question.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          selectedQuestions.includes(question.id)
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedQuestions.includes(question.id) && <Check className="h-3 w-3" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-900">{question.content}</p>
                        <div className="mt-1 flex gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-xs ${getDifficultyColor(question.difficulty)}`}>
                            {DIFFICULTY_LABELS[question.difficulty]}
                          </span>
                          <span className="text-xs text-gray-500">{getQuestionTopic(question)}</span>
                          <span className="text-xs text-gray-500">{question.points} điểm</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {mode === 'MATRIX' && (
            <div>
              <label className="mb-2 block text-sm font-medium">Ma trận độ khó</label>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium text-slate-700">{DIFFICULTY_LABELS.RECOGNIZE}</p>
                  <Input
                    type="number"
                    value={form.recognizeCount}
                    onChange={e => setForm(prev => ({ ...prev, recognizeCount: Number(e.target.value) }))}
                    min={0}
                  />
                  <p className="mt-1 text-xs text-gray-500">tối đa: {availableCounts.recognize}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium text-blue-700">{DIFFICULTY_LABELS.UNDERSTAND}</p>
                  <Input
                    type="number"
                    value={form.understandCount}
                    onChange={e => setForm(prev => ({ ...prev, understandCount: Number(e.target.value) }))}
                    min={0}
                  />
                  <p className="mt-1 text-xs text-gray-500">tối đa: {availableCounts.understand}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium text-amber-700">{DIFFICULTY_LABELS.APPLY}</p>
                  <Input
                    type="number"
                    value={form.applyCount}
                    onChange={e => setForm(prev => ({ ...prev, applyCount: Number(e.target.value) }))}
                    min={0}
                  />
                  <p className="mt-1 text-xs text-gray-500">tối đa: {availableCounts.apply}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium text-rose-700">{DIFFICULTY_LABELS.ANALYZE}</p>
                  <Input
                    type="number"
                    value={form.analyzeCount}
                    onChange={e => setForm(prev => ({ ...prev, analyzeCount: Number(e.target.value) }))}
                    min={0}
                  />
                  <p className="mt-1 text-xs text-gray-500">tối đa: {availableCounts.analyze}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium">Chọn chủ đề từ ngân hàng câu hỏi</label>
                <Input
                  value={topicSearch}
                  onChange={e => setTopicSearch(e.target.value)}
                  placeholder="Tìm chủ đề..."
                />
                <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border p-2">
                  {filteredTopics.length === 0 ? (
                    <p className="text-xs text-gray-500">Không tìm thấy chủ đề</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filteredTopics.map(topic => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            selectedTopics.includes(topic)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedTopics.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600">Đã chọn: {selectedTopics.join(', ')}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Tổng: <strong>{totalMatrixQuestions}</strong> câu hỏi sẽ được chọn ngẫu nhiên
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
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
  const { user, isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      void fetchExams();
    }
  }, [authLoading, user?.id]);

  const fetchExams = async () => {
    try {
      const [examsResponse, coursesResponse] = await Promise.all([
        examService.getMyExams(0, 200),
        courseService.getMyCourses(user?.id || ''),
      ]);

      if (isSuccess(coursesResponse.code)) {
        setCourses(coursesResponse.result || []);
      } else {
        setCourses([]);
      }

      if (!isSuccess(examsResponse.code)) {
        setExams([]);
        return;
      }

      const baseExams = examsResponse.result?.content || [];
      const attemptStats = await Promise.all(
        baseExams.map(async exam => {
          try {
            const attemptsResponse = await attemptService.getByExam(exam.id, 0, 200);
            const attempts = isSuccess(attemptsResponse.code) ? attemptsResponse.result?.content || [] : [];
            const percentages = attempts
              .map(attempt => Number(attempt.percentage ?? 0))
              .filter(score => Number.isFinite(score));

            return [
              exam.id,
              {
                attemptCount: attempts.length,
                avgScore:
                  percentages.length > 0
                    ? Math.round(percentages.reduce((sum, score) => sum + score, 0) / percentages.length)
                    : undefined,
              },
            ] as const;
          } catch (error) {
            console.error(`Error fetching attempts for exam ${exam.id}:`, error);
            return [exam.id, { attemptCount: 0, avgScore: undefined }] as const;
          }
        })
      );

      const statsMap = new Map(attemptStats);
      setExams(
        baseExams.map(exam => ({
          ...exam,
          ...statsMap.get(exam.id),
        }))
      );
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đề thi này?')) return;

    try {
      const response = await examService.delete(examId);
      if (isSuccess(response.code)) {
        setExams(prev => prev.filter(exam => exam.id !== examId));
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

      if (isSuccess(response.code)) {
        setExams(prev =>
          prev.map(item =>
            item.id === exam.id
              ? { ...item, isPublished: !item.isPublished }
              : item
          )
        );
        toast.success(exam.isPublished ? 'Đã ẩn đề thi' : 'Đã xuất bản đề thi');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleCopyExamId = async (examId: string) => {
    try {
      await navigator.clipboard.writeText(examId);
      toast.success(`Đã sao chép mã đề: ${examId}`);
    } catch (error) {
      toast.error('Không thể sao chép mã đề thi');
    }
  };

  if (authLoading || loading) {
    return <PageLoading message="Đang tải danh sách đề thi..." />;
  }

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'published' && exam.isPublished) ||
      (filter === 'draft' && !exam.isPublished);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đề thi</h1>
          <p className="mt-2 text-gray-600">Danh sách và thao tác đề thi đang map trực tiếp với API backend</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đề thi
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm đề thi..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map(value => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'Tất cả' : value === 'published' ? 'Đã xuất bản' : 'Nháp'}
            </Button>
          ))}
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có đề thi nào"
          description={
            searchQuery ? 'Không tìm thấy đề thi phù hợp' : 'Backend chưa trả về đề thi nào cho giảng viên hiện tại'
          }
          action={!searchQuery ? <Button onClick={() => setModalOpen(true)}>Tạo đề thi</Button> : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredExams.map(exam => (
            <Card key={exam.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          exam.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {exam.isPublished ? 'Đã xuất bản' : 'Nháp'}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {exam.mode === 'MANUAL' ? 'Chọn thủ công' : 'Ma trận'}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-500">{exam.description || 'Không có mô tả'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration} phút
                      </span>
                      <span>Điểm đạt: {exam.passingScore}%</span>
                      <span>Tổng điểm: {exam.totalPoints}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {exam.attemptCount || 0} lượt thi
                      </span>
                      {exam.avgScore !== undefined && <span>Điểm TB: {exam.avgScore}%</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/instructor/exams/${exam.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Xem
                      </Button>
                    </Link>
                    <Link href={`/instructor/exams/${exam.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Sửa
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleCopyExamId(exam.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Sao chép mã
                    </Button>
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

      <ExamModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchExams} courses={courses} />
    </div>
  );
}
