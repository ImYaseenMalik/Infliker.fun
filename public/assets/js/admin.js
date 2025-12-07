// admin.js
const API_ROOT = '/api';
const saveBtn = document.getElementById('save');
const titleEl = document.getElementById('title');
const excerptEl = document.getElementById('excerpt');
const contentEl = document.getElementById('content');
const listEl = document.getElementById('list');

async function loadPosts(){
  const res = await fetch(`${API_ROOT}/posts`);
  const posts = await res.json();
  listEl.innerHTML = posts.map(p=>`<div>
    <strong>${p.title}</strong>
    <button data-id="${p.id}" class="edit">Edit</button>
    <button data-id="${p.id}" class="del">Delete</button>
    </div>`).join('');
  document.querySelectorAll('.edit').forEach(b=>b.onclick = async (e)=>{
    const id = e.target.dataset.id;
    const r = await fetch(`${API_ROOT}/posts/${id}`);
    const data = await r.json();
    titleEl.value = data.title; excerptEl.value = data.excerpt||''; contentEl.value = data.content;
    saveBtn.dataset.edit = id;
  });
  document.querySelectorAll('.del').forEach(b=>b.onclick = async e=>{
    const id = e.target.dataset.id;
    if(!confirm('Delete post?')) return;
    const r = await fetch(`${API_ROOT}/posts/${id}`, {method:'DELETE', headers:{'X-API-KEY':localStorage.getItem('API_KEY')||''}});
    if(r.ok) loadPosts();
  });
}
saveBtn.onclick = async ()=>{
  const body = {
    title: titleEl.value,
    excerpt: excerptEl.value,
    content: contentEl.value
  };
  const apiKey = localStorage.getItem('API_KEY') || prompt('Enter admin API key (configured in Worker secrets):');
  if(!apiKey) return alert('No API key');
  const editId = saveBtn.dataset.edit;
  const url = editId ? `/api/posts/${editId}` : '/api/posts';
  const method = editId ? 'PUT' : 'POST';
  const r = await fetch(url, {method, headers:{'Content-Type':'application/json','X-API-KEY':apiKey}, body: JSON.stringify(body)});
  if(r.ok){
    alert('Saved');
    delete saveBtn.dataset.edit;
    titleEl.value=''; excerptEl.value=''; contentEl.value='';
    loadPosts();
  } else {
    alert('Error: ' + r.statusText);
  }
};

document.getElementById('uploadBtn').onclick = async ()=>{
  const f = document.getElementById('media').files[0];
  if(!f) return alert('Choose file');
  // ask worker for presigned URL
  const apiKey = localStorage.getItem('API_KEY') || prompt('Enter admin API key:');
  const presigned = await fetch('/api/upload-url', {method:'POST', headers:{'X-API-KEY':apiKey,'Content-Type':'application/json'}, body: JSON.stringify({filename: f.name, size: f.size, type: f.type})});
  if(!presigned.ok) return alert('Failed to get upload URL');
  const {url, objectKey} = await presigned.json();
  // upload directly
  const up = await fetch(url, {method:'PUT', body: f});
  if(!up.ok) return alert('Upload failed');
  const publicUrl = `/r2/${objectKey}`; // we'll create a worker route to proxy R2 GETs
  document.getElementById('mediaResult').innerHTML = `Uploaded: <a href="${publicUrl}" target="_blank">${publicUrl}</a>`;
};

loadPosts();
