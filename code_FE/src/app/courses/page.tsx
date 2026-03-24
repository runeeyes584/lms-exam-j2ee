'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { courseService } from '@/services/courseService';
import type { Course } from '@/types/backend';
import { FaPlus, FaEdit, FaTrash, FaImage, FaTag, FaUsers } from 'react-icons/fa';

// ─── Course Form Modal ────────────────────────────────────────────────────── //

interface CourseFormData {
    title: string;
    description: string;
    price: string;
    coverImage: string;
    instructorId: string;
}

const EMPTY_FORM: CourseFormData = {
    title: '',
    description: '',
    price: '',
    coverImage: '',
    instructorId: '',
};

interface CourseFormModalProps {
    course?: Course | null;
    onClose: () => void;
    onSaved: () => void;
}

function CourseFormModal({ course, onClose, onSaved }: CourseFormModalProps) {
    const [form, setForm] = useState<CourseFormData>(
        course
            ? {
                title: course.title,
                description: course.description ?? '',
                price: course.price?.toString() ?? '',
                coverImage: course.coverImage ?? '',
                instructorId: course.instructorId ?? '',
            }
            : EMPTY_FORM
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError('Title is required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                price: form.price ? parseFloat(form.price) : undefined,
                coverImage: form.coverImage.trim() || undefined,
                instructorId: form.instructorId.trim() || undefined,
            };
            if (course) {
                await courseService.update(course.id, payload);
            } else {
                await courseService.create(payload);
            }
            onSaved();
            onClose();
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <h2 className="modal-title">
                    {course ? 'Edit Course' : 'Add New Course'}
                </h2>
                {error && <p className="modal-error">{error}</p>}
                <form onSubmit={handleSubmit} className="modal-form">
                    <label className="form-label">
                        Title <span className="required">*</span>
                    </label>
                    <input
                        id="course-title"
                        name="title"
                        className="form-input"
                        placeholder="e.g. Full-Stack Web Development"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />

                    <label className="form-label">Description</label>
                    <textarea
                        id="course-desc"
                        name="description"
                        className="form-input form-textarea"
                        placeholder="Brief course description..."
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                    />

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Price (VND)</label>
                            <input
                                id="course-price"
                                name="price"
                                className="form-input"
                                type="number"
                                min="0"
                                step="1000"
                                placeholder="0 = Free"
                                value={form.price}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Instructor ID</label>
                            <input
                                id="course-instructor"
                                name="instructorId"
                                className="form-input"
                                placeholder="User ID of instructor"
                                value={form.instructorId}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <label className="form-label">Cover Image URL</label>
                    <input
                        id="course-cover"
                        name="coverImage"
                        className="form-input"
                        placeholder="https://example.com/cover.jpg"
                        value={form.coverImage}
                        onChange={handleChange}
                    />

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            id="course-submit-btn"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : course ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }
        .modal-box {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          width: 100%;
          max-width: 560px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          animation: fadeUp 0.2s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .modal-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        .modal-error {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .required { color: #ef4444; }
        .form-input {
          width: 100%;
          padding: 0.65rem 0.9rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--text-primary);
          transition: border-color 0.2s;
          outline: none;
        }
        .form-input:focus { border-color: var(--primary); }
        .form-textarea { resize: vertical; }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-col { display: flex; flex-direction: column; gap: 0.4rem; }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }
      `}</style>
        </div>
    );
}

// ─── Courses Page ─────────────────────────────────────────────────────────── //

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await courseService.getAll();
            setCourses(data);
        } catch {
            setError('Failed to load courses. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setEditingCourse(null);
        setShowModal(true);
    };

    const openEdit = (course: Course) => {
        setEditingCourse(course);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        setDeletingId(id);
        try {
            await courseService.delete(id);
            await load();
        } catch {
            alert('Failed to delete course.');
        } finally {
            setDeletingId(null);
        }
    };

    const gradients = [
        'linear-gradient(135deg, #135bec, #4bc0c8)',
        'linear-gradient(135deg, #FF6B6B, #556270)',
        'linear-gradient(135deg, #FDB99B, #CF8BF3, #A770EF)',
        'linear-gradient(135deg, #11998e, #38ef7d)',
        'linear-gradient(135deg, #f7971e, #ffd200)',
    ];

    return (
        <div className="page-wrapper">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Course Management</h1>
                    <p className="page-subtitle">
                        Create, edit, and manage your courses
                    </p>
                </div>
                <button
                    id="add-course-btn"
                    className="btn btn-primary add-btn"
                    onClick={openCreate}
                >
                    <FaPlus /> Add Course
                </button>
            </div>

            {/* ── States ── */}
            {error && <div className="alert-error">{error}</div>}

            {loading ? (
                <div className="loading-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-thumb" />
                            <div className="skeleton-body">
                                <div className="skeleton-line wide" />
                                <div className="skeleton-line" />
                                <div className="skeleton-line narrow" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h3>No courses yet</h3>
                    <p>Click "Add Course" to create your first course.</p>
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map((course, idx) => (
                        <div key={course.id} className="c-card">
                            {/* Thumbnail */}
                            <div
                                className="c-thumb"
                                style={{
                                    background: course.coverImage
                                        ? `url(${course.coverImage}) center/cover`
                                        : gradients[idx % gradients.length],
                                }}
                            >
                                {!course.coverImage && <FaImage className="c-thumb-icon" />}
                            </div>

                            {/* Content */}
                            <div className="c-body">
                                <h3 className="c-title">{course.title}</h3>
                                {course.description && (
                                    <p className="c-desc">{course.description}</p>
                                )}
                                <div className="c-meta">
                                    {course.price != null && (
                                        <span className="meta-chip">
                                            <FaTag className="chip-icon" />
                                            {course.price === 0
                                                ? 'Free'
                                                : `${course.price.toLocaleString('vi-VN')}đ`}
                                        </span>
                                    )}
                                    {course.instructorId && (
                                        <span className="meta-chip">
                                            <FaUsers className="chip-icon" />
                                            {course.instructorId}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="c-actions">
                                <a
                                    href={`/courses/${course.id}`}
                                    id={`curriculum-btn-${course.id}`}
                                    className="btn btn-secondary c-action-btn"
                                >
                                    Curriculum →
                                </a>
                                <button
                                    id={`edit-btn-${course.id}`}
                                    className="icon-btn edit-btn"
                                    onClick={() => openEdit(course)}
                                    title="Edit course"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    id={`delete-btn-${course.id}`}
                                    className="icon-btn delete-btn"
                                    onClick={() => handleDelete(course.id)}
                                    disabled={deletingId === course.id}
                                    title="Delete course"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Modal ── */}
            {showModal && (
                <CourseFormModal
                    course={editingCourse}
                    onClose={() => setShowModal(false)}
                    onSaved={load}
                />
            )}

            <style jsx>{`
        .page-wrapper {
          max-width: 1280px;
          margin: 7rem auto 4rem;
          padding: 0 1.5rem;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .page-subtitle {
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }
        /* ── Skeleton ── */
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .skeleton-card { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #eee; }
        .skeleton-thumb { height: 170px; background: linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .skeleton-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .skeleton-line { height: 14px; background: #f3f4f6; border-radius: 4px; animation: shimmer 1.4s infinite; }
        .skeleton-line.wide { width: 80%; }
        .skeleton-line.narrow { width: 40%; }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        /* ── Empty ── */
        .empty-state {
          text-align: center;
          padding: 5rem 1rem;
          color: var(--text-secondary);
        }
        .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
        .empty-state h3 { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary); }
        /* ── Cards ── */
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .c-card {
          background: white;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.25s, box-shadow 0.25s;
          display: flex;
          flex-direction: column;
        }
        .c-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .c-thumb {
          height: 170px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .c-thumb-icon { font-size: 2.5rem; color: rgba(255,255,255,0.5); }
        .c-body { flex: 1; padding: 1.25rem 1.25rem 0; }
        .c-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; }
        .c-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .c-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #f1f5f9;
          border-radius: 20px;
          padding: 0.25rem 0.7rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .chip-icon { font-size: 0.75rem; color: var(--primary); }
        .c-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid #f3f4f6;
          margin-top: 1rem;
        }
        .c-action-btn {
          flex: 1;
          font-size: 0.85rem;
          padding: 0.5rem 0.75rem;
          text-align: center;
        }
        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          border: 1.5px solid transparent;
          transition: all 0.2s;
        }
        .edit-btn { color: var(--primary); border-color: var(--primary); }
        .edit-btn:hover { background: var(--primary); color: white; }
        .delete-btn { color: #ef4444; border-color: #ef4444; }
        .delete-btn:hover { background: #ef4444; color: white; }
        .delete-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
        </div>
    );
}
