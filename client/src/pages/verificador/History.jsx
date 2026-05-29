import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { fmtDate } from '../../lib.js';

export default function History() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get('/validations/mine').then(setRows).catch(() => setRows([])); }, []);

  return (
    <div className="card">
      <div className="card-head"><h2>Mis dictámenes</h2><span className="dim">{rows.length} total</span></div>
      {rows.length === 0 ? <p className="muted">Todavía no emitiste dictámenes.</p> : (
        <div className="table-wrap"><table className="data">
          <thead><tr><th>Documento</th><th>Tipo doc.</th><th>Validación</th><th>Resultado</th><th>Δ Score</th><th>Fecha</th></tr></thead>
          <tbody>
            {rows.map(r => {
              const c = r.result === 'aprobado' ? 'badge-good' : r.result === 'observado' ? 'badge-warn' : 'badge-risk';
              return (
                <tr key={r.id}>
                  <td><strong>{r.doc_title}</strong></td>
                  <td>{r.doc_type}</td>
                  <td>{r.val_type}</td>
                  <td><span className={`badge ${c}`}>{r.result}</span></td>
                  <td>{Number(r.score_impact) > 0 ? '+' : ''}{Number(r.score_impact)}</td>
                  <td className="dim">{fmtDate(r.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
