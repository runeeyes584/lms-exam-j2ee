import { el, qs, toast, modal, confirmDialog, formatMmSs } from './ui.js';
import { mockApi } from './mockApi.js';
import { generateImportPreview } from './mockData.js';

function pill(text, kind) {
  return el('span', { class: `pill ${kind || ''}`.trim(), text });
}

function renderEmpty(msg) {
  return el('div', { style: 'color: var(--muted); padding: 10px 0' }, msg);
}

export function renderDashboard() {
  const s = mockApi.getStats();

  const cards = el('div', { class: 'grid' }, [
    el('div', { class: 'card', style: 'grid-column: span 4' }, [
      el('div', { class: 'card-h' }, el('h2', { text: 'Questions' })),
      el('div', { class: 'card-b' }, el('div', { style: 'font-size: 28px; font-weight: 750' }, String(s.questions)))
    ]),
    el('div', { class: 'card', style: 'grid-column: span 4' }, [
      el('div', { class: 'card-h' }, el('h2', { text: 'Exams' })),
      el('div', { class: 'card-b' }, el('div', { style: 'font-size: 28px; font-weight: 750' }, String(s.exams)))
    ]),
    el('div', { class: 'card', style: 'grid-column: span 4' }, [
      el('div', { class: 'card-h' }, el('h2', { text: 'Attempts' })),
      el('div', { class: 'card-b' }, el('div', { style: 'font-size: 28px; font-weight: 750' }, String(s.attempts)))
    ]),
    el('div', { class: 'card', style: 'grid-column: span 12' }, [
      el('div', { class: 'card-h' }, [
        el('h2', { text: 'Quick actions' }),
        el('div', { class: 'row' }, [
          el('a', { class: 'btn primary', href: '#/questions' }, 'Question Bank'),
          el('a', { class: 'btn', href: '#/import' }, 'Import UI'),
          el('a', { class: 'btn', href: '#/exams' }, 'Exams'),
          el('a', { class: 'btn', href: '#/take-exam' }, 'Take Exam')
        ])
      ]),
      el('div', { class: 'card-b' }, [
        el('div', { style: 'color: var(--muted); line-height: 1.6' },
          'This is a static, mock-only UI (no backend API calls yet). Data is stored in localStorage so you can refresh without losing work.'
        ),
        el('div', { style: 'margin-top: 10px' }, el('button', {
          class: 'btn danger',
          type: 'button',
          onClick: async () => {
            const ok = await confirmDialog({
              title: 'Reset demo data',
              message: 'This will wipe local UI data and restore seed demo content.'
            });
            if (!ok) return;
            mockApi.reset();
            toast('Demo data reset');
            location.hash = '#/dashboard';
          }
        }, 'Reset demo data'))
      ])
    ])
  ]);

  return cards;
}

