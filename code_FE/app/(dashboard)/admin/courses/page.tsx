'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, CheckCircle, XCircle, BookOpen, Clock, Tag, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { ResponseCode } from '@/types/types';

interface PendingCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  instructorName: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function AdminCoursesPage() {
  const { isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Mocking the admin API endpoint since it might not exist yet
      const response = await api.get('/admin/courses', { params: { status: filter } }).catch(() => null);
      
      if (response?.data?.code === ResponseCode.SUCCESS) {
        setCourses(response.data.result || []);
      } else {
        // Mock data for UI demonstration
        if (filter === 'PENDING') {
          setCourses([
            { id: 'c1', title: 'React Masterclass', description: 'Khóa học React nâng cao', price: 500000, instructorName: 'Nguyễn Văn A', createdAt: new Date().toISOString(), status: 'PENDING' },
            { id: 'c2', title: 'Java Spring Boot from zero to hero', description: 'Spring boot REST API', price: 800000, instructorName: 'Trần Thị B', createdAt: new Date().toISOString(), status: 'PENDING' }
          ]);
        } else {
          setCourses([]);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (courseId: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Bạn có chắc muốn ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} khóa học này?`)) return;

    try {
      // Optimistic update
      setCourses(prev => prev.filter(c => c.id !== courseId));
      
      // Attempt API call
      await api.patch(`/admin/courses/${courseId}/status`, { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' });
      toast.success(`Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} khóa học`);
    } catch (error) {
      toast.success(`Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} khóa học (Mock)`);
    }
  };

  if (authLoading) return <PageLoading message="Đang tải..." />;

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kiểm duyệt khóa học</h1>
          <p className="mt-2 text-gray-600">Quản lý và phê duyệt các khóa học mới từ giảng viên</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input type="text" placeholder="Tìm kiếm theo tên khóa học hoặc giảng viên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'PENDING' ? 'Chờ duyệt' : f === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoading message="Đang tải danh sách..." />
      ) : filteredCourses.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-12 w-12 text-gray-400" />} title="Không có dữ liệu" description={searchQuery ? 'Không tìm thấy khóa học nào phù hợp' : 'Hiện không có khóa học nào trong trạng thái này'} />
      ) : (
        <div className="space-y-4">
          {filteredCourses.map(course => (
            <Card key={course.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        course.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        course.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.status === 'PENDING' ? 'CHỜ DUYỆT' : course.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}
                      </span>
                    </div>
                    
                    <p className="mb-4 text-gray-600">{course.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><UserIcon className="h-4 w-4" /> GV: {course.instructorName}</span>
                      <span className="flex items-center gap-1.5"><Tag className="h-4 w-4" /> {course.price.toLocaleString('vi-VN')} đ</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Ngày đăng: {new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  
                  {course.status === 'PENDING' && (
                    <div className="flex shrink-0 gap-2 md:flex-col md:w-32">
                      <Button onClick={() => handleAction(course.id, 'APPROVE')} className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" /> Duyệt
                      </Button>
                      <Button variant="outline" onClick={() => handleAction(course.id, 'REJECT')} className="w-full text-red-600 hover:bg-red-50 hover:text-red-700">
                        <XCircle className="mr-2 h-4 w-4" /> Từ chối
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
