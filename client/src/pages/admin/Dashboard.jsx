import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';

export default function ADashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  useEffect(() => {
    api.get('/users/stats/overview').then(setStats).catch(() => setStats(null));
    api.get('/nft/health').then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  if (!stats) return <div className="card">Cargando…</div>;
  const risk = (stats.risk || []).reduce((acc, r) => ({ ...acc, [r.ai_risk]: r.c }), {});

  return (
    <div>
      <div className="grid grid-4">
        <div className="card stat"><div className="stat-val">{stats.users}</div><div className="stat-lbl">Usuarios</div></div>
        <div className="card stat"><div className="stat-val">{stats.documents}</div><div className="stat-lbl">Documentos</div></div>
        <div className="card stat"><div className="stat-val">{stats.validations}</div><div className="stat-lbl">Dictámenes</div></div>
        <div className="card stat"><div className="stat-val">{stats.nfts}</div><div className="stat-lbl">NFTs en ETTIOS</div></div>
      </div>

      <div className="grid grid-2 mt">
        <div className="card">
          <h2>Distribución de riesgo (IA)</h2>
          <div className="mt">
            <span className="badge badge-good">Bajo: {risk.bajo || 0}</span>{' '}
            <span className="badge badge-warn">Medio: {risk.medio || 0}</span>{' '}
            <span className="badge badge-risk">Alto: {risk.alto || 0}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>ETTIOS Blockchain</h2>
            {health && (health.ok
              ? <span className="badge badge-good">✓ conectado</span>
              : <span className="badge badge-risk">✗ desconectado</span>)}
          </div>
          {health?.ok ? (
            <>
              <p className="muted">Chain ID actual: <strong>{health.chainId}</strong> (esperado: {health.expectedChainId})</p>
              <p className="dim">RPC: {health.rpc}</p>
              {health.contract && <p className="dim">Contrato: <span className="tx-hash">{health.contract}</span></p>}
            </>
          ) : (
            <p className="muted">{health?.error || 'Configurá ETTIOS_RPC_URL, ETTIOS_CONTRACT_ADDRESS y ETTIOS_MINTER_PRIVATE_KEY en el .env del servidor.'}</p>
          )}
        </div>
      </div>

      <div className="card mt">
        <div className="card-head"><h2>Accesos rápidos</h2></div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
          <Link className="btn btn-ghost" to="/admin/users">◉ Usuarios & KYC</Link>
          <Link className="btn btn-ghost" to="/admin/documents">▤ Documentos</Link>
          <Link className="btn btn-ghost" to="/admin/scoring">◴ Scoring</Link>
          <Link className="btn btn-ghost" to="/admin/traceability">≣ Trazabilidad</Link>
          <Link className="btn btn-accent" to="/admin/nfts">★ Registro NFT</Link>
        </div>
      </div>
    </div>
  );
}