function buildQuestionEditor({ initial, onSave }) {
  const q = initial || {
    id: null,
    type: 'SINGLE',
    topic: 'Java',
    difficulty: 'EASY',
    points: 1,
    content: '',
    options: [
      { id: 'A', text: '', isCorrect: false },
      { id: 'B', text: '', isCorrect: false },
      { id: 'C', text: '', isCorrect: false },
      { id: 'D', text: '', isCorrect: false }
    ],
    explanation: ''
  };

  const content = el('textarea', { class: 'textarea', placeholder: 'Question content...' });
  content.value = q.content;

  const type = el('select', { class: 'select' }, [
    el('option', { value: 'SINGLE', text: 'SINGLE (one answer)' }),
    el('option', { value: 'MULTI', text: 'MULTI (multiple answers)' })
  ]);
  type.value = q.type;

  const topic = el('input', { class: 'input', placeholder: 'Topic (e.g., Java)' });
  topic.value = q.topic;

  const difficulty = el('select', { class: 'select' }, [
    el('option', { value: 'EASY', text: 'EASY' }),
    el('option', { value: 'MEDIUM', text: 'MEDIUM' }),
    el('option', { value: 'HARD', text: 'HARD' })
  ]);
  difficulty.value = q.difficulty;

  const points = el('input', { class: 'input', type: 'number', min: '1', step: '1' });
  points.value = String(q.points || 1);

  const explanation = el('textarea', { class: 'textarea', placeholder: 'Explanation (optional)...' });
  explanation.value = q.explanation;

  const optionsTable = el('table', { class: 'table' }, [
    el('thead', {}, el('tr', {}, [
      el('th', {}, 'Option'),
      el('th', {}, 'Text'),
      el('th', {}, 'Correct')
    ])),
    el('tbody', {})
  ]);

  function renderOptions() {
    const tbody = qs('tbody', optionsTable);
    tbody.innerHTML = '';

    q.options.forEach((o, idx) => {
      const input = el('input', { class: 'input', placeholder: `Option ${o.id}` });
      input.value = o.text || '';
      input.addEventListener('input', () => { q.options[idx].text = input.value; });

      const checkbox = el('input', { type: 'checkbox' });
      checkbox.checked = !!o.isCorrect;
      checkbox.addEventListener('change', () => {
        if (type.value === 'SINGLE') {
          q.options.forEach((x) => { x.isCorrect = false; });
        }
        q.options[idx].isCorrect = checkbox.checked;
        renderOptions();
      });

      tbody.appendChild(el('tr', {}, [
        el('td', {}, o.id),
        el('td', {}, input),
        el('td', {}, checkbox)
      ]));
    });
  }

  type.addEventListener('change', () => {
    if (type.value === 'SINGLE') {
      // Keep only the first correct if multiple are selected
      const first = q.options.findIndex((x) => x.isCorrect);
      q.options.forEach((x, i) => { x.isCorrect = i === first; });
      renderOptions();
    }
  });

  renderOptions();

  const form = el('div', { class: 'grid' }, [
    el('div', { class: 'card', style: 'grid-column: span 12; background: transparent; box-shadow: none; border: none' }, [
      el('div', { class: 'row' }, [
        el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Type' }), type]),
        el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Topic' }), topic]),
        el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Difficulty' }), difficulty]),
        el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Points' }), points])
      ]),
      el('div', { style: 'height: 10px' }),
      el('div', { class: 'field', style: 'min-width: 100%' }, [el('div', { class: 'label', text: 'Content' }), content]),
      el('div', { style: 'height: 10px' }),
      el('div', { class: 'field', style: 'min-width: 100%' }, [el('div', { class: 'label', text: 'Options' }), optionsTable]),
      el('div', { style: 'height: 10px' }),
      el('div', { class: 'field', style: 'min-width: 100%' }, [el('div', { class: 'label', text: 'Explanation' }), explanation])
    ])
  ]);

  const saveBtn = el('button', { class: 'btn primary', type: 'button' }, 'Save');
  saveBtn.addEventListener('click', () => {
    const payload = {
      id: q.id,
      type: type.value,
      topic: topic.value,
      difficulty: difficulty.value,
      points: Number(points.value || 1),
      content: content.value,
      explanation: explanation.value,
      options: q.options.map((x) => ({ id: x.id, text: x.text, isCorrect: !!x.isCorrect }))
    };

    if (!payload.content.trim()) {
      toast('Content is required');
      return;
    }

    if (!payload.options.some((x) => x.text.trim())) {
      toast('At least one option text is required');
      return;
    }

    if (!payload.options.some((x) => x.isCorrect)) {
      toast('Select at least one correct option');
      return;
    }

    onSave(payload);
  });

  return { form, saveBtn };
}

