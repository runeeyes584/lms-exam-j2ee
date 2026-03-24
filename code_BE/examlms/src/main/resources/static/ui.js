export function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, k);
    else if (v !== false && v != null) node.setAttribute(k, String(v));
  }

  const arr = Array.isArray(children) ? children : [children];
  for (const c of arr) {
    if (c == null) continue;
    if (typeof c === 'string') node.appendChild(document.createTextNode(c));
    else node.appendChild(c);
  }
  return node;
}

export function qs(sel, root = document) {
  return root.querySelector(sel);
}

export function formatMmSs(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function toast(message) {
  let host = document.querySelector('.toast');
  if (!host) {
    host = el('div', { class: 'toast' });
    document.body.appendChild(host);
  }

  const item = el('div', { class: 'item' }, message);
  host.appendChild(item);

  setTimeout(() => {
    item.remove();
    if (host.childElementCount === 0) host.remove();
  }, 2400);
}

export function modal({ title, body, actions = [] }) {
  const backdrop = el('div', { class: 'modal-backdrop' });
  const box = el('div', { class: 'modal' });

  const header = el('div', { class: 'modal-h' }, [
    el('h3', { text: title || 'Dialog' }),
    el('button', {
      class: 'btn',
      type: 'button',
      onClick: () => close()
    }, 'Close')
  ]);

  const content = el('div', { class: 'modal-b' }, body);

  const footer = actions.length
    ? el('div', { class: 'modal-b' }, el('div', { class: 'row' }, actions))
    : null;

  box.appendChild(header);
  box.appendChild(content);
  if (footer) box.appendChild(footer);

  backdrop.appendChild(box);

  function close() {
    backdrop.remove();
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  backdrop.style.display = 'flex';
  document.body.appendChild(backdrop);

  return { close, backdrop, box };
}

export function confirmDialog({ title = 'Confirm', message = 'Are you sure?' }) {
  return new Promise((resolve) => {
    const dlg = modal({
      title,
      body: el('div', {}, [el('div', { style: 'color: var(--muted); margin-bottom: 10px' }, message)]),
      actions: [
        el('button', { class: 'btn', type: 'button', onClick: () => { dlg.close(); resolve(false); } }, 'Cancel'),
        el('button', { class: 'btn danger', type: 'button', onClick: () => { dlg.close(); resolve(true); } }, 'Delete')
      ]
    });
  });
}
