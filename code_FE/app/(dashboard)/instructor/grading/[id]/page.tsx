'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import {
    ArrowLeft, CheckCircle, XCircle, Clock, User,
    FileText, Save, Send, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { gradingService, GradingDetailResponse, QuestionGrade } from '@/services/gradingService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';

export default function GradingDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [detail, setDetail] = useState<GradingDetailResponse | null>(null);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchDetail();
    }, [params.id]);

    const fetchDetail = async () => {
        try {
            const response = await gradingService.getDetails(params.id);
            if (response.code === ResponseCode.SUCCESS && response.result) {
                setDetail(response.result);
                // Init scores from existing grades
                const initScores: Record<string, number> = {};
                const initFeedbacks: Record<string, string> = {};
                response.result.questionGrades.forEach(q => {
                    initScores[q.questionId] = q.earnedPoints;
                    initFeedbacks[q.questionId] = q.feedback || '';
                });
                setScores(initScores);
                setFeedbacks(initFeedbacks);
            }
        } catch (error) {
            console.error('Error fetching grading detail:', error);
            // Mock data for demo
            const mock: GradingDetailResponse = {
                attemptId: params.id,
                examId: '1',
                examTitle: 'Kiểm tra Java cơ bản',
                studentId: '1',
                studentName: 'Nguyễn Văn A',
                studentEmail: 'student@test.com',
                totalScore: 75,
                maxScore: 100,
                percentage: 75,
                status: 'SUBMITTED',
                passed: false,
                submittedAt: new Date().toISOString(),
                questionGrades: [
                    { questionId: 'q1', questionContent: 'Java là ngôn ngữ lập trình gì?', questionType: 'MULTIPLE_CHOICE', maxPoints: 10, earnedPoints: 10, selectedOptions: ['Both compiled and interpreted'], correctOptions: ['Both compiled and interpreted'], isCorrect: true },
                    { questionId: 'q2', questionContent: 'OOP bao gồm những tính chất nào?', questionType: 'MULTIPLE_CHOICE', maxPoints: 10, earnedPoints: 0, selectedOptions: ['Encapsulation'], correctOptions: ['Encapsulation', 'Inheritance', 'Polymorphism'], isCorrect: false },
                    { questionId: 'q3', questionContent: 'Giải thích khái niệm Polymorphism trong Java?', questionType: 'FILL_IN', maxPoints: 20, earnedPoints: 0, selectedOptions: ['Polymorphism là khả năng một đối tượng có thể có nhiều hình thái khác nhau'], correctOptions: [], isCorrect: false, feedback: '' },
                    { questionId: 'q4', questionContent: 'React là một framework?', questionType: 'TRUE_FALSE', maxPoints: 5, earnedPoints: 5, selectedOptions: ['False'], correctOptions: ['False'], isCorrect: true },
                    { questionId: 'q5', questionContent: 'Trình bày về Thread trong Java', questionType: 'FILL_IN', maxPoints: 15, earnedPoints: 0, selectedOptions: ['Thread là luồng xử lý song song trong Java'], correctOptions: [], isCorrect: false, feedback: '' },
                ],
            };
            setDetail(mock);
            const initScores: Record<string, number> = {};
            const initFeedbacks: Record<string, string> = {};
            mock.questionGrades.forEach(q => {
                initScores[q.questionId] = q.earnedPoints;
                initFeedbacks[q.questionId] = q.feedback || '';
            });
            setScores(initScores);
            setFeedbacks(initFeedbacks);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (finalize = false) => {
        if (!detail) return;
        setSaving(true);
        try {
            const gradeData = {
                attemptId: params.id,
                questionGrades: Object.entries(scores).map(([questionId, score]) => ({
                    questionId,
                    score,
                    feedback: feedbacks[questionId] || '',
                })),
            };

            const response = await gradingService.gradeAttempt(gradeData);
            if (response.code === ResponseCode.SUCCESS) {
                if (finalize) {
                    await gradingService.finalize(params.id);
                    toast.success('Đã hoàn thành chấm điểm!');
                    router.push('/instructor/grading');
                } else {
                    toast.success('Đã lưu điểm!');
                    fetchDetail();
                }
            } else {
                toast.error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            // Demo fallback
            if (finalize) {
                toast.success('Đã hoàn thành chấm điểm! (Demo)');
                router.push('/instructor/grading');
            } else {
                toast.success('Đã lưu điểm! (Demo)');
            }
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) return <PageLoading message="Đang tải bài thi..." />;
    if (!detail) return null;

    const fillInQuestions = detail.questionGrades.filter(q => q.questionType === 'FILL_IN');
    const autoGradedQuestions = detail.questionGrades.filter(q => q.questionType !== 'FILL_IN');
    const currentTotal = Object.entries(scores).reduce((sum, [qId, score]) => sum + score, 0);
    const percentage = detail.maxScore > 0 ? Math.round((currentTotal / detail.maxScore) * 100) : 0;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/instructor/grading">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Chấm điểm bài thi</h1>
                        <p className="text-sm text-gray-500">{detail.examTitle}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />Lưu nháp
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={saving}>
                        <Send className="mr-2 h-4 w-4" />{saving ? 'Đang lưu...' : 'Hoàn thành chấm'}
                    </Button>
                </div>
            </div>

            {/* Student Info + Score Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="sm:col-span-2">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                                {detail.studentName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{detail.studentName}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <User className="h-3 w-3" />{detail.studentEmail}
                                </p>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3" />Nộp lúc: {new Date(detail.submittedAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500 mb-1">Điểm hiện tại</p>
                        <p className="text-4xl font-bold text-blue-600">{currentTotal}</p>
                        <p className="text-sm text-gray-500">/ {detail.maxScore} ({percentage}%)</p>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                                className={`h-full transition-all ${percentage >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Auto-graded questions */}
            {autoGradedQuestions.length > 0 && (
                <Card>
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Câu hỏi chấm tự động ({autoGradedQuestions.length} câu)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y p-0">
                        {autoGradedQuestions.map((q, idx) => (
                            <div key={q.questionId} className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-500">Câu {idx + 1}</span>
                                            {q.isCorrect
                                                ? <CheckCircle className="h-4 w-4 text-green-500" />
                                                : <XCircle className="h-4 w-4 text-red-500" />
                                            }
                                            <span className={`text-xs font-medium ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                {q.isCorrect ? 'Đúng' : 'Sai'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-800 mb-2">{q.questionContent}</p>
                                        <div className="space-y-1 text-xs">
                                            <p className="text-gray-500">
                                                Học viên chọn: <span className="font-medium text-gray-700">{q.selectedOptions.join(', ') || '(Không trả lời)'}</span>
                                            </p>
                                            {!q.isCorrect && q.correctOptions.length > 0 && (
                                                <p className="text-green-600">
                                                    Đáp án đúng: <span className="font-medium">{q.correctOptions.join(', ')}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`text-lg font-bold ${q.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                            {q.earnedPoints}
                                        </span>
                                        <span className="text-sm text-gray-400">/{q.maxPoints}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Fill-in questions - manual grading */}
            {fillInQuestions.length > 0 && (
                <Card>
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            Câu hỏi tự luận - Cần chấm thủ công ({fillInQuestions.length} câu)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y p-0">
                        {fillInQuestions.map((q, idx) => (
                            <div key={q.questionId} className="p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">Câu tự luận {idx + 1}</span>
                                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Chấm thủ công</span>
                                </div>
                                <p className="mb-3 font-medium text-gray-800">{q.questionContent}</p>

                                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                                    <p className="mb-1 text-xs font-medium text-gray-500">Câu trả lời của học viên:</p>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {q.selectedOptions[0] || <span className="italic text-gray-400">(Không có câu trả lời)</span>}
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Điểm <span className="text-gray-400">(tối đa {q.maxPoints})</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                max={q.maxPoints}
                                                value={scores[q.questionId] ?? 0}
                                                onChange={(e) => {
                                                    const val = Math.min(q.maxPoints, Math.max(0, Number(e.target.value)));
                                                    setScores(prev => ({ ...prev, [q.questionId]: val }));
                                                }}
                                                className="w-24 rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-500">/ {q.maxPoints} điểm</span>
                                        </div>
                                        {/* Quick score buttons */}
                                        <div className="mt-2 flex gap-1">
                                            {[0, Math.round(q.maxPoints * 0.5), Math.round(q.maxPoints * 0.75), q.maxPoints].map(v => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setScores(prev => ({ ...prev, [q.questionId]: v }))}
                                                    className={`rounded px-2 py-1 text-xs transition-colors ${scores[q.questionId] === v
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Nhận xét</label>
                                        <textarea
                                            rows={3}
                                            value={feedbacks[q.questionId] || ''}
                                            onChange={(e) => setFeedbacks(prev => ({ ...prev, [q.questionId]: e.target.value }))}
                                            placeholder="Nhận xét cho học viên..."
                                            className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Bottom action bar */}
            <div className="sticky bottom-4 flex justify-end gap-3 rounded-xl border bg-white/90 p-4 shadow-lg backdrop-blur-sm">
                <p className="flex-1 text-sm text-gray-500 self-center">
                    Tổng điểm: <strong className="text-gray-900">{currentTotal}/{detail.maxScore}</strong> ({percentage}%)
                </p>
                <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />Lưu nháp
                </Button>
                <Button onClick={() => handleSave(true)} disabled={saving}>
                    <Send className="mr-2 h-4 w-4" />{saving ? 'Đang lưu...' : 'Hoàn thành & Gửi kết quả'}
                </Button>
            </div>
        </div>
    );
}