export function renderQuestions() {
  const state = { q: '', topic: 'ALL', difficulty: 'ALL' };

  const query = el('input', { class: 'input', placeholder: 'Search in question content...' });
  const topic = el('select', { class: 'select' }, [
    el('option', { value: 'ALL', text: 'All topics' })
  ]);
  const difficulty = el('select', { class: 'select' }, [
    el('option', { value: 'ALL', text: 'All difficulties' }),
    el('option', { value: 'EASY', text: 'EASY' }),
    el('option', { value: 'MEDIUM', text: 'MEDIUM' }),
    el('option', { value: 'HARD', text: 'HARD' })
  ]);

  const table = el('table', { class: 'table' }, [
    el('thead', {}, el('tr', {}, [
      el('th', {}, 'Content'),
      el('th', {}, 'Meta'),
      el('th', {}, 'Actions')
    ])),
    el('tbody', {})
  ]);

  function refreshTopicOptions() {
    const items = mockApi.listQuestions({});
    const topics = Array.from(new Set(items.map((x) => x.topic))).sort();

    topic.innerHTML = '';
    topic.appendChild(el('option', { value: 'ALL', text: 'All topics' }));
    topics.forEach((t) => topic.appendChild(el('option', { value: t, text: t })));
  }

  function render() {
    const items = mockApi.listQuestions(state);
    const tbody = qs('tbody', table);
    tbody.innerHTML = '';

    if (items.length === 0) {
      tbody.appendChild(el('tr', {}, [
        el('td', { colspan: '3' }, renderEmpty('No questions found.'))
      ]));
      return;
    }

    for (const it of items) {
      const meta = el('div', { class: 'row' }, [
        pill(it.type, 'ok'),
        pill(it.topic),
        pill(it.difficulty, it.difficulty === 'HARD' ? 'bad' : it.difficulty === 'MEDIUM' ? 'warn' : 'ok'),
        pill(`${it.points} pts`)
      ]);

      const editBtn = el('button', { class: 'btn', type: 'button' }, 'Edit');
      editBtn.addEventListener('click', () => {
        const editor = buildQuestionEditor({
          initial: it,
          onSave: (payload) => {
            mockApi.upsertQuestion(payload);
            dlg.close();
            refreshTopicOptions();
            render();
            toast('Saved');
          }
        });

        const dlg = modal({
          title: 'Edit question',
          body: editor.form,
          actions: [
            editor.saveBtn,
            el('button', { class: 'btn', type: 'button', onClick: () => dlg.close() }, 'Cancel')
          ]
        });
      });

      const delBtn = el('button', { class: 'btn danger', type: 'button' }, 'Delete');
      delBtn.addEventListener('click', async () => {
        const ok = await confirmDialog({
          title: 'Delete question',
          message: 'This will remove the question from the bank (and from any exams using it).'
        });
        if (!ok) return;
        mockApi.deleteQuestion(it.id);
        refreshTopicOptions();
        render();
        toast('Deleted');
      });

      tbody.appendChild(el('tr', {}, [
        el('td', {}, [
          el('div', { style: 'font-weight: 650; margin-bottom: 6px' }, it.content),
          el('div', { style: 'color: var(--muted); font-size: 12px' }, it.explanation || '—')
        ]),
        el('td', {}, meta),
        el('td', {}, el('div', { class: 'row' }, [editBtn, delBtn]))
      ]));
    }
  }

  query.addEventListener('input', () => { state.q = query.value; render(); });
  topic.addEventListener('change', () => { state.topic = topic.value; render(); });
  difficulty.addEventListener('change', () => { state.difficulty = difficulty.value; render(); });

  const createBtn = el('button', { class: 'btn primary', type: 'button' }, 'New question');
  createBtn.addEventListener('click', () => {
    const editor = buildQuestionEditor({
      initial: null,
      onSave: (payload) => {
        mockApi.upsertQuestion(payload);
        dlg.close();
        refreshTopicOptions();
        render();
        toast('Created');
      }
    });

    const dlg = modal({
      title: 'Create question',
      body: editor.form,
      actions: [
        editor.saveBtn,
        el('button', { class: 'btn', type: 'button', onClick: () => dlg.close() }, 'Cancel')
      ]
    });
  });

  refreshTopicOptions();
  render();

  return el('div', { class: 'grid' }, [
    el('div', { class: 'card', style: 'grid-column: span 12' }, [
      el('div', { class: 'card-h' }, [
        el('h2', { text: 'Question Bank' }),
        el('div', { class: 'row' }, [
          el('a', { class: 'btn', href: '#/import' }, 'Import UI'),
          createBtn
        ])
      ]),
      el('div', { class: 'card-b' }, [
        el('div', { class: 'row' }, [
          el('div', { class: 'field', style: 'min-width: 260px' }, [el('div', { class: 'label', text: 'Search' }), query]),
          el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Topic' }), topic]),
          el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Difficulty' }), difficulty])
        ]),
        el('div', { style: 'height: 12px' }),
        table
      ])
    ])
  ]);
}

