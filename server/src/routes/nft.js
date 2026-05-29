/**
 * MTP PLATFORM — Rutas NFT (Capa 7: tokenización).
 *
 *  POST  /api/nft/mint/:docId    — admin/usuario dispara el mint en ETTIOS
 *  GET   /api/nft/metadata/:id   — metadata pública ERC-721 (lo lee el marketplace/OpenSea)
 *  GET   /api/nft                — listado de NFTs minteados (público)
 *  GET   /api/nft/health         — chequeo de conexión a ETTIOS
 */

import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logActivity } from '../helpers.js';
import { ettiosHealth, mintValidationNFT, buildMetadata, ETTIOS_CHAIN_ID } from '../blockchain.js';

const r = Router();

/** Estado de la conexión a ETTIOS (útil para diagnóstico). */
r.get('/health', async (_req, res) => {
  res.json(await ettiosHealth());
});

/** Listado público de NFTs minteados (registro on-chain trazable). */
r.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT n.*, d.title AS doc_title, d.doc_type, u.full_name AS owner_name, u.membership
     FROM nfts n
     JOIN documents d ON d.id = n.document_id
     JOIN users u ON u.id = n.user_id
     ORDER BY n.minted_at DESC LIMIT 100`
  );
  res.json(rows);
});

/** Metadata JSON ERC-721 (pública, sin auth — la consume el contrato/marketplace). */
r.get('/metadata/:id', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT metadata_json FROM nfts WHERE id = ? OR token_id = ? LIMIT 1',
    [req.params.id, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'NFT no encontrado' });
  res.json(rows[0].metadata_json);
});

/**
 * POST /api/nft/mint/:docId
 * Mintea un NFT en ETTIOS con los metadatos del documento validado.
 * Requisitos:
 *   - El usuario debe ser admin O propietario del documento.
 *   - El documento debe estar en estado 'validado'.
 *   - El propietario debe tener wallet_address (o se acepta `to` en body).
 *   - No debe existir un NFT ya minteado para ese documento.
 */
r.post('/mint/:docId', requireAuth, async (req, res) => {
  const docId = Number(req.params.docId);

  // 1) Validaciones previas
  const [docs] = await pool.query(
    `SELECT d.*, u.full_name AS owner_name, u.email AS owner_email,
            u.reputation AS owner_reputation, u.membership AS owner_membership,
            u.wallet_address AS owner_wallet
     FROM documents d JOIN users u ON u.id = d.user_id
     WHERE d.id = ?`, [docId]);
  if (!docs.length) return res.status(404).json({ error: 'Documento no encontrado' });
  const doc = docs[0];

  const isOwner = doc.user_id === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Sin permiso para mintear este documento' });
  if (doc.status !== 'validado') {
    return res.status(400).json({ error: 'El documento debe estar validado antes de mintear' });
  }
  const [existing] = await pool.query('SELECT id FROM nfts WHERE document_id = ?', [docId]);
  if (existing.length) return res.status(409).json({ error: 'Este documento ya tiene un NFT minteado' });

  const toAddress = (req.body && req.body.to) || doc.owner_wallet;
  if (!toAddress) {
    return res.status(400).json({ error: 'Hace falta una billetera destino (wallet_address del propietario o `to` en el body)' });
  }

  // 2) Construir metadatos ERC-721
  const [vals] = await pool.query('SELECT * FROM validations WHERE document_id = ?', [docId]);
  const metadata = buildMetadata({
    doc,
    validations: vals,
    owner: {
      full_name: doc.owner_name,
      reputation: doc.owner_reputation,
      membership: doc.owner_membership,
    },
    fileUrl: doc.file_path ? `${req.protocol}://${req.get('host')}/api/documents/${doc.id}/file` : null,
  });

  // 3) URI: si hay gateway IPFS configurado, usalo; si no, servimos desde nuestro propio backend.
  // El metadata se inserta primero para conocer el id; después se mintea on-chain con ese URI.
  const placeholderUri = 'pending';
  const [ins] = await pool.query(
    `INSERT INTO nfts (document_id, user_id, contract_address, chain_id,
                       token_id, tx_hash, metadata_uri, metadata_json, minted_by)
     VALUES (?, ?, ?, ?, '0', '0x', ?, CAST(? AS JSON), ?)`,
    [docId, doc.user_id, process.env.ETTIOS_CONTRACT_ADDRESS || '0x0',
     ETTIOS_CHAIN_ID, placeholderUri, JSON.stringify(metadata), req.user.id]
  );
  const nftId = ins.insertId;

  const base = (process.env.NFT_METADATA_BASE_URL || '').replace(/\/+$/, '');
  const metadataUri = base
    ? `${base}/${nftId}.json`
    : `${req.protocol}://${req.get('host')}/api/nft/metadata/${nftId}`;

  // 4) Mintear on-chain en ETTIOS
  try {
    const onchain = await mintValidationNFT({ toAddress, metadataUri });
    await pool.query(
      `UPDATE nfts SET contract_address = ?, token_id = ?, tx_hash = ?, block_number = ?, metadata_uri = ?
       WHERE id = ?`,
      [onchain.contractAddress, onchain.tokenId, onchain.txHash, onchain.blockNumber, metadataUri, nftId]
    );
    await logActivity({
      userId: req.user.id, action: 'nft_mint', entity: 'document', entityId: docId,
      details: `NFT #${onchain.tokenId} en ETTIOS · tx ${onchain.txHash}`, ip: req.ip,
    });

    res.json({
      ok: true,
      nft: {
        id: nftId,
        token_id: onchain.tokenId,
        tx_hash: onchain.txHash,
        contract_address: onchain.contractAddress,
        chain_id: ETTIOS_CHAIN_ID,
        metadata_uri: metadataUri,
        metadata: metadata,
      },
    });
  } catch (err) {
    console.error('Mint error:', err);
    // Revertir el registro placeholder si la transacción falló
    await pool.query('DELETE FROM nfts WHERE id = ?', [nftId]);
    res.status(500).json({ error: 'Falló el minteo en ETTIOS', detail: err.message });
  }
});

/** Mis NFTs (los del usuario autenticado). */
r.get('/mine', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT n.*, d.title AS doc_title FROM nfts n
     JOIN documents d ON d.id = n.document_id
     WHERE n.user_id = ? ORDER BY n.minted_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

export default r;
