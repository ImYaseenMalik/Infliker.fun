// endpoints: POST /api/auth/login, POST /api/auth/register
import { hashPassword, comparePassword, signToken } from './util.js';

export async function handleLogin(request, env) {
  const { email, password } = await request.json();
  const userQ = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();
  const user = userQ.results[0];
  if(!user) return new Response(JSON.stringify({error:'Invalid'}), {status:401});
  const ok = await comparePassword(password, user.password_hash);
  if(!ok) return new Response(JSON.stringify({error:'Invalid'}), {status:401});
  const token = await signToken({id:user.id, role: user.role}, env.JWT_SECRET);
  // set cookie (consider Secure + HttpOnly via Set-Cookie)
  return new Response(JSON.stringify({token, user: {id:user.id, email:user.email, role:user.role}}), {
    headers: {'Content-Type':'application/json'}
  });
}