export function renderImport() {
  const preview = generateImportPreview();

  const file = el('input', { class: 'input', type: 'file', accept: '.xlsx,.xls,.csv' });
  const status = el('div', { style: 'color: var(--muted); font-size: 13px' }, 'Choose a file to simulate import (no parsing yet).');

  const table = el('table', { class: 'table' }, [
    el('thead', {}, el('tr', {}, [
      el('th', {}, 'Content'),
      el('th', {}, 'Type'),
      el('th', {}, 'Topic'),
      el('th', {}, 'Difficulty'),
      el('th', {}, 'Correct')
    ])),
    el('tbody', {})
  ]);

  function renderPreview() {
    const tbody = qs('tbody', table);
    tbody.innerHTML = '';

    for (const r of preview) {
      tbody.appendChild(el('tr', {}, [
        el('td', {}, r.content),
        el('td', {}, pill(r.type, 'ok')),
        el('td', {}, pill(r.topic)),
        el('td', {}, pill(r.difficulty, r.difficulty === 'HARD' ? 'bad' : r.difficulty === 'MEDIUM' ? 'warn' : 'ok')),
        el('td', {}, pill((r.correct || []).join(', ') || '—'))
      ]));
    }
  }

  renderPreview();

  file.addEventListener('change', () => {
    const f = file.files && file.files[0];
    status.textContent = f
      ? `Selected: ${f.name} (${Math.round(f.size / 1024)} KB). Preview below is demo data.`
      : 'Choose a file to simulate import (no parsing yet).';
  });

  const validateBtn = el('button', { class: 'btn', type: 'button' }, 'Simulate validate');
  const importBtn = el('button', { class: 'btn primary', type: 'button' }, 'Import preview rows');

  validateBtn.addEventListener('click', () => {
    const errors = [];
    preview.forEach((r, idx) => {
      if (!r.content || !r.content.trim()) errors.push(`Row ${idx + 1}: empty content`);
      if (!Array.isArray(r.options) || r.options.length < 2) errors.push(`Row ${idx + 1}: need >= 2 options`);
      if (!Array.isArray(r.correct) || r.correct.length < 1) errors.push(`Row ${idx + 1}: missing correct answer`);
    });

    if (errors.length === 0) toast('Validation OK');
    else toast(`Validation errors: ${errors.length}`);
  });

  importBtn.addEventListener('click', () => {
    mockApi.importQuestions(preview);
    toast('Imported into Question Bank');
    location.hash = '#/questions';
  });

  return el('div', { class: 'grid' }, [
    el('div', { class: 'card', style: 'grid-column: span 12' }, [
      el('div', { class: 'card-h' }, [
        el('h2', { text: 'Import Questions (UI only)' }),
        el('div', { class: 'row' }, [
          el('a', { class: 'btn', href: '#/questions' }, 'Back to bank')
        ])
      ]),
      el('div', { class: 'card-b' }, [
        el('div', { class: 'row' }, [
          el('div', { class: 'field', style: 'min-width: 340px' }, [el('div', { class: 'label', text: 'Excel file' }), file]),
          el('div', { class: 'field', style: 'min-width: 340px' }, [el('div', { class: 'label', text: 'Status' }), status])
        ]),
        el('div', { style: 'height: 10px' }),
        el('div', { class: 'row' }, [validateBtn, importBtn]),
        el('div', { style: 'height: 12px' }),
        table
      ])
    ])
  ]);
}

