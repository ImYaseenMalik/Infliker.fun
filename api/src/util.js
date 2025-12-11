import bcrypt from 'bcryptjs';
import jwt from '@tsndr/cloudflare-worker-jwt';

export const JWT_SECRET = () => { throw new Error("Set via env") };

// password helpers
export async function hashPassword(pwd) {
  return bcrypt.hash(pwd, 10);
}
export async function comparePassword(pwd, hash) {
  return bcrypt.compare(pwd, hash);
}

// jwt helpers
export async function signToken(payload, secret, opts={exp: '7d'}) {
  return jwt.sign(payload, secret, opts);
}
export async function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}
