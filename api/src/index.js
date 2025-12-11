import { handleLogin } from './auth.js';
import { createPost } from './posts.js';
import { getUploadUrl } from './media.js';
import { verifyToken } from './util.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // public: list posts
    if(request.method === 'GET' && path.startsWith('/api/posts')) {
      // implement list or single fetch
    }

    // auth
    if(path === '/api/auth/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    // protected endpoints: check JWT
    const authHeader = request.headers.get('Authorization') || '';
    let user = null;
    if(authHeader.startsWith('Bearer ')) {
      try { user = await verifyToken(authHeader.split(' ')[1], env.JWT_SECRET); }
      catch(e) { user = null; }
    }

    if(path === '/api/posts' && request.method === 'POST') {
      if(!user) return new Response('Unauthorized', {status:401});
      return createPost(request, env, ctx, user);
    }

    if(path === '/api/media/upload-url' && request.method === 'POST') {
      if(!user) return new Response('Unauthorized', {status:401});
      return getUploadUrl(request, env, user);
    }

    return new Response('Not Found', {status:404});
  }
}
