import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import pool from '../db.js';
import { upload, sha256File, UPLOAD_DIR } from '../middleware/upload.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { analyzeDocument } from '../ai.js';
import { applyScore, logActivity } from '../helpers.js';

const r = Router();

/** POST /api/documents — el usuario carga un documento (multipart/form-data) */
r.post('/', requireAuth, upload.single('file'), async (req, res) => {
  const { title, doc_type = 'otro', description = '' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Título requerido' });

  const file = req.file;
  const filePath = file ? path.relative('.', file.path) : null;
  const fileHash = file ? sha256File(file.path) : null;

  const ai = analyzeDocument({ title, doc_type, description });

  try {
    const [ins] = await pool.query(
      `INSERT INTO documents
       (user_id, title, doc_type, description, file_path, file_hash, ai_risk, ai_summary, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'cargado')`,
      [req.user.id, title, doc_type, description, filePath, fileHash, ai.risk, ai.summary]
    );
    const docId = ins.insertId;
    await applyScore(req.user.id, 1.0, 'Carga de documento');
    await logActivity({ userId: req.user.id, action: 'doc_upload', entity: 'document', entityId: docId,
                        details: `Documento "${title}" (riesgo IA: ${ai.risk})`, ip: req.ip });
    const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [docId]);
    res.json({ document: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudo guardar el documento' });
  }
});

/** GET /api/documents — listado del usuario actual (sus documentos) */
r.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT d.*, n.token_id AS nft_token_id, n.tx_hash AS nft_tx_hash
     FROM documents d
     LEFT JOIN nfts n ON n.document_id = d.id
     WHERE d.user_id = ?
     ORDER BY d.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

/** GET /api/documents/:id — detalle (propietario, verificador asignado o admin) */
r.get('/:id', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT d.*, u.full_name AS owner_name, u.email AS owner_email, u.reputation AS owner_reputation,
            u.membership AS owner_membership, u.wallet_address AS owner_wallet,
            n.id AS nft_id, n.token_id AS nft_token_id, n.tx_hash AS nft_tx_hash, n.metadata_uri
     FROM documents d
     JOIN users u ON u.id = d.user_id
     LEFT JOIN nfts n ON n.document_id = d.id
     WHERE d.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  const doc = rows[0];
  const allowed = req.user.role === 'admin'
    || doc.user_id === req.user.id
    || doc.assigned_to === req.user.id;
  if (!allowed) return res.status(403).json({ error: 'Sin acceso a este documento' });

  const [vals] = await pool.query(
    `SELECT v.*, u.full_name AS verifier_name, u.specialty
     FROM validations v JOIN users u ON u.id = v.verifier_id
     WHERE v.document_id = ? ORDER BY v.created_at DESC`,
    [doc.id]
  );
  res.json({ document: doc, validations: vals });
});

/** GET /api/documents/:id/file — descarga del archivo original (con permisos) */
r.get('/:id/file', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).end();
  const doc = rows[0];
  const allowed = req.user.role === 'admin' || doc.user_id === req.user.id || doc.assigned_to === req.user.id;
  if (!allowed) return res.status(403).end();
  if (!doc.file_path) return res.status(404).end();
  const abs = path.resolve(doc.file_path);
  if (!fs.existsSync(abs)) return res.status(404).end();
  res.sendFile(abs);
});

/** PATCH /api/documents/:id/assign — admin asigna documento a un verificador */
r.patch('/:id/assign', requireRole('admin'), async (req, res) => {
  const { verifier_id } = req.body;
  await pool.query(
    `UPDATE documents SET assigned_to = ?, status = 'asignado' WHERE id = ?`,
    [verifier_id, req.params.id]
  );
  await logActivity({ userId: req.user.id, action: 'doc_assign', entity: 'document',
                      entityId: Number(req.params.id), details: `Asignado a verificador ${verifier_id}`, ip: req.ip });
  res.json({ ok: true });
});

export default r;
