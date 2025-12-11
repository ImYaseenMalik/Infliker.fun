// R2 binding is env.MEDIA_BUCKET
export async function getUploadUrl(request, env, user) {
  // only allow admin/editor
  const { filename } = await request.json();
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${filename}`;
  const expires = 60 * 5; // 5 minutes
  const putUrl = await env.MEDIA_BUCKET.getUploadUrl({key, expires});
  // return signed url + key for DB insert later
  return new Response(JSON.stringify({url: putUrl, key}), {headers: {'Content-Type':'application/json'}});
}
