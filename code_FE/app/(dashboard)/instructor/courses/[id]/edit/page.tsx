'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { ArrowLeft, Plus, X, Trash2, GripVertical, ChevronDown, ChevronRight, Save, ExternalLink, Upload, FileText, Video } from 'lucide-react';
import Link from 'next/link';
import { courseService, CourseRequest, chapterService, ChapterRequest, ChapterResponse, lessonService, LessonRequest, LessonResponse } from '@/services/courseService';
import { mediaService, MediaResourceResponse } from '@/services/mediaService';
import { isSuccess } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ChapterWithLessons extends ChapterResponse {
  lessons: LessonResponse[];
}

export default function EditCoursePage() {
  const params = useParams();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'content'>('info');
  const [tagInput, setTagInput] = useState('');

  // Course info form
  const [form, setForm] = useState<CourseRequest>({
    title: '',
    description: '',
    price: 0,
    tags: [],
    coverImage: '',
    isPublished: false,
  });

  // Chapters & Lessons
  const [chapters, setChapters] = useState<ChapterWithLessons[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // New chapter form
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterDesc, setNewChapterDesc] = useState('');

  // New lesson form per chapter
  const [newLessonForms, setNewLessonForms] = useState<Record<string, { title: string; content: string; videoUrl: string; duration: number }>>({});
  const [showNewLesson, setShowNewLesson] = useState<string | null>(null);
  const [lessonMedia, setLessonMedia] = useState<Record<string, MediaResourceResponse[]>>({});
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
  const [draggingChapterId, setDraggingChapterId] = useState<string | null>(null);
  const [draggingLesson, setDraggingLesson] = useState<{ chapterId: string; lessonId: string } | null>(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const courseResponse = await courseService.getById(courseId);
      if (isSuccess(courseResponse.code) && courseResponse.result) {
        const c = courseResponse.result;
        setForm({
          title: c.title,
          description: c.description,
          price: c.price,
          tags: c.tags || [],
          coverImage: c.coverImage || '',
          isPublished: c.isPublished,
          instructorId: c.instructorId,
        });

        // Fetch chapters + lessons
        try {
          const chaptersResponse = await chapterService.getByCourse(courseId);
          if (isSuccess(chaptersResponse.code) && chaptersResponse.result) {
            const chaptersWithLessons = await Promise.all(
              chaptersResponse.result.map(async (chapter) => {
                try {
                  const lessonsResponse = await lessonService.getByChapter(chapter.id);
                  const lessons = isSuccess(lessonsResponse.code) ? (lessonsResponse.result || []) : [];

                  const mediaEntries = await Promise.all(
                    lessons.map(async lesson => {
                      try {
                        const mediaResponse = await mediaService.getByLesson(lesson.id);
                        return [lesson.id, isSuccess(mediaResponse.code) ? (mediaResponse.result || []) : []] as const;
                      } catch {
                        return [lesson.id, []] as const;
                      }
                    })
                  );
                  setLessonMedia(prev => ({ ...prev, ...Object.fromEntries(mediaEntries) }));

                  return {
                    ...chapter,
                    lessons,
                  };
                } catch {
                  return { ...chapter, lessons: [] };
                }
              })
            );
            setChapters(chaptersWithLessons.sort((a, b) => a.orderIndex - b.orderIndex));
          }
        } catch {
          setChapters([]);
        }
      } else {
        setError('Không tìm thấy khóa học');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu khóa học');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Course Info ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags?.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setForm(prev => ({ ...prev, tags: (prev.tags || []).filter(x => x !== t) }));

  const handleSaveCourse = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      const response = await courseService.update(courseId, {
        ...form,
        instructorId: form.instructorId || user?.id,
      });
      if (isSuccess(response.code)) {
        toast.success('Đã lưu thay đổi');
      } else {
        toast.error(response.message || 'Không thể lưu');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  // --- Handlers: Chapters ---
  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) { toast.error('Vui lòng nhập tên chương'); return; }
    setSaving(true);
    try {
      const data: ChapterRequest = {
        courseId, title: newChapterTitle, description: newChapterDesc, orderIndex: chapters.length,
      };
      const response = await chapterService.create(data);
      if (isSuccess(response.code) && response.result) {
        setChapters(prev => [...prev, { ...response.result, lessons: [] }]);
        toast.success('Đã thêm chương');
      } else {
        toast.error(response.message || 'Không thể thêm chương');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thêm chương');
    } finally {
      setNewChapterTitle('');
      setNewChapterDesc('');
      setShowNewChapter(false);
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Xóa chương này và tất cả bài học bên trong?')) return;
    try {
      await chapterService.delete(chapterId);
    } catch {}
    setChapters(prev => prev.filter(ch => ch.id !== chapterId));
    toast.success('Đã xóa chương');
  };

  // --- Handlers: Lessons ---
  const openNewLessonForm = (chapterId: string) => {
    setShowNewLesson(chapterId);
    setNewLessonForms(prev => ({ ...prev, [chapterId]: { title: '', content: '', videoUrl: '', duration: 0 } }));
    setExpandedChapters(prev => new Set(prev).add(chapterId));
  };

  const handleAddLesson = async (chapterId: string) => {
    const lessonForm = newLessonForms[chapterId];
    if (!lessonForm?.title.trim()) { toast.error('Vui lòng nhập tên bài học'); return; }

    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    setSaving(true);
    try {
      const data: LessonRequest = {
        chapterId, title: lessonForm.title, content: lessonForm.content || undefined,
        videoUrl: lessonForm.videoUrl || undefined, duration: lessonForm.duration || undefined,
        orderIndex: chapter.lessons.length,
      };
      const response = await lessonService.create(data);
      if (isSuccess(response.code) && response.result) {
        setChapters(prev => prev.map(ch =>
          ch.id === chapterId ? { ...ch, lessons: [...ch.lessons, response.result] } : ch
        ));
        setLessonMedia(prev => ({ ...prev, [response.result!.id]: [] }));
        toast.success('Đã thêm bài học');
      } else {
        toast.error(response.message || 'Không thể thêm bài học');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thêm bài học');
    } finally {
      setShowNewLesson(null);
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    if (!confirm('Xóa bài học này?')) return;
    try {
      await lessonService.delete(lessonId);
    } catch {}
    setChapters(prev => prev.map(ch =>
      ch.id === chapterId ? { ...ch, lessons: ch.lessons.filter(l => l.id !== lessonId) } : ch
    ));
    toast.success('Đã xóa bài học');
  };

  const persistChapterOrder = async (orderedChapters: ChapterWithLessons[]) => {
    setSorting(true);
    try {
      await Promise.all(
        orderedChapters.map((chapter, index) =>
          chapterService.update(chapter.id, {
            courseId: chapter.courseId,
            title: chapter.title,
            description: chapter.description,
            orderIndex: index,
          })
        )
      );
      toast.success('Đã cập nhật thứ tự chương');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể lưu thứ tự chương');
      fetchCourseData();
    } finally {
      setSorting(false);
    }
  };

  const persistLessonOrder = async (updatedChapters: ChapterWithLessons[]) => {
    setSorting(true);
    try {
      await Promise.all(
        updatedChapters.flatMap(chapter =>
          chapter.lessons.map((lesson, index) =>
            lessonService.update(lesson.id, {
              chapterId: chapter.id,
              title: lesson.title,
              content: lesson.content,
              videoUrl: lesson.videoUrl,
              duration: lesson.duration,
              orderIndex: index,
            })
          )
        )
      );
      toast.success('Đã cập nhật thứ tự bài học');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể lưu thứ tự bài học');
      fetchCourseData();
    } finally {
      setSorting(false);
    }
  };

  const handleChapterDrop = (targetChapterId: string) => {
    if (!draggingChapterId || draggingChapterId === targetChapterId) {
      setDraggingChapterId(null);
      return;
    }

    let reordered: ChapterWithLessons[] = [];
    setChapters(prev => {
      const sourceIndex = prev.findIndex(ch => ch.id === draggingChapterId);
      const targetIndex = prev.findIndex(ch => ch.id === targetChapterId);
      if (sourceIndex < 0 || targetIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      reordered = next.map((chapter, index) => ({ ...chapter, orderIndex: index }));
      return reordered;
    });

    setDraggingChapterId(null);
    if (reordered.length > 0) {
      void persistChapterOrder(reordered);
    }
  };

  const handleLessonDrop = (targetChapterId: string, targetLessonId: string) => {
    if (!draggingLesson) return;

    let reordered: ChapterWithLessons[] = [];
    setChapters(prev => {
      const sourceChapterIndex = prev.findIndex(ch => ch.id === draggingLesson.chapterId);
      const targetChapterIndex = prev.findIndex(ch => ch.id === targetChapterId);
      if (sourceChapterIndex < 0 || targetChapterIndex < 0) return prev;

      const sourceLessonIndex = prev[sourceChapterIndex].lessons.findIndex(l => l.id === draggingLesson.lessonId);
      const targetLessonIndex = prev[targetChapterIndex].lessons.findIndex(l => l.id === targetLessonId);
      if (sourceLessonIndex < 0 || targetLessonIndex < 0) return prev;

      const next = prev.map(ch => ({ ...ch, lessons: [...ch.lessons] }));
      const [movedLesson] = next[sourceChapterIndex].lessons.splice(sourceLessonIndex, 1);
      const normalizedLesson = { ...movedLesson, chapterId: targetChapterId };
      next[targetChapterIndex].lessons.splice(targetLessonIndex, 0, normalizedLesson);

      reordered = next.map(ch => ({
        ...ch,
        lessons: ch.lessons.map((lesson, index) => ({ ...lesson, orderIndex: index, chapterId: ch.id })),
      }));
      return reordered;
    });

    setDraggingLesson(null);
    if (reordered.length > 0) {
      void persistLessonOrder(reordered);
    }
  };

  const handleLessonDropToEmptyChapter = (targetChapterId: string) => {
    if (!draggingLesson) return;

    let reordered: ChapterWithLessons[] = [];
    setChapters(prev => {
      const sourceChapterIndex = prev.findIndex(ch => ch.id === draggingLesson.chapterId);
      const targetChapterIndex = prev.findIndex(ch => ch.id === targetChapterId);
      if (sourceChapterIndex < 0 || targetChapterIndex < 0) return prev;

      const sourceLessonIndex = prev[sourceChapterIndex].lessons.findIndex(l => l.id === draggingLesson.lessonId);
      if (sourceLessonIndex < 0) return prev;

      const next = prev.map(ch => ({ ...ch, lessons: [...ch.lessons] }));
      const [movedLesson] = next[sourceChapterIndex].lessons.splice(sourceLessonIndex, 1);
      next[targetChapterIndex].lessons.push({ ...movedLesson, chapterId: targetChapterId });

      reordered = next.map(ch => ({
        ...ch,
        lessons: ch.lessons.map((lesson, index) => ({ ...lesson, orderIndex: index, chapterId: ch.id })),
      }));
      return reordered;
    });

    setDraggingLesson(null);
    if (reordered.length > 0) {
      void persistLessonOrder(reordered);
    }
  };

  const handleUploadDocument = async (lessonId: string, file: File) => {
    setUploadingLessonId(lessonId);
    try {
      const response = await mediaService.uploadDocument(lessonId, file);
      if (isSuccess(response.code) && response.result) {
        setLessonMedia(prev => ({ ...prev, [lessonId]: [...(prev[lessonId] || []), response.result] }));
        toast.success('Tải tài liệu thành công');
      } else {
        toast.error(response.message || 'Không thể tải tài liệu');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải tài liệu');
    } finally {
      setUploadingLessonId(null);
    }
  };

  const handleAttachVideo = async (lessonId: string) => {
    const videoUrl = window.prompt('Nhập URL video:');
    if (!videoUrl) return;
    setUploadingLessonId(lessonId);
    try {
      const response = await mediaService.addVideo(lessonId, videoUrl);
      if (isSuccess(response.code) && response.result) {
        setLessonMedia(prev => ({ ...prev, [lessonId]: [...(prev[lessonId] || []), response.result] }));
        toast.success('Đã thêm video');
      } else {
        toast.error(response.message || 'Không thể thêm video');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thêm video');
    } finally {
      setUploadingLessonId(null);
    }
  };

  const handleDeleteMedia = async (lessonId: string, mediaId: string) => {
    try {
      const response = await mediaService.delete(mediaId);
      if (isSuccess(response.code)) {
        setLessonMedia(prev => ({ ...prev, [lessonId]: (prev[lessonId] || []).filter(item => item.id !== mediaId) }));
        toast.success('Đã xóa tài nguyên');
      } else {
        toast.error(response.message || 'Không thể xóa tài nguyên');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa tài nguyên');
    }
  };

  if (loading) return <PageLoading message="Đang tải khóa học..." />;
  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">{error}</p>
          <Link href="/instructor/courses"><Button className="mt-4">Quay lại danh sách</Button></Link>
        </CardContent>
      </Card>
    );
  }

  const tabItems = [
    { id: 'info', label: 'Thông tin cơ bản' },
    { id: 'content', label: 'Nội dung khóa học' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/instructor/courses/${courseId}`}>
            <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Quay lại</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa khóa học</h1>
            <p className="mt-1 text-sm text-gray-500">{form.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/student/courses/${courseId}`}>
            <Button variant="outline"><ExternalLink className="mr-2 h-4 w-4" />Preview</Button>
          </Link>
          <Button onClick={handleSaveCourse} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />{saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          {tabItems.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >{tab.label}</button>
          ))}
        </nav>
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>Cập nhật thông tin chính của khóa học</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Tên khóa học <span className="text-red-500">*</span></label>
                  <Input name="title" value={form.title} onChange={handleChange} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Mô tả <span className="text-red-500">*</span></label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">URL ảnh bìa</label>
                  <Input name="coverImage" value={form.coverImage || ''} onChange={handleChange} placeholder="https://..." />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Nhập tag rồi nhấn Enter..." />
                  <Button type="button" variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
                </div>
                {(form.tags?.length || 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.tags?.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full p-0.5 hover:bg-blue-200"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader><CardTitle>Giá & Trạng thái</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
                  <Input name="price" type="number" value={form.price} onChange={handleChange} min={0} step={10000} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked={form.isPublished}
                      onChange={(e) => setForm(prev => ({ ...prev, isPublished: e.target.checked }))} />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                  <span className="text-sm text-gray-700">{form.isPublished ? 'Đã xuất bản' : 'Nháp'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Content */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{chapters.length} chương • {chapters.reduce((s, c) => s + c.lessons.length, 0)} bài học</p>
            <Button onClick={() => setShowNewChapter(true)} disabled={showNewChapter || sorting}>
              <Plus className="mr-2 h-4 w-4" />Thêm chương
            </Button>
          </div>
          {sorting && <p className="text-sm text-blue-600">Đang lưu thứ tự mới...</p>}

          {/* Chapter list */}
          {chapters.map((chapter, chIdx) => (
            <Card
              key={chapter.id}
              draggable
              onDragStart={() => setDraggingChapterId(chapter.id)}
              onDragEnd={() => setDraggingChapterId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleChapterDrop(chapter.id)}
              className={draggingChapterId === chapter.id ? 'opacity-60' : ''}
            >
              {/* Chapter header */}
              <div className="flex items-center justify-between p-4">
                <button className="flex flex-1 items-center gap-3 text-left" onClick={() => toggleChapter(chapter.id)}>
                  <GripVertical className="h-4 w-4 text-gray-300" />
                  {expandedChapters.has(chapter.id) ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <div>
                    <span className="font-semibold text-gray-900">Chương {chIdx + 1}: {chapter.title}</span>
                    <span className="ml-2 text-sm text-gray-400">({chapter.lessons.length} bài)</span>
                  </div>
                </button>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => openNewLessonForm(chapter.id)} disabled={sorting}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteChapter(chapter.id)} disabled={sorting}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Expanded content */}
              {expandedChapters.has(chapter.id) && (
                <div className="border-t">
                  {[...chapter.lessons].sort((a, b) => a.orderIndex - b.orderIndex).map((lesson, lIdx) => (
                    <div key={lesson.id} className="border-b last:border-0 bg-gray-50 px-6 py-3">
                      <div
                        className="flex items-center justify-between"
                        draggable
                        onDragStart={() => setDraggingLesson({ chapterId: chapter.id, lessonId: lesson.id })}
                        onDragEnd={() => setDraggingLesson(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleLessonDrop(chapter.id, lesson.id)}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-gray-300" />
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-xs font-medium text-blue-700">{lIdx + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                            <div className="flex gap-3 text-xs text-gray-500">
                              {lesson.duration && <span>{lesson.duration} phút</span>}
                              {lesson.videoUrl && <span className="text-blue-500">🎬 Video URL</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              disabled={sorting}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadDocument(lesson.id, file);
                              }}
                            />
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white hover:bg-gray-100">
                              <Upload className="h-4 w-4 text-gray-600" />
                            </span>
                          </label>
                          <Button variant="outline" size="sm" onClick={() => handleAttachVideo(lesson.id)} disabled={sorting}>
                            <Video className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(chapter.id, lesson.id)} disabled={sorting}>
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 rounded-md bg-white p-2">
                        {uploadingLessonId === lesson.id ? (
                          <p className="text-xs text-gray-500">Đang xử lý media...</p>
                        ) : (lessonMedia[lesson.id] || []).length === 0 ? (
                          <p className="text-xs text-gray-400">Chưa có media cho bài học này.</p>
                        ) : (
                          <div className="space-y-1">
                            {(lessonMedia[lesson.id] || []).map(media => (
                              <div key={media.id} className="flex items-center justify-between rounded border px-2 py-1">
                                <div className="flex items-center gap-2 text-xs text-gray-700">
                                  <FileText className="h-3.5 w-3.5" />
                                  <span className="line-clamp-1">{media.fileName || media.url}</span>
                                </div>
                                <button className="text-xs text-red-500 hover:underline" onClick={() => handleDeleteMedia(lesson.id, media.id)}>Xóa</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* New lesson form */}
                  {showNewLesson === chapter.id && (
                    <div className="border-t bg-blue-50 p-4 space-y-3">
                      <p className="text-sm font-medium text-blue-700">Thêm bài học mới</p>
                      <Input
                        placeholder="Tên bài học *"
                        value={newLessonForms[chapter.id]?.title || ''}
                        onChange={(e) => setNewLessonForms(prev => ({ ...prev, [chapter.id]: { ...prev[chapter.id], title: e.target.value } }))}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          placeholder="URL Video (tùy chọn)"
                          value={newLessonForms[chapter.id]?.videoUrl || ''}
                          onChange={(e) => setNewLessonForms(prev => ({ ...prev, [chapter.id]: { ...prev[chapter.id], videoUrl: e.target.value } }))}
                        />
                        <Input
                          type="number"
                          placeholder="Thời lượng (phút)"
                          value={newLessonForms[chapter.id]?.duration || ''}
                          onChange={(e) => setNewLessonForms(prev => ({ ...prev, [chapter.id]: { ...prev[chapter.id], duration: Number(e.target.value) } }))}
                        />
                      </div>
                      <textarea
                        placeholder="Nội dung bài học (tùy chọn)"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={3}
                        value={newLessonForms[chapter.id]?.content || ''}
                        onChange={(e) => setNewLessonForms(prev => ({ ...prev, [chapter.id]: { ...prev[chapter.id], content: e.target.value } }))}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAddLesson(chapter.id)} disabled={saving}>
                          {saving ? 'Đang lưu...' : 'Thêm bài học'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowNewLesson(null)}>Hủy</Button>
                      </div>
                    </div>
                  )}

                  {chapter.lessons.length === 0 && showNewLesson !== chapter.id && (
                    <div
                      className="p-4 text-center text-sm text-gray-400 italic"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleLessonDropToEmptyChapter(chapter.id)}
                    >
                      Chưa có bài học. Nhấn + để thêm hoặc kéo bài học vào đây.
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}

          {/* New chapter form */}
          {showNewChapter && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-medium text-blue-700">Thêm chương mới</p>
                <Input
                  placeholder="Tên chương *"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                />
                <Input
                  placeholder="Mô tả chương (tùy chọn)"
                  value={newChapterDesc}
                  onChange={(e) => setNewChapterDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddChapter} disabled={saving}>
                    {saving ? 'Đang thêm...' : 'Thêm chương'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setShowNewChapter(false); setNewChapterTitle(''); setNewChapterDesc(''); }}>
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {chapters.length === 0 && !showNewChapter && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Chưa có chương nào. Nhấn &quot;Thêm chương&quot; để bắt đầu.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