function randomPick(arr, count) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function renderExams() {
  const items = mockApi.listExams();

  const table = el('table', { class: 'table' }, [
    el('thead', {}, el('tr', {}, [
      el('th', {}, 'Name'),
      el('th', {}, 'Meta'),
      el('th', {}, 'Actions')
    ])),
    el('tbody', {})
  ]);

  function render() {
    const exams = mockApi.listExams();
    const tbody = qs('tbody', table);
    tbody.innerHTML = '';

    if (exams.length === 0) {
      tbody.appendChild(el('tr', {}, el('td', { colspan: '3' }, renderEmpty('No exams yet. Create one in the builder.'))));
      return;
    }

    for (const e of exams) {
      const meta = el('div', { class: 'row' }, [
        pill(`${e.durationMinutes} min`),
        pill(`pass ${e.passScore}%`, 'ok'),
        pill(e.mode)
      ]);

      const openBtn = el('a', { class: 'btn', href: `#/exam-builder?id=${encodeURIComponent(e.id)}` }, 'Open');
      tbody.appendChild(el('tr', {}, [
        el('td', {}, [
          el('div', { style: 'font-weight: 650' }, e.name),
          el('div', { style: 'color: var(--muted); font-size: 12px' }, `${(e.questionIds || []).length} questions`) 
        ]),
        el('td', {}, meta),
        el('td', {}, openBtn)
      ]));
    }
  }

  render();

  return el('div', { class: 'grid' }, [
    el('div', { class: 'card', style: 'grid-column: span 12' }, [
      el('div', { class: 'card-h' }, [
        el('h2', { text: 'Exams' }),
        el('div', { class: 'row' }, [
          el('a', { class: 'btn primary', href: '#/exam-builder' }, 'New exam')
        ])
      ]),
      el('div', { class: 'card-b' }, table)
    ])
  ]);
}

