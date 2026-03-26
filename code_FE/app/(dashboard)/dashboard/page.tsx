'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoading } from '@/components/ui/loading';
import { BookOpen, FileText, Award, Users, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { enrollmentService, examService, courseService, analyticsService, attemptService, certificateService, adminService } from '@/services';
import { isSuccess } from '@/types/types';

interface DashboardStats {
  courses: number;
  exams: number;
  certificates: number;
  students: number;
}

interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  at: string;
}

const formatRelativeTime = (value?: string): string => {
  if (!value) return 'Không rõ thời gian';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN');
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ courses: 0, exams: 0, certificates: 0, students: 0 });
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      void fetchStats();
    }
  }, [user]);

  const sortRecent = (items: RecentActivityItem[]) =>
    items
      .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime())
      .slice(0, 6);

  const fetchStats = async () => {
    try {
      if (user?.role === 'STUDENT') {
        const [enrollments, exams, certificates] = await Promise.allSettled([
          enrollmentService.getMyEnrollments(user.id),
          attemptService.getMyAttempts(0, 200),
          certificateService.getMyCertificates(),
        ]);

        const activities: RecentActivityItem[] = [];
        const enrollmentList =
          enrollments.status === 'fulfilled' && isSuccess(enrollments.value.code)
            ? (enrollments.value.result || [])
            : [];
        const courseNameMap = new Map<string, string>();

        const missingCourseIds = [
          ...new Set(
            enrollmentList
              .filter((item: any) => !item.courseName && !item.course?.title && !item.title && item.courseId)
              .map((item: any) => item.courseId as string)
          ),
        ];

        if (missingCourseIds.length > 0) {
          const courseLookups = await Promise.allSettled(
            missingCourseIds.map((courseId) => courseService.getById(courseId))
          );

          courseLookups.forEach((lookup, index) => {
            if (lookup.status === 'fulfilled' && isSuccess(lookup.value.code) && lookup.value.result?.title) {
              courseNameMap.set(missingCourseIds[index], lookup.value.result.title);
            }
          });
        }

        if (enrollments.status === 'fulfilled' && isSuccess(enrollments.value.code)) {
          enrollmentList.forEach((item: any, index: number) => {
            const enrolledCourseName =
              item.courseName ||
              item.course?.title ||
              item.title ||
              courseNameMap.get(item.courseId) ||
              'Khóa học mới';

            activities.push({
              id: `enroll-${item.courseId || index}`,
              title: 'Đăng ký khóa học',
              description: enrolledCourseName,
              at: item.lastAccessedAt || item.enrolledAt || '',
            });
          });
        }

        if (exams.status === 'fulfilled' && isSuccess(exams.value.code)) {
          (exams.value.result?.content || []).forEach((item: any, index: number) => {
            activities.push({
              id: `attempt-${item.id || index}`,
              title: 'Hoàn thành bài thi',
              description: item.examTitle || item.exam?.title || 'Bạn đã làm một bài thi',
              at: item.endTime || item.startTime || '',
            });
          });
        }

        if (certificates.status === 'fulfilled' && isSuccess(certificates.value.code)) {
          (certificates.value.result || []).forEach((item: any, index: number) => {
            const certificateTime = item.issuedAt || item.issueDate || item.createdAt || item.updatedAt || '';
            activities.push({
              id: `certificate-${item.id || index}`,
              title: 'Nhận chứng chỉ',
              description: item.courseName || 'Bạn đã nhận chứng chỉ mới',
              at: certificateTime,
            });
          });
        }

        setRecentActivities(sortRecent(activities));

        setStats({
          courses: enrollments.status === 'fulfilled' && isSuccess(enrollments.value.code)
            ? (enrollments.value.result?.length || 0)
            : 0,
          exams: exams.status === 'fulfilled' && isSuccess(exams.value.code)
            ? (exams.value.result?.content?.length || 0)
            : 0,
          certificates: certificates.status === 'fulfilled' && isSuccess(certificates.value.code)
            ? (certificates.value.result?.length || 0)
            : 0,
          students: 0,
        });
      } else if (user?.role === 'INSTRUCTOR') {
        const [courses, exams] = await Promise.allSettled([
          courseService.getMyCourses(user.id),
          examService.getInstructorExams(0, 200),
        ]);

        const activities: RecentActivityItem[] = [];

        if (courses.status === 'fulfilled' && isSuccess(courses.value.code)) {
          (courses.value.result || []).forEach((item: any, index: number) => {
            activities.push({
              id: `course-${item.id || index}`,
              title: 'Cập nhật khóa học',
              description: item.title || 'Bạn đã cập nhật một khóa học',
              at: item.updatedAt || item.createdAt || '',
            });
          });
        }

        if (exams.status === 'fulfilled' && isSuccess(exams.value.code)) {
          (exams.value.result?.content || []).forEach((item: any, index: number) => {
            activities.push({
              id: `exam-${item.id || index}`,
              title: 'Tạo/Cập nhật đề thi',
              description: item.title || 'Bạn đã thao tác với đề thi',
              at: item.updatedAt || item.createdAt || '',
            });
          });
        }

        setRecentActivities(sortRecent(activities));

        setStats({
          courses: courses.status === 'fulfilled' && isSuccess(courses.value.code)
            ? (courses.value.result?.length || 0)
            : 0,
          exams: exams.status === 'fulfilled' && isSuccess(exams.value.code)
            ? (exams.value.result?.content?.length || 0)
            : 0,
          certificates: 0,
          students: 0,
        });
      } else if (user?.role === 'ADMIN') {
        const [dashboardResponse, usersResponse, coursesResponse] = await Promise.allSettled([
          analyticsService.getDashboard(),
          adminService.getAllUsers(0, 1000),
          courseService.getAll(),
        ]);

        const dashboardData =
          dashboardResponse.status === 'fulfilled' && isSuccess(dashboardResponse.value.code)
            ? (dashboardResponse.value.result as any)
            : null;

        const allCourses =
          coursesResponse.status === 'fulfilled' && isSuccess(coursesResponse.value.code)
            ? (coursesResponse.value.result || [])
            : [];

        const users =
          usersResponse.status === 'fulfilled' && isSuccess(usersResponse.value.code)
            ? (usersResponse.value.result?.content || [])
            : [];

        setStats({
          courses: Number(dashboardData?.totalCourses ?? allCourses.length ?? 0),
          exams: Number(dashboardData?.totalExams ?? 0),
          certificates: 0,
          students: Number(dashboardData?.totalStudents ?? users.filter((item: any) => item.role === 'STUDENT').length ?? 0),
        });

        const activities: RecentActivityItem[] = Array.isArray(dashboardData?.recentActivity)
          ? dashboardData.recentActivity.map((item: any, index: number) => ({
              id: `admin-activity-${index}`,
              title: item.label || 'Hoạt động hệ thống',
              description: `Người dùng mới: ${item.users || 0}, Doanh thu: ${(item.revenue || 0).toLocaleString('vi-VN')}đ`,
              at: item.date || item.month || '',
            }))
          : [];

        setRecentActivities(sortRecent(activities));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setRecentActivities([]);
    } finally {
      setLoadingStats(false);
    }
  };

  if (isLoading) {
    return <PageLoading message="Đang tải dashboard..." />;
  }

  if (!user) {
    return null;
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'INSTRUCTOR':
        return 'Giảng viên';
      case 'STUDENT':
        return 'Học viên';
      default:
        return role;
    }
  };

  const getQuickActions = () => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { label: 'Khóa học của tôi', href: '/student/courses', icon: BookOpen },
          { label: 'Kho khóa học', href: '/student/catalog', icon: BookOpen },
          { label: 'Bài thi của tôi', href: '/student/exams', icon: FileText },
          { label: 'Chứng chỉ', href: '/student/certificates', icon: Award },
        ];
      case 'INSTRUCTOR':
        return [
          { label: 'Quản lý khóa học', href: '/instructor/courses', icon: BookOpen },
          { label: 'Ngân hàng câu hỏi', href: '/instructor/questions', icon: FileText },
          { label: 'Quản lý đề thi', href: '/instructor/exams', icon: FileText },
        ];
      case 'ADMIN':
        return [
          { label: 'Quản lý người dùng', href: '/admin/users', icon: Users },
          { label: 'Duyệt giảng viên', href: '/admin/instructor-requests', icon: Award },
          { label: 'Báo cáo & Thống kê', href: '/admin/analytics', icon: TrendingUp },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h1 className="text-3xl font-bold">Chào mừng trở lại, {user.fullName}!</h1>
        <p className="mt-2 text-blue-100">
          Vai trò: <span className="font-medium text-white">{getRoleDisplay(user.role)}</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-blue-200">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? '...' : stats.courses}</div>
            <p className="text-xs text-muted-foreground">{user.role === 'STUDENT' ? 'Đã đăng ký' : 'Đang quản lý'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài thi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? '...' : stats.exams}</div>
            <p className="text-xs text-muted-foreground">{user.role === 'STUDENT' ? 'Đã hoàn thành' : 'Đã tạo'}</p>
          </CardContent>
        </Card>

        {user.role === 'STUDENT' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chứng chỉ</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? '...' : stats.certificates}</div>
              <p className="text-xs text-muted-foreground">Đã đạt được</p>
            </CardContent>
          </Card>
        )}

        {(user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Học viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? '...' : stats.students}</div>
              <p className="text-xs text-muted-foreground">Đang học</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thảo luận</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Bài viết mới</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Các tính năng thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getQuickActions().map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} href={action.href}>
                  <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{action.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Các hoạt động mới nhất của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-gray-600">Chưa có hoạt động nào.</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="rounded-lg border bg-white p-3">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatRelativeTime(activity.at)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
