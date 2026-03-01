'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { chapterService } from '@/services/chapterService';
import { lessonService } from '@/services/lessonService';
import type { Course, Chapter, Lesson } from '@/types/backend';
import {
    FaPlus, FaEdit, FaTrash, FaChevronUp, FaChevronDown,
    FaBookOpen, FaArrowLeft
} from 'react-icons/fa';

// ─── Inline Add/Edit forms ─────────────────────────────────────────────────── //

function InlineForm({
    placeholder,
    initialValue = '',
    onSave,
    onCancel,
}: {
    placeholder: string;
    initialValue?: string;
    onSave: (value: string) => Promise<void>;
    onCancel: () => void;
}) {
    const [value, setValue] = useState(initialValue);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        setSaving(true);
        await onSave(value.trim());
        setSaving(false);
    };

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <input
                className="inline-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                autoFocus
                required
            />
            <button type="submit" className="btn btn-primary inline-save-btn" disabled={saving}>
                {saving ? '...' : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary inline-cancel-btn" onClick={onCancel}>
                Cancel
            </button>
            <style jsx>{`
        .inline-form { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem; }
        .inline-input {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1.5px solid var(--primary);
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
          outline: none;
        }
        .inline-save-btn, .inline-cancel-btn {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }
      `}</style>
        </form>
    );
}

// ─── Curriculum Builder Page ───────────────────────────────────────────────── //

interface LessonWithChapterId extends Lesson {
    chapterId: string;
}

