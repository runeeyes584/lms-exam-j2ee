const PREFIX = 'lms-exam-ui:';

export function getJson(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setJson(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function clearAll() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
