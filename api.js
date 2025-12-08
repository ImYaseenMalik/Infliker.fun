// api.js - frontend helper used by dashboard and login
const API_ROOT = location.origin; // uses same origin; if your Worker is on a separate domain, set full URL

export async function apiFetch(path, opts = {}) {
  const headers = opts.headers || {};
  // attach API key from localStorage for admin actions
  const key = localStorage.getItem('INFLIKER_API_KEY');
  if (key) headers['X-API-KEY'] = key;
  opts.headers = headers;
  const res = await fetch(`${API_ROOT}${path}`, opts);
  if (res.status === 401 || res.status === 403) {
    throw new Error('Unauthorized');
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}
