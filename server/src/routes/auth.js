import { Router } from 'express';
import pool from '../db.js';
import { hashPassword, verifyPassword, signToken, publicUser } from '../auth.js';
import { logActivity } from '../helpers.js';

const r = Router();

const VALID_ENTITIES = ['empresa','profesional','organizacion','proyecto','inversor'];
const VALID_MEMBERSHIPS = ['basica','profesional','premium'];

r.post('/register', async (req, res) => {
  const {
    full_name, email, password,
    entity_type = 'empresa', company_name = null, document_id = null,
    sector = null, as_verifier = false, specialty = null,
    membership = 'basica', wallet_address = null,
    accept_terms = false, accept_privacy = false, accept_kyc = false,
  } = req.body || {};

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
  }
  if (!accept_terms || !accept_privacy || !accept_kyc) {
    return res.status(400).json({ error: 'Es obligatorio aceptar Términos, Política de Privacidad y consentir KYC/AML' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  const entity = VALID_ENTITIES.includes(entity_type) ? entity_type : 'empresa';
  const mem    = VALID_MEMBERSHIPS.includes(membership) ? membership : 'basica';
  const role   = as_verifier ? 'verificador' : 'usuario';
  const TERMS_VERSION = '2026.05';

  try {
    const [exists] = await pool.query('SELECT 1 FROM users WHERE email = ? LIMIT 1', [email]);
    if (exists.length) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

    const hash = await hashPassword(password);
    const [ins] = await pool.query(
      `INSERT INTO users
       (full_name, email, password_hash, role, entity_type, company_name, document_id, sector, specialty, membership, wallet_address,
        terms_accepted_at, terms_version, privacy_accepted_at, kyc_consent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), 1)`,
      [full_name, email, hash, role, entity,
       company_name || null, document_id || null, sector || null,
       as_verifier ? (specialty || null) : null, mem, wallet_address || null,
       TERMS_VERSION]
    );
    const uid = ins.insertId;

    // Log inmutable de los 3 consentimientos
    const ua = (req.headers['user-agent'] || '').slice(0, 255);
    await pool.query(
      `INSERT INTO legal_consents (user_id, document_type, version, ip_address, user_agent)
       VALUES (?, 'terms', ?, ?, ?), (?, 'privacy', ?, ?, ?), (?, 'kyc', ?, ?, ?)`,
      [uid, TERMS_VERSION, req.ip, ua,
       uid, TERMS_VERSION, req.ip, ua,
       uid, TERMS_VERSION, req.ip, ua]
    );

    await logActivity({ userId: uid, action: 'register', entity: 'user', entityId: uid,
                        details: `Alta de cuenta (${role} · ${mem}) — consentimientos v${TERMS_VERSION}`, ip: req.ip });

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [uid]);
    const user = rows[0];
    const token = signToken({ uid: user.id, role: user.role });
    res.json({ user: publicUser(user), token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudo crear la cuenta' });
  }
});

r.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND status = ? LIMIT 1', [email, 'activo']
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas o cuenta suspendida' });
    const user = rows[0];
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = signToken({ uid: user.id, role: user.role });
    await logActivity({ userId: user.id, action: 'login', entity: 'user', entityId: user.id, ip: req.ip });
    res.json({ user: publicUser(user), token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

r.get('/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  res.json({ user: publicUser(req.user) });
});

export default r;
