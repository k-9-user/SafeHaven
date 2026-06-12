const BASE_URL = import.meta.env.VITE_AGENT_URL ?? '';
console.log('[SafeHaven API] BASE_URL =', BASE_URL || '(vide — VITE_AGENT_URL non défini)');

function getToken() {
  return localStorage.getItem('safehaven_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  let body;
  try { body = await res.json(); } catch { body = {}; }

  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return body;
}

export const get   = (path)       => request(path);
export const post  = (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body) });
export const patch = (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body) });
export const del   = (path)       => request(path, { method: 'DELETE' });

// ── Admin API (token séparé : safehaven_admin_token) ──────────────────────────

function getAdminToken() {
  return localStorage.getItem('safehaven_admin_token');
}

async function adminRequest(path, options = {}) {
  const token = getAdminToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  let body;
  try { body = await res.json(); } catch { body = {}; }

  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export const adminGet   = (path)       => adminRequest(path);
export const adminPost  = (path, body) => adminRequest(path, { method: 'POST',   body: JSON.stringify(body) });
export const adminPatch = (path, body) => adminRequest(path, { method: 'PATCH',  body: JSON.stringify(body) });
export const adminDel   = (path)       => adminRequest(path, { method: 'DELETE' });

export const api = {
  auth: {
    login:    (email, password)       => request('/api/auth/login',    { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password, name) => request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
    me:       ()                       => request('/api/auth/me'),
  },
  chat: {
    send: (messages, opts = {}) =>
      request('/api/chat', { method: 'POST', body: JSON.stringify({ messages, ...opts }) }),
  },
  yields: {
    get: () => request('/api/yields'),
  },
  strategies: {
    list: (riskScore) => request(`/api/strategies?riskScore=${riskScore}`),
  },
};
