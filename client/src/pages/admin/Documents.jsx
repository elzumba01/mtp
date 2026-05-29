import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { statusBadge, fmtDate } from '../../lib.js';

export default function ADocs() {
  const [docs, setDocs] = useState([]);
  const [verifiers, setVerifiers] = useState([]);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);

  async function load() {
    setDocs(await api.get('/validations/queue').catch(() => []));
    setVerifiers(await api.get('/users?role=verificador').catch(() => []));
  }
  useEffect(() => { load(); }, []);

  async function assign(docId, verifierId) {
    setErr(null); setMsg(null);
    if (!verifierId) return;
    try {
      await api.patch(`/documents/${docId}/assign`, { verifier_id: Number(verifierId) });
      setMsg(`✓ Documento asignado`);
      await load();
    } catch (e) { setErr(e.message); }
  }

  return (
    <div>
      {err && <div className="alert alert-error">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card">
        <div className="card-head"><h2>Documentos en proceso</h2><span className="dim">{docs.length} doc(s)</span></div>
        <div className="table-wrap"><table className="data">
          <thead><tr><th>Documento</th><th>Tipo</th><th>Propietario</th><th>IA</th><th>Estado</th><th>Verificador</th><th>Fecha</th></tr></thead>
          <tbody>
            {docs.map(d => {
              const s = statusBadge(d.status);
              return (
                <tr key={d.id}>
                  <td><Link to={`/u/documents/${d.id}`}><strong>{d.title}</strong></Link></td>
                  <td>{d.doc_type}</td>
                  <td>{d.owner_name}<br/><span className="dim">{d.owner_sector || ''}</span></td>
                  <td>{d.ai_risk ? <span className={`badge ${d.ai_risk === 'alto' ? 'badge-risk' : d.ai_risk === 'medio' ? 'badge-warn' : 'badge-good'}`}>{d.ai_risk}</span> : '—'}</td>
                  <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                  <td>
                    <select defaultValue={d.assigned_to || ''} onChange={e => assign(d.id, e.target.value)}>
                      <option value="">— Asignar —</option>
                      {verifiers.map(v => <option key={v.id} value={v.id}>{v.full_name}</option>)}
                    </select>
                  </td>
                  <td className="dim">{fmtDate(d.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
