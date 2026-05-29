import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/** Datos públicos del usuario (sin password_hash). */
export function publicUser(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}