export function renderExamBuilder({ query }) {
  const editingId = query && query.id ? String(query.id) : null;
  const existing = editingId ? mockApi.getExam(editingId) : null;

  const name = el('input', { class: 'input', placeholder: 'Exam name' });
  name.value = existing ? existing.name : '';

  const duration = el('input', { class: 'input', type: 'number', min: '1', step: '1' });
  duration.value = String(existing ? existing.durationMinutes : 15);

  const passScore = el('input', { class: 'input', type: 'number', min: '0', max: '100', step: '1' });
  passScore.value = String(existing ? existing.passScore : 60);

  const mode = el('select', { class: 'select' }, [
    el('option', { value: 'MANUAL', text: 'MANUAL (pick questions)' }),
    el('option', { value: 'MATRIX', text: 'MATRIX/RANDOM (stub UI)' })
  ]);
  mode.value = existing ? existing.mode : 'MANUAL';

  const qAll = mockApi.listQuestions({});
  const selected = new Set((existing && existing.questionIds) ? existing.questionIds : []);

  const matrixEasy = el('input', { class: 'input', type: 'number', min: '0', step: '1' });
  const matrixMed = el('input', { class: 'input', type: 'number', min: '0', step: '1' });
  const matrixHard = el('input', { class: 'input', type: 'number', min: '0', step: '1' });
  matrixEasy.value = '2';
  matrixMed.value = '1';
  matrixHard.value = '0';

  const table = el('table', { class: 'table' }, [
    el('thead', {}, el('tr', {}, [
      el('th', {}, ''),
      el('th', {}, 'Question'),
      el('th', {}, 'Meta')
    ])),
    el('tbody', {})
  ]);

  function renderTable() {
    const tbody = qs('tbody', table);
    tbody.innerHTML = '';

    for (const q of qAll) {
      const cb = el('input', { type: 'checkbox' });
      cb.checked = selected.has(q.id);
      cb.addEventListener('change', () => {
        if (cb.checked) selected.add(q.id);
        else selected.delete(q.id);
        counter.textContent = `${selected.size} selected`;
      });

      tbody.appendChild(el('tr', {}, [
        el('td', {}, cb),
        el('td', {}, q.content),
        el('td', {}, el('div', { class: 'row' }, [pill(q.type, 'ok'), pill(q.difficulty), pill(`${q.points} pts`)]))
      ]));
    }
  }

  const counter = el('div', { style: 'color: var(--muted); font-size: 13px' }, `${selected.size} selected`);

  const generateBtn = el('button', { class: 'btn', type: 'button' }, 'Generate from matrix');
  generateBtn.addEventListener('click', () => {
    const easy = Number(matrixEasy.value || 0);
    const med = Number(matrixMed.value || 0);
    const hard = Number(matrixHard.value || 0);

    const picked = [
      ...randomPick(qAll.filter((x) => x.difficulty === 'EASY'), easy),
      ...randomPick(qAll.filter((x) => x.difficulty === 'MEDIUM'), med),
      ...randomPick(qAll.filter((x) => x.difficulty === 'HARD'), hard)
    ];

    selected.clear();
    picked.forEach((q) => selected.add(q.id));

    renderTable();
    counter.textContent = `${selected.size} selected`;
    toast('Generated selection (mock)');
  });

  renderTable();

  const saveBtn = el('button', { class: 'btn primary', type: 'button' }, 'Save exam');
  saveBtn.addEventListener('click', () => {
    const payload = {
      id: existing ? existing.id : null,
      name: name.value,
      durationMinutes: Number(duration.value || 10),
      passScore: Number(passScore.value || 60),
      mode: mode.value,
      questionIds: Array.from(selected)
    };

    if (!payload.name.trim()) {
      toast('Name is required');
      return;
    }

    if (payload.questionIds.length === 0) {
      toast('Pick at least 1 question');
      return;
    }

    const saved = mockApi.upsertExam(payload);
    toast('Exam saved');
    location.hash = `#/exam-builder?id=${encodeURIComponent(saved.id)}`;
  });

  return el('div', { class: 'grid' }, [
    el('div', { class: 'card', style: 'grid-column: span 12' }, [
      el('div', { class: 'card-h' }, [
        el('h2', { text: existing ? 'Exam Builder (edit)' : 'Exam Builder (new)' }),
        el('div', { class: 'row' }, [
          el('a', { class: 'btn', href: '#/exams' }, 'Back'),
          saveBtn
        ])
      ]),
      el('div', { class: 'card-b' }, [
        el('div', { class: 'row' }, [
          el('div', { class: 'field', style: 'min-width: 320px' }, [el('div', { class: 'label', text: 'Name' }), name]),
          el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Duration (min)' }), duration]),
          el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Pass score (%)' }), passScore]),
          el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Mode' }), mode])
        ]),
        el('div', { style: 'height: 10px' }),
        el('div', { class: 'row' }, [
          counter,
          el('div', { style: 'flex: 1' }),
          el('div', { class: 'row' }, [
            el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Easy' }), matrixEasy]),
            el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Medium' }), matrixMed]),
            el('div', { class: 'field' }, [el('div', { class: 'label', text: 'Hard' }), matrixHard]),
            generateBtn
          ])
        ]),
        el('div', { style: 'height: 12px' }),
        table
      ])
    ])
  ]);
}

