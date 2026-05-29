/**
 * MTP PLATFORM — Servidor Express.
 * API REST con autenticación JWT, integración con MySQL y minteo de NFTs en ETTIOS.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { optionalAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import marketplaceRoutes from './routes/marketplace.js';
import documentRoutes from './routes/documents.js';
import validationRoutes from './routes/validations.js';
import userRoutes from './routes/users.js';
import activityRoutes from './routes/activity.js';
import nftRoutes from './routes/nft.js';
import kycRoutes from './routes/kyc.js';
import verifyRoutes from './routes/verify.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: false,
}));
app.use(express.json({ limit: '2mb' }));
app.use(optionalAuth);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/nft', nftRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/verify', verifyRoutes);

app.get('/api/health', (_req, res) => res.json({
  ok: true,
  app: 'MTP Platform',
  version: '2.0.0-react',
  chain: { name: 'ETTIOS', chainId: Number(process.env.ETTIOS_CHAIN_ID || 2237) },
}));

// Manejo de errores genérico
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err && err.message && /File too large|Tipo de archivo/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`▶ MTP API escuchando en http://localhost:${PORT}`);
  console.log(`  Chain: ETTIOS (id ${process.env.ETTIOS_CHAIN_ID || 2237})`);
});
