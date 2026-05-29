import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { statusBadge, fmtDate, shortHash } from '../../lib.js';

export default function Documents() {
  const [docs, setDocs] = useState(null);
  useEffect(() => { api.get('/documents').then(setDocs).catch(() => setDocs([])); }, []);

  return (
    <div className="card">
      <div className="card-head">
        <h2>Mis documentos</h2>
        <Link to="/u/upload" className="btn btn-primary btn-sm">+ Cargar nuevo</Link>
      </div>
      {docs === null ? <p className="muted">Cargando…</p>
       : docs.length === 0 ? <p className="muted">Todavía no cargaste documentos. <Link to="/u/upload">Empezá ahora</Link>.</p>
       : (
        <div className="table-wrap"><table className="data">
          <thead><tr><th>Título</th><th>Tipo</th><th>Análisis IA</th><th>Estado</th><th>NFT en ETTIOS</th><th>Fecha</th><th></th></tr></thead>
          <tbody>
            {docs.map(d => {
              const s = statusBadge(d.status);
              const riskCls = d.ai_risk === 'alto' ? 'badge-risk' : d.ai_risk === 'medio' ? 'badge-warn' : 'badge-good';
              return (
                <tr key={d.id}>
                  <td><strong>{d.title}</strong>{d.file_hash && <><br/><span className="dim" title={d.file_hash}>SHA: {shortHash(d.file_hash)}</span></>}</td>
                  <td>{d.doc_type}</td>
                  <td>{d.ai_risk ? <span className={`badge ${riskCls}`}>Riesgo {d.ai_risk}</span> : <span className="dim">—</span>}</td>
                  <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                  <td>{d.nft_token_id
                        ? <span className="nft-pill">★ Token #{d.nft_token_id}</span>
                        : (d.status === 'validado'
                            ? <Link to={`/u/documents/${d.id}`} className="badge badge-warn">Listo para mintear</Link>
                            : <span className="dim">—</span>)}</td>
                  <td className="dim">{fmtDate(d.created_at)}</td>
                  <td><Link to={`/u/documents/${d.id}`} className="btn btn-ghost btn-sm">Ver →</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
       )}
    </div>
  );
}