export function renderTakeExam() {
  const exams = mockApi.listExams();
  const select = el('select', { class: 'select' }, exams.map((e) => el('option', { value: e.id, text: e.name })));

  const student = el('input', { class: 'input', placeholder: 'Student name (optional)' });
  student.value = 'Student';

  const startBtn = el('button', { class: 'btn primary', type: 'button' }, 'Start');

  const container = el('div', { class: 'grid' });

  function renderStarter() {
    container.innerHTML = '';

    const body = exams.length
      ? el('div', {}, [
          el('div', { class: 'row' }, [
            el('div', { class: 'field', style: 'min-width: 360px' }, [el('div', { class: 'label', text: 'Exam' }), select]),
            el('div', { class: 'field', style: 'min-width: 240px' }, [el('div', { class: 'label', text: 'Student' }), student]),
            el('div', { class: 'field' }, [el('div', { class: 'label', text: ' ' }), startBtn])
          ])
        ])
      : renderEmpty('No exams. Create one first.');

    container.appendChild(el('div', { class: 'card', style: 'grid-column: span 12' }, [
      el('div', { class: 'card-h' }, el('h2', { text: 'Take Exam (mock)' })),
      el('div', { class: 'card-b' }, body)
    ]));
  }

  function renderAttempt(attempt) {
    const exam = mockApi.getExam(attempt.examId);
    const bank = mockApi.listQuestions({});
    const questions = bank.filter((q) => (exam.questionIds || []).includes(q.id));

    let idx = 0;
    let remaining = Math.max(60, Number(exam.durationMinutes || 10) * 60);

    const timer = el('div', { class: 'kbd' }, `Time: ${formatMmSs(remaining)}`);

    const questionHost = el('div', {});

    function saveSelected(questionId, selectedOptionIds) {
      mockApi.saveAnswer({ attemptId: attempt.id, questionId, selectedOptionIds });
    }

    function renderQuestion() {
      const q = questions[idx];
      if (!q) {
        questionHost.innerHTML = '';
        questionHost.appendChild(renderEmpty('No questions in this exam.'));
        return;
      }

      const attemptFresh = mockApi.getAttempt(attempt.id);
      const selected = new Set((attemptFresh.answers && attemptFresh.answers[q.id]) || []);

      const options = el('div', { style: 'display: grid; gap: 8px; margin-top: 10px' });

      q.options.forEach((o) => {
        const inputType = q.type === 'MULTI' ? 'checkbox' : 'radio';
        const input = el('input', { type: inputType, name: `q_${q.id}` });
        input.checked = selected.has(o.id);
        input.addEventListener('change', () => {
          if (q.type === 'SINGLE') {
            selected.clear();
            if (input.checked) selected.add(o.id);
          } else {
            if (input.checked) selected.add(o.id);
            else selected.delete(o.id);
          }
          saveSelected(q.id, Array.from(selected));
        });

        const row = el('label', { class: 'btn', style: 'justify-content: flex-start; width: 100%' }, [
          input,
          el('div', { style: 'width: 10px' }),
          el('div', {}, `${o.id}. ${o.text}`)
        ]);

        options.appendChild(row);
      });

      const nav = el('div', { class: 'row', style: 'margin-top: 12px' }, [
        el('button', {
          class: 'btn',
          type: 'button',
          disabled: idx === 0,
          onClick: () => { idx = Math.max(0, idx - 1); renderQuestion(); }
        }, 'Prev'),
        el('button', {
          class: 'btn',
          type: 'button',
          disabled: idx >= questions.length - 1,
          onClick: () => { idx = Math.min(questions.length - 1, idx + 1); renderQuestion(); }
        }, 'Next'),
        el('div', { style: 'flex: 1' }),
        el('button', {
          class: 'btn primary',
          type: 'button',
          onClick: () => {
            const submitted = mockApi.submitAttempt(attempt.id);
            toast('Submitted');
            location.hash = `#/review?attemptId=${encodeURIComponent(submitted.id)}`;
          }
        }, 'Submit')
      ]);

      questionHost.innerHTML = '';
      questionHost.appendChild(el('div', { style: 'color: var(--muted); font-size: 12px' }, `Question ${idx + 1}/${questions.length}`));
      questionHost.appendChild(el('div', { style: 'font-weight: 700; margin-top: 6px' }, q.content));
      questionHost.appendChild(el('div', { class: 'row', style: 'margin-top: 8px' }, [pill(q.type, 'ok'), pill(q.difficulty), pill(`${q.points} pts`)]));
      questionHost.appendChild(options);
      questionHost.appendChild(nav);
    }

    const tick = setInterval(() => {
      remaining -= 1;
      timer.textContent = `Time: ${formatMmSs(remaining)}`;
      if (remaining <= 0) {
        clearInterval(tick);
        const submitted = mockApi.submitAttempt(attempt.id);
        toast('Time up - auto submitted');
        location.hash = `#/review?attemptId=${encodeURIComponent(submitted.id)}`;
      }
    }, 1000);

    const stopOnRoute = () => {
      clearInterval(tick);
      window.removeEventListener('hashchange', stopOnRoute);
    };
    window.addEventListener('hashchange', stopOnRoute);

    renderQuestion();

    container.innerHTML = '';
    container.appendChild(el('div', { class: 'card', style: 'grid-column: span 12' }, [
      el('div', { class: 'card-h' }, [
        el('h2', { text: `Attempt: ${exam.name}` }),
        el('div', { class: 'row' }, [timer])
      ]),
      el('div', { class: 'card-b' }, questionHost)
    ]));
  }

  startBtn.addEventListener('click', () => {
    if (exams.length === 0) return;
    const att = mockApi.startAttempt({ examId: select.value, studentName: student.value });
    renderAttempt(att);
  });

  renderStarter();

  return container;
}

