/**
 * MTP PLATFORM — Capa 1: KYC.
 * Endpoint para que el usuario envíe sus datos de identidad.
 * En producción se integra con SumSub / Onfido. Acá guardamos los datos
 * y dejamos al admin marcar el KYC como verificado.
 */

import { Router } from 'express';
import crypto from 'node:crypto';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { applyScore, logActivity } from '../helpers.js';

const r = Router();

const VALID_DOC_TYPES = ['DNI','Pasaporte','CI','RUC','NIF','CUIT','CURP','Otro'];

/** POST /api/kyc — el usuario envía datos de identidad */
r.post('/', requireAuth, async (req, res) => {
  const { country, doc_type, doc_number, wallet_address } = req.body || {};
  if (!country || !doc_type || !doc_number) {
    return res.status(400).json({ error: 'País, tipo de documento y número son requeridos' });
  }
  if (!VALID_DOC_TYPES.includes(doc_type)) {
    return res.status(400).json({ error: 'Tipo de documento inválido' });
  }
  const reference = 'MTP-KYC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  try {
    await pool.query(
      `UPDATE users SET kyc_country = ?, kyc_doc_type = ?, kyc_doc_number = ?,
                        kyc_provider = ?, kyc_reference = ?, kyc_status = 'pendiente',
                        wallet_address = COALESCE(?, wallet_address)
       WHERE id = ?`,
      [country, doc_type, doc_number, 'manual', reference, wallet_address || null, req.user.id]
    );
    await logActivity({
      userId: req.user.id, action: 'kyc_submit', entity: 'user', entityId: req.user.id,
      details: `KYC enviado · ${doc_type} ${country} · ref ${reference}`, ip: req.ip,
    });
    res.json({ ok: true, reference, status: 'pendiente' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudo guardar el KYC' });
  }
});

/** GET /api/kyc/me — devuelve el estado y los datos KYC del usuario */
r.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT kyc_status, kyc_country, kyc_doc_type, kyc_doc_number,
            kyc_provider, kyc_reference, kyc_completed_at,
            terms_accepted_at, terms_version, privacy_accepted_at, kyc_consent
     FROM users WHERE id = ?`,
    [req.user.id]
  );
  res.json(rows[0] || {});
});

/** GET /api/kyc/consents — log de consentimientos legales del usuario */
r.get('/consents', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT document_type, version, ip_address, accepted_at
     FROM legal_consents WHERE user_id = ? ORDER BY accepted_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

export default r;
