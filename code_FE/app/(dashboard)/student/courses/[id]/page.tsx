'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageLoading } from '@/components/ui/loading';
import StarRating from '@/components/ui/star-rating';
import { useAuth } from '@/contexts/AuthContext';
import { certificateService, commentService, reviewService, type ReviewStats, type ReviewViewModel } from '@/services';
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
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Flag,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Plus,
    Star,
    Trash2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  userId: string;
  parentId?: string;
  parentName?: string;
  content: string;
  createdAt: string;
  authorName: string;
  replies: DiscussionItem[];
}

type LearningTab = 'course' | 'progress' | 'important' | 'discussion' | 'review';
type WeeklyGoal = 'normal' | 'regular' | 'intensive';

const tabs: Array<{ key: LearningTab; label: string }> = [
  { key: 'course', label: 'Khóa học' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'important', label: 'Ngày quan trọng' },
  { key: 'discussion', label: 'Thảo luận' },
  { key: 'review', label: 'Đánh giá' },
];

const goalOptions: Array<{ key: WeeklyGoal; title: string; subtitle: string; lessonsPerWeek: number }> = [
  { key: 'normal', title: 'Bình thường', subtitle: '1 buổi một tuần', lessonsPerWeek: 1 },
  { key: 'regular', title: 'Thường xuyên', subtitle: '3 buổi một tuần', lessonsPerWeek: 3 },
  { key: 'intensive', title: 'Rất chăm chỉ', subtitle: '5 buổi một tuần', lessonsPerWeek: 5 },
];

