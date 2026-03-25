'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Flag,
  PlayCircle,
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
import { isSuccess } from '@/types/types';
import { toast } from 'react-hot-toast';

interface ExtendedLesson extends LessonResponse {
  isCompleted?: boolean;
}

interface ExtendedChapter extends ChapterResponse {
  lessons: ExtendedLesson[];
  isExpanded: boolean;
}

export default function LessonLearningPage({ params }: { params: { id: string; lessonId: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [chapters, setChapters] = useState<ExtendedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const syncingLessonsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    void fetchData();
  }, [params.id, params.lessonId, user, authLoading]);

  const fetchData = async () => {
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

      const mapped: ExtendedChapter[] = chapterList.map((chapter, index) => {
        const hasCurrentLesson = lessonResponses[index].some(item => item.id === params.lessonId);
        return {
          ...chapter,
          lessons: lessonResponses[index],
          isExpanded: hasCurrentLesson || index === 0,
        };
      });

      setChapters(mapped);
    } catch (error) {
      console.error('Error loading lesson page:', error);
      toast.error('Có lỗi xảy ra khi tải bài học');
    } finally {
      setLoading(false);
    }
  };

  const flatLessons = useMemo(() => {
    const list: Array<{ chapterId: string; chapterTitle: string; lesson: ExtendedLesson }> = [];
    chapters.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        list.push({ chapterId: chapter.id, chapterTitle: chapter.title, lesson });
      });
    });
    return list;
  }, [chapters]);

  const currentIndex = flatLessons.findIndex(item => item.lesson.id === params.lessonId);
  const currentItem = currentIndex >= 0 ? flatLessons[currentIndex] : null;
  const previousItem = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  const completedLessons = flatLessons.filter(item => item.lesson.isCompleted).length;
  const progressPercent = flatLessons.length === 0 ? 0 : Math.round((completedLessons / flatLessons.length) * 100);

  useEffect(() => {
    if (!user || !currentItem) return;
    if (currentItem.lesson.isCompleted) return;
    if (syncingLessonsRef.current.has(currentItem.lesson.id)) return;

    syncingLessonsRef.current.add(currentItem.lesson.id);
    const timer = setTimeout(() => {
      void markLessonCompleted(currentItem.lesson.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user?.id, currentItem?.lesson.id]);

  if (loading || authLoading) return <PageLoading message="Đang tải bài học..." />;
  if (!course || !currentItem) {
    return (
      <div className="rounded border bg-white p-6">
        <p className="text-gray-600">Không tìm thấy bài học.</p>
        <Button className="mt-4" onClick={() => router.push(`/student/courses/${params.id}`)}>
          Quay lại khóa học
        </Button>
      </div>
    );
  }

  const toggleChapter = (chapterId: string) => {
    setChapters(prev => prev.map(ch => (ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch)));
  };

  const navigateToLesson = async (lessonId: string) => {
    if (lessonId === params.lessonId) return;
    if (currentItem && !currentItem.lesson.isCompleted) {
      await markLessonCompleted(currentItem.lesson.id);
    }
    router.push(`/student/courses/${params.id}/lessons/${lessonId}`);
  };

  const markLessonCompleted = async (lessonId: string) => {
    if (!user) return;
    try {
      const response = await progressService.update({
        userId: user.id,
        courseId: params.id,
        lessonId,
        completed: true,
        lastWatchedSecond: 0,
      });
      if (isSuccess(response.code)) {
        setChapters(prev =>
          prev.map(ch => ({
            ...ch,
            lessons: ch.lessons.map(ls => (ls.id === lessonId ? { ...ls, isCompleted: true } : ls)),
          }))
        );
      }
    } catch (error) {
      console.error('Update progress failed:', error);
    } finally {
      syncingLessonsRef.current.delete(lessonId);
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
          <button className="border-b-2 border-blue-700 pb-3 text-base font-semibold text-blue-800">Khóa học</button>
          <button onClick={() => router.push(`/student/courses/${params.id}`)} className="border-b-2 border-transparent pb-3 text-base text-gray-600">
            Tiến độ
          </button>
          <button onClick={() => router.push(`/student/courses/${params.id}`)} className="border-b-2 border-transparent pb-3 text-base text-gray-600">
            Ngày quan trọng
          </button>
          <button onClick={() => router.push(`/student/courses/${params.id}`)} className="border-b-2 border-transparent pb-3 text-base text-gray-600">
            Thảo luận
          </button>
          <button onClick={() => router.push(`/student/courses/${params.id}`)} className="border-b-2 border-transparent pb-3 text-base text-gray-600">
            Ghi chú
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="rounded border bg-white p-4">
            <p className="text-sm text-gray-500">Tiến độ khóa học</p>
            <p className="text-2xl font-bold text-gray-900">{progressPercent}%</p>
            <p className="mt-1 text-sm text-gray-600">
              {completedLessons}/{flatLessons.length} bài học đã hoàn thành
            </p>
          </div>

          <div className="space-y-3">
            {chapters.map((chapter, chapterIndex) => (
              <div key={chapter.id} className="overflow-hidden rounded border bg-white">
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Circle className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">
                      {chapter.title || `Chương ${chapterIndex + 1}`}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${chapter.isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {chapter.isExpanded && (
                  <div className="border-t bg-gray-50 p-2">
                    {chapter.lessons.length === 0 ? (
                      <div className="rounded border bg-white px-3 py-2 text-sm text-gray-500">Chưa có bài học.</div>
                    ) : (
                      <div className="space-y-2">
                        {chapter.lessons.map(lesson => {
                          const isActive = lesson.id === params.lessonId;
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => {
                                void navigateToLesson(lesson.id);
                              }}
                              className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm ${
                                isActive ? 'border-blue-300 bg-blue-50' : 'bg-white hover:bg-gray-100'
                              }`}
                            >
                              <span className="line-clamp-1 text-gray-700">{lesson.title}</span>
                              {lesson.isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Flag className="h-4 w-4 text-gray-300" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border bg-white p-6">
          <div className="mb-3 text-sm font-medium text-blue-700">{currentItem.chapterTitle}</div>
          <h2 className="text-3xl font-bold text-gray-900">{currentItem.lesson.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>Thời lượng: {currentItem.lesson.duration || 0} phút</span>
            {currentItem.lesson.isCompleted ? (
              <span className="font-medium text-green-700">Đã hoàn thành</span>
            ) : (
              <span>Chưa hoàn thành</span>
            )}
          </div>

          <div className="mt-6 rounded border bg-gray-50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Nội dung bài học</h3>
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
              {currentItem.lesson.content || 'Bài học này chưa có nội dung chi tiết.'}
            </p>
          </div>

          {currentItem.lesson.videoUrl && (
            <div className="mt-6">
              <h3 className="mb-3 text-2xl font-semibold text-gray-900">Video bài học</h3>
              <div className="overflow-hidden rounded border bg-black">
                <video controls className="h-auto w-full" src={currentItem.lesson.videoUrl}>
                  Trình duyệt của bạn không hỗ trợ phát video.
                </video>
              </div>
              <a
                href={currentItem.lesson.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm text-blue-700 hover:underline"
              >
                <PlayCircle className="h-4 w-4" />
                Mở video trong tab mới
              </a>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => {
                if (previousItem) {
                  void navigateToLesson(previousItem.lesson.id);
                } else {
                  router.push(`/student/courses/${params.id}`);
                }
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Trước
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (nextItem) {
                  void navigateToLesson(nextItem.lesson.id);
                } else {
                  router.push(`/student/courses/${params.id}`);
                }
              }}
            >
              Tiếp theo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
