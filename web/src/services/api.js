const API_BASE = '/api';

export async function login(email, password){
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({email,password})
  });
  if(!r.ok) throw new Error('Login failed');
  return r.json();
}

export async function createPost(token, post){
  const r = await fetch(`${API_BASE}/posts`, {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
    body: JSON.stringify(post)
  });
  return r.json();
}

export async function getUploadUrl(token, filename){
  const r = await fetch(`${API_BASE}/media/upload-url`, {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
    body: JSON.stringify({filename})
  });
  return r.json();
}
