import { verifyToken } from '../auth.js';
import pool from '../db.js';

/** Lee el JWT del header Authorization. Si no hay, sigue sin user (anónimo). */
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND status = ?',
      [payload.uid, 'activo']
    );
    if (rows.length) req.user = rows[0];
  } catch { /* token inválido => anónimo */ }
  next();
}

/** Exige usuario autenticado. */
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  next();
}

/** Exige uno o varios roles. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
}
