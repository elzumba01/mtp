import { Router } from 'express';
import pool from '../db.js';
import { requireRole } from '../middleware/auth.js';
import { applyScore, logActivity } from '../helpers.js';
import { publicUser } from '../auth.js';

const r = Router();

r.get('/', requireRole('admin'), async (req, res) => {
  const { role } = req.query;
  let sql = 'SELECT * FROM users';
  const params = [];
  if (['admin','usuario','verificador'].includes(role)) {
    sql += ' WHERE role = ?'; params.push(role);
  }
  sql += ' ORDER BY created_at DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows.map(publicUser));
});

r.patch('/:id/kyc', requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  if (!['verificado','rechazado','pendiente'].includes(status)) {
    return res.status(400).json({ error: 'Estado KYC inválido' });
  }
  await pool.query('UPDATE users SET kyc_status = ? WHERE id = ?', [status, req.params.id]);
  if (status === 'verificado') {
    await applyScore(Number(req.params.id), 5, 'KYC verificado por admin');
  }
  await logActivity({ userId: req.user.id, action: 'kyc_'+status, entity: 'user',
                      entityId: Number(req.params.id), ip: req.ip });
  res.json({ ok: true });
});

r.patch('/:id/role', requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['admin','usuario','verificador'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'No podés cambiar tu propio rol' });
  }
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  await logActivity({ userId: req.user.id, action: 'role_change', entity: 'user',
                      entityId: Number(req.params.id), details: `→ ${role}`, ip: req.ip });
  res.json({ ok: true });
});

r.patch('/:id/membership', requireRole('admin'), async (req, res) => {
  const { membership } = req.body;
  if (!['basica','profesional','premium'].includes(membership)) {
    return res.status(400).json({ error: 'Membresía inválida' });
  }
  await pool.query('UPDATE users SET membership = ? WHERE id = ?', [membership, req.params.id]);
  await logActivity({ userId: req.user.id, action: 'membership_change', entity: 'user',
                      entityId: Number(req.params.id), details: `→ ${membership}`, ip: req.ip });
  res.json({ ok: true });
});

r.patch('/:id/status', requireRole('admin'), async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'No podés modificar tu propia cuenta' });
  }
  const [rows] = await pool.query('SELECT status FROM users WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'No existe' });
  const next = rows[0].status === 'activo' ? 'suspendido' : 'activo';
  await pool.query('UPDATE users SET status = ? WHERE id = ?', [next, req.params.id]);
  await logActivity({ userId: req.user.id, action: 'status_change', entity: 'user',
                      entityId: Number(req.params.id), details: next, ip: req.ip });
  res.json({ ok: true, status: next });
});

/** Admin dashboard stats */
r.get('/stats/overview', requireRole('admin'), async (_req, res) => {
  const [[users]] = await pool.query('SELECT COUNT(*) AS c FROM users');
  const [[docs]]  = await pool.query('SELECT COUNT(*) AS c FROM documents');
  const [[vals]]  = await pool.query('SELECT COUNT(*) AS c FROM validations');
  const [[nfts]]  = await pool.query('SELECT COUNT(*) AS c FROM nfts');
  const [risk]    = await pool.query(
    `SELECT ai_risk, COUNT(*) AS c FROM documents WHERE ai_risk IS NOT NULL GROUP BY ai_risk`
  );
  res.json({ users: users.c, documents: docs.c, validations: vals.c, nfts: nfts.c, risk });
});

/** Scoring: ranking + movimientos recientes */
r.get('/scoring/ranking', requireRole('admin'), async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, full_name, role, sector, reputation, membership
     FROM users WHERE status='activo' ORDER BY reputation DESC LIMIT 50`
  );
  res.json(rows);
});

r.get('/scoring/recent', requireRole('admin'), async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT sh.*, u.full_name FROM scoring_history sh
     JOIN users u ON u.id = sh.user_id
     ORDER BY sh.created_at DESC LIMIT 30`
  );
  res.json(rows);
});

export default r;