export default function CourseLearningPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [chapters, setChapters] = useState<ExtendedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LearningTab>('course');
  const [goal, setGoal] = useState<WeeklyGoal>('normal');

  const [discussionDraft, setDiscussionDraft] = useState('');
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteTargetComment, setDeleteTargetComment] = useState<DiscussionItem | null>(null);
  const [claimingCertificate, setClaimingCertificate] = useState(false);
  const targetCommentId = searchParams.get('commentId');

  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<ReviewViewModel[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [userReview, setUserReview] = useState<ReviewViewModel | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [isDeleteReviewModalOpen, setIsDeleteReviewModalOpen] = useState(false);

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
    const goalKey = `course-goal-${params.id}`;

    const rawGoal = window.localStorage.getItem(goalKey) as WeeklyGoal | null;

    if (rawGoal && goalOptions.some(item => item.key === rawGoal)) {
      setGoal(rawGoal);
    }
  }, [params.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`course-goal-${params.id}`, goal);
  }, [goal, params.id]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'discussion') {
      setActiveTab('discussion');
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== 'discussion' || !user?.id) return;
    void fetchDiscussionsFromApi(user.id);
  }, [activeTab, params.id, user?.id]);

  useEffect(() => {
    if (activeTab !== 'review' || !user?.id) return;
    void fetchReviewData(user.id);
  }, [activeTab, params.id, user?.id]);

  useEffect(() => {
    if (activeTab !== 'discussion' || !targetCommentId || discussions.length === 0) return;
    const element = document.getElementById(`discussion-${targetCommentId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeTab, targetCommentId, discussions]);

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

      if (user?.id) {
        await fetchDiscussionsFromApi(user.id);
      }
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

  async function fetchDiscussionsFromApi(userId: string) {
    try {
      const response = await commentService.getByCourse(params.id, undefined, 0, 50);
      if (!isSuccess(response.code)) {
        setDiscussions([]);
        return;
      }
      const mapComment = (comment: any, parentName?: string): DiscussionItem => ({
        id: comment.id,
        userId: comment.userId,
        parentId: comment.parentId,
        parentName,
        content: comment.content || '',
        createdAt: comment.createdAt,
        authorName: comment.userName || (comment.userId === userId ? user?.fullName || 'B?n' : '?n danh'),
        replies: [],
      });

      const topLevelComments = (response.result?.content || [])
        .filter((comment) => !comment.parentId)
        .map(mapComment);

      const repliesResult = await Promise.allSettled(
        topLevelComments.map((comment) => commentService.getReplies(comment.id))
      );

      const mapped: DiscussionItem[] = topLevelComments.map((comment, index) => {
        const replyRes = repliesResult[index];
        const replies =
          replyRes.status === 'fulfilled' && isSuccess(replyRes.value.code)
            ? (replyRes.value.result || []).map(reply => mapComment(reply, comment.authorName)).sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              )
            : [];

        return { ...comment, replies };
      });

      setDiscussions(mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
    }
  }

  async function fetchReviewData(userId: string) {
    setReviewLoading(true);
    try {
      const [statsRes, reviewsRes] = await Promise.all([
        reviewService.getStats(params.id),
        reviewService.getByCourseMapped(params.id, 0, 50),
      ]);

      const list = isSuccess(reviewsRes.code) ? (reviewsRes.result?.content || []) : [];
      const stats = isSuccess(statsRes.code) ? statsRes.result : null;
      const distribution = list.reduce(
        (acc, item) => {
          const key = Math.min(5, Math.max(1, Math.round(item.rating))) as 1 | 2 | 3 | 4 | 5;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
      );

      const normalizedStats: ReviewStats | null = stats
        ? {
            ...stats,
            ratingDistribution: distribution,
          }
        : list.length > 0
          ? {
              averageRating:
                list.reduce((sum, item) => sum + Number(item.rating || 0), 0) / list.length,
              totalReviews: list.length,
              ratingDistribution: distribution,
            }
          : null;

      setReviewStats(normalizedStats);
      setReviews(list);

      const mine = list.find(item => item.user?.id === userId) || null;
      setUserReview(mine);
      setReviewRating(mine?.rating ?? 0);
      setReviewComment(mine?.comment ?? '');
      setIsEditingReview(false);
    } catch (error) {
      console.error('Error fetching review data:', error);
      setReviewStats(null);
      setReviews([]);
      setUserReview(null);
    } finally {
      setReviewLoading(false);
    }
  }

  const handleSubmitReview = async () => {
    if (!user?.id) return;
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Vui lòng chọn số sao từ 1 đến 5');
      return;
    }

    setReviewSaving(true);
    try {
      const payload = {
        courseId: params.id,
        userId: user.id,
        userName: user.fullName,
        userAvatar: user.avatarUrl,
        rating: reviewRating,
        comment: reviewComment.trim(),
      };

      const response = userReview
        ? await reviewService.update(userReview.id, user.id, reviewRating, reviewComment.trim())
        : await reviewService.create(payload);

      if (!isSuccess(response.code)) {
        toast.error(response.message || 'Không thể gửi đánh giá');
        return;
      }

      toast.success(userReview ? 'Đã cập nhật đánh giá' : 'Đã gửi đánh giá');
      await fetchReviewData(user.id);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setReviewSaving(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user?.id || !userReview) return;

    try {
      const response = await reviewService.delete(userReview.id, user.id);
      if (!isSuccess(response.code)) {
        toast.error(response.message || 'Không thể xóa đánh giá');
        return;
      }
      toast.success('Đã xóa đánh giá');
      setIsDeleteReviewModalOpen(false);
      await fetchReviewData(user.id);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa đánh giá');
    }
  };

  const addDiscussion = async () => {
    const content = discussionDraft.trim();
    if (!content || !user?.id) return;

    try {
      const response = await commentService.create({
        courseId: params.id,
        userId: user.id,
        userName: user.fullName,
        content,
      });

      if (!isSuccess(response.code)) {
        toast.error(response.message || 'Không thể gửi thảo luận');
        return;
      }

      setDiscussionDraft('');
      await fetchDiscussionsFromApi(user.id);
      toast.success('Đã gửi thảo luận');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể gửi thảo luận');
    }
  };

  const addReply = async (parentId: string) => {
    const content = replyDraft.trim();
    if (!content || !user?.id) return;

    try {
      const response = await commentService.create({
        courseId: params.id,
        parentId,
        userId: user.id,
        userName: user.fullName,
        content,
      });

      if (!isSuccess(response.code)) {
        toast.error(response.message || 'Không thể gửi phản hồi');
        return;
      }

      setReplyDraft('');
      setReplyTargetId(null);
      await fetchDiscussionsFromApi(user.id);
      toast.success('Đã gửi phản hồi');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể gửi phản hồi');
    }
  };

  const startEditComment = (item: DiscussionItem) => {
    setReplyTargetId(null);
    setEditingCommentId(item.id);
    setEditingContent(item.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const saveEditComment = async (item: DiscussionItem) => {
    if (!user?.id) return;
    const content = editingContent.trim();
    if (!content) {
      toast.error('Nội dung không được để trống');
      return;
    }

    try {
      const response = await commentService.update(item.id, user.id, content);
      if (!isSuccess(response.code)) {
        toast.error(response.message || 'Không thể cập nhật bình luận');
        return;
      }

      cancelEditComment();
      await fetchDiscussionsFromApi(user.id);
      toast.success('Đã cập nhật bình luận');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật bình luận');
    }
  };

  const requestDeleteComment = (item: DiscussionItem) => {
    setDeleteTargetComment(item);
  };

  const confirmDeleteComment = async () => {
    const item = deleteTargetComment;
    if (!item) return;
    if (!user?.id) return;
    let loadingToastId: string | undefined;

    try {
      loadingToastId = toast.loading('Đang xóa bình luận...');
      const response = await commentService.delete(item.id, user.id);
      if (!isSuccess(response.code)) {
        toast.dismiss(loadingToastId);
        toast.error(response.message || 'Không thể xóa bình luận');
        return;
      }

      if (editingCommentId === item.id) {
        cancelEditComment();
      }
      await fetchDiscussionsFromApi(user.id);
      toast.dismiss(loadingToastId);
      toast.success('Đã xóa bình luận');
      setDeleteTargetComment(null);
    } catch (error: any) {
      if (loadingToastId) toast.dismiss(loadingToastId);
      toast.error(error?.response?.data?.message || 'Không thể xóa bình luận');
    }
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
                <textarea
                  value={discussionDraft}
                  onChange={e => setDiscussionDraft(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Nhập câu hỏi hoặc ý kiến của bạn..."
                />
                <Button onClick={addDiscussion}>Gửi</Button>
              </div>
              <div className="space-y-3">
                {discussions.length === 0 ? (
                  <p className="rounded border border-dashed p-4 text-sm text-gray-500">Chưa có thảo luận nào.</p>
                ) : (
                  discussions.map(item => (
                    <div
                      id={`discussion-${item.id}`}
                      key={item.id}
                      className={`group rounded border p-4 ${
                        targetCommentId === item.id ? 'border-blue-400 bg-blue-50/40 shadow-sm' : ''
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{item.authorName}</span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                          {user?.id === item.userId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="rounded p-1 text-gray-500 opacity-0 hover:bg-gray-100 hover:text-gray-700 focus:opacity-100 group-hover:opacity-100"
                                  aria-label="Tùy chọn bình luận"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => startEditComment(item)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => requestDeleteComment(item)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      {editingCommentId === item.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => void saveEditComment(item)}>Lưu</Button>
                            <Button size="sm" variant="outline" onClick={cancelEditComment}>Hủy</Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.content}</p>
                      )}

                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <button
                          type="button"
                          className="font-medium text-blue-700 hover:underline"
                          onClick={() => setReplyTargetId(prev => (prev === item.id ? null : item.id))}
                        >
                          Phản hồi
                        </button>
                        <span className="text-gray-500">{item.replies.length} phản hồi</span>
                      </div>

                      {replyTargetId === item.id && (
                        <div className="mt-3 flex gap-2">
                          <div className="flex-1">
                            <div className="mb-1 text-xs text-gray-500">
                              Đang trả lời <span className="font-medium text-gray-700">{item.authorName}</span>
                            </div>
                            <textarea
                              value={replyDraft}
                              onChange={e => setReplyDraft(e.target.value)}
                              rows={2}
                              className="w-full rounded-md border px-3 py-2 text-sm"
                              placeholder="Nhập phản hồi của bạn..."
                            />
                          </div>
                          <Button onClick={() => addReply(item.id)}>Gửi</Button>
                        </div>
                      )}

                      {item.replies.length > 0 && (
                        <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3">
                          {item.replies.map(reply => (
                            <div key={reply.id} className="group rounded border bg-gray-50 p-3">
                              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                <span>{reply.authorName}</span>
                                <div className="flex items-center gap-2">
                                  <span>{new Date(reply.createdAt).toLocaleString('vi-VN')}</span>
                                  {user?.id === reply.userId && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          type="button"
                                          className="rounded p-1 text-gray-500 opacity-0 hover:bg-gray-200 hover:text-gray-700 focus:opacity-100 group-hover:opacity-100"
                                          aria-label="Tùy chọn phản hồi"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => startEditComment(reply)}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => requestDeleteComment(reply)}>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Xóa
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </div>
                              {reply.parentName && (
                                <div className="mb-1 text-xs text-gray-500">
                                  Trả lời <span className="font-medium text-gray-700">{reply.parentName}</span>
                                </div>
                              )}
                              {editingCommentId === reply.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editingContent}
                                    onChange={e => setEditingContent(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => void saveEditComment(reply)}>Lưu</Button>
                                    <Button size="sm" variant="outline" onClick={cancelEditComment}>Hủy</Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-5 rounded border bg-white p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Đánh giá khóa học</h2>
                  <p className="mt-1 text-sm text-gray-600">Chia sẻ trải nghiệm học tập của bạn.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>
                    {Number(reviewStats?.averageRating ?? 0).toFixed(1)} / 5 ({reviewStats?.totalReviews ?? reviews.length} đánh giá)
                  </span>
                </div>
              </div>

              {reviewLoading ? (
                <p className="text-sm text-gray-500">Đang tải đánh giá...</p>
              ) : (
                <div className="space-y-4">
                  <div className="group rounded border p-4">
                    <h3 className="text-base font-semibold text-gray-800">Tổng hợp đánh giá</h3>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="text-3xl font-bold text-gray-900">
                        {Number(reviewStats?.averageRating ?? 0).toFixed(1)}
                      </div>
                      <StarRating value={Number(reviewStats?.averageRating ?? 0)} readOnly />
                      <span className="text-sm text-gray-500">
                        {reviewStats?.totalReviews ?? reviews.length} lượt đánh giá
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      {[5, 4, 3, 2, 1].map(level => {
                        const total = reviewStats?.totalReviews ?? reviews.length;
                        const count = reviewStats?.ratingDistribution?.[level as 1 | 2 | 3 | 4 | 5] ?? 0;
                        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={level} className="flex items-center gap-2">
                            <span className="w-6 text-right">{level}</span>
                            <Star className="h-3 w-3 text-yellow-500" />
                            <div className="h-2 flex-1 rounded-full bg-gray-200">
                              <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="w-10 text-right text-xs">{percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="group rounded border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">Đánh giá của bạn</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {userReview
                            ? 'Bạn đã đánh giá khóa học này.'
                            : 'Hãy cho chúng tôi biết cảm nhận của bạn.'}
                        </p>
                      </div>
                      {userReview && !isEditingReview && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-1 text-gray-500 opacity-0 transition group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-700 focus-visible:opacity-100"
                              aria-label="Tùy chọn đánh giá"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditingReview(true)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setIsDeleteReviewModalOpen(true)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {userReview && !isEditingReview ? (
                      <div className="group mt-3 rounded-md border bg-gray-50 p-3">
                        <div className="flex items-center gap-2">
                          <StarRating value={reviewRating} readOnly />
                          <span className="text-sm text-gray-600">{reviewRating}/5</span>
                        </div>
                        {reviewComment ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{reviewComment}</p>
                        ) : (
                          <p className="mt-2 text-sm italic text-gray-500">Bạn chưa để lại bình luận.</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <StarRating value={reviewRating} onChange={setReviewRating} readOnly={false} />
                            <span className="text-sm text-gray-600">{reviewRating}/5</span>
                          </div>
                          <textarea
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="Nhận xét của bạn..."
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button onClick={handleSubmitReview} disabled={reviewSaving}>
                            {reviewSaving ? 'Đang lưu...' : userReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                          </Button>
                          {userReview && isEditingReview && (
                            <Button variant="outline" onClick={() => setIsEditingReview(false)}>
                              Hủy chỉnh sửa
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {isDeleteReviewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                  <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa đánh giá</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Bạn có chắc muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDeleteReviewModalOpen(false)}>
                        Hủy
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteReview}>
                        Xóa đánh giá
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="rounded border border-dashed p-4 text-sm text-gray-500">Chưa có đánh giá nào.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="rounded border p-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">{review.user.fullName || 'An danh'}</span>
                        <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <StarRating value={review.rating} readOnly />
                        <span className="text-xs text-gray-500">{review.rating}/5</span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                      )}
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
              onClick={() => setActiveTab('discussion')}
              className="mt-3 flex items-center gap-2 text-sm text-blue-700 hover:underline"
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

      {deleteTargetComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border bg-white p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa bình luận</h3>
            <p className="mt-2 text-sm text-gray-600">
              Bạn có chắc muốn xóa bình luận này không? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTargetComment(null)}>
                Hủy
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => void confirmDeleteComment()}>
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