export default function CurriculumPage() {
    const params = useParams();
    const courseId = params?.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [lessonMap, setLessonMap] = useState<Record<string, Lesson[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI state for inline forms
    const [addingChapter, setAddingChapter] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [addingLessonFor, setAddingLessonFor] = useState<string | null>(null);
    const [editingLesson, setEditingLesson] = useState<LessonWithChapterId | null>(null);

    const loadCurriculum = useCallback(async () => {
        if (!courseId) return;
        setLoading(true);
        setError('');
        try {
            const [courseData, chaptersData] = await Promise.all([
                courseService.getById(courseId),
                chapterService.getByCourse(courseId),
            ]);
            setCourse(courseData);
            setChapters(chaptersData);

            // Load lessons for each chapter in parallel
            const lessonEntries = await Promise.all(
                chaptersData.map(async (ch) => {
                    const lessons = await lessonService.getByChapter(ch.id);
                    return [ch.id, lessons] as [string, Lesson[]];
                })
            );
            setLessonMap(Object.fromEntries(lessonEntries));
        } catch {
            setError('Failed to load curriculum. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => { loadCurriculum(); }, [loadCurriculum]);

    // ── Chapter handlers ──────────────────────────────── //

    const createChapter = async (title: string) => {
        const nextOrder = chapters.length + 1;
        await chapterService.create({ courseId, title, orderIndex: nextOrder });
        setAddingChapter(false);
        await loadCurriculum();
    };

    const updateChapter = async (title: string) => {
        if (!editingChapter) return;
        await chapterService.update(editingChapter.id, {
            courseId,
            title,
            orderIndex: editingChapter.orderIndex,
        });
        setEditingChapter(null);
        await loadCurriculum();
    };

    const deleteChapter = async (id: string) => {
        if (!confirm('Delete this chapter and all its lessons?')) return;
        await chapterService.delete(id);
        await loadCurriculum();
    };

    const moveChapter = async (chapter: Chapter, direction: 'up' | 'down') => {
        const idx = chapters.findIndex((c) => c.id === chapter.id);
        const target = direction === 'up' ? chapters[idx - 1] : chapters[idx + 1];
        if (!target) return;
        await Promise.all([
            chapterService.update(chapter.id, { courseId, title: chapter.title, orderIndex: target.orderIndex }),
            chapterService.update(target.id, { courseId, title: target.title, orderIndex: chapter.orderIndex }),
        ]);
        await loadCurriculum();
    };

    // ── Lesson handlers ───────────────────────────────── //

    const createLesson = async (chapterId: string, title: string) => {
        const lessons = lessonMap[chapterId] || [];
        await lessonService.create({ chapterId, title, orderIndex: lessons.length + 1 });
        setAddingLessonFor(null);
        await loadCurriculum();
    };

    const updateLesson = async (title: string) => {
        if (!editingLesson) return;
        await lessonService.update(editingLesson.id, {
            chapterId: editingLesson.chapterId,
            title,
            content: editingLesson.content,
            orderIndex: editingLesson.orderIndex,
        });
        setEditingLesson(null);
        await loadCurriculum();
    };

    const deleteLesson = async (id: string) => {
        if (!confirm('Delete this lesson?')) return;
        await lessonService.delete(id);
        await loadCurriculum();
    };

    const moveLesson = async (lesson: Lesson, chapterId: string, direction: 'up' | 'down') => {
        const lessons = lessonMap[chapterId] || [];
        const idx = lessons.findIndex((l) => l.id === lesson.id);
        const target = direction === 'up' ? lessons[idx - 1] : lessons[idx + 1];
        if (!target) return;
        await Promise.all([
            lessonService.update(lesson.id, { chapterId, title: lesson.title, content: lesson.content, orderIndex: target.orderIndex }),
            lessonService.update(target.id, { chapterId, title: target.title, content: target.content, orderIndex: lesson.orderIndex }),
        ]);
        await loadCurriculum();
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="loading-pulse">Loading curriculum...</div>
                <style jsx>{`.page-wrapper{max-width:860px;margin:7rem auto 4rem;padding:0 1.5rem}.loading-pulse{color:var(--text-secondary);font-size:1.1rem;text-align:center;padding:4rem 0;}`}</style>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            {/* Back nav */}
            <a href="/courses" className="back-link">
                <FaArrowLeft /> Back to Courses
            </a>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">{course?.title ?? 'Curriculum Builder'}</h1>
                    <p className="page-subtitle">
                        Manage chapters and lessons · {chapters.length} chapter
                        {chapters.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    id="add-chapter-btn"
                    className="btn btn-primary add-btn"
                    onClick={() => { setAddingChapter(true); setEditingChapter(null); }}
                >
                    <FaPlus /> Add Chapter
                </button>
            </div>

            {error && <div className="alert-error">{error}</div>}

            {/* Add chapter inline form */}
            {addingChapter && (
                <InlineForm
                    placeholder="Chapter title…"
                    onSave={createChapter}
                    onCancel={() => setAddingChapter(false)}
                />
            )}

            {/* Chapter list */}
            {chapters.length === 0 && !addingChapter ? (
                <div className="empty-state">
                    <span className="empty-icon">📂</span>
                    <p>No chapters yet. Click "Add Chapter" to start building your curriculum.</p>
                </div>
            ) : (
                <div className="chapter-list">
                    {chapters.map((chapter, chIdx) => {
                        const lessons = lessonMap[chapter.id] || [];
                        return (
                            <div key={chapter.id} className="chapter-card">
                                {/* Chapter header */}
                                <div className="chapter-header">
                                    <div className="chapter-index">{chIdx + 1}</div>
                                    {editingChapter?.id === chapter.id ? (
                                        <InlineForm
                                            placeholder="Chapter title…"
                                            initialValue={chapter.title}
                                            onSave={updateChapter}
                                            onCancel={() => setEditingChapter(null)}
                                        />
                                    ) : (
                                        <span className="chapter-title">{chapter.title}</span>
                                    )}
                                    <div className="chapter-controls">
                                        <button
                                            className="ctrl-btn"
                                            onClick={() => moveChapter(chapter, 'up')}
                                            disabled={chIdx === 0}
                                            title="Move up"
                                        >
                                            <FaChevronUp />
                                        </button>
                                        <button
                                            className="ctrl-btn"
                                            onClick={() => moveChapter(chapter, 'down')}
                                            disabled={chIdx === chapters.length - 1}
                                            title="Move down"
                                        >
                                            <FaChevronDown />
                                        </button>
                                        <button
                                            className="ctrl-btn edit-ctrl"
                                            onClick={() => { setEditingChapter(chapter); setAddingChapter(false); }}
                                            title="Edit chapter"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="ctrl-btn delete-ctrl"
                                            onClick={() => deleteChapter(chapter.id)}
                                            title="Delete chapter"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                {/* Lesson list */}
                                <div className="lesson-list">
                                    {lessons.map((lesson, lIdx) => (
                                        <div key={lesson.id} className="lesson-row">
                                            <FaBookOpen className="lesson-icon" />
                                            {editingLesson?.id === lesson.id ? (
                                                <InlineForm
                                                    placeholder="Lesson title…"
                                                    initialValue={lesson.title}
                                                    onSave={updateLesson}
                                                    onCancel={() => setEditingLesson(null)}
                                                />
                                            ) : (
                                                <a
                                                    href={`/courses/${courseId}/lessons/${lesson.id}`}
                                                    id={`lesson-link-${lesson.id}`}
                                                    className="lesson-title-link"
                                                >
                                                    {lIdx + 1}. {lesson.title}
                                                </a>
                                            )}
                                            <div className="lesson-controls">
                                                <button
                                                    className="ctrl-btn sm"
                                                    onClick={() => moveLesson(lesson, chapter.id, 'up')}
                                                    disabled={lIdx === 0}
                                                    title="Move up"
                                                >
                                                    <FaChevronUp />
                                                </button>
                                                <button
                                                    className="ctrl-btn sm"
                                                    onClick={() => moveLesson(lesson, chapter.id, 'down')}
                                                    disabled={lIdx === lessons.length - 1}
                                                    title="Move down"
                                                >
                                                    <FaChevronDown />
                                                </button>
                                                <button
                                                    className="ctrl-btn sm edit-ctrl"
                                                    onClick={() =>
                                                        setEditingLesson({ ...lesson, chapterId: chapter.id })
                                                    }
                                                    title="Edit lesson"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="ctrl-btn sm delete-ctrl"
                                                    onClick={() => deleteLesson(lesson.id)}
                                                    title="Delete lesson"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add lesson inline form */}
                                    {addingLessonFor === chapter.id ? (
                                        <div className="lesson-add-form">
                                            <InlineForm
                                                placeholder="Lesson title…"
                                                onSave={(title) => createLesson(chapter.id, title)}
                                                onCancel={() => setAddingLessonFor(null)}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            id={`add-lesson-btn-${chapter.id}`}
                                            className="add-lesson-btn"
                                            onClick={() =>
                                                setAddingLessonFor(chapter.id)
                                            }
                                        >
                                            <FaPlus /> Add Lesson
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
        .page-wrapper { max-width: 860px; margin: 7rem auto 4rem; padding: 0 1.5rem; }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          transition: color 0.2s;
        }
        .back-link:hover { color: var(--primary); }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .page-title { font-size: 1.9rem; font-weight: 800; }
        .page-subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
        .add-btn { display: flex; align-items: center; gap: 0.4rem; }
        .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
        .empty-state {
          text-align: center;
          padding: 4rem 1rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .empty-icon { font-size: 3rem; }

        /* ── Chapters ── */
        .chapter-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
        .chapter-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .chapter-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: #f8faff;
          border-bottom: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }
        .chapter-index {
          width: 28px;
          height: 28px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .chapter-title { font-size: 1rem; font-weight: 700; flex: 1; color: var(--text-primary); }
        .chapter-controls { display: flex; gap: 0.3rem; margin-left: auto; }

        /* ── Lessons ── */
        .lesson-list { padding: 0.75rem 1.25rem 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
        .lesson-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          transition: border-color 0.2s;
          flex-wrap: wrap;
        }
        .lesson-row:hover { border-color: #d1d5db; }
        .lesson-icon { color: var(--primary); font-size: 0.85rem; flex-shrink: 0; }
        .lesson-title-link {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
          text-decoration: none;
        }
        .lesson-title-link:hover { color: var(--primary); text-decoration: underline; }
        .lesson-controls { display: flex; gap: 0.25rem; }
        .lesson-add-form { margin-top: 0.25rem; }

        /* ── Controls ── */
        .ctrl-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          transition: all 0.15s;
        }
        .ctrl-btn.sm { width: 26px; height: 26px; font-size: 0.65rem; }
        .ctrl-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; color: var(--text-primary); }
        .ctrl-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .ctrl-btn.edit-ctrl:hover:not(:disabled) { background: #eff6ff; border-color: var(--primary); color: var(--primary); }
        .ctrl-btn.delete-ctrl:hover:not(:disabled) { background: #fef2f2; border-color: #ef4444; color: #ef4444; }

        .add-lesson-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          margin-top: 0.25rem;
          font-size: 0.82rem;
          color: var(--primary);
          border: 1.5px dashed var(--primary);
          border-radius: 7px;
          background: #eff6ff;
          width: 100%;
          justify-content: center;
          transition: all 0.2s;
        }
        .add-lesson-btn:hover { background: var(--primary); color: white; }
      `}</style>
        </div>
    );
}
