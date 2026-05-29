import { Router } from 'express';
import pool from '../db.js';

const r = Router();

/** GET /api/marketplace/sectors  → lista única de sectores con verificadores activos */
r.get('/sectors', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT sector FROM users
     WHERE role='verificador' AND status='activo'
       AND sector IS NOT NULL AND sector <> ''
     ORDER BY sector`
  );
  res.json(rows.map(r => r.sector));
});

/**
 * GET /api/marketplace/professionals?sector=
 *  → lista pública (sin password) ordenada por membresía y reputación.
 */
r.get('/professionals', async (req, res) => {
  const { sector } = req.query;
  let sql = `
    SELECT u.id, u.full_name, u.sector, u.specialty, u.reputation, u.kyc_status,
           u.entity_type, u.company_name, u.membership,
           (SELECT COUNT(*) FROM validations v WHERE v.verifier_id = u.id) AS dictamenes
    FROM users u
    WHERE u.role='verificador' AND u.status='activo'`;
  const params = [];
  if (sector) { sql += ' AND u.sector = ?'; params.push(sector); }
  sql += ` ORDER BY FIELD(u.membership,'premium','profesional','basica'),
                    (u.kyc_status='verificado') DESC,
                    u.reputation DESC, u.full_name ASC`;
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

/** Métricas para el hero del marketplace. */
r.get('/stats', async (_req, res) => {
  const [[pros]] = await pool.query(
    `SELECT COUNT(*) AS total, AVG(reputation) AS avg_rep
     FROM users WHERE role='verificador' AND status='activo'`
  );
  const [[sectors]] = await pool.query(
    `SELECT COUNT(DISTINCT sector) AS total
     FROM users WHERE role='verificador' AND status='activo'
       AND sector IS NOT NULL AND sector <> ''`
  );
  const [[nfts]] = await pool.query('SELECT COUNT(*) AS total FROM nfts');
  res.json({
    professionals: Number(pros.total),
    avg_reputation: Number(pros.avg_rep || 0),
    sectors: Number(sectors.total),
    nfts_minted: Number(nfts.total),
  });
});

export default r;
