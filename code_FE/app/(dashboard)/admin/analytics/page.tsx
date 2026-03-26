'use client';

import { useEffect, useState } from 'react';
import { Activity, Award, BarChart3, BookOpen, Calendar, DollarSign, FileText, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, analyticsService, DashboardStats } from '@/services';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface AnalyticsStats extends DashboardStats {
  totalOrders: number;
  totalReviews: number;
  recentActivity: { label: string; users: number; revenue: number }[];
}

const extractList = <T,>(result: any): T[] => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.content)) return result.content;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

export default function AdminAnalyticsPage() {
  const { isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    void fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const year = new Date().getFullYear();
      const [dashboardResponse, usersResponse, newUsersResponse, revenueResponse] = await Promise.all([
        analyticsService.getDashboard(),
        adminService.getAllUsers(0, 1000),
        analyticsService.getNewUsers(year),
        analyticsService.getRevenue(year),
      ]);

      const users = isSuccess(usersResponse.code) ? extractList<any>(usersResponse.result) : [];
      const newUsers = isSuccess(newUsersResponse.code) ? extractList<any>(newUsersResponse.result) : [];
      const revenue = isSuccess(revenueResponse.code) ? extractList<any>(revenueResponse.result) : [];
      const dashboardData: any = isSuccess(dashboardResponse.code) ? dashboardResponse.result || {} : {};

      const revenueMap = new Map(
        revenue.map((item: any) => [String(item?._id?.month ?? item?.month ?? ''), Number(item?.totalRevenue ?? item?.revenue ?? 0)])
      );

      setStats({
        ...dashboardData,
        totalUsers: Number(dashboardData.totalUsers ?? users.length),
        totalStudents: users.filter(user => user.role === 'STUDENT').length,
        totalInstructors: users.filter(user => user.role === 'INSTRUCTOR').length,
        totalCourses: Number(dashboardData.totalCourses ?? 0),
        totalExams: Number(dashboardData.totalExams ?? 0),
        totalAttempts: Number(dashboardData.totalAttempts ?? dashboardData.totalOrders ?? 0),
        totalRevenue: Number(dashboardData.totalRevenue ?? 0),
        newUsersThisMonth: Number(dashboardData.newUsersThisMonth ?? 0),
        activeUsersThisWeek: Number(dashboardData.activeUsersThisWeek ?? 0),
        totalOrders: Number(dashboardData.totalOrders ?? 0),
        totalReviews: Number(dashboardData.totalReviews ?? 0),
        recentActivity: newUsers.map((item: any) => {
          const month = String(item?._id?.month ?? item?.month ?? '');
          return {
            label: month ? `Tháng ${month}` : 'Không rõ',
            users: Number(item?.newUsers ?? item?.count ?? 0),
            revenue: Number(revenueMap.get(month) ?? 0),
          };
        }),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải thống kê..." />;
  if (!stats) {
    return <EmptyState icon={BarChart3} title="Không tải được thống kê" description="Không nhận được dữ liệu phù hợp từ backend." />;
  }

  const totalUsers = Number(stats.totalUsers ?? 0);
  const totalStudents = Number(stats.totalStudents ?? 0);
  const totalInstructors = Number(stats.totalInstructors ?? 0);
  const totalCourses = Number(stats.totalCourses ?? 0);
  const totalOrders = Number(stats.totalOrders ?? 0);
  const totalAttempts = Number(stats.totalAttempts ?? 0);
  const totalReviews = Number(stats.totalReviews ?? 0);
  const totalRevenue = Number(stats.totalRevenue ?? 0);

  const statCards = [
    { title: 'Tổng người dùng', value: totalUsers.toLocaleString('vi-VN'), icon: Users, color: 'bg-blue-100 text-blue-600' },
    { title: 'Học viên', value: totalStudents.toLocaleString('vi-VN'), icon: Users, color: 'bg-green-100 text-green-600' },
    { title: 'Giảng viên', value: totalInstructors.toLocaleString('vi-VN'), icon: Award, color: 'bg-purple-100 text-purple-600' },
    { title: 'Khóa học', value: totalCourses.toLocaleString('vi-VN'), icon: BookOpen, color: 'bg-orange-100 text-orange-600' },
    { title: 'Đơn hàng', value: totalOrders.toLocaleString('vi-VN'), icon: FileText, color: 'bg-red-100 text-red-600' },
    { title: 'Lượt thi/đơn', value: totalAttempts.toLocaleString('vi-VN'), icon: Activity, color: 'bg-indigo-100 text-indigo-600' },
    { title: 'Đánh giá', value: totalReviews.toLocaleString('vi-VN'), icon: TrendingUp, color: 'bg-teal-100 text-teal-600' },
    { title: 'Doanh thu', value: `${(totalRevenue / 1000000).toFixed(0)}M`, icon: DollarSign, color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="mt-2 text-gray-600">Trang này hiển thị dữ liệu thực tế từ API backend.</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map(value => (
            <Button key={value} variant={period === value ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(value)}>
              {value === 'week' ? '7 ngày' : value === 'month' ? '30 ngày' : '1 năm'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className={`inline-flex rounded-lg p-2 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có dữ liệu hoạt động.</p>
              ) : (
                stats.recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600"><Users className="mr-1 inline h-3 w-3" />{item.users} người dùng mới</span>
                      <span className="text-green-600"><DollarSign className="mr-1 inline h-3 w-3" />{item.revenue.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Phân bố người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Học viên', value: totalStudents, total: totalUsers || 1, color: 'bg-green-500' },
                { label: 'Giảng viên', value: totalInstructors, total: totalUsers || 1, color: 'bg-blue-500' },
                { label: 'Admin', value: Math.max(totalUsers - totalStudents - totalInstructors, 0), total: totalUsers || 1, color: 'bg-purple-500' },
              ].map((item, index) => {
                const percentage = Math.round((item.value / item.total) * 100);
                return (
                  <div key={index}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{item.value} ({percentage}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className={`h-full ${item.color} transition-all`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Thống kê nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-600">Tỷ lệ review/truy cập</p>
              <p className="mt-1 text-3xl font-bold text-blue-700">{totalAttempts > 0 ? Math.round((totalReviews / totalAttempts) * 100) : 0}%</p>
              <p className="mt-1 text-xs text-blue-500">Tính theo reviews và attempts/orders hiện có</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-600">Tổng khóa học</p>
              <p className="mt-1 text-xl font-bold text-green-700">{totalCourses.toLocaleString('vi-VN')}</p>
              <p className="mt-1 text-xs text-green-500">Giá trị backend trả về</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm font-medium text-purple-600">Người dùng hoạt động tuần này</p>
              <p className="mt-1 text-xl font-bold text-purple-700">{Number(stats.activeUsersThisWeek ?? 0).toLocaleString('vi-VN')}</p>
              <p className="mt-1 text-xs text-purple-500">Nếu backend chưa tính sẽ là 0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
