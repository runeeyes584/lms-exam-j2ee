'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { mediaService } from '@/services/mediaService';
import type { MediaResource } from '@/types/backend';
import {
    FaArrowLeft, FaPlayCircle, FaFileAlt, FaDownload, FaTrash, FaLink, FaUpload
} from 'react-icons/fa';

function getEmbedUrl(url: string): string | null {
    // YouTube short & full
    const ytShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
    const ytFull = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (ytFull) return `https://www.youtube.com/embed/${ytFull[1]}`;
    // Vimeo
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    // Already an embed URL
    if (url.includes('embed')) return url;
    return null;
}

// ─── Video Tab ─────────────────────────────────────────────────────────────── //
function VideoTab({
    lessonId,
    onSaved,
}: {
    lessonId: string;
    onSaved: () => void;
}) {
    const [url, setUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState('');

    const handleSave = async () => {
        if (!url.trim()) return;
        setSaving(true);
        try {
            await mediaService.addVideoLink(lessonId, url.trim());
            setUrl('');
            setPreview('');
            onSaved();
        } catch {
            alert('Failed to save video link');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tab-body">
            <p className="tab-hint">Paste a YouTube or Vimeo URL to embed it in this lesson.</p>
            <div className="url-row">
                <input
                    id="video-url-input"
                    className="url-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
                    className="btn btn-secondary preview-btn"
                    onClick={() => setPreview(url.trim())}
                    type="button"
                >
                    Preview
                </button>
                <button
                    id="save-video-btn"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving || !url.trim()}
                    type="button"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {preview && (() => {
                const embed = getEmbedUrl(preview);
                return embed ? (
                    <div className="video-preview-wrap">
                        <iframe
                            src={embed}
                            title="Video preview"
                            allowFullScreen
                            className="video-iframe"
                        />
                    </div>
                ) : (
                    <p className="preview-error">Could not detect a YouTube or Vimeo URL. Please check the link.</p>
                );
            })()}

            <style jsx>{`
        .tab-body { display: flex; flex-direction: column; gap: 1rem; }
        .tab-hint { color: var(--text-secondary); font-size: 0.9rem; }
        .url-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .url-input {
          flex: 1;
          padding: 0.65rem 0.9rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
          outline: none;
          min-width: 200px;
        }
        .url-input:focus { border-color: var(--primary); }
        .preview-btn { padding: 0.65rem 1rem; font-size: 0.9rem; }
        .video-preview-wrap {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .video-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
        .preview-error { color: #ef4444; font-size: 0.85rem; }
      `}</style>
        </div>
    );
}

// ─── Document Tab ──────────────────────────────────────────────────────────── //
function DocumentTab({
    lessonId,
    onSaved,
}: {
    lessonId: string;
    onSaved: () => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            await mediaService.uploadDocument(lessonId, file);
            setFile(null);
            if (fileRef.current) fileRef.current.value = '';
            onSaved();
        } catch {
            alert('Upload failed. Ensure the backend is running and file size ≤ 100MB.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) setFile(dropped);
    };

    return (
        <div className="tab-body">
            <p className="tab-hint">Upload a PDF or DOCX file. Students will be able to download it.</p>

            <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
            >
                <FaUpload className="drop-icon" />
                {file ? (
                    <p className="drop-text file-name">{file.name}</p>
                ) : (
                    <>
                        <p className="drop-text">Drag & drop your file here, or click to browse</p>
                        <p className="drop-hint">Supports PDF, DOCX (max 100 MB)</p>
                    </>
                )}
            </div>

            <input
                ref={fileRef}
                type="file"
                id="doc-file-input"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            {file && (
                <div className="upload-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                        type="button"
                    >
                        Remove
                    </button>
                    <button
                        id="upload-doc-btn"
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={uploading}
                        type="button"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            )}

            <style jsx>{`
        .tab-body { display: flex; flex-direction: column; gap: 1rem; }
        .tab-hint { color: var(--text-secondary); font-size: 0.9rem; }
        .drop-zone {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 2.5rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: #f9fafb;
        }
        .drop-zone.drag-over { border-color: var(--primary); background: #eff6ff; }
        .drop-zone.has-file { border-color: #22c55e; background: #f0fdf4; }
        .drop-icon { font-size: 2rem; color: #9ca3af; }
        .drop-zone.has-file .drop-icon { color: #22c55e; }
        .drop-text { font-size: 0.9rem; color: var(--text-secondary); }
        .file-name { font-weight: 600; color: var(--text-primary); }
        .drop-hint { font-size: 0.8rem; color: #9ca3af; }
        .upload-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
      `}</style>
        </div>
    );
}

// ─── Media Resource Card ───────────────────────────────────────────────────── //
function MediaCard({
    resource,
    onDelete,
}: {
    resource: MediaResource;
    onDelete: () => void;
}) {
    const embedUrl = resource.type === 'VIDEO' ? getEmbedUrl(resource.url) : null;

    return (
        <div className="media-card">
            {resource.type === 'VIDEO' ? (
                <div className="media-card-icon video-icon"><FaPlayCircle /></div>
            ) : (
                <div className="media-card-icon doc-icon"><FaFileAlt /></div>
            )}
            <div className="media-card-body">
                <p className="media-type-label">{resource.type}</p>
                <p className="media-name">
                    {resource.originalFileName || resource.url}
                </p>
                {embedUrl && (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="media-link">
                        <FaLink /> View original
                    </a>
                )}
            </div>
            <div className="media-card-actions">
                {resource.type === 'DOCUMENT' && resource.downloadUrl && (
                    <a
                        href={resource.downloadUrl}
                        id={`download-${resource.id}`}
                        className="icon-action download-action"
                        title="Download"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaDownload />
                    </a>
                )}
                <button
                    id={`delete-media-${resource.id}`}
                    className="icon-action delete-action"
                    onClick={onDelete}
                    title="Delete resource"
                >
                    <FaTrash />
                </button>
            </div>

            <style jsx>{`
        .media-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .media-card-icon { font-size: 1.5rem; flex-shrink: 0; }
        .video-icon { color: #ef4444; }
        .doc-icon { color: #3b82f6; }
        .media-card-body { flex: 1; min-width: 0; }
        .media-type-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .media-name { font-size: 0.9rem; color: var(--text-primary); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .media-link { font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; color: var(--primary); margin-top: 0.2rem; }
        .media-card-actions { display: flex; gap: 0.35rem; }
        .icon-action {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          transition: all 0.15s;
          color: var(--text-secondary);
          text-decoration: none;
        }
        .download-action:hover { background: #eff6ff; border-color: var(--primary); color: var(--primary); }
        .delete-action:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
      `}</style>
        </div>
    );
}

// ─── Main Lesson Page ──────────────────────────────────────────────────────── //
export default function LessonMediaPage() {
    const params = useParams();
    const courseId = params?.id as string;
    const lessonId = params?.lessonId as string;

    const [resources, setResources] = useState<MediaResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'video' | 'document'>('video');

    const loadData = useCallback(async () => {
        if (!lessonId) return;
        setLoading(true);
        try {
            const resourceData = await mediaService.getByLesson(lessonId);
            setResources(resourceData);
        } catch {
            setResources([]);
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    // Better lesson load — fetch all lessons by chapterId isn't available directly,
    // so we just show the lesson ID and media
    useEffect(() => { loadData(); }, [loadData]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this media resource?')) return;
        try {
            await mediaService.delete(id);
            setResources((prev) => prev.filter((r) => r.id !== id));
        } catch {
            alert('Failed to delete resource');
        }
    };

    const handleMediaSaved = async () => {
        const updated = await mediaService.getByLesson(lessonId);
        setResources(updated);
    };

    const videos = resources.filter((r) => r.type === 'VIDEO');
    const docs = resources.filter((r) => r.type === 'DOCUMENT');

    return (
        <div className="page-wrapper">
            {/* Nav */}
            <a href={`/courses/${courseId}`} className="back-link">
                <FaArrowLeft /> Back to Curriculum
            </a>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Lesson Media</h1>
                    <p className="page-subtitle">Add videos and documents to this lesson</p>
                </div>
            </div>

            {/* ── Add Media ── */}
            <div className="panel">
                <h2 className="panel-title">Add Media Resource</h2>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        id="tab-video"
                        className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                        onClick={() => setActiveTab('video')}
                    >
                        <FaPlayCircle /> Video
                    </button>
                    <button
                        id="tab-document"
                        className={`tab-btn ${activeTab === 'document' ? 'active' : ''}`}
                        onClick={() => setActiveTab('document')}
                    >
                        <FaFileAlt /> Document
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'video' ? (
                        <VideoTab lessonId={lessonId} onSaved={handleMediaSaved} />
                    ) : (
                        <DocumentTab lessonId={lessonId} onSaved={handleMediaSaved} />
                    )}
                </div>
            </div>

            {/* ── Existing Media ── */}
            {!loading && (
                <>
                    {/* Videos */}
                    {videos.length > 0 && (
                        <div className="panel">
                            <h2 className="panel-title">Videos ({videos.length})</h2>
                            <div className="media-list">
                                {videos.map((r) => (
                                    <MediaCard key={r.id} resource={r} onDelete={() => handleDelete(r.id)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    {docs.length > 0 && (
                        <div className="panel">
                            <h2 className="panel-title">Documents ({docs.length})</h2>
                            <div className="media-list">
                                {docs.map((r) => (
                                    <MediaCard key={r.id} resource={r} onDelete={() => handleDelete(r.id)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {resources.length === 0 && (
                        <div className="empty-state">
                            <span className="empty-icon">🎬</span>
                            <p>No media resources yet. Add a video or document above.</p>
                        </div>
                    )}
                </>
            )}

            <style jsx>{`
        .page-wrapper { max-width: 760px; margin: 7rem auto 4rem; padding: 0 1.5rem; }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover { color: var(--primary); }
        .page-header { margin-bottom: 1.5rem; }
        .page-title { font-size: 1.9rem; font-weight: 800; }
        .page-subtitle { color: var(--text-secondary); margin-top: 0.25rem; }

        .panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }
        .panel-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        /* ── Tabs ── */
        .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          border: 1.5px solid #e5e7eb;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s;
          background: white;
        }
        .tab-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .tab-btn:hover:not(.active) { border-color: var(--primary); color: var(--primary); }

        .media-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .empty-icon { font-size: 3rem; }
      `}</style>
        </div>
    );
}
