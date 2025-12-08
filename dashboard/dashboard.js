import { apiFetch } from '/api.js';

const tabs = document.querySelectorAll('.tab-btn');
const views = {
  posts: document.getElementById('view-posts'),
  editor: document.getElementById('view-editor'),
  media: document.getElementById('view-media'),
  themes: document.getElementById('view-themes'),
  settings: document.getElementById('view-settings')
};

let currentPost = null;

function show(view) {
  Object.values(views).forEach(v => v.classList.add('hidden'));
  if (view === 'editor') {
    views.editor.classList.remove('hidden');
  } else {
    views[view].classList.remove('hidden');
  }
}

tabs.forEach(t => t.addEventListener('click', () => {
  const tab = t.dataset.tab;
  if (tab === 'posts') loadPosts();
  if (tab === 'media') loadMedia();
  if (tab === 'themes') show('themes');
  if (tab === 'settings') loadSettings();
  show(tab);
}));

document.getElementById('logout').onclick = () => {
  localStorage.removeItem('INFLIKER_API_KEY');
  location.href = '/login';
};

// POSTS
const postsList = document.getElementById('postsList');
async function loadPosts(){
  show('posts');
  postsList.innerHTML = 'Loading...';
  try {
    const posts = await apiFetch('/api/posts');
    if (!posts || !Array.isArray(posts.results) && !Array.isArray(posts)) {
      // older worker may return raw array or {results:[]}
    }
    const items = Array.isArray(posts.results) ? posts.results : posts;
    postsList.innerHTML = items.map(p=> `
      <div class="p-4 border rounded bg-white">
        <h4 class="font-semibold">${escapeHtml(p.title)}</h4>
        <p class="text-sm text-slate-500">${escapeHtml(p.excerpt||'')}</p>
        <div class="mt-2 flex gap-2">
          <button data-id="${p.id}" class="editBtn bg-indigo-600 text-white px-2 py-1 rounded">Edit</button>
          <button data-id="${p.id}" class="delBtn bg-red-600 text-white px-2 py-1 rounded">Delete</button>
        </div>
      </div>`).join('');
    document.querySelectorAll('.editBtn').forEach(b => b.onclick = editHandler);
    document.querySelectorAll('.delBtn').forEach(b => b.onclick = deleteHandler);
  } catch (e) {
    postsList.innerHTML = 'Error loading posts. ' + e.message;
  }
}

function escapeHtml(s=''){ return String(s).replaceAll('<','&lt;').replaceAll('>','&gt;'); }

async function editHandler(e){
  const id = e.target.dataset.id;
  const post = await apiFetch(`/api/posts/${id}`);
  currentPost = post;
  document.getElementById('postTitle').value = post.title || '';
  document.getElementById('postExcerpt').value = post.excerpt || '';
  document.getElementById('postContent').value = post.content || '';
  show('editor');
}

document.getElementById('newPostBtn').onclick = () => {
  currentPost = null;
  document.getElementById('postTitle').value = '';
  document.getElementById('postExcerpt').value = '';
  document.getElementById('postContent').value = '';
  show('editor');
};

document.getElementById('backToPosts').onclick = () => loadPosts();

document.getElementById('savePost').onclick = async () => {
  const title = document.getElementById('postTitle').value;
  const excerpt = document.getElementById('postExcerpt').value;
  const content = document.getElementById('postContent').value;
  if (!title || !content) return alert('Title and content required');
  try {
    if (currentPost && currentPost.id) {
      await apiFetch(`/api/posts/${currentPost.id}`, { method:'PUT', body: JSON.stringify({ title, excerpt, content }), headers: {'Content-Type':'application/json'}});
    } else {
      await apiFetch(`/api/posts`, { method:'POST', body: JSON.stringify({ title, excerpt, content }), headers: {'Content-Type':'application/json'}});
    }
    alert('Saved');
    loadPosts();
  } catch (e) { alert('Error: '+e.message); }
};

document.getElementById('deletePost').onclick = async () => {
  if (!currentPost || !currentPost.id) return alert('No post selected');
  if (!confirm('Delete post?')) return;
  try {
    await apiFetch(`/api/posts/${currentPost.id}`, { method: 'DELETE' });
    alert('Deleted');
    loadPosts();
  } catch (e) { alert('Error: '+e.message); }
};

// MEDIA
async function loadMedia(){
  show('media');
  const grid = document.getElementById('mediaGrid');
  grid.innerHTML = 'Loading...';
  try {
    // We don't have a generic list endpoint in worker example; list by known prefix is optional.
    // As a fallback show uploaded files links in D1 if you store them there. For now show placeholder.
    grid.innerHTML = `<div class="col-span-4 text-sm text-slate-500">Uploaded files appear here after upload. Use upload to add.</div>`;
  } catch(e) {
    grid.innerHTML = 'Error loading media: ' + e.message;
  }
}

document.getElementById('uploadMediaBtn').onclick = async () => {
  const f = document.getElementById('mediaFile').files[0];
  if (!f) return alert('Select file');
  try {
    // request upload URL from worker if implemented; our worker accepts upload at /r2/<key> or /api/images/upload
    // We'll stream via form POST to /api/images/upload
    const fd = new FormData();
    fd.append('file', f);
    const res = await apiFetch('/api/images/upload', { method: 'POST', body: fd });
    alert('Uploaded: ' + (res.url || 'OK'));
    loadMedia();
  } catch (e) {
    alert('Upload failed: ' + e.message);
  }
};

// THEMES
document.querySelectorAll('.applyThemeBtn').forEach(b => {
  b.onclick = async (e) => {
    const theme = e.target.dataset.theme;
    // simple store in localStorage for active theme
    localStorage.setItem('INFLIKER_ACTIVE_THEME', theme);
    alert('Theme applied: ' + theme);
  }
});

// SETTINGS
async function loadSettings(){
  show('settings');
  const t = localStorage.getItem('SITE_TITLE') || 'infliker.fun';
  document.getElementById('siteTitle').value = t;
}
document.getElementById('saveSettings').onclick = () => {
  const v = document.getElementById('siteTitle').value || 'infliker.fun';
  localStorage.setItem('SITE_TITLE', v);
  alert('Saved');
};

// initial
(function init() {
  const key = localStorage.getItem('INFLIKER_API_KEY');
  if (!key) {
    alert('No API key found. Redirecting to login.');
    location.href = '/login';
    return;
  }
  // show posts by default
  loadPosts();
})();
