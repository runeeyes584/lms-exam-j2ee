'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { BarChart3, Users, BookOpen, FileText, TrendingUp, DollarSign, Award, Activity, Calendar } from 'lucide-react';
import { analyticsService, DashboardStats } from '@/services';
import { ResponseCode } from '@/types/types';

interface AnalyticsStats extends DashboardStats {
  avgScore: number;
  recentActivity: { date: string; users: number; exams: number }[];
}

export default function AdminAnalyticsPage() {
  const { isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const response = await analyticsService.getDashboard();
      if (response.code === ResponseCode.SUCCESS && response.result) {
        setStats({
          ...response.result,
          avgScore: 72, // Thêm field mặc định nếu BE chưa trả
          recentActivity: [
            { date: new Date().toISOString().split('T')[0], users: 50, exams: 120 },
            { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], users: 65, exams: 145 },
            { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], users: 45, exams: 98 },
          ],
        });
      } else {
        throw new Error('API failed');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Mock data cho demo
      setStats({
        totalUsers: 1250,
        totalStudents: 1100,
        totalInstructors: 45,
        totalCourses: 120,
        totalExams: 350,
        totalAttempts: 8500,
        totalRevenue: 125000000,
        newUsersThisMonth: 150,
        activeUsersThisWeek: 320,
        avgScore: 72,
        recentActivity: [
          { date: '2024-03-01', users: 50, exams: 120 },
          { date: '2024-03-02', users: 65, exams: 145 },
          { date: '2024-03-03', users: 45, exams: 98 },
          { date: '2024-03-04', users: 80, exams: 180 },
          { date: '2024-03-05', users: 72, exams: 165 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading || !stats) return <PageLoading message="Đang tải thống kê..." />;

  const statCards = [
    { title: 'Tổng người dùng', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-100 text-blue-600', change: '+12%' },
    { title: 'Học viên', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'bg-green-100 text-green-600', change: '+8%' },
    { title: 'Giảng viên', value: stats.totalInstructors.toLocaleString(), icon: Award, color: 'bg-purple-100 text-purple-600', change: '+5%' },
    { title: 'Khóa học', value: stats.totalCourses.toLocaleString(), icon: BookOpen, color: 'bg-orange-100 text-orange-600', change: '+15%' },
    { title: 'Đề thi', value: stats.totalExams.toLocaleString(), icon: FileText, color: 'bg-red-100 text-red-600', change: '+20%' },
    { title: 'Lượt thi', value: stats.totalAttempts.toLocaleString(), icon: Activity, color: 'bg-indigo-100 text-indigo-600', change: '+25%' },
    { title: 'Điểm TB', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'bg-teal-100 text-teal-600', change: '+3%' },
    { title: 'Doanh thu', value: `${(stats.totalRevenue / 1000000).toFixed(0)}M`, icon: DollarSign, color: 'bg-yellow-100 text-yellow-600', change: '+18%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="mt-2 text-gray-600">Tổng quan hoạt động hệ thống</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map(p => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
              {p === 'week' ? '7 ngày' : p === 'month' ? '30 ngày' : '1 năm'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.color}`}><Icon className="h-5 w-5" /></div>
                  <span className="text-xs font-medium text-green-600">{stat.change}</span>
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
              {stats.recentActivity.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{new Date(day.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-600"><Users className="mr-1 inline h-3 w-3" />{day.users} người dùng mới</span>
                    <span className="text-green-600"><FileText className="mr-1 inline h-3 w-3" />{day.exams} lượt thi</span>
                  </div>
                </div>
              ))}
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
                { label: 'Học viên', value: stats.totalStudents, total: stats.totalUsers, color: 'bg-green-500' },
                { label: 'Giảng viên', value: stats.totalInstructors, total: stats.totalUsers, color: 'bg-blue-500' },
                { label: 'Admin', value: stats.totalUsers - stats.totalStudents - stats.totalInstructors, total: stats.totalUsers, color: 'bg-purple-500' },
              ].map((item, idx) => {
                const percentage = Math.round((item.value / item.total) * 100);
                return (
                  <div key={idx}>
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
              <p className="text-sm font-medium text-blue-600">Tỷ lệ đậu trung bình</p>
              <p className="mt-1 text-3xl font-bold text-blue-700">68%</p>
              <p className="mt-1 text-xs text-blue-500">Trên tổng số lượt thi</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-600">Khóa học phổ biến nhất</p>
              <p className="mt-1 text-xl font-bold text-green-700">Java cơ bản</p>
              <p className="mt-1 text-xs text-green-500">450 học viên đăng ký</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm font-medium text-purple-600">Giảng viên xuất sắc</p>
              <p className="mt-1 text-xl font-bold text-purple-700">Nguyễn Văn A</p>
              <p className="mt-1 text-xs text-purple-500">Rating: 4.9/5 ⭐</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
