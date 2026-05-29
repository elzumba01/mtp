import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { MEMBERSHIPS, statusBadge, fmtDate } from '../../lib.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  useEffect(() => { api.get('/documents').then(setDocs).catch(() => setDocs([])); }, []);
  const mem = MEMBERSHIPS[user.membership] || MEMBERSHIPS.basica;
  const validated = docs.filter(d => d.status === 'validado').length;
  const minted = docs.filter(d => d.nft_token_id).length;

  return (
    <div>
      <div className="grid grid-4">
        <div className="card stat"><div className="stat-val">{docs.length}</div><div className="stat-lbl">Documentos cargados</div></div>
        <div className="card stat"><div className="stat-val">{validated}</div><div className="stat-lbl">Validados</div></div>
        <div className="card stat"><div className="stat-val">{minted}</div><div className="stat-lbl">NFTs en ETTIOS</div></div>
        <div className="card stat"><div className="stat-val">{Math.round(Number(user.reputation))}</div><div className="stat-lbl">Reputación</div></div>
      </div>

      <div className="grid grid-2 mt">
        <div className="card">
          <div className="card-head"><h2>Mi membresía</h2><span className={`badge mem-${mem.cls}`}>{mem.icon} {mem.label}</span></div>
          <p className="muted">Tu plan actual es <strong>{mem.label}</strong> ({mem.price}{mem.unit}).
          Las membresías Premium incluyen minteo automático de NFT al validar.</p>
        </div>
        <div className="card">
          <div className="card-head"><h2>Acciones rápidas</h2></div>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <Link to="/u/upload" className="btn btn-primary">+ Cargar documento</Link>
            <Link to="/u/documents" className="btn btn-ghost">Ver documentos</Link>
            <Link to="/u/reputation" className="btn btn-ghost">Mi reputación</Link>
          </div>
        </div>
      </div>

      <div className="card mt">
        <div className="card-head"><h2>Documentos recientes</h2><Link to="/u/documents" className="dim">Ver todos →</Link></div>
        {docs.length === 0 ? <p className="muted">Todavía no cargaste documentos.</p> : (
          <div className="table-wrap"><table className="data">
            <thead><tr><th>Título</th><th>Tipo</th><th>Estado</th><th>NFT</th><th>Fecha</th></tr></thead>
            <tbody>
              {docs.slice(0, 5).map(d => {
                const s = statusBadge(d.status);
                return (
                  <tr key={d.id}>
                    <td><Link to={`/u/documents/${d.id}`}><strong>{d.title}</strong></Link></td>
                    <td>{d.doc_type}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td>{d.nft_token_id ? <span className="nft-pill">★ #{d.nft_token_id}</span> : <span className="dim">—</span>}</td>
                    <td className="dim">{fmtDate(d.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
