'use client';

import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { useAuth } from '@/contexts/AuthContext';
import { commentService, courseService, enrollmentService, type DiscussionViewModel } from '@/services';
import { isSuccess } from '@/types/types';
import { ChevronRight, Clock3, Filter, MessageCircle, MessageSquare, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface CourseFilterItem {
  id: string;
  name: string;
}

export default function DiscussionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  const [discussions, setDiscussions] = useState<DiscussionViewModel[]>([]);
  const [courseFilters, setCourseFilters] = useState<CourseFilterItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    const courseIdFromQuery = searchParams.get('courseId');
    setSelectedCourseId(courseIdFromQuery || 'all');
  }, [user?.id, searchParams]);

  useEffect(() => {
    void fetchDiscussions();
  }, [user?.id, selectedCourseId]);

  const fetchDiscussions = async () => {
    try {
      if (!user?.id) {
        setDiscussions([]);
        setCourseFilters([]);
        return;
      }

      setLoading(true);

      const enrollmentsResponse = await enrollmentService.getMyEnrollments(user.id);
      const enrollments = isSuccess(enrollmentsResponse.code) ? (enrollmentsResponse.result || []) : [];

      const enrolledCourseIds = [...new Set(enrollments.map((item) => item.courseId).filter(Boolean))];
      if (enrolledCourseIds.length === 0) {
        setDiscussions([]);
        setCourseFilters([]);
        return;
      }

      const courseNameMap: Record<string, string> = {};
      enrollments.forEach((item) => {
        if (item.courseId && item.courseName) {
          courseNameMap[item.courseId] = item.courseName;
        }
      });

      const missingNameCourseIds = enrolledCourseIds.filter((id) => !courseNameMap[id]);
      if (missingNameCourseIds.length > 0) {
        const nameLookups = await Promise.allSettled(missingNameCourseIds.map((id) => courseService.getById(id)));
        nameLookups.forEach((lookup, index) => {
          if (lookup.status === 'fulfilled' && isSuccess(lookup.value.code) && lookup.value.result?.title) {
            courseNameMap[missingNameCourseIds[index]] = lookup.value.result.title;
          }
        });
      }

      setCourseFilters(
        enrolledCourseIds.map((id) => ({
          id,
          name: courseNameMap[id] || 'Khóa học',
        }))
      );

      const targetCourseIds =
        selectedCourseId !== 'all' && enrolledCourseIds.includes(selectedCourseId)
          ? [selectedCourseId]
          : enrolledCourseIds;

      const responses = await Promise.allSettled(
        targetCourseIds.map((courseId) =>
          commentService.getByCourseMapped(courseId, courseNameMap, undefined, 0, 30)
        )
      );

      const merged: DiscussionViewModel[] = [];
      responses.forEach((res) => {
        if (res.status === 'fulfilled' && isSuccess(res.value.code)) {
          merged.push(...(res.value.result?.content || []));
        }
      });

      const uniqueById = new Map<string, DiscussionViewModel>();
      merged.forEach((item) => {
        if (!uniqueById.has(item.id)) uniqueById.set(item.id, item);
      });

      const sorted = [...uniqueById.values()].sort(
        (a, b) => new Date(b.lastReplyAt || b.createdAt).getTime() - new Date(a.lastReplyAt || a.createdAt).getTime()
      );

      const withReplyCount = await Promise.all(
        sorted.map(async (item) => {
          try {
            const repliesResponse = await commentService.getReplies(item.id);
            const repliesCount =
              isSuccess(repliesResponse.code) && Array.isArray(repliesResponse.result)
                ? repliesResponse.result.length
                : item.replyCount;
            return { ...item, replyCount: repliesCount };
          } catch {
            return item;
          }
        })
      );

      setDiscussions(withReplyCount);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
      setCourseFilters([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscussions = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return discussions;

    return discussions.filter((item) => {
      const fullText = `${item.title} ${item.content} ${item.courseName || ''} ${item.author.fullName}`.toLowerCase();
      return fullText.includes(keyword);
    });
  }, [discussions, searchQuery]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Không rõ thời gian';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  if (authLoading || loading) return <PageLoading message="Đang tải thảo luận..." />;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thảo luận</h1>
            <p className="mt-2 text-gray-600">Trao đổi và học hỏi cùng cộng đồng theo từng khóa học</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {filteredDiscussions.length} bài viết đang hiển thị
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm theo nội dung, tác giả, khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-500"
            >
              <option value="all">Tất cả khóa học đã đăng ký</option>
              {courseFilters.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredDiscussions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Chưa có thảo luận nào"
          description={searchQuery ? 'Không tìm thấy thảo luận phù hợp bộ lọc hiện tại.' : 'Hãy bắt đầu thảo luận trong khóa học của bạn.'}
        />
      ) : (
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => {
            const courseHref = discussion.courseId
              ? `/student/courses/${discussion.courseId}?tab=discussion&commentId=${discussion.id}`
              : '/student/courses';

            return (
              <Link key={discussion.id} href={courseHref}>
                <Card className="border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-semibold text-blue-700">
                        {discussion.author.fullName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {discussion.author.fullName}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {formatTimeAgo(discussion.lastReplyAt || discussion.createdAt)}
                          </span>
                          {discussion.courseName && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {discussion.courseName}
                            </span>
                          )}
                        </div>

                        <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                          {discussion.title}
                        </h3>

                        {discussion.content && (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{discussion.content}</p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {discussion.replyCount} phản hồi
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
