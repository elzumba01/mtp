import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { statusBadge, fmtDate } from '../../lib.js';

export default function Queue() {
  const [docs, setDocs] = useState([]);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ val_type: 'estructural', result: 'aprobado', opinion: '' });
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setDocs(await api.get('/validations/queue').catch(() => []));
  }
  useEffect(() => { load(); }, []);

  async function take(docId) {
    try { await api.post(`/validations/take/${docId}`); await load(); }
    catch (e) { setErr(e.message); }
  }

  function open(d) {
    setActive(d); setErr(null); setMsg(null);
    setForm({ val_type: 'estructural', result: 'aprobado', opinion: '' });
  }

  async function submit(e) {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      const r = await api.post('/validations', { document_id: active.id, ...form });
      setMsg(`✓ Dictamen ${r.result} emitido sobre "${active.title}"`);
      setActive(null);
      await load();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      {err && <div className="alert alert-error">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card">
        <div className="card-head"><h2>Cola de validación</h2><span className="dim">{docs.length} documento(s)</span></div>
        {docs.length === 0 ? <p className="muted">No hay documentos pendientes.</p> : (
          <div className="table-wrap"><table className="data">
            <thead><tr><th>Documento</th><th>Tipo</th><th>Propietario</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
            <tbody>
              {docs.map(d => {
                const s = statusBadge(d.status);
                return (
                  <tr key={d.id}>
                    <td><strong>{d.title}</strong>{d.ai_risk && <><br/><span className="dim">IA: riesgo {d.ai_risk}</span></>}</td>
                    <td>{d.doc_type}</td>
                    <td>{d.owner_name}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td className="dim">{fmtDate(d.created_at)}</td>
                    <td className="row" style={{ gap: 6 }}>
                      {d.status !== 'en_validacion' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => take(d.id)}>Tomar</button>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => open(d)}>Dictaminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </div>

      {active && (
        <div className="card mt">
          <div className="card-head">
            <div>
              <h2>Emitir dictamen</h2>
              <p className="muted">Documento: <strong>{active.title}</strong></p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActive(null)}>Cancelar</button>
          </div>
          <form onSubmit={submit}>
            <div className="grid grid-2">
              <div className="field">
                <label>Tipo de validación</label>
                <select value={form.val_type} onChange={e => setForm(f => ({ ...f, val_type: e.target.value }))}>
                  <option value="estructural">Estructural</option>
                  <option value="juridica">Jurídica</option>
                  <option value="tecnica">Técnica</option>
                  <option value="economica">Económica</option>
                </select>
              </div>
              <div className="field">
                <label>Resultado</label>
                <select value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
                  <option value="aprobado">Aprobado (+8 score)</option>
                  <option value="observado">Observado (-2 score)</option>
                  <option value="rechazado">Rechazado (-10 score)</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Opinión / dictamen *</label>
              <textarea required value={form.opinion}
                        onChange={e => setForm(f => ({ ...f, opinion: e.target.value }))}
                        placeholder="Fundamentos del dictamen, observaciones, recomendaciones…" />
            </div>
            <div className="row between mt">
              <span className="muted">El dictamen impactará en el scoring del propietario y el tuyo.</span>
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Emitiendo…' : 'Emitir dictamen'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
