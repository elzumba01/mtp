import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { fmtDate, shortHash, MEMBERSHIPS } from '../../lib.js';

export default function Nfts() {
  const [list, setList] = useState([]);
  const [health, setHealth] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    api.get('/nft').then(setList).catch(() => setList([]));
    api.get('/nft/health').then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  async function showMeta(nft) {
    setMeta({ nft, json: null, loading: true });
    try {
      const json = await api.get(`/nft/metadata/${nft.id}`);
      setMeta({ nft, json, loading: false });
    } catch {
      setMeta({ nft, json: null, loading: false });
    }
  }

  return (
    <div>
      {/* Health diagnostic */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>ETTIOS Blockchain</h2>
            <p className="muted">Conexión a la red blockchain · Chain ID 2237</p>
          </div>
          {health && (health.ok
            ? <span className="badge badge-good">✓ Conectado</span>
            : <span className="badge badge-risk">✗ Sin conexión</span>)}
        </div>
        {health?.ok ? (
          <div className="grid grid-2">
            <div>
              <strong>RPC endpoint</strong>
              <div className="tx-hash">{health.rpc || '—'}</div>
            </div>
            <div>
              <strong>Contrato MTPValidationNFT</strong>
              <div className="tx-hash">{health.contract || '—'}</div>
            </div>
            <div>
              <strong>Chain ID detectado</strong>
              <div>{health.chainId} {health.chainId !== health.expectedChainId &&
                <span className="badge badge-warn">esperado: {health.expectedChainId}</span>}</div>
            </div>
            <div>
              <strong>Wallet minter</strong>
              <div className="tx-hash">{health.minter || '—'}</div>
            </div>
          </div>
        ) : (
          <div className="alert alert-info">
            {health?.error || 'Configurá las variables ETTIOS_RPC_URL, ETTIOS_CONTRACT_ADDRESS y ETTIOS_MINTER_PRIVATE_KEY en server/.env y reiniciá el servidor.'}
          </div>
        )}
      </div>

      {/* NFTs minteados */}
      <div className="card mt">
        <div className="card-head">
          <h2>Registro on-chain</h2>
          <span className="dim">{list.length} NFT(s) minteados</span>
        </div>
        {list.length === 0 ? (
          <p className="muted">Todavía no se minteó ningún NFT. Validá un documento y usá el botón
             "Mintear NFT en ETTIOS" desde su ficha.</p>
        ) : (
          <div className="table-wrap"><table className="data">
            <thead><tr><th>Token ID</th><th>Documento</th><th>Propietario</th><th>Membresía</th><th>Contract</th><th>Tx hash</th><th>Fecha</th><th></th></tr></thead>
            <tbody>
              {list.map(n => {
                const mem = MEMBERSHIPS[n.membership] || MEMBERSHIPS.basica;
                return (
                  <tr key={n.id}>
                    <td><span className="nft-pill">★ #{n.token_id}</span></td>
                    <td><strong>{n.doc_title}</strong><br/><span className="dim">{n.doc_type}</span></td>
                    <td>{n.owner_name}</td>
                    <td><span className={`badge mem-${mem.cls}`}>{mem.icon} {mem.label}</span></td>
                    <td><span className="tx-hash" title={n.contract_address}>{shortHash(n.contract_address)}</span></td>
                    <td><span className="tx-hash" title={n.tx_hash}>{shortHash(n.tx_hash)}</span></td>
                    <td className="dim">{fmtDate(n.minted_at)}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => showMeta(n)}>Metadata</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Metadata modal */}
      {meta && (
        <div className="card mt" style={{ borderColor: 'var(--yellow-400)', borderWidth: 2 }}>
          <div className="card-head">
            <div>
              <h2>Metadata ERC-721 · Token #{meta.nft.token_id}</h2>
              <p className="dim">URI: {meta.nft.metadata_uri}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setMeta(null)}>Cerrar</button>
          </div>
          {meta.loading ? <p className="muted">Cargando…</p> : (
            <pre style={{ background: 'rgba(0,212,255,.05)', border: '1px solid rgba(0,212,255,.15)', color: 'var(--cyan-200)', padding: 16, borderRadius: 10, overflow: 'auto', fontSize: '.82rem', lineHeight: 1.5 }}>
              {JSON.stringify(meta.json, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
