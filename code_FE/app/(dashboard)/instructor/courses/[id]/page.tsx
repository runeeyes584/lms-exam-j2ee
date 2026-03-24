'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Users, BookOpen, Clock, Tag, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { courseService, CourseResponse, chapterService, ChapterResponse, lessonService, LessonResponse } from '@/services/courseService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [chapters, setChapters] = useState<(ChapterResponse & { lessons: LessonResponse[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'students'>('overview');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const courseResponse = await courseService.getById(courseId);
      if (courseResponse.code === ResponseCode.SUCCESS && courseResponse.result) {
        setCourse(courseResponse.result);

        // Fetch chapters
        try {
          const chaptersResponse = await chapterService.getByCourse(courseId);
          if (chaptersResponse.code === ResponseCode.SUCCESS && chaptersResponse.result) {
            const chaptersWithLessons = await Promise.all(
              chaptersResponse.result.map(async (chapter) => {
                try {
                  const lessonsResponse = await lessonService.getByChapter(chapter.id);
                  return {
                    ...chapter,
                    lessons: lessonsResponse.code === ResponseCode.SUCCESS ? (lessonsResponse.result || []) : [],
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
        toast.error('Không tìm thấy khóa học');
        router.push('/instructor/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      // Mock data for demo
      setCourse({
        id: courseId,
        title: 'Lập trình Java cơ bản',
        description: 'Khóa học Java từ cơ bản đến nâng cao. Bạn sẽ học được cách xây dựng ứng dụng Java hoàn chỉnh.',
        price: 500000,
        instructorId: '1',
        tags: ['java', 'programming', 'oop'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublished: true,
        enrollmentCount: 25,
        rating: 4.5,
        chaptersCount: 5,
      });
      setChapters([
        {
          id: 'ch1', courseId, title: 'Chương 1: Giới thiệu Java', description: 'Tổng quan về ngôn ngữ Java', orderIndex: 0,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          lessons: [
            { id: 'l1', chapterId: 'ch1', title: 'Bài 1: Java là gì?', content: 'Giới thiệu về Java', orderIndex: 0, duration: 15, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'l2', chapterId: 'ch1', title: 'Bài 2: Cài đặt JDK', content: 'Hướng dẫn cài đặt', orderIndex: 1, duration: 20, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        },
        {
          id: 'ch2', courseId, title: 'Chương 2: Biến và kiểu dữ liệu', description: 'Các kiểu dữ liệu trong Java', orderIndex: 1,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          lessons: [
            { id: 'l3', chapterId: 'ch2', title: 'Bài 3: Kiểu dữ liệu nguyên thủy', orderIndex: 0, duration: 25, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!course) return;
    try {
      const response = await courseService.update(course.id, {
        ...course,
        isPublished: !course.isPublished,
      });
      if (response.code === ResponseCode.SUCCESS) {
        setCourse(prev => prev ? { ...prev, isPublished: !prev.isPublished } : prev);
        toast.success(course.isPublished ? 'Đã ẩn khóa học' : 'Đã xuất bản khóa học');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!course || !confirm('Bạn có chắc muốn xóa khóa học này? Hành động này không thể hoàn tác.')) return;
    try {
      const response = await courseService.delete(course.id);
      if (response.code === ResponseCode.SUCCESS) {
        toast.success('Đã xóa khóa học');
        router.push('/instructor/courses');
      } else {
        toast.error(response.message || 'Không thể xóa khóa học');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa khóa học');
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId); else next.add(chapterId);
      return next;
    });
  };

  if (loading) return <PageLoading message="Đang tải khóa học..." />;
  if (!course) return null;

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const totalDuration = chapters.reduce((sum, ch) => sum + ch.lessons.reduce((s, l) => s + (l.duration || 0), 0), 0);

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'content', label: `Nội dung (${chapters.length} chương)` },
    { id: 'students', label: 'Học viên' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/instructor/courses">
            <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Quay lại</Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {course.isPublished ? 'Đã xuất bản' : 'Nháp'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Cập nhật: {new Date(course.updatedAt).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/instructor/courses/${courseId}/edit`}>
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" />Chỉnh sửa</Button>
          </Link>
          <Button variant="outline" onClick={handleTogglePublish}>
            {course.isPublished ? <><EyeOff className="mr-2 h-4 w-4" />Ẩn</> : <><Eye className="mr-2 h-4 w-4" />Xuất bản</>}
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Mô tả khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{course.description}</p>
              </CardContent>
            </Card>

            {course.tags && course.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" />Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">{tag}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Users, label: 'Học viên', value: course.enrollmentCount || 0 },
                  { icon: BookOpen, label: 'Chương', value: chapters.length },
                  { icon: FileText, label: 'Bài học', value: totalLessons },
                  { icon: Clock, label: 'Thời lượng', value: `${totalDuration} phút` },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{stat.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{stat.value}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá</span>
                  <span className="font-medium">{course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')}đ`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày tạo</span>
                  <span className="font-medium">{new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {course.rating !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Đánh giá</span>
                    <span className="font-medium">{course.rating}/5 ⭐</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-4">
          {chapters.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có nội dung</h3>
                <p className="mt-2 text-sm text-gray-500">Bắt đầu thêm chương và bài học cho khóa học này</p>
                <Link href={`/instructor/courses/${courseId}/edit`}>
                  <Button className="mt-4">Thêm nội dung</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            chapters.map((chapter, chIdx) => (
              <Card key={chapter.id}>
                <button
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedChapters.has(chapter.id) ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                    <div>
                      <h3 className="font-semibold text-gray-900">Chương {chIdx + 1}: {chapter.title}</h3>
                      {chapter.description && <p className="mt-0.5 text-sm text-gray-500">{chapter.description}</p>}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{chapter.lessons.length} bài học</span>
                </button>
                {expandedChapters.has(chapter.id) && (
                  <div className="border-t bg-gray-50">
                    {chapter.lessons.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 italic">Chưa có bài học nào</p>
                    ) : (
                      chapter.lessons
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((lesson, lIdx) => (
                          <div key={lesson.id} className="flex items-center justify-between border-b last:border-0 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">{lIdx + 1}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                                {lesson.videoUrl && <p className="text-xs text-blue-500">🎬 Có video</p>}
                              </div>
                            </div>
                            {lesson.duration && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />{lesson.duration} phút
                              </span>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Danh sách học viên</h3>
            <p className="mt-2 text-sm text-gray-500">
              {course.enrollmentCount ? `Có ${course.enrollmentCount} học viên đã đăng ký khóa học này` : 'Chưa có học viên nào đăng ký'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
