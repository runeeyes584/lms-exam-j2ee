'use client';

import { useEffect, useMemo, useState } from 'react';
import { Award, BookOpen, Filter, Search, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { enrollmentService, CourseMemberResponse } from '@/services/enrollmentService';
import { examService } from '@/services/examService';
import { attemptService, ExamAttemptResponse } from '@/services/attemptService';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface StudentInClass {
  id: string;
  displayName: string;
  email?: string;
  enrolledAt?: string;
  progressPercent: number;
  completedExams: number;
  avgScore: number;
  lastActive?: string;
}

interface ClassGroup {
  courseId: string;
  courseTitle: string;
  students: StudentInClass[];
  avgScore: number;
  activeCount: number;
}

export default function InstructorStudentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'activity'>('name');

  useEffect(() => {
    if (user?.id) {
      void fetchClasses();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const fetchClasses = async () => {
    if (!user?.id) return;

    try {
      const coursesResponse = await courseService.getMyCoursesStrict(user.id);
      if (!isSuccess(coursesResponse.code)) {
        setClassGroups([]);
        return;
      }

      const courses = coursesResponse.result || [];
      const [membersByCourse, examsResponse] = await Promise.all([
        Promise.all(
          courses.map(async course => {
            try {
              const membersResponse = await enrollmentService.getCourseMembers(course.id, user.id);
              return {
                courseId: course.id,
                members: isSuccess(membersResponse.code) ? (membersResponse.result || []) : [],
              };
            } catch (error) {
              console.error(`Error fetching members for course ${course.id}:`, error);
              return { courseId: course.id, members: [] as CourseMemberResponse[] };
            }
          })
        ),
        examService.getMyExams(0, 500),
      ]);

      const exams = isSuccess(examsResponse.code) ? examsResponse.result?.content || [] : [];
      const attemptsByExam = await Promise.all(
        exams.map(async exam => {
          try {
            const attemptsResponse = await attemptService.getByExam(exam.id, 0, 500);
            return {
              examId: exam.id,
              courseId: exam.courseId || '',
              attempts: isSuccess(attemptsResponse.code) ? attemptsResponse.result?.content || [] : [],
            };
          } catch (error) {
            console.error(`Error fetching attempts for exam ${exam.id}:`, error);
            return { examId: exam.id, courseId: exam.courseId || '', attempts: [] as ExamAttemptResponse[] };
          }
        })
      );

      const statsByCourseAndStudent = new Map<string, { scores: number[]; lastActive?: string }>();
      attemptsByExam.forEach(({ courseId, attempts }) => {
        if (!courseId) return;
        attempts.forEach(attempt => {
          const key = `${courseId}::${attempt.studentId}`;
          const current = statsByCourseAndStudent.get(key) || { scores: [], lastActive: undefined };
          current.scores.push(Number(attempt.percentage || 0));
          const activeAt = attempt.endTime || attempt.startTime;
          if (!current.lastActive || new Date(activeAt).getTime() > new Date(current.lastActive).getTime()) {
            current.lastActive = activeAt;
          }
          statsByCourseAndStudent.set(key, current);
        });
      });

      const groups: ClassGroup[] = courses.map(course => {
        const members = membersByCourse.find(item => item.courseId === course.id)?.members || [];
        const students: StudentInClass[] = members.map(member => {
          const statKey = `${course.id}::${member.userId}`;
          const stats = statsByCourseAndStudent.get(statKey);
          const scores = stats?.scores || [];
          return {
            id: member.userId,
            displayName: member.fullName || `Học viên ${member.userId.slice(-6)}`,
            email: member.email,
            enrolledAt: member.enrolledAt,
            progressPercent: Number(member.progressPercent || 0),
            completedExams: scores.length,
            avgScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
            lastActive: stats?.lastActive,
          };
        });

        const avgScore = students.length > 0
          ? Math.round(students.reduce((sum, student) => sum + student.avgScore, 0) / students.length)
          : 0;
        const activeCount = students.filter(student =>
          student.lastActive && new Date(student.lastActive).getTime() > Date.now() - 7 * 86400000
        ).length;

        return {
          courseId: course.id,
          courseTitle: course.title,
          students,
          avgScore,
          activeCount,
        };
      });

      setClassGroups(groups);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClassGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const allStudents = classGroups.flatMap(group => group.students);
    const uniqueStudents = new Set(allStudents.map(student => student.id));
    const totalClasses = classGroups.length;
    const avgScore = allStudents.length > 0
      ? Math.round(allStudents.reduce((sum, student) => sum + student.avgScore, 0) / allStudents.length)
      : 0;
    const active = allStudents.filter(student =>
      student.lastActive && new Date(student.lastActive).getTime() > Date.now() - 7 * 86400000
    ).length;
    return {
      totalClasses,
      totalStudents: uniqueStudents.size,
      avgScore,
      active,
    };
  }, [classGroups]);

  const filteredGroups = classGroups
    .map(group => ({
      ...group,
      students: group.students
        .filter(student =>
          student.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === 'score') return b.avgScore - a.avgScore;
          if (sortBy === 'activity') return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
          return a.displayName.localeCompare(b.displayName);
        }),
    }))
    .filter(group => group.students.length > 0 || group.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()));

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách lớp..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lớp của tôi</h1>
        <p className="mt-2 text-gray-600">Danh sách lớp học và học viên đang tham gia từng khóa học của bạn</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2"><BookOpen className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                <p className="text-sm text-gray-500">Tổng lớp</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2"><Users className="h-5 w-5 text-indigo-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-sm text-gray-500">Học viên</p>
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
              <div className="rounded-lg bg-purple-100 p-2"><Filter className="h-5 w-5 text-purple-600" /></div>
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
              <Input type="text" placeholder="Tìm theo tên lớp hoặc học viên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="name">Sắp xếp: Tên</option>
              <option value="score">Sắp xếp: Điểm TB</option>
              <option value="activity">Sắp xếp: Hoạt động</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredGroups.length === 0 ? (
        <EmptyState icon={Users} title="Không có lớp hoặc học viên" description="Chưa có học viên tham gia các khóa học của bạn" />
      ) : (
        <div className="space-y-6">
          {filteredGroups.map(group => (
            <Card key={group.courseId}>
              <CardHeader className="border-b">
                <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span>{group.courseTitle}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {group.students.length} học viên • Điểm TB: {group.avgScore}% • Hoạt động tuần này: {group.activeCount}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {group.students.map(student => (
                  <div key={`${group.courseId}-${student.id}`} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-600">
                        {student.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{student.displayName}</p>
                        <p className="text-sm text-gray-500">{student.email || student.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Thi: {student.completedExams} bài</span>
                      <span className={`font-medium ${student.avgScore >= 80 ? 'text-green-600' : student.avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        Điểm TB: {student.avgScore}%
                      </span>
                      <span>Tiến độ khóa học: {Math.round(student.progressPercent)}%</span>
                      {student.enrolledAt && <span>Tham gia: {new Date(student.enrolledAt).toLocaleDateString('vi-VN')}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
