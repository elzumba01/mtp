/**
 * MTP PLATFORM — Inicializador de base de datos.
 * Crea la base si no existe, ejecuta el schema y siembra datos demo.
 * Uso:  node src/initDb.js
 */
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const cfg = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
  charset: 'utf8mb4_unicode_ci',
};
const dbName = process.env.DB_NAME || 'mtp_platform';

async function run() {
  const root = await mysql.createConnection(cfg);
  console.log('✓ Conectado a MySQL en', cfg.host);

  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await root.query(`USE \`${dbName}\``);
  console.log(`✓ Base \`${dbName}\` lista`);

  const schemaPath = path.resolve('./sql/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await root.query(schema);
  console.log('✓ Schema aplicado');

  // Re-seed (truncate seguro)
  await root.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of ['nfts','scoring_history','validations','documents','activity_log','users']) {
    await root.query(`TRUNCATE TABLE \`${t}\``);
  }
  await root.query('SET FOREIGN_KEY_CHECKS = 1');

  const hash = await bcrypt.hash('mtp1234', 10);
  const users = [
    // [full_name, email, role, entity_type, company, doc_id, sector, specialty, kyc, reputation, membership]
    ['Administrador MTP',    'admin@mtp.test',    'admin',       'organizacion','Aston Mining S.L.','23374177',     'Tecnología',  null,       'verificado',100.0,'premium'],
    ['Estudio Vega & Asoc.', 'empresa@mtp.test',  'usuario',     'empresa',     'Vega & Asociados','30-71234567-8', 'Inmobiliario',null,       'verificado', 62.0,'profesional'],
    ['Bruno Acosta',         'usuario@mtp.test',  'usuario',     'profesional', null,              '28999111',      'Agro',        null,       'pendiente',  50.0,'basica'],
    ['Dra. Lucía Ferreyra',  'abogada@mtp.test',  'verificador', 'profesional', null,              '27888222',      'Legal',       'abogado',  'verificado', 88.0,'premium'],
    ['Cont. Marco Salinas',  'contador@mtp.test', 'verificador', 'profesional', null,              '20777333',      'Finanzas',    'contador', 'verificado', 91.0,'profesional'],
  ];
  for (const u of users) {
    await root.query(
      `INSERT INTO users (full_name,email,password_hash,role,entity_type,company_name,document_id,sector,specialty,kyc_status,reputation,membership,
                         terms_accepted_at,terms_version,privacy_accepted_at,kyc_consent)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),'2026.05',NOW(),1)`,
      [u[0], u[1], hash, u[2], u[3], u[4], u[5], u[6], u[7], u[8], u[9], u[10]]
    );
  }
  console.log('✓ 5 usuarios demo creados (contraseña: mtp1234) — con consentimientos legales');

  // Documento demo validado
  const [[empresa]]  = await root.query("SELECT id FROM users WHERE email='empresa@mtp.test'");
  const [[abogada]]  = await root.query("SELECT id FROM users WHERE email='abogada@mtp.test'");
  await root.query(
    `INSERT INTO documents (user_id,title,doc_type,description,status,ai_risk,ai_summary,assigned_to)
     VALUES (?,?,?,?,?,?,?,?)`,
    [empresa.id, 'Contrato de fideicomiso inmobiliario - Torre Norte', 'contrato',
     'Estructura de fideicomiso para 42 unidades funcionales en AMBA.', 'validado',
     'bajo', 'El motor IA no detectó inconsistencias relevantes.', abogada.id]
  );
  const [[doc]] = await root.query('SELECT LAST_INSERT_ID() AS id');
  await root.query(
    `INSERT INTO validations (document_id, verifier_id, val_type, result, score_impact, opinion)
     VALUES (?,?,?,?,?,?)`,
    [doc.id, abogada.id, 'juridica', 'aprobado', 8, 'Estructura jurídica adecuada y conforme.']
  );
  console.log('✓ Documento + validación demo creados (listos para mintear NFT)');

  await root.end();
  console.log('\n▶ Listo. Iniciá el servidor con:  npm start');
  console.log('  Logins demo (todos contraseña mtp1234):');
  console.log('   admin@mtp.test  ·  empresa@mtp.test  ·  usuario@mtp.test  ·  abogada@mtp.test  ·  contador@mtp.test');
}

run().catch(err => { console.error('✗ Init falló:', err.message); process.exit(1); });
