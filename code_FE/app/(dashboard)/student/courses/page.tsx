'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { BookOpen, Search, Play } from 'lucide-react';
import Link from 'next/link';
import { enrollmentService, EnrollmentResponse } from '@/services/enrollmentService';
import { ResponseCode } from '@/types/types';

export default function StudentCoursesPage() {
  const { isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await enrollmentService.getMyEnrollments();
      if (response.code === ResponseCode.SUCCESS) {
        setCourses(response.result || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Mock data for demo
      setCourses([
        {
          id: '1', userId: '1', courseId: '1', courseName: 'Lập trình Java cơ bản',
          courseImage: '', instructorName: 'Nguyễn Văn A',
          enrolledAt: new Date().toISOString(), progress: 65,
          completedLessons: 13, totalLessons: 20,
        },
        {
          id: '2', userId: '1', courseId: '2', courseName: 'React và NextJS',
          courseImage: '', instructorName: 'Trần Văn B',
          enrolledAt: new Date().toISOString(), progress: 30,
          completedLessons: 6, totalLessons: 20,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải khóa học..." />;

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'completed' && course.progress === 100) || (filter === 'in-progress' && course.progress < 100);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
          <p className="mt-2 text-gray-600">Tiếp tục học tập và phát triển kỹ năng</p>
        </div>
        <Link href="/courses/browse">
          <Button><BookOpen className="mr-2 h-4 w-4" />Khám phá khóa học</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="text" placeholder="Tìm kiếm khóa học..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'in-progress', 'completed'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tất cả' : f === 'in-progress' ? 'Đang học' : 'Hoàn thành'}
            </Button>
          ))}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState icon={BookOpen} title="Chưa có khóa học nào" description={searchQuery ? 'Không tìm thấy khóa học phù hợp' : 'Bạn chưa đăng ký khóa học nào'} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => (
            <Card key={course.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-video bg-gray-100">
                {course.courseImage ? (
                  <img src={course.courseImage} alt={course.courseName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="secondary" size="sm"><Play className="mr-2 h-4 w-4" />Tiếp tục học</Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold text-gray-900 line-clamp-2">{course.courseName}</h3>
                <p className="mb-2 text-sm text-gray-500">Giảng viên: {course.instructorName || 'N/A'}</p>
                <p className="mb-4 text-xs text-gray-400">{course.completedLessons}/{course.totalLessons} bài học</p>
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">Tiến độ</span>
                    <span className="font-medium text-blue-600">{course.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full bg-blue-600 transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
                <Link href={`/student/courses/${course.courseId}`}>
                  <Button className="w-full" variant={course.progress === 100 ? 'outline' : 'default'}>
                    {course.progress === 100 ? 'Xem lại' : 'Tiếp tục học'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
