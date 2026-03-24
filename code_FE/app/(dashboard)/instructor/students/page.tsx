'use client';

import { useEffect, useState } from 'react';
import { Award, BookOpen, Filter, Search, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/examService';
import { attemptService, ExamAttemptResponse } from '@/services/attemptService';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface StudentWithStats {
  id: string;
  displayName: string;
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
      const examsResponse = await examService.getMyExams(0, 200);
      if (!isSuccess(examsResponse.code)) {
        setStudents([]);
        return;
      }

      const exams = examsResponse.result?.content || [];
      const attemptsByExam = await Promise.all(
        exams.map(async exam => {
          const response = await attemptService.getByExam(exam.id, 0, 200);
          return isSuccess(response.code) ? response.result?.content || [] : [];
        })
      );

      const examCourseMap = new Map(exams.map(exam => [exam.id, exam.courseId || exam.id]));
      const studentMap = new Map<string, { scores: number[]; courseIds: Set<string>; lastActive?: string }>();

      attemptsByExam.flat().forEach((attempt: ExamAttemptResponse) => {
        const existing = studentMap.get(attempt.studentId) || {
          scores: [],
          courseIds: new Set<string>(),
          lastActive: undefined,
        };

        existing.scores.push(Number(attempt.percentage || 0));
        existing.courseIds.add(examCourseMap.get(attempt.examId) || attempt.examId);

        const activeAt = attempt.endTime || attempt.startTime;
        if (!existing.lastActive || new Date(activeAt).getTime() > new Date(existing.lastActive).getTime()) {
          existing.lastActive = activeAt;
        }

        studentMap.set(attempt.studentId, existing);
      });

      setStudents(
        Array.from(studentMap.entries()).map(([studentId, stats]) => ({
          id: studentId,
          displayName: `Học viên ${studentId.slice(-6)}`,
          enrolledCourses: stats.courseIds.size,
          completedExams: stats.scores.length,
          avgScore: stats.scores.length > 0 ? Math.round(stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length) : 0,
          lastActive: stats.lastActive,
        }))
      );
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách học viên..." />;

  const filteredStudents = [...students]
    .filter(student =>
      student.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score') return b.avgScore - a.avgScore;
      if (sortBy === 'activity') return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
      return a.displayName.localeCompare(b.displayName);
    });

  const stats = {
    total: students.length,
    avgScore: students.length > 0 ? Math.round(students.reduce((sum, student) => sum + student.avgScore, 0) / students.length) : 0,
    active: students.filter(student => student.lastActive && new Date(student.lastActive) > new Date(Date.now() - 7 * 86400000)).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Học viên của tôi</h1>
        <p className="mt-2 text-gray-600">Dữ liệu được tổng hợp từ attempts của các đề thi giảng viên đã tạo</p>
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
              <div className="rounded-lg bg-green-100 p-2"><Award className="h-5 w-5 text-green-600" /></div>
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
              <div className="rounded-lg bg-purple-100 p-2"><BookOpen className="h-5 w-5 text-purple-600" /></div>
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
        <EmptyState icon={Users} title="Không có học viên" description="Backend hiện không có attempts nào để tổng hợp danh sách học viên" />
      ) : (
        <div className="space-y-3">
          {filteredStudents.map(student => (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                      {student.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.displayName}</h3>
                      <p className="text-sm text-gray-500">Mã học viên: {student.id}</p>
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
