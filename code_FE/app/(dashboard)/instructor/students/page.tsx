'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, Search, Mail, BookOpen, Award, TrendingUp, Filter } from 'lucide-react';
import api from '@/lib/api';
import { ResponseCode, type User } from '@/types/types';

interface StudentWithStats extends User {
  enrolledCourses: number;
  completedExams: number;
  avgScore: number;
  lastActive?: string;
}

export default function InstructorStudentsPage() {
  const { isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'activity'>('name');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // TODO: Khi BE có endpoint /v1/instructor/students, sử dụng:
      // const response = await api.get('/v1/instructor/students');
      // if (response.data.code === ResponseCode.SUCCESS) setStudents(response.data.result || []);
      
      // Mock data cho demo
      setStudents([
        { id: '1', email: 'student1@test.com', fullName: 'Nguyễn Văn A', role: 'STUDENT', enrolledCourses: 3, completedExams: 5, avgScore: 85, lastActive: new Date().toISOString() },
        { id: '2', email: 'student2@test.com', fullName: 'Trần Thị B', role: 'STUDENT', enrolledCourses: 2, completedExams: 3, avgScore: 72, lastActive: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', email: 'student3@test.com', fullName: 'Lê Văn C', role: 'STUDENT', enrolledCourses: 4, completedExams: 8, avgScore: 91, lastActive: new Date(Date.now() - 172800000).toISOString() },
      ]);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách học viên..." />;

  const filteredStudents = students
    .filter(s => s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score') return b.avgScore - a.avgScore;
      if (sortBy === 'activity') return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
      return a.fullName.localeCompare(b.fullName);
    });

  const stats = {
    total: students.length,
    avgScore: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / students.length) : 0,
    active: students.filter(s => s.lastActive && new Date(s.lastActive) > new Date(Date.now() - 7 * 86400000)).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Học viên của tôi</h1>
        <p className="mt-2 text-gray-600">Quản lý và theo dõi tiến độ học viên</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2"><Users className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Tổng học viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2"><TrendingUp className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
                <p className="text-sm text-gray-500">Điểm trung bình</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2"><Award className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">Hoạt động tuần này</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Tìm kiếm & Sắp xếp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input type="text" placeholder="Tìm kiếm học viên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="name">Sắp xếp: Tên</option>
              <option value="score">Sắp xếp: Điểm TB</option>
              <option value="activity">Sắp xếp: Hoạt động</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 ? (
        <EmptyState icon={Users} title="Không tìm thấy học viên" description="Không có học viên nào phù hợp với tìm kiếm" />
      ) : (
        <div className="space-y-3">
          {filteredStudents.map(student => (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                      {student.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.fullName}</h3>
                      <p className="flex items-center gap-1 text-sm text-gray-500"><Mail className="h-3 w-3" />{student.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{student.enrolledCourses} khóa học</span>
                    <span className="flex items-center gap-1"><Award className="h-4 w-4" />{student.completedExams} bài thi</span>
                    <span className={`font-medium ${student.avgScore >= 80 ? 'text-green-600' : student.avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      Điểm TB: {student.avgScore}%
                    </span>
                    {student.lastActive && (
                      <span className="text-gray-400">
                        Hoạt động: {new Date(student.lastActive).toLocaleDateString('vi-VN')}
                      </span>
                    )}
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
