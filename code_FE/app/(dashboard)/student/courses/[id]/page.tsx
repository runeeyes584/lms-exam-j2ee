'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flag,
  MessageSquare,
  NotebookPen,
  Plus,
} from 'lucide-react';
import {
  chapterService,
  courseService,
  lessonService,
  type ChapterResponse,
  type CourseResponse,
  type LessonResponse,
} from '@/services/courseService';
import { progressService } from '@/services/enrollmentService';
import { certificateService } from '@/services';
import { isSuccess } from '@/types/types';
import { toast } from 'react-hot-toast';

interface ExtendedLesson extends LessonResponse {
  isCompleted?: boolean;
}

interface ExtendedChapter extends ChapterResponse {
  lessons: ExtendedLesson[];
  isExpanded: boolean;
}

interface DiscussionItem {
  id: string;
  message: string;
  createdAt: string;
  authorName: string;
}

interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
}

type LearningTab = 'course' | 'progress' | 'important' | 'discussion' | 'notes';
type WeeklyGoal = 'normal' | 'regular' | 'intensive';

const tabs: Array<{ key: LearningTab; label: string }> = [
  { key: 'course', label: 'Khóa học' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'important', label: 'Ngày quan trọng' },
  { key: 'discussion', label: 'Thảo luận' },
  { key: 'notes', label: 'Ghi chú' },
];

const goalOptions: Array<{ key: WeeklyGoal; title: string; subtitle: string; lessonsPerWeek: number }> = [
  { key: 'normal', title: 'Bình thường', subtitle: '1 buổi một tuần', lessonsPerWeek: 1 },
  { key: 'regular', title: 'Thường xuyên', subtitle: '3 buổi một tuần', lessonsPerWeek: 3 },
  { key: 'intensive', title: 'Rất chăm chỉ', subtitle: '5 buổi một tuần', lessonsPerWeek: 5 },
];

