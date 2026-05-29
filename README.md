# MTP Platform — React + Node + ETTIOS Blockchain

**Infraestructura de Validación Económica Verificable** reescrita íntegramente en
React (cliente) + Node.js/Express (API) + MySQL (datos) con integración
on-chain a **ETTIOS BLOCKCHAIN** (Chain ID 2237) para emisión de NFTs de
validación.

Basado en el whitepaper de Lic. Pablo Rutigliano (Aston Mining S.L.) y las
7 capas del MTP Framework. Reemplaza la versión PHP/WAMP anterior.

---

## 📐 Arquitectura

```
mtp-react/
├── server/                   API REST (Node 22 + Express + MySQL2 + ethers v6)
│   ├── src/
│   │   ├── index.js          → bootstrap Express
│   │   ├── db.js             → pool MySQL
│   │   ├── auth.js           → JWT + bcrypt
│   │   ├── blockchain.js     → integración ETTIOS via ethers.js
│   │   ├── ai.js             → motor IA (heurístico)
│   │   ├── helpers.js        → scoring + activity log
│   │   ├── middleware/       → auth, role, upload (multer)
│   │   ├── routes/           → auth, marketplace, documents,
│   │   │                       validations, users, activity, nft
│   │   └── initDb.js         → seed de DB con datos demo
│   ├── contracts/
│   │   └── MTPValidationNFT.sol   → contrato ERC-721 para desplegar en ETTIOS
│   ├── sql/schema.sql        → esquema MySQL (incluye tabla `nfts`)
│   └── .env.example
│
└── client/                   React 18 + Vite + React Router 6
    ├── src/
    │   ├── App.jsx           → router con 3 áreas (admin/verificador/usuario)
    │   ├── api.js            → wrapper de fetch con JWT
    │   ├── auth.jsx          → AuthContext
    │   ├── lib.js            → helpers (membresías, badges, fechas)
    │   ├── styles.css        → tema verde + amarillo (Bricolage + Schibsted)
    │   ├── components/Layout.jsx
    │   └── pages/            → 16 páginas (públicas + 3 paneles por rol)
    └── vite.config.js        → proxy /api → http://localhost:4000
```

### Las 7 Capas del MTP Framework

| Capa | Implementación |
|------|----------------|
| **1** KYC dinámico       | `users.kyc_status`, panel admin |
| **2** Motor de IA         | `server/src/ai.js` (heurístico, reemplazable) |
| **3** Validación humana   | rol *verificador*, tabla `validations`, dictámenes con scoring |
| **4** Trazabilidad        | tabla `activity_log` + SHA-256 de cada archivo |
| **5** Motor de scoring    | `users.reputation` (0–100) + tabla `scoring_history` |
| **6** Marketplace         | `/` público, profesionales filtrables por sector y membresía |
| **7** Tokenización NFT    | tabla `nfts` + contrato Solidity en ETTIOS (Chain ID 2237) |

---

## 🚀 Setup

### Requisitos
- Node.js 18+ (probado en 22)
- MySQL 8 o MariaDB 10.4+ (WAMP funciona perfecto — solo usás MySQL del stack)
- Para mintear NFTs: un nodo RPC de ETTIOS y un wallet con fondos en la red

### 1) Servidor

```bash
cd server
npm install
cp .env.example .env
# editá .env con tus credenciales MySQL y datos de ETTIOS
npm run init-db      # crea base, schema y datos demo
npm run dev          # arranca en http://localhost:4000
```

Variables en `.env`:

| Variable | Para qué |
|----------|----------|
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL local (WAMP, etc.) |
| `JWT_SECRET` | clave para firmar tokens (poné algo largo y aleatorio) |
| `ETTIOS_RPC_URL` | URL del nodo JSON-RPC de ETTIOS (pedile a Adrián) |
| `ETTIOS_CHAIN_ID` | `2237` |
| `ETTIOS_CONTRACT_ADDRESS` | dirección del contrato ERC-721 ya desplegado |
| `ETTIOS_MINTER_PRIVATE_KEY` | private key de un wallet con saldo en ETTIOS y permisos de mint |
| `NFT_METADATA_BASE_URL` | (opcional) gateway IPFS propio — si está vacío, los metadatos los sirve el propio servidor desde `/api/nft/metadata/:id` |

### 2) Cliente

```bash
cd ../client
npm install
npm run dev          # http://localhost:5173
```

Vite ya proxea `/api/*` → `http://localhost:4000`, no hace falta tocar nada.

---

## ⛓️ Desplegar el contrato en ETTIOS

El contrato Solidity está en `server/contracts/MTPValidationNFT.sol` — es un
ERC-721 autocontenido (sin dependencias de OpenZeppelin para máxima portabilidad).

**Opción 1: Remix (rápido)**

1. Abrí https://remix.ethereum.org
2. Pegá el contenido de `MTPValidationNFT.sol` en un archivo nuevo.
3. Pestaña **Solidity Compiler** → compilador `0.8.20` → Compile.
4. Pestaña **Deploy & Run** → Environment: *Injected Provider - MetaMask*.
5. Configurá en MetaMask la red ETTIOS:
   - Network name: `ETTIOS`
   - RPC URL: la URL que te pase Adrián
   - Chain ID: `2237`
   - Symbol: el símbolo nativo de ETTIOS
6. Deploy → confirmá en MetaMask → copiá la dirección del contrato a `.env` como
   `ETTIOS_CONTRACT_ADDRESS`.
