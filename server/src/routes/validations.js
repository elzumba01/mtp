import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { applyScore, logActivity } from '../helpers.js';

const r = Router();

/** GET /api/validations/queue — documentos pendientes para validar */
r.get('/queue', requireRole('verificador','admin'), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT d.*, u.full_name AS owner_name, u.sector AS owner_sector
     FROM documents d JOIN users u ON u.id = d.user_id
     WHERE d.status IN ('cargado','en_analisis_ia','asignado')
        OR (d.status = 'en_validacion' AND d.assigned_to = ?)
     ORDER BY d.created_at ASC`,
    [req.user.id]
  );
  res.json(rows);
});

/** POST /api/validations/take/:docId — verificador toma un documento */
r.post('/take/:docId', requireRole('verificador'), async (req, res) => {
  await pool.query(
    `UPDATE documents SET assigned_to = ?, status = 'en_validacion'
     WHERE id = ? AND status IN ('cargado','en_analisis_ia','asignado')`,
    [req.user.id, req.params.docId]
  );
  await logActivity({ userId: req.user.id, action: 'doc_take', entity: 'document',
                      entityId: Number(req.params.docId), ip: req.ip });
  res.json({ ok: true });
});

/** POST /api/validations — verificador emite dictamen */
r.post('/', requireRole('verificador'), async (req, res) => {
  const { document_id, val_type = 'estructural', result, opinion } = req.body || {};
  if (!document_id || !result || !opinion) {
    return res.status(400).json({ error: 'Faltan datos del dictamen' });
  }
  if (!['aprobado','observado','rechazado'].includes(result)) {
    return res.status(400).json({ error: 'Resultado inválido' });
  }
  const [docRows] = await pool.query('SELECT * FROM documents WHERE id = ?', [document_id]);
  if (!docRows.length) return res.status(404).json({ error: 'Documento inexistente' });
  const doc = docRows[0];

  const deltaOwner = result === 'aprobado' ? 8 : (result === 'observado' ? -2 : -10);
  const newStatus  = result === 'rechazado' ? 'rechazado' : 'validado';

  await pool.query(
    `INSERT INTO validations (document_id, verifier_id, val_type, result, score_impact, opinion)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [document_id, req.user.id, val_type, result, deltaOwner, opinion]
  );
  await pool.query('UPDATE documents SET status = ? WHERE id = ?', [newStatus, document_id]);
  await applyScore(doc.user_id, deltaOwner, `Validación ${result} sobre documento #${document_id}`);
  await applyScore(req.user.id, 0.5, `Emisión de dictamen sobre documento #${document_id}`);
  await logActivity({ userId: req.user.id, action: 'validation', entity: 'document',
                      entityId: Number(document_id), details: `Resultado: ${result}`, ip: req.ip });
  res.json({ ok: true, document_id, result, new_status: newStatus });
});

/** GET /api/validations/mine — historial de dictámenes del verificador */
r.get('/mine', requireRole('verificador'), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT v.*, d.title AS doc_title, d.doc_type
     FROM validations v JOIN documents d ON d.id = v.document_id
     WHERE v.verifier_id = ?
     ORDER BY v.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

export default r;
