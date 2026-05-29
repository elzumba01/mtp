/**
 * MTP PLATFORM — Capas 4 y 5 (Trazabilidad + Scoring), helpers compartidos.
 */
import pool from './db.js';

/** Aplica delta al score de un usuario, clampea 0-100 y graba el historial. */
export async function applyScore(userId, delta, reason) {
  const [rows] = await pool.query('SELECT reputation FROM users WHERE id = ?', [userId]);
  if (!rows.length) return;
  const prev = Number(rows[0].reputation);
  const next = Math.max(0, Math.min(100, prev + Number(delta)));
  await pool.query('UPDATE users SET reputation = ? WHERE id = ?', [next, userId]);
  await pool.query(
    `INSERT INTO scoring_history (user_id, previous_score, new_score, delta, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, prev, next, Number(delta), reason]
  );
}

/** Inserta una fila en activity_log (Capa 4 — Trazabilidad estructural). */
export async function logActivity({ userId, action, entity = null, entityId = null, details = null, ip = null }) {
  await pool.query(
    `INSERT INTO activity_log (user_id, action, entity, entity_id, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId || null, action, entity, entityId, details, ip]
  );
}

/** Devuelve etiqueta + clase css para un score dado. */
export function scoreLabel(score) {
  if (score >= 80) return ['Confianza alta',  'good'];
  if (score >= 55) return ['Confianza media', 'mid'];
  if (score >= 30) return ['Confianza baja',  'low'];
  return ['Riesgo', 'risk'];
}
