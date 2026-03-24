'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Play, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { enrollmentService, EnrollmentResponse } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import { isSuccess } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

export default function StudentCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    if (user?.id) {
      void fetchEnrolledCourses();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const fetchEnrolledCourses = async () => {
    if (!user?.id) return;

    try {
      const response = await enrollmentService.getMyEnrollments(user.id);
      if (!isSuccess(response.code)) {
        setCourses([]);
        return;
      }

      const enrollments = response.result || [];
      const enrichedCourses = await Promise.all(
        enrollments.map(async enrollment => {
          try {
            const courseResponse = await courseService.getById(enrollment.courseId);
            if (isSuccess(courseResponse.code) && courseResponse.result) {
              return {
                ...enrollment,
                courseName: courseResponse.result.title,
                courseImage: courseResponse.result.coverImage,
                progress: Number(enrollment.progressPercent ?? 0),
              };
            }
          } catch (error) {
            console.error(`Không thể tải khóa học ${enrollment.courseId}:`, error);
          }

          return {
            ...enrollment,
            courseName: `Khóa học ${enrollment.courseId}`,
            progress: Number(enrollment.progressPercent ?? 0),
          };
        })
      );

      setCourses(enrichedCourses);
    } catch (error) {
      console.error('Lỗi tải khóa học đã đăng ký:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải khóa học..." />;

  const filteredCourses = courses.filter(course => {
    const progress = Number(course.progress ?? course.progressPercent ?? 0);
    const matchesSearch = (course.courseName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && progress >= 100) ||
      (filter === 'in-progress' && progress < 100);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
          <p className="mt-2 text-gray-600">Tiếp tục học tập từ các khóa học bạn đã đăng ký</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="text" placeholder="Tìm kiếm khóa học..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'in-progress', 'completed'] as const).map(value => (
            <Button key={value} variant={filter === value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(value)}>
              {value === 'all' ? 'Tất cả' : value === 'in-progress' ? 'Đang học' : 'Hoàn thành'}
            </Button>
          ))}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Chưa có khóa học nào"
          description={searchQuery ? 'Không tìm thấy khóa học phù hợp' : 'Bạn chưa đăng ký khóa học nào'}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => {
            const progress = Number(course.progress ?? course.progressPercent ?? 0);
            return (
              <Card key={`${course.courseId}-${course.enrolledAt}`} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-video bg-gray-100">
                  {course.courseImage ? (
                    <img src={course.courseImage} alt={course.courseName || 'Khóa học'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600">
                      <BookOpen className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="secondary" size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Tiếp tục học
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">{course.courseName || course.courseId}</h3>
                  <p className="mb-4 text-xs text-gray-400">Ngày đăng ký: {new Date(course.enrolledAt).toLocaleDateString('vi-VN')}</p>
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-medium text-blue-600">{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <Link href={`/student/courses/${course.courseId}`}>
                    <Button className="w-full" variant={progress >= 100 ? 'outline' : 'default'}>
                      {progress >= 100 ? 'Xem lại khóa học' : 'Tiếp tục học'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
