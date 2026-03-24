'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { BookOpen, FileText, Award, Users, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { enrollmentService, examService, courseService, analyticsService } from '@/services';
import { ResponseCode } from '@/types/types';

interface DashboardStats {
  courses: number;
  exams: number;
  certificates: number;
  students: number;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ courses: 0, exams: 0, certificates: 0, students: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      if (user?.role === 'STUDENT') {
        // Student stats
        const [enrollments, exams] = await Promise.allSettled([
          enrollmentService.getMyEnrollments(),
          examService.getMyAttempts(),
        ]);
        
        setStats({
          courses: enrollments.status === 'fulfilled' && enrollments.value.code === ResponseCode.SUCCESS 
            ? (enrollments.value.result?.length || 0) : 0,
          exams: exams.status === 'fulfilled' && exams.value.code === ResponseCode.SUCCESS 
            ? (exams.value.result?.length || 0) : 0,
          certificates: 0, // TODO: Implement when API available
          students: 0,
        });
      } else if (user?.role === 'INSTRUCTOR') {
        // Instructor stats
        const [courses, exams] = await Promise.allSettled([
          courseService.getMyCourses(),
          examService.getInstructorExams(),
        ]);
        
        setStats({
          courses: courses.status === 'fulfilled' && courses.value.code === ResponseCode.SUCCESS 
            ? (courses.value.result?.content?.length || 0) : 0,
          exams: exams.status === 'fulfilled' && exams.value.code === ResponseCode.SUCCESS 
            ? (exams.value.result?.content?.length || 0) : 0,
          certificates: 0,
          students: 0, // TODO: Implement when API available
        });
      } else if (user?.role === 'ADMIN') {
        // Admin stats
        const dashboardResponse = await analyticsService.getDashboard();
        if (dashboardResponse.code === ResponseCode.SUCCESS && dashboardResponse.result) {
          setStats({
            courses: dashboardResponse.result.totalCourses || 0,
            exams: dashboardResponse.result.totalExams || 0,
            certificates: 0,
            students: dashboardResponse.result.totalStudents || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h1 className="text-3xl font-bold">
          Chào mừng trở lại, {user.fullName}!
        </h1>
        <p className="mt-2 text-blue-100">
          Vai trò: <span className="font-medium text-white">{getRoleDisplay(user.role)}</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-blue-200 text-sm">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? '...' : stats.courses}</div>
            <p className="text-xs text-muted-foreground">
              {user.role === 'STUDENT' ? 'Đã đăng ký' : 'Đang quản lý'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài thi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? '...' : stats.exams}</div>
            <p className="text-xs text-muted-foreground">
              {user.role === 'STUDENT' ? 'Đã hoàn thành' : 'Đã tạo'}
            </p>
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

      {/* Quick Actions */}
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Các hoạt động mới nhất của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Chưa có hoạt động nào.</p>
        </CardContent>
      </Card>
    </div>
  );
}