import { apiFetch } from '/api.js';

const input = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');

document.addEventListener('DOMContentLoaded', () => {
  const key = localStorage.getItem('INFLIKER_API_KEY');
  if (key) input.value = key;
});

saveBtn.onclick = async () => {
  const key = input.value.trim();
  if (!key) return alert('Enter API key');
  // optional quick verification: call protected endpoint (create a harmless request)
  try {
    // try listing posts (public) — some endpoints may be public; to verify auth we can call a write endpoint with no-op
    const res = await fetch('/api/posts', { method: 'GET', headers: { 'X-API-KEY': key }});
    // If response is 401/403, server will reject later when writing; still accept key
  } catch (e) {
    // ignore network errors here
  }
  localStorage.setItem('INFLIKER_API_KEY', key);
  location.href = '/dashboard';
};

clearBtn.onclick = () => {
  localStorage.removeItem('INFLIKER_API_KEY');
  input.value = '';
  alert('Cleared');
};
