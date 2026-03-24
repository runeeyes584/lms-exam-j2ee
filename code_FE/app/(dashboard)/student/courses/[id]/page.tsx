'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle, 
  FileText, 
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { courseService, chapterService, lessonService, CourseResponse, ChapterResponse, LessonResponse } from '@/services/courseService';
import { progressService, ProgressResponse } from '@/services/enrollmentService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface ExtendedChapter extends ChapterResponse {
  lessons: ExtendedLesson[];
  isExpanded?: boolean;
}

interface ExtendedLesson extends LessonResponse {
  isCompleted?: boolean;
}

export default function CourseLearningPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [chapters, setChapters] = useState<ExtendedChapter[]>([]);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [currentLesson, setCurrentLesson] = useState<ExtendedLesson | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchCourseData();
  }, [params.id, user, authLoading]);

  const fetchCourseData = async () => {
    try {
      // 1. Fetch Course
      const courseRes = await courseService.getById(params.id);
      if (courseRes.code !== ResponseCode.SUCCESS || !courseRes.result) {
        toast.error('Không tìm thấy khóa học');
        router.push('/student/courses');
        return;
      }
      setCourse(courseRes.result);

      // 2. Fetch Progress (mock if API fails for demo)
      let userProgress: ProgressResponse | null = null;
      try {
        const progRes = await progressService.get(user!.id, params.id);
        if (progRes.code === ResponseCode.SUCCESS) {
          userProgress = progRes.result || null;
        }
      } catch (e) {
        console.warn('Could not fetch progress, using empty state');
        userProgress = {
          userId: user!.id,
          courseId: params.id,
          completedLessons: [],
          totalLessons: 0,
          progressPercentage: 0,
          totalWatchTime: 0,
          lastAccessedAt: new Date().toISOString()
        };
      }
      setProgress(userProgress);

      const completedIds = userProgress?.completedLessons || [];

      // 3. Fetch Chapters
      const chapRes = await chapterService.getByCourse(params.id);
      let courseChapters: ExtendedChapter[] = [];
      
      if (chapRes.code === ResponseCode.SUCCESS && chapRes.result) {
        const sortedChapters = chapRes.result.sort((a, b) => a.orderIndex - b.orderIndex);
        
        // 4. Fetch lessons for each chapter
        courseChapters = await Promise.all(
          sortedChapters.map(async (chap) => {
            let lessons: ExtendedLesson[] = [];
            try {
              const lesRes = await lessonService.getByChapter(chap.id);
              if (lesRes.code === ResponseCode.SUCCESS && lesRes.result) {
                lessons = lesRes.result
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map(l => ({
                    ...l,
                    isCompleted: completedIds.includes(l.id)
                  }));
              }
            } catch (e) {
               console.error(`Failed to fetch lessons for chapter ${chap.id}`);
            }
            return {
              ...chap,
              lessons,
              isExpanded: true // default expanded
            };
          })
        );
      } else {
        // Fallback demo data if no chapters found
        courseChapters = [
          {
            id: 'mock-chap-1', courseId: params.id, title: 'Chương 1: Giới thiệu chung', orderIndex: 1, createdAt: '', updatedAt: '', isExpanded: true,
            lessons: [
              { id: 'mock-les-1', chapterId: 'mock-chap-1', title: 'Giới thiệu khóa học', orderIndex: 1, duration: 300, isCompleted: true, createdAt: '', updatedAt: '', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
              { id: 'mock-les-2', chapterId: 'mock-chap-1', title: 'Cài đặt môi trường', orderIndex: 2, duration: 450, isCompleted: false, createdAt: '', updatedAt: '', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
            ]
          }
        ];
      }

      setChapters(courseChapters);

      // Select first lesson to play
      let toPlay = null;
      for (const chap of courseChapters) {
        if (chap.lessons.length > 0) {
          // Find first uncompleted
          const uncompleted = chap.lessons.find(l => !l.isCompleted);
          if (uncompleted) {
            toPlay = uncompleted;
            break;
          } else if (!toPlay) {
            toPlay = chap.lessons[0];
          }
        }
      }
      
      if (toPlay) setCurrentLesson(toPlay);

    } catch (error) {
      console.error('Error fetching course logic:', error);
      toast.error('Có lỗi xảy ra khi tải khóa học');
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setChapters(prev => prev.map(c => 
      c.id === chapterId ? { ...c, isExpanded: !c.isExpanded } : c
    ));
  };

  const playLesson = (lesson: ExtendedLesson) => {
    setCurrentLesson(lesson);
  };

  const markAsCompleted = async () => {
    if (!currentLesson || currentLesson.isCompleted) return;
    
    // Optimistic UI update
    setCurrentLesson({ ...currentLesson, isCompleted: true });
    
    setChapters(prev => prev.map(c => {
      if (c.id === currentLesson.chapterId) {
        return {
          ...c,
          lessons: c.lessons.map(l => l.id === currentLesson.id ? { ...l, isCompleted: true } : l)
        };
      }
      return c;
    }));

    try {
      await progressService.update({
        courseId: params.id,
        lessonId: currentLesson.id,
        completed: true
      });
      toast.success('Đã hoàn thành bài học!');
      
      // Auto advance to next lesson
      advanceToNextLesson();
    } catch (error) {
      console.error('Error updating progress', error);
      toast.success('Đã hoàn thành bài học (Mock API)!');
      advanceToNextLesson();
    }
  };

  const advanceToNextLesson = () => {
    if (!currentLesson) return;
    
    let foundCurrent = false;
    for (const chap of chapters) {
      for (const less of chap.lessons) {
        if (foundCurrent) {
          playLesson(less);
          return;
        }
        if (less.id === currentLesson.id) {
          foundCurrent = true;
        }
      }
    }
  };

  if (loading || authLoading) return <PageLoading message="Đang tải nội dung học tập..." />;
  if (!course) return null;

  // Calculate totals
  const totalLessons = chapters.reduce((acc, chap) => acc + chap.lessons.length, 0);
  const completedLessons = chapters.reduce((acc, chap) => acc + chap.lessons.filter(l => l.isCompleted).length, 0);
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="flex h-[calc(100vh-64px)]flex-col overflow-hidden bg-white fixed inset-0 z-50">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-[#1C1D1F] px-4 text-white">
        <div className="flex items-center gap-4">
          <Link href="/student/courses" className="text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold line-clamp-1">{course.title}</h1>
            <p className="text-xs text-gray-400">Giảng viên: {course.instructor?.fullName || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 mr-4">
            <div className="w-32 bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-sm font-medium">{progressPercent}%</span>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-300 hover:text-white hover:bg-gray-800 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Left: Video Player */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:pr-[350px] xl:pr-[400px]' : ''}`}>
          {/* Video Container */}
          <div className="bg-black w-full relative pt-[56.25%] sm:pt-[50%] lg:pt-[45%]">
            <div className="absolute inset-0 flex items-center justify-center">
              {currentLesson ? (
                currentLesson.videoUrl ? (
                  <video 
                    key={currentLesson.id}
                    src={currentLesson.videoUrl} 
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    controlsList="nodownload"
                    onEnded={markAsCompleted}
                  >
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                  </video>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <FileText className="h-16 w-16 mb-4 opacity-50" />
                    <p>Bài học này không có video</p>
                  </div>
                )
              ) : (
                <div className="text-gray-400">Vui lòng chọn bài học</div>
              )}
            </div>
          </div>

          {/* Lesson Details */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white">
            {currentLesson ? (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-start justify-between gap-4 border-b pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                       <span className="flex items-center gap-1">
                         <PlayCircle className="h-4 w-4" /> {currentLesson.duration ? `${Math.floor(currentLesson.duration / 60)} phút` : 'Chưa cập nhật'}
                       </span>
                    </div>
                  </div>
                  
                  {!currentLesson.isCompleted ? (
                    <Button onClick={markAsCompleted} className="shrink-0 bg-blue-600 hover:bg-blue-700">
                      Đánh dấu hoàn thành
                    </Button>
                  ) : (
                    <Button variant="outline" className="shrink-0 text-green-600 border-green-200 bg-green-50 pointer-events-none">
                      <CheckCircle className="mr-2 h-4 w-4" /> Đã hoàn thành
                    </Button>
                  )}
                </div>

                <div className="prose max-w-none">
                  {currentLesson.content ? (
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  ) : (
                    <p className="text-gray-500 italic">Học viên xem video bài giảng để tiếp thu kiến thức phần này.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Hãy chọn một bài học trong danh sách để bắt đầu
              </div>
            )}
          </div>
        </div>

        {/* Right: Curriculum Sidebar */}
        <div 
          className={`absolute top-0 right-0 h-full w-full sm:w-[350px] xl:w-[400px] bg-white border-l transition-transform duration-300 z-10 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 border-b flex items-center justify-between bg-gray-50 shrink-0">
            <h3 className="font-bold text-gray-900 text-base">Nội dung khóa học</h3>
            <span className="text-sm text-gray-500 font-medium">{completedLessons} / {totalLessons} bài</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chapters.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Chưa có bài học nào</div>
            ) : (
              <div className="divide-y">
                {chapters.map((chap, idx) => (
                  <div key={chap.id} className="bg-white">
                    <button 
                      onClick={() => toggleChapter(chap.id)}
                      className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 mb-1">Chương {idx + 1}: {chap.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <span>{chap.lessons.filter(l => l.isCompleted).length}/{chap.lessons.length}</span>
                        </div>
                      </div>
                      {chap.isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </button>
                    
                    {chap.isExpanded && (
                      <div className="bg-white divide-y divide-gray-50 border-t border-gray-100">
                        {chap.lessons.map((lesson, lIdx) => {
                          const isPlaying = currentLesson?.id === lesson.id;
                          return (
                            <button
                                key={lesson.id}
                                onClick={() => playLesson(lesson)}
                                className={`w-full px-4 py-3 flex items-start gap-3 transition-colors text-left ${
                                  isPlaying ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                            >
                              <div className="mt-0.5">
                                {lesson.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : isPlaying ? (
                                  <PlayCircle className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border border-gray-300" />
                                )}
                              </div>
                              <div>
                                <p className={`text-sm mb-1 ${isPlaying ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                                  {lIdx + 1}. {lesson.title}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <PlayCircle className="h-3 w-3" />
                                    {lesson.duration ? `${Math.floor(lesson.duration / 60)} phút` : '0 phút'}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
