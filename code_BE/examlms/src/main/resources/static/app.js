import { createRouter } from './router.js';
import { el, qs } from './ui.js';
import {
  renderDashboard,
  renderQuestions,
  renderImport,
  renderExams,
  renderExamBuilder,
  renderTakeExam,
  renderReview,
  renderNotFound
} from './views.js';

async function loadConfig() {
  const defaults = {
    appName: 'LMS Exam (Mock UI)',
    enableMockPersistence: true
  };

  try {
    const res = await fetch('./app-config.json', { cache: 'no-store' });
    if (!res.ok) return defaults;
    const json = await res.json();
    return { ...defaults, ...json };
  } catch {
    return defaults;
  }
}

function buildShell(appName) {
  const navItems = [
    { href: '#/dashboard', label: 'Dashboard' },
    { href: '#/questions', label: 'Question Bank' },
    { href: '#/import', label: 'Import UI' },
    { href: '#/exams', label: 'Exams' },
    { href: '#/exam-builder', label: 'Exam Builder' },
    { href: '#/take-exam', label: 'Take Exam' }
  ];

  const sidebar = el('aside', { class: 'sidebar' }, [
    el('div', { class: 'brand' }, [
      el('div', { style: 'width: 12px; height: 12px; border-radius: 4px; background: var(--primary); box-shadow: 0 0 0 6px rgba(110,168,254,0.12)' }),
      el('div', {}, [
        el('div', { style: 'font-weight: 800; letter-spacing: 0.2px' }, appName),
        el('div', { class: 'badge' }, 'Mock-only')
      ])
    ]),
    el('nav', { class: 'nav' }, navItems.map((it) => el('a', { href: it.href, 'data-nav': it.href }, it.label)))
  ]);

  const topbarTitle = el('h1', { text: '—' });
  const topbar = el('div', { class: 'topbar' }, [
    topbarTitle,
    el('div', { class: 'row' }, [
      el('div', { class: 'kbd' }, 'Tip: refresh is safe (localStorage)')
    ])
  ]);

  const content = el('div', { id: 'content', style: 'margin-top: 16px' });

  const main = el('main', { class: 'main' }, [topbar, content]);

  const root = el('div', { class: 'container' }, [sidebar, main]);

  return { root, content, topbarTitle, navItems };
}

function setActiveNav(navHref) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('data-nav') === navHref);
  });
}

function setTitle(title) {
  const node = qs('.topbar h1');
  if (node) node.textContent = title;
  document.title = title;
}

function mount(contentNode, view) {
  contentNode.innerHTML = '';
  contentNode.appendChild(view);
}

(async function main() {
  const cfg = await loadConfig();

  const app = qs('#app');
  const shell = buildShell(cfg.appName);
  app.appendChild(shell.root);

  const router = createRouter();

  router.onChange((loc) => {
    const navMatch = {
      '/dashboard': '#/dashboard',
      '/questions': '#/questions',
      '/import': '#/import',
      '/exams': '#/exams',
      '/exam-builder': '#/exam-builder',
      '/take-exam': '#/take-exam',
      '/review': null
    };

    const href = navMatch[loc.path] || null;
    if (href) setActiveNav(href);

    const titleMap = {
      '/dashboard': `${cfg.appName} - Dashboard`,
      '/questions': `${cfg.appName} - Question Bank`,
      '/import': `${cfg.appName} - Import UI`,
      '/exams': `${cfg.appName} - Exams`,
      '/exam-builder': `${cfg.appName} - Exam Builder`,
      '/take-exam': `${cfg.appName} - Take Exam`,
      '/review': `${cfg.appName} - Review`
    };

    setTitle(titleMap[loc.path] || `${cfg.appName}`);
  });

  router.onRender((view) => {
    if (view) mount(shell.content, view);
  });

  router.add('/dashboard', () => renderDashboard());
  router.add('/questions', () => renderQuestions());
  router.add('/import', () => renderImport());
  router.add('/exams', () => renderExams());
  router.add('/exam-builder', (loc) => renderExamBuilder(loc));
  router.add('/take-exam', () => renderTakeExam());
  router.add('/review', (loc) => renderReview(loc));
  router.add('/404', () => renderNotFound());

  // Start router once
  router.start();
})();
