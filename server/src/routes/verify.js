/**
 * MTP PLATFORM — Verificación pública de certificados.
 *
 * Endpoint sin autenticación que devuelve los datos esenciales de un
 * certificado a partir de su hash SHA-256, token ID o ID interno.
 * Lo que ve cualquier persona escaneando el QR o pegando el hash en /verify.
 */

import { Router } from 'express';
import pool from '../db.js';

const r = Router();

/**
 * GET /api/verify/:identifier
 *   :identifier puede ser:
 *     - hash SHA-256 del archivo
 *     - token_id del NFT
 *     - id interno del documento
 */
r.get('/:identifier', async (req, res) => {
  const ident = String(req.params.identifier || '').trim();
  if (!ident) return res.status(400).json({ ok: false, error: 'Identificador requerido' });

  try {
    let where = '';
    let param = ident;
    if (/^[0-9a-f]{64}$/i.test(ident)) {
      where = 'd.file_hash = ?';
    } else if (/^\d{1,18}$/.test(ident) && ident.length > 6) {
      where = 'n.token_id = ?';
    } else {
      where = 'd.id = ?';
    }

    const [rows] = await pool.query(
      `SELECT d.id AS doc_id, d.title, d.doc_type, d.description, d.file_hash, d.status,
              d.ai_risk, d.created_at, d.updated_at,
              u.full_name AS owner_name, u.entity_type, u.company_name, u.membership,
              u.reputation, u.kyc_status, u.sector,
              n.id AS nft_id, n.token_id, n.tx_hash, n.contract_address, n.chain_id,
              n.block_number, n.metadata_uri, n.minted_at
       FROM documents d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN nfts n ON n.document_id = d.id
       WHERE ${where} LIMIT 1`,
      [param]
    );

    if (!rows.length) {
      return res.json({ ok: false, found: false, error: 'Certificado no encontrado' });
    }

    const c = rows[0];

    // Dictámenes
    const [vals] = await pool.query(
      `SELECT v.val_type, v.result, v.opinion, v.created_at,
              u.full_name AS verifier_name, u.specialty, u.reputation AS verifier_reputation
       FROM validations v JOIN users u ON u.id = v.verifier_id
       WHERE v.document_id = ? ORDER BY v.created_at DESC`,
      [c.doc_id]
    );

    // Score breakdown sintético (en producción se calcula desde la DB)
    const rep = Number(c.reputation || 50);
    const approvals = vals.filter(v => v.result === 'aprobado').length;
    const breakdown = {
      economico:  Math.min(100, Math.round(rep + approvals * 2)),
      tributario: Math.min(100, Math.round(rep * 0.95 + approvals * 1.5)),
      financiero: Math.min(100, Math.round(rep * 1.05)),
      laboral:    Math.min(100, Math.round(rep * 0.98 + approvals)),
    };

    const isValidated = c.status === 'validado';
    const isMinted = !!c.token_id;

    res.json({
      ok: true,
      found: true,
      verification_status: isValidated ? (isMinted ? 'on_chain' : 'validado') : c.status,
      certificate: {
        id: c.doc_id,
        title: c.title,
        doc_type: c.doc_type,
        description: c.description,
        ai_risk: c.ai_risk,
        status: c.status,
        file_hash: c.file_hash,
        created_at: c.created_at,
        validated_at: c.updated_at,
      },
      owner: {
        name: c.owner_name,
        entity_type: c.entity_type,
        company_name: c.company_name,
        sector: c.sector,
        reputation: Number(c.reputation),
        membership: c.membership,
        kyc_status: c.kyc_status,
      },
      validations: vals,
      score_breakdown: breakdown,
      nft: isMinted ? {
        token_id: c.token_id,
        tx_hash: c.tx_hash,
        contract_address: c.contract_address,
        chain_id: c.chain_id,
        block_number: c.block_number,
        metadata_uri: c.metadata_uri,
        minted_at: c.minted_at,
        explorer_url: `https://scan.ettiosblockchain.io/tx/${c.tx_hash}`,
      } : null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Error en la verificación' });
  }
});

export default r;