export default function CourseLearningPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [chapters, setChapters] = useState<ExtendedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LearningTab>('course');
  const [goal, setGoal] = useState<WeeklyGoal>('normal');

  const [discussionDraft, setDiscussionDraft] = useState('');
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [claimingCertificate, setClaimingCertificate] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    void fetchCourseData();
  }, [params.id, user, authLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const discussionKey = `course-discussion-${params.id}`;
    const noteKey = `course-notes-${params.id}`;
    const goalKey = `course-goal-${params.id}`;

    const rawDiscussions = window.localStorage.getItem(discussionKey);
    const rawNotes = window.localStorage.getItem(noteKey);
    const rawGoal = window.localStorage.getItem(goalKey) as WeeklyGoal | null;

    if (rawDiscussions) {
      try {
        setDiscussions(JSON.parse(rawDiscussions));
      } catch {
        setDiscussions([]);
      }
    }
    if (rawNotes) {
      try {
        setNotes(JSON.parse(rawNotes));
      } catch {
        setNotes([]);
      }
    }
    if (rawGoal && goalOptions.some(item => item.key === rawGoal)) {
      setGoal(rawGoal);
    }
  }, [params.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`course-discussion-${params.id}`, JSON.stringify(discussions));
  }, [discussions, params.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`course-notes-${params.id}`, JSON.stringify(notes));
  }, [notes, params.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`course-goal-${params.id}`, goal);
  }, [goal, params.id]);

  const fetchCourseData = async () => {
    try {
      const courseRes = await courseService.getById(params.id);
      if (!isSuccess(courseRes.code) || !courseRes.result) {
        toast.error('Không tìm thấy khóa học');
        router.push('/student/courses');
        return;
      }
      setCourse(courseRes.result);

      let completedIds: string[] = [];
      try {
        const progressRes = await progressService.get(user!.id, params.id);
        if (isSuccess(progressRes.code) && progressRes.result) {
          if (Array.isArray(progressRes.result.completedLessonIds)) {
            completedIds = progressRes.result.completedLessonIds;
          } else if (Array.isArray(progressRes.result.completedLessons)) {
            completedIds = progressRes.result.completedLessons as string[];
          } else {
            completedIds = [];
          }
        }
      } catch {
        completedIds = [];
      }

      const chapterRes = await chapterService.getByCourse(params.id);
      const chapterList = (chapterRes.result || []).sort((a, b) => a.orderIndex - b.orderIndex);
      const lessonResponses = await Promise.all(
        chapterList.map(async chapter => {
          try {
            const lessonRes = await lessonService.getByChapter(chapter.id);
            if (!isSuccess(lessonRes.code)) return [];
            return (lessonRes.result || [])
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map(lesson => ({
                ...lesson,
                isCompleted: completedIds.includes(lesson.id),
              }));
          } catch {
            return [];
          }
        })
      );

      const mapped: ExtendedChapter[] = chapterList.map((chapter, index) => ({
        ...chapter,
        lessons: lessonResponses[index],
        isExpanded: index === 0,
      }));
      setChapters(mapped);
    } catch (error) {
      console.error('Error fetching learning page:', error);
      toast.error('Có lỗi xảy ra khi tải trang học tập');
    } finally {
      setLoading(false);
    }
  };

  const totalLessons = useMemo(
    () => chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0),
    [chapters]
  );
  const completedLessons = useMemo(
    () =>
      chapters.reduce((sum, chapter) => {
        return sum + chapter.lessons.filter(lesson => lesson.isCompleted).length;
      }, 0),
    [chapters]
  );
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const estimatedFinishDate = useMemo(() => {
    const currentGoal = goalOptions.find(item => item.key === goal)!;
    const remainingLessons = Math.max(totalLessons - completedLessons, 0);
    const neededWeeks = currentGoal.lessonsPerWeek > 0 ? Math.ceil(remainingLessons / currentGoal.lessonsPerWeek) : 0;
    const finish = new Date();
    finish.setDate(finish.getDate() + neededWeeks * 7);
    return finish;
  }, [goal, totalLessons, completedLessons]);

  const chapterProgress = useMemo(() => {
    return chapters.map(chapter => {
      const chapterTotal = chapter.lessons.length;
      const chapterDone = chapter.lessons.filter(item => item.isCompleted).length;
      const percent = chapterTotal === 0 ? 0 : Math.round((chapterDone / chapterTotal) * 100);
      return { chapter, chapterTotal, chapterDone, percent };
    });
  }, [chapters]);

  const importantDateLabel = useMemo(() => {
    const base = course?.updatedAt || new Date().toISOString();
    return new Date(base).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [course?.updatedAt]);

  if (loading || authLoading) return <PageLoading message="Đang tải nội dung học tập..." />;
  if (!course) return null;

  const toggleChapter = (chapterId: string) => {
    setChapters(prev => prev.map(ch => (ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch)));
  };

  const toggleExpandAll = () => {
    const shouldExpand = chapters.some(ch => !ch.isExpanded);
    setChapters(prev => prev.map(ch => ({ ...ch, isExpanded: shouldExpand })));
  };

  const addDiscussion = () => {
    const message = discussionDraft.trim();
    if (!message) return;
    const item: DiscussionItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      createdAt: new Date().toISOString(),
      authorName: user?.fullName || 'Bạn',
    };
    setDiscussions(prev => [item, ...prev]);
    setDiscussionDraft('');
  };

  const addNote = () => {
    const content = noteDraft.trim();
    if (!content) return;
    const item: NoteItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      content,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [item, ...prev]);
    setNoteDraft('');
  };

  const onStartCourse = () => {
    if (totalLessons === 0) {
      toast('Khóa học chưa có bài học để bắt đầu');
      return;
    }
    const firstChapter = chapters.find(item => item.lessons.length > 0);
    const firstLesson = firstChapter?.lessons[0];
    if (firstLesson) {
      router.push(`/student/courses/${params.id}/lessons/${firstLesson.id}`);
    }
  };

  const handleClaimCertificate = async () => {
    if (progressPercent < 100) {
      toast.error('Bạn cần hoàn thành 100% khóa học để nhận chứng chỉ');
      return;
    }

    try {
      setClaimingCertificate(true);
      const response = await certificateService.generate(params.id);
      if (isSuccess(response.code)) {
        toast.success('Đã cấp chứng chỉ thành công');
        router.push('/student/certificates');
      } else {
        toast.error(response.message || 'Không thể cấp chứng chỉ');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cấp chứng chỉ');
    } finally {
      setClaimingCertificate(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="border-b bg-white">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1 pt-1 text-sm text-gray-600">
          <div className="font-medium">Mã khóa học: {course.id}</div>
          <div className="text-right">Hỗ trợ: 2280603218</div>
        </div>
        <h1 className="px-1 text-4xl font-extrabold text-gray-900">{course.title}</h1>
        <div className="mt-6 flex flex-wrap gap-6 px-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 pb-3 text-base transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-700 font-semibold text-blue-800'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
        <div className="space-y-4">
          {activeTab === 'course' && (
            <>
              <div className="rounded border bg-white p-5">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Bắt đầu khóa học của bạn ngay hôm nay</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Đã hoàn thành {completedLessons}/{totalLessons} bài học ({progressPercent}%)
                    </p>
                  </div>
                  <Button
                    onClick={onStartCourse}
                    className="h-11 rounded-none bg-red-600 px-8 text-base font-semibold hover:bg-red-700"
                  >
                    Bắt đầu khóa học
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" className="h-11 rounded-none px-6 text-base" onClick={toggleExpandAll}>
                  {chapters.some(ch => !ch.isExpanded) ? 'Mở rộng tất cả' : 'Thu gọn tất cả'}
                </Button>
              </div>

              <div className="divide-y rounded border bg-white">
                {chapters.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">Khóa học chưa có nội dung bài học.</div>
                ) : (
                  chapters.map((chapter, index) => (
                    <div key={chapter.id}>
                      <button
                        type="button"
                        onClick={() => toggleChapter(chapter.id)}
                        className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <CheckCircle2 className="h-5 w-5 text-gray-400" />
                          <span className="text-2xl font-semibold leading-tight text-gray-900">
                            {chapter.title || `Chương ${index + 1}`}
                          </span>
                        </div>
                        <Plus className={`h-5 w-5 text-gray-500 transition-transform ${chapter.isExpanded ? 'rotate-45' : ''}`} />
                      </button>
                      {chapter.isExpanded && (
                        <div className="border-t bg-gray-50 px-6 py-4">
                          {chapter.lessons.length === 0 ? (
                            <div className="rounded border bg-white px-4 py-3 text-sm text-gray-500">Chưa có bài học.</div>
                          ) : (
                            <div className="space-y-3">
                              {chapter.lessons.map(lesson => (
                                <button
                                  type="button"
                                  key={lesson.id}
                                  onClick={() => router.push(`/student/courses/${params.id}/lessons/${lesson.id}`)}
                                  className="flex w-full items-center justify-between rounded border bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                                >
                                  <div className="text-sm text-gray-700">{lesson.title}</div>
                                  {lesson.isCompleted ? (
                                    <span className="text-xs font-semibold text-green-700">Đã hoàn thành</span>
                                  ) : (
                                    <span className="text-xs text-gray-500">Chưa hoàn thành</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4 rounded border bg-white p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Tiến độ học tập</h2>
                <Button
                  onClick={() => void handleClaimCertificate()}
                  disabled={progressPercent < 100 || claimingCertificate}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {claimingCertificate ? 'Đang cấp...' : 'Nhận chứng chỉ'}
                </Button>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600">Tổng tiến độ</span>
                  <span className="font-semibold text-blue-700">{progressPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full bg-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded border p-4">
                  <p className="text-sm text-gray-500">Bài học</p>
                  <p className="text-2xl font-bold">{totalLessons}</p>
                </div>
                <div className="rounded border p-4">
                  <p className="text-sm text-gray-500">Đã hoàn thành</p>
                  <p className="text-2xl font-bold text-green-700">{completedLessons}</p>
                </div>
                <div className="rounded border p-4">
                  <p className="text-sm text-gray-500">Còn lại</p>
                  <p className="text-2xl font-bold text-orange-600">{Math.max(totalLessons - completedLessons, 0)}</p>
                </div>
              </div>
              <div className="space-y-3">
                {chapterProgress.map(({ chapter, chapterDone, chapterTotal, percent }) => (
                  <div key={chapter.id} className="rounded border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium text-gray-900">{chapter.title}</p>
                      <p className="text-sm text-gray-600">{chapterDone}/{chapterTotal}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full bg-emerald-600 transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'important' && (
            <div className="space-y-4 rounded border bg-white p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Ngày quan trọng của khóa học</h2>
              <div className="space-y-3">
                <div className="rounded border p-4">
                  <p className="text-sm text-gray-500">Ngày tham chiếu cập nhật</p>
                  <p className="text-lg font-semibold">{importantDateLabel}</p>
                </div>
                <div className="rounded border p-4">
                  <p className="text-sm text-gray-500">Ngày dự kiến hoàn thành</p>
                  <p className="text-lg font-semibold">{estimatedFinishDate.toLocaleDateString('vi-VN')}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Theo mục tiêu: {goalOptions.find(item => item.key === goal)?.title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="space-y-4 rounded border bg-white p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Thảo luận khóa học</h2>
              <div className="flex gap-2">
                <Input
                  value={discussionDraft}
                  onChange={e => setDiscussionDraft(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc ý kiến của bạn..."
                />
                <Button onClick={addDiscussion}>Gửi</Button>
              </div>
              <div className="space-y-3">
                {discussions.length === 0 ? (
                  <p className="rounded border border-dashed p-4 text-sm text-gray-500">Chưa có thảo luận nào.</p>
                ) : (
                  discussions.map(item => (
                    <div key={item.id} className="rounded border p-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{item.authorName}</span>
                        <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <p className="text-sm text-gray-800">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4 rounded border bg-white p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Ghi chú cá nhân</h2>
              <textarea
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                rows={4}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Ghi chú của bạn về nội dung đang học..."
              />
              <div className="flex justify-end">
                <Button onClick={addNote}>Lưu ghi chú</Button>
              </div>
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="rounded border border-dashed p-4 text-sm text-gray-500">Bạn chưa có ghi chú nào.</p>
                ) : (
                  notes.map(item => (
                    <div key={item.id} className="rounded border p-4">
                      <div className="mb-2 text-xs text-gray-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                      <p className="whitespace-pre-wrap text-sm text-gray-800">{item.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded border bg-white p-6">
            <h3 className="text-3xl font-semibold text-gray-900">Đặt mục tiêu học tập hằng tuần</h3>
            <p className="mt-2 text-sm text-gray-600">
              Đặt mục tiêu thúc đẩy bạn hoàn thành khóa học. Bạn có thể thay đổi nó sau.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {goalOptions.map(option => (
                <button
                  type="button"
                  key={option.key}
                  onClick={() => setGoal(option.key)}
                  className={`rounded border px-4 py-4 text-left ${
                    goal === option.key ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <Flag className="h-4 w-4" />
                    <span className="font-semibold">{option.title}</span>
                  </div>
                  <p className="text-xs text-gray-500">{option.subtitle}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded border bg-white p-6">
            <h3 className="text-4xl font-semibold text-gray-900">Công cụ Khóa học</h3>
            <button
              onClick={() => setActiveTab('notes')}
              className="mt-3 flex items-center gap-2 text-sm text-blue-700 hover:underline"
            >
              <NotebookPen className="h-4 w-4" />
              Mở ghi chú nhanh
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className="mt-2 flex items-center gap-2 text-sm text-blue-700 hover:underline"
            >
              <MessageSquare className="h-4 w-4" />
              Vào thảo luận
            </button>
          </div>

          <div className="rounded border bg-white p-6">
            <h3 className="text-4xl font-semibold text-gray-900">Ngày quan trọng</h3>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <CalendarDays className="h-4 w-4" />
              <span>{importantDateLabel}</span>
            </div>
            <div className="mt-4 text-sm font-semibold text-gray-900">Dự kiến hoàn thành</div>
            <p className="mt-2 text-sm text-gray-600">{estimatedFinishDate.toLocaleDateString('vi-VN')}</p>
            <button
              className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
              onClick={() => setActiveTab('important')}
            >
              Xem tất cả ngày của khóa học
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded border bg-white p-6">
            <h3 className="text-4xl font-semibold text-gray-900">Tài liệu khóa học</h3>
            {course.description ? (
              <p className="mt-3 text-sm text-gray-600">{course.description}</p>
            ) : (
              <p className="mt-3 text-sm text-gray-500">Chưa có tài liệu bổ sung.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
