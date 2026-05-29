import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();

/** Mi historial de scoring */
r.get('/my-scoring', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM scoring_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json(rows);
});

/** Traza global (admin) — paginada */
r.get('/activity', requireRole('admin'), async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 30;
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT a.*, u.full_name FROM activity_log a
     LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[count]] = await pool.query('SELECT COUNT(*) AS c FROM activity_log');
  res.json({ rows, total: count.c, page, limit });
});

export default r;
