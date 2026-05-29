import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import 'dotenv/config';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 * 1024);

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.png', '.jpg', '.jpeg', '.webp', '.txt'
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}_${id}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(ext)) {
      return cb(new Error(`Tipo de archivo no permitido (${ext})`));
    }
    cb(null, true);
  },
});

/** SHA-256 de un archivo local (se usa como huella en los metadatos del NFT). */
export function sha256File(filepath) {
  const buf = fs.readFileSync(filepath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export { UPLOAD_DIR };
