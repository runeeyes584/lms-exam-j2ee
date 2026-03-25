'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { courseService, CourseResponse } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { isSuccess } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'react-hot-toast';

export default function CourseCatalogPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) setLoading(false);
      return;
    }
    void loadData();
  }, [user?.id, authLoading]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [courseRes, enrollRes] = await Promise.all([
        courseService.getAll(),
        enrollmentService.getMyEnrollments(user.id),
      ]);

      const allCourses = isSuccess(courseRes.code) ? (courseRes.result || []) : [];
      const enrolled = isSuccess(enrollRes.code) ? (enrollRes.result || []) : [];

      // Backend hiện tại chưa có cờ publish cho course, chỉ có soft-delete.
      // Vì vậy catalog nên hiển thị tất cả course chưa bị xóa mềm.
      setCourses(allCourses.filter(course => !course.isDeleted));
      setEnrolledCourseIds(new Set(enrolled.map(item => item.courseId)));
    } catch (error) {
      console.error('Error loading catalog:', error);
      toast.error('Không thể tải kho khóa học');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const keyword = search.trim().toLowerCase();
      const inKeyword =
        !keyword ||
        course.title.toLowerCase().includes(keyword) ||
        (course.description || '').toLowerCase().includes(keyword) ||
        (course.tags || []).some(tag => tag.toLowerCase().includes(keyword));

      const isFree = Number(course.price || 0) <= 0;
      const inPrice = priceFilter === 'all' || (priceFilter === 'free' && isFree) || (priceFilter === 'paid' && !isFree);

      return inKeyword && inPrice;
    });
  }, [courses, search, priceFilter]);

  const handleEnroll = async (courseId: string) => {
    if (!user?.id) return;
    setEnrollingId(courseId);
    try {
      const response = await enrollmentService.enroll({ userId: user.id, courseId });
      if (isSuccess(response.code)) {
        setEnrolledCourseIds(prev => new Set(prev).add(courseId));
        toast.success('Đăng ký khóa học thành công');
      } else {
        toast.error(response.message || 'Không thể đăng ký khóa học');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể đăng ký khóa học');
    } finally {
      setEnrollingId(null);
    }
  };

  if (authLoading || loading) {
    return <PageLoading message="Đang tải kho khóa học..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kho khóa học</h1>
          <p className="mt-2 text-gray-600">Khám phá và đăng ký học các khóa học đang mở</p>
        </div>
        <Link href="/student/courses">
          <Button variant="outline">Khóa học đã đăng ký</Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Tìm theo tên, mô tả, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
          className="h-10 rounded-md border border-gray-300 px-3 text-sm"
        >
          <option value="all">Tất cả mức giá</option>
          <option value="free">Miễn phí</option>
          <option value="paid">Trả phí</option>
        </select>
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Không có khóa học phù hợp"
          description="Thử từ khóa khác hoặc đổi bộ lọc."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            const isFree = Number(course.price || 0) <= 0;
            return (
              <Card key={course.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100">
                  {course.coverImage ? (
                    <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600">
                      <BookOpen className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-3 p-4">
                  <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="line-clamp-2 text-sm text-gray-600">{course.description || 'Chưa có mô tả khóa học.'}</p>
                  <div className="flex flex-wrap gap-2">
                    {(course.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {isFree ? 'Miễn phí' : `${Number(course.price || 0).toLocaleString('vi-VN')}đ`}
                    </span>
                    {isEnrolled ? (
                      <Link href={`/student/courses/${course.id}`}>
                        <Button size="sm" variant="outline">Vào học</Button>
                      </Link>
                    ) : isFree ? (
                      <Button size="sm" onClick={() => handleEnroll(course.id)} disabled={enrollingId === course.id}>
                        {enrollingId === course.id ? 'Đang đăng ký...' : 'Đăng ký học'}
                      </Button>
                    ) : (
                      <Link href={`/student/courses/${course.id}/checkout`}>
                        <Button size="sm">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Đăng ký
                        </Button>
                      </Link>
                    )}
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
