import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { fmtDate } from '../../lib.js';

export default function Traceability() {
  const [data, setData] = useState({ rows: [], total: 0, page: 1, limit: 30 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get(`/activity/activity?page=${page}`).then(setData).catch(() => {});
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Trazabilidad estructural</h2>
          <p className="muted">Capa 4 — registro inmutable de eventos del sistema.</p>
        </div>
        <span className="dim">{data.total} eventos</span>
      </div>
      <div className="table-wrap"><table className="data">
        <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Detalle</th><th>IP</th></tr></thead>
        <tbody>
          {data.rows.map(r => (
            <tr key={r.id}>
              <td className="dim">{fmtDate(r.created_at)}</td>
              <td>{r.full_name || <span className="dim">—</span>}</td>
              <td><span className="badge badge-info">{r.action}</span></td>
              <td>{r.entity || ''} {r.entity_id && <span className="dim">#{r.entity_id}</span>}</td>
              <td className="dim">{r.details || ''}</td>
              <td className="dim">{r.ip_address || ''}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="row between mt">
        <span className="dim">Página {data.page} de {totalPages}</span>
        <div className="row">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente →</button>
        </div>
      </div>
    </div>
  );
}
