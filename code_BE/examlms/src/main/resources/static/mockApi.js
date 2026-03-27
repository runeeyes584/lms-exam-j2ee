import { getJson, setJson } from './storage.js';
import { buildSeed } from './mockData.js';

const DB_KEY = 'db';

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16).slice(-6)}`;
}

function normalizeQuestion(q) {
  const options = (q.options || []).map((o, idx) => {
    const id = o.id || String.fromCharCode('A'.charCodeAt(0) + idx);
    return { id, text: (o.text || '').trim(), isCorrect: !!o.isCorrect };
  });

  return {
    id: q.id || makeId('q'),
    type: q.type === 'MULTI' ? 'MULTI' : 'SINGLE',
    topic: (q.topic || 'General').trim(),
    difficulty: (q.difficulty || 'EASY').trim().toUpperCase(),
    points: Number.isFinite(Number(q.points)) ? Number(q.points) : 1,
    content: (q.content || '').trim(),
    options,
    explanation: (q.explanation || '').trim(),
    createdAt: q.createdAt || nowIso(),
    updatedAt: nowIso()
  };
}

function ensureDb() {
  const existing = getJson(DB_KEY, null);
  if (existing && existing.questions && existing.exams && existing.attempts) return existing;
  const seed = buildSeed();
  setJson(DB_KEY, seed);
  return seed;
}

function writeDb(db) {
  setJson(DB_KEY, db);
}

export const mockApi = {
  reset() {
    const seed = buildSeed();
    writeDb(seed);
    return clone(seed);
  },

  getStats() {
    const db = ensureDb();
    return {
      questions: db.questions.length,
      exams: db.exams.length,
      attempts: db.attempts.length
    };
  },

  listQuestions({ q = '', topic = 'ALL', difficulty = 'ALL' } = {}) {
    const db = ensureDb();
    const query = q.trim().toLowerCase();

    return clone(db.questions)
      .filter((x) => (query ? x.content.toLowerCase().includes(query) : true))
      .filter((x) => (topic === 'ALL' ? true : x.topic === topic))
      .filter((x) => (difficulty === 'ALL' ? true : x.difficulty === difficulty))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  getQuestion(id) {
    const db = ensureDb();
    return clone(db.questions.find((q) => q.id === id) || null);
  },

  upsertQuestion(question) {
    const db = ensureDb();
    const normalized = normalizeQuestion(question);

    const idx = db.questions.findIndex((q) => q.id === normalized.id);
    if (idx >= 0) db.questions[idx] = { ...db.questions[idx], ...normalized, updatedAt: nowIso() };
    else db.questions.push(normalized);

    writeDb(db);
    return clone(normalized);
  },

  deleteQuestion(id) {
    const db = ensureDb();
    const before = db.questions.length;
    db.questions = db.questions.filter((q) => q.id !== id);

    // Remove from exams
    db.exams = db.exams.map((e) => ({
      ...e,
      questionIds: (e.questionIds || []).filter((qid) => qid !== id)
    }));

    writeDb(db);
    return { deleted: before !== db.questions.length };
  },

  importQuestions(rows) {
    const created = [];
    for (const r of rows) {
      const options = (r.options || []).map((text, idx) => {
        const id = String.fromCharCode('A'.charCodeAt(0) + idx);
        const isCorrect = (r.correct || []).includes(id);
        return { id, text, isCorrect };
      });

      created.push(
        this.upsertQuestion({
          type: r.type,
          topic: r.topic,
          difficulty: r.difficulty,
          points: r.points,
          content: r.content,
          options,
          explanation: r.explanation || ''
        })
      );
    }
    return created;
  },

  listExams() {
    const db = ensureDb();
    return clone(db.exams).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  getExam(id) {
    const db = ensureDb();
    return clone(db.exams.find((e) => e.id === id) || null);
  },

  upsertExam(exam) {
    const db = ensureDb();
    const normalized = {
      id: exam.id || makeId('exam'),
      name: (exam.name || 'Untitled Exam').trim(),
      durationMinutes: Number.isFinite(Number(exam.durationMinutes)) ? Number(exam.durationMinutes) : 10,
      passScore: Number.isFinite(Number(exam.passScore)) ? Number(exam.passScore) : 60,
      mode: exam.mode === 'MATRIX' ? 'MATRIX' : 'MANUAL',
      questionIds: Array.isArray(exam.questionIds) ? Array.from(new Set(exam.questionIds)) : [],
      createdAt: exam.createdAt || nowIso(),
      updatedAt: nowIso()
    };

    const idx = db.exams.findIndex((e) => e.id === normalized.id);
    if (idx >= 0) db.exams[idx] = { ...db.exams[idx], ...normalized, updatedAt: nowIso() };
    else db.exams.push(normalized);

    writeDb(db);
    return clone(normalized);
  },

  startAttempt({ examId, studentName = 'Student' }) {
    const db = ensureDb();
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) throw new Error('Exam not found');

    const attempt = {
      id: makeId('att'),
      examId,
      studentName: (studentName || 'Student').trim(),
      startedAt: nowIso(),
      submittedAt: null,
      answers: {},
      score: null,
      percent: null,
      passed: null
    };

    db.attempts.push(attempt);
    writeDb(db);
    return clone(attempt);
  },

  saveAnswer({ attemptId, questionId, selectedOptionIds }) {
    const db = ensureDb();
    const attempt = db.attempts.find((a) => a.id === attemptId);
    if (!attempt) throw new Error('Attempt not found');

    attempt.answers[questionId] = Array.isArray(selectedOptionIds) ? selectedOptionIds : [];
    writeDb(db);
    return { ok: true };
  },

  submitAttempt(attemptId) {
    const db = ensureDb();
    const attempt = db.attempts.find((a) => a.id === attemptId);
    if (!attempt) throw new Error('Attempt not found');

    const exam = db.exams.find((e) => e.id === attempt.examId);
    if (!exam) throw new Error('Exam not found');

    const questions = db.questions.filter((q) => (exam.questionIds || []).includes(q.id));

    let earned = 0;
    let total = 0;

    for (const q of questions) {
      total += Number(q.points) || 1;
      const selected = new Set(attempt.answers[q.id] || []);
      const correct = new Set(q.options.filter((o) => o.isCorrect).map((o) => o.id));

      const isCorrect =
        selected.size === correct.size &&
        Array.from(selected).every((x) => correct.has(x));

      if (isCorrect) earned += Number(q.points) || 1;
    }

    const percent = total > 0 ? Math.round((earned / total) * 100) : 0;

    attempt.submittedAt = nowIso();
    attempt.score = earned;
    attempt.percent = percent;
    attempt.passed = percent >= Number(exam.passScore || 60);

    writeDb(db);
    return clone(attempt);
  },

  getAttempt(id) {
    const db = ensureDb();
    return clone(db.attempts.find((a) => a.id === id) || null);
  }
};
