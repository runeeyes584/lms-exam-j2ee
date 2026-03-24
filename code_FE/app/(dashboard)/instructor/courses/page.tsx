'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderOpen, Search, Plus, Edit, Trash2, Eye, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { courseService, CourseResponse } from '@/services/courseService';
import { isSuccess } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'react-hot-toast';

export default function InstructorCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const fetchCourses = async () => {
    if (!user?.id) return;
    try {
      const response = await courseService.getMyCourses(user.id);
      if (isSuccess(response.code)) {
        setCourses(response.result || []);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    try {
      const response = await courseService.delete(courseId);
      if (isSuccess(response.code)) {
        setCourses(prev => prev.filter(course => course.id !== courseId));
        toast.success('Đã xóa khóa học');
      } else {
        toast.error(response.message || 'Không thể xóa khóa học');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa khóa học');
    }
  };

  if (authLoading || loading) {
    return <PageLoading message="Đang tải khóa học..." />;
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="mt-2 text-gray-600">Hiển thị đúng dữ liệu khóa học từ API backend</p>
        </div>
        <Link href="/instructor/courses/create">
          <Button><Plus className="mr-2 h-4 w-4" />Tạo khóa học</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Chưa có khóa học nào"
          description={searchQuery ? 'Không tìm thấy khóa học phù hợp' : 'Backend chưa trả về khóa học nào cho giảng viên hiện tại'}
          action={!searchQuery ? <Link href="/instructor/courses/create"><Button>Tạo khóa học</Button></Link> : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredCourses.map(course => (
            <Card key={course.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${course.isDeleted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {course.isDeleted ? 'Đã xóa mềm' : 'Đang hoạt động'}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Giá: {Number(course.price || 0).toLocaleString('vi-VN')}đ</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />GV: {course.instructorId}</span>
                      <span>Cập nhật: {new Date(course.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/instructor/courses/${course.id}`}>
                      <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />Xem</Button>
                    </Link>
                    <Link href={`/instructor/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Sửa</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(course.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
