export async function createPost(request, env, ctx, user) {
  const body = await request.json();
  const {title, content, excerpt = '', status='draft', featured_image=null} = body;
  // generate slug simple
  const slug = body.slug || (title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''));
  // insert
  const insert = await env.DB.prepare(
    `INSERT INTO posts (title, slug, content, excerpt, status, featured_image, author_id, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(title, slug, content, excerpt, status, featured_image, user.id, status === 'published' ? new Date().toISOString() : null).run();
  return new Response(JSON.stringify({id: insert.lastInsertRowid, slug}), {status:201, headers:{'Content-Type':'application/json'}});
}
