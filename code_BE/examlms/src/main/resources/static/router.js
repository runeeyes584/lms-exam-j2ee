function normalizeHash(hash) {
  const h = (hash || '').replace(/^#/, '');
  if (!h || h === '/') return '/dashboard';
  return h.startsWith('/') ? h : `/${h}`;
}

export function parseLocation() {
  const raw = normalizeHash(location.hash);
  const [path, queryString] = raw.split('?');

  const query = {};
  if (queryString) {
    const sp = new URLSearchParams(queryString);
    for (const [k, v] of sp.entries()) query[k] = v;
  }

  return { path, query, raw };
}

export function createRouter() {
  const routes = new Map();
  const changeListeners = [];
  const renderListeners = [];

  function onChange(fn) {
    changeListeners.push(fn);
  }

  function onRender(fn) {
    renderListeners.push(fn);
  }

  function add(path, handler) {
    routes.set(path, handler);
  }

  function navigate(path) {
    location.hash = `#${path}`;
  }

  function start() {
    function handle() {
      const loc = parseLocation();
      const handler = routes.get(loc.path) || routes.get('/404');
      const view = handler ? handler(loc) : null;

      for (const l of changeListeners) l(loc);
      for (const r of renderListeners) r(view, loc);

      return view;
    }

    window.addEventListener('hashchange', handle);
    return handle();
  }

  return { add, start, navigate, onChange, onRender };
}
