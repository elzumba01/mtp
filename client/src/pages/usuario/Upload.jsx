import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { DOC_TYPES } from '../../lib.js';

export default function Upload() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('contrato');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setErr(null);
    if (!title.trim()) return setErr('Título requerido');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('doc_type', type);
      fd.append('description', desc);
      if (file) fd.append('file', file);
      const r = await api.upload('/documents', fd);
      nav(`/u/documents/${r.document.id}`);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h2>Cargar nuevo documento</h2>
      <p className="muted mb">El motor IA (Capa 2) genera un análisis preliminar de riesgo al cargar.
         Luego un verificador profesional emite el dictamen (Capa 3) y, si se aprueba,
         podés mintear el NFT en ETTIOS Blockchain.</p>

      {err && <div className="alert alert-error">{err}</div>}

      <form onSubmit={submit}>
        <div className="field">
          <label>Título *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
                 placeholder="Ej: Contrato de fideicomiso Torre Norte" />
        </div>
        <div className="field">
          <label>Tipo de documento</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {DOC_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Descripción (mín. 40 caracteres para mejor análisis IA)</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="Describí el contenido, partes, objeto y monto del documento…" />
        </div>
        <div className="field">
          <label>Archivo (PDF, DOC, XLS, imagen, ≤ 8MB)</label>
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)}
                 accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.txt" />
        </div>
        <div className="row between mt">
          <button type="button" className="btn btn-ghost" onClick={() => nav('/u/documents')}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Cargando…' : 'Cargar documento'}</button>
        </div>
      </form>
    </div>
  );
}