7. Si el wallet que va a usar la API es **distinto** del deployer, ejecutá
   `setMinter(addressDelMinter, true)` desde Remix para autorizarlo.

**Opción 2: Hardhat / Foundry**

Compilá con `solc 0.8.20`, deployá apuntando al RPC de ETTIOS, y guardá la
dirección resultante en `.env`.

---

## 👥 Usuarios demo

Tras correr `npm run init-db`, todos los logins usan contraseña **`mtp1234`**:

| Email | Rol | Membresía |
|-------|-----|-----------|
| `admin@mtp.test`    | admin       | premium      |
| `empresa@mtp.test`  | usuario     | profesional  |
| `usuario@mtp.test`  | usuario     | básica       |
| `abogada@mtp.test`  | verificador | premium      |
| `contador@mtp.test` | verificador | profesional  |

La DB se siembra con un documento ya validado de `empresa@mtp.test` para que
puedas probar el flujo de minteo de NFT inmediatamente.

---

## 🔁 Flujo de demo completo

1. **Marketplace público** → entrá a http://localhost:5173 sin loguearte.
   Vas a ver el listado de verificadores filtrables por sector, con
   destacado para los Premium.
2. **Registro** → creá una cuenta nueva eligiendo plan (Básica/Profesional/Premium)
   y opcionalmente pegando tu wallet EVM `0x…` para poder recibir NFTs.
3. **Carga de documento** → como usuario, andá a `+ Cargar documento`, subí un
   PDF/imagen. El motor IA (Capa 2) analiza el contenido y le asigna riesgo.
4. **Asignación** → entrá como `admin@mtp.test`, andá a `Documentos`,
   seleccioná el verificador apropiado.
5. **Dictamen** → entrá como verificador, andá a `Cola de validación`,
   tomá el documento y emití un dictamen `aprobado`.
6. **Mint NFT** → volvé como propietario del documento. En la ficha del
   documento validado aparece un botón **★ Mintear NFT en ETTIOS**.
   Al apretarlo, el servidor:
   - construye los metadatos ERC-721,
   - llama `safeMint(toAddress, metadataUri)` en el contrato,
   - graba en la DB el `token_id`, `tx_hash` y `block_number`.
7. **Verificación on-chain** → entrá como admin a `★ NFTs en ETTIOS`. Vas a ver
   el registro de todos los NFTs minteados, con health check del RPC y vista
   de los metadatos JSON.

---

## 🧠 Cómo funciona el minteo de NFT

```
[ Documento validado ]
        │
        ▼
POST /api/nft/mint/:docId
        │
        ├─→ valida: status='validado', no minteado, propietario o admin
        ├─→ construye metadata JSON (atributos ERC-721 estándar)
        ├─→ inserta fila placeholder en `nfts`
        ├─→ resuelve metadataUri:
        │       NFT_METADATA_BASE_URL/:id.json   (si seteado)
        │       o /api/nft/metadata/:id          (servido por nuestro backend)
        ├─→ ethers.js → contract.safeMint(to, uri)
        ├─→ espera receipt, parsea event Transfer → token_id
        └─→ actualiza fila con token_id, tx_hash, block_number
```

Los metadatos siguen el estándar ERC-721 / OpenSea:

```json
{
  "name": "MTP Validation #42 — Contrato Torre Norte",
  "description": "Documento validado dentro del ecosistema MTP Platform…",
  "image": "https://server/api/documents/42/file",
  "attributes": [
    { "trait_type": "Document Type", "value": "contrato" },
    { "trait_type": "AI Risk", "value": "bajo" },
    { "trait_type": "Validations", "value": 1 },
    { "trait_type": "Owner Reputation", "value": 88 },
    { "trait_type": "Owner Membership", "value": "premium" },
    { "trait_type": "File SHA-256", "value": "..." },
    { "trait_type": "Chain", "value": "ETTIOS" },
    { "trait_type": "Chain ID", "value": 2237 }
  ]
}
```

Cualquier marketplace o explorador ERC-721 compatible (como los que use
ETTIOS internamente) puede leer estos NFTs sin modificación.

---

## 📝 API endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | crear cuenta (devuelve `{user, token}`) |
| `POST` | `/api/auth/login` | login |
| `GET`  | `/api/marketplace/professionals?sector=` | listado público |
| `POST` | `/api/documents` | cargar documento (multipart) |
| `GET`  | `/api/documents` | mis documentos |
| `GET`  | `/api/documents/:id` | detalle (con dictámenes y NFT) |
| `POST` | `/api/validations` | emitir dictamen (verificador) |
| `POST` | `/api/nft/mint/:docId` | **mintear NFT en ETTIOS** |
| `GET`  | `/api/nft` | registro público on-chain |
| `GET`  | `/api/nft/metadata/:id` | metadata JSON (ERC-721) |
| `GET`  | `/api/nft/health` | estado de conexión a ETTIOS |
| `GET`  | `/api/users/stats/overview` | métricas admin |

---

## 📦 Stack

- **Backend**: Express 4.21 · MySQL2 3.11 · ethers.js 6.13 · bcryptjs · multer · jsonwebtoken
- **Frontend**: React 18.3 · Vite 5.4 · React Router 6.28
- **Blockchain**: contrato ERC-721 propio en Solidity 0.8.20

---

## ✅ Verificación rápida

```bash
# Servidor compila
cd server && node --check src/index.js

# Cliente compila
cd ../client && npm run build
```

---

© 2026 — Aston Mining S.L. · Lic. Pablo Rutigliano  
Tokenización en ETTIOS Blockchain (Chain ID 2237)