export function renderReview({ query }) {
  const attemptId = query && query.attemptId ? String(query.attemptId) : null;
  const attempt = attemptId ? mockApi.getAttempt(attemptId) : null;

  if (!attempt) {
    return el('div', { class: 'grid' }, [
      el('div', { class: 'card', style: 'grid-column: span 12' }, [
        el('div', { class: 'card-h' }, el('h2', { text: 'Review' })),
        el('div', { class: 'card-b' }, renderEmpty('Attempt not found. Start an exam first.'))
      ])
    ]);
  }

  const exam = mockApi.getExam(attempt.examId);
  const bank = mockApi.listQuestions({});
  const questions = bank.filter((q) => (exam.questionIds || []).includes(q.id));

  const header = el('div', { class: 'row' }, [
    pill(attempt.passed ? 'PASSED' : 'FAILED', attempt.passed ? 'ok' : 'bad'),
    pill(`Score: ${attempt.score}`),
    pill(`Percent: ${attempt.percent}%`)
  ]);

  const list = el('div', { style: 'display: grid; gap: 12px' });

  for (const q of questions) {
    const selected = new Set((attempt.answers && attempt.answers[q.id]) || []);
    const correct = new Set(q.options.filter((o) => o.isCorrect).map((o) => o.id));
    const isCorrect = selected.size === correct.size && Array.from(selected).every((x) => correct.has(x));

    const rows = el('div', { style: 'display: grid; gap: 6px; margin-top: 8px' });

    q.options.forEach((o) => {
      const picked = selected.has(o.id);
      const ok = correct.has(o.id);
      const mark = ok ? 'ok' : picked ? 'bad' : '';
      rows.appendChild(el('div', { class: `pill ${mark}`.trim() }, `${o.id}. ${o.text}`));
    });

    list.appendChild(el('div', { class: 'card', style: 'box-shadow: none' }, [
      el('div', { class: 'card-h' }, [
        el('h2', { text: isCorrect ? 'Correct' : 'Incorrect' }),
        el('div', { class: 'row' }, [pill(q.difficulty), pill(q.type, 'ok'), pill(`${q.points} pts`)])
      ]),
      el('div', { class: 'card-b' }, [
        el('div', { style: 'font-weight: 650' }, q.content),
        rows,
        el('div', { style: 'color: var(--muted); margin-top: 10px' }, q.explanation || '—')
      ])
    ]));
  }

  return el('div', { class: 'grid' }, [
    el('div', { class: 'card', style: 'grid-column: span 12' }, [
      el('div', { class: 'card-h' }, [
        el('h2', { text: 'Review' }),
        el('div', { class: 'row' }, [
          el('a', { class: 'btn', href: '#/take-exam' }, 'Back')
        ])
      ]),
      el('div', { class: 'card-b' }, [header, el('div', { style: 'height: 12px' }), list])
    ])
  ]);
}

export function renderNotFound() {
  return el('div', { class: 'grid' }, [
    el('div', { class: 'card', style: 'grid-column: span 12' }, [
      el('div', { class: 'card-h' }, el('h2', { text: 'Not found' })),
      el('div', { class: 'card-b' }, [
        renderEmpty('Route not found.'),
        el('div', { style: 'margin-top: 10px' }, el('a', { class: 'btn primary', href: '#/dashboard' }, 'Go dashboard'))
      ])
    ])
  ]);
}
