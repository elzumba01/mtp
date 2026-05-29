/**
 * MTP PLATFORM — Integración con ETTIOS BLOCKCHAIN (Chain ID 2237).
 *
 * ETTIOS es una blockchain EVM-compatible, por lo que usamos ethers.js para
 * interactuar con un contrato ERC-721 estándar (MTPValidationNFT.sol).
 *
 * Variables de entorno necesarias:
 *   ETTIOS_RPC_URL            — URL del nodo JSON-RPC de ETTIOS
 *   ETTIOS_CHAIN_ID           — 2237
 *   ETTIOS_CONTRACT_ADDRESS   — dirección del contrato ERC-721 desplegado
 *   ETTIOS_MINTER_PRIVATE_KEY — private key del wallet autorizado a mintear
 */

import { ethers } from 'ethers';
import 'dotenv/config';

// ABI mínima del contrato MTPValidationNFT (ERC-721 + safeMint + tokenURI).
// Si modificás el contrato, regenerá esta ABI desde Remix/Hardhat.
const MTP_NFT_ABI = [
  'function safeMint(address to, string memory uri) public returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

let _provider = null;
let _wallet = null;
let _contract = null;

function provider() {
  if (!_provider) {
    const url = process.env.ETTIOS_RPC_URL;
    if (!url) throw new Error('Falta ETTIOS_RPC_URL en .env');
    _provider = new ethers.JsonRpcProvider(url, {
      chainId: Number(process.env.ETTIOS_CHAIN_ID || 2237),
      name: 'ettios',
    });
  }
  return _provider;
}

function wallet() {
  if (!_wallet) {
    const pk = process.env.ETTIOS_MINTER_PRIVATE_KEY;
    if (!pk || pk.replace(/0|x/g, '') === '') {
      throw new Error('Falta ETTIOS_MINTER_PRIVATE_KEY en .env');
    }
    _wallet = new ethers.Wallet(pk, provider());
  }
  return _wallet;
}

function contract() {
  if (!_contract) {
    const addr = process.env.ETTIOS_CONTRACT_ADDRESS;
    if (!addr || /^0x0+$/.test(addr)) {
      throw new Error('Falta ETTIOS_CONTRACT_ADDRESS en .env (deployá MTPValidationNFT.sol primero)');
    }
    _contract = new ethers.Contract(addr, MTP_NFT_ABI, wallet());
  }
  return _contract;
}

/** Chequeo de salud: ¿el RPC responde y devuelve el chainId esperado? */
export async function ettiosHealth() {
  try {
    const net = await provider().getNetwork();
    return {
      ok: true,
      chainId: Number(net.chainId),
      expectedChainId: Number(process.env.ETTIOS_CHAIN_ID || 2237),
      rpc: process.env.ETTIOS_RPC_URL,
      minter: process.env.ETTIOS_MINTER_PRIVATE_KEY ? wallet().address : null,
      contract: process.env.ETTIOS_CONTRACT_ADDRESS || null,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Construye los metadatos JSON estilo ERC-721 (compatibles con OpenSea/marketplaces).
 * Estos metadatos se guardan en la DB y se sirven en /api/nft/metadata/:id.
 */
export function buildMetadata({ doc, validations, owner, fileUrl }) {
  return {
    name: `MTP Validation #${doc.id} — ${doc.title}`,
    description:
      `Documento validado dentro del ecosistema MTP Platform.\n` +
      `Tipo: ${doc.doc_type} · Propietario: ${owner.full_name}.\n` +
      `Validaciones profesionales (Capa 3): ${validations.length}.`,
    image: fileUrl || null,
    external_url: `https://mtp.platform/documents/${doc.id}`,
    attributes: [
      { trait_type: 'Document Type', value: doc.doc_type },
      { trait_type: 'AI Risk', value: doc.ai_risk || 'n/a' },
      { trait_type: 'Status', value: doc.status },
      { trait_type: 'Validations', value: validations.length },
      { trait_type: 'Owner Reputation', value: Number(owner.reputation) },
      { trait_type: 'Owner Membership', value: owner.membership },
      { trait_type: 'File SHA-256', value: doc.file_hash || 'n/a' },
      { trait_type: 'Chain', value: 'ETTIOS' },
      { trait_type: 'Chain ID', value: Number(process.env.ETTIOS_CHAIN_ID || 2237) },
    ],
  };
}

/**
 * Mintea un NFT en ETTIOS llamando a safeMint(to, uri) del contrato.
 * Devuelve { tokenId, txHash, blockNumber }.
 */
export async function mintValidationNFT({ toAddress, metadataUri }) {
  if (!ethers.isAddress(toAddress)) {
    throw new Error(`Dirección destino inválida: ${toAddress}`);
  }
  const c = contract();
  const tx = await c.safeMint(toAddress, metadataUri);
  const receipt = await tx.wait();

  // El tokenId se obtiene del event Transfer(from=0x0, to=toAddress, tokenId)
  let tokenId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = c.interface.parseLog(log);
      if (parsed && parsed.name === 'Transfer') {
        tokenId = parsed.args.tokenId.toString();
        break;
      }
    } catch { /* log no parseable, sigo */ }
  }
  if (!tokenId) {
    // Fallback: derivarlo de totalSupply (asume incremental, suficiente para MVP)
    const total = await c.totalSupply();
    tokenId = (total - 1n).toString();
  }
  return {
    tokenId,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    contractAddress: await c.getAddress(),
  };
}

export const ETTIOS_CHAIN_ID = Number(process.env.ETTIOS_CHAIN_ID || 2237);
