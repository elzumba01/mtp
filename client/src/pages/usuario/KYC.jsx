import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { fmtDate } from '../../lib.js';

const COUNTRIES = ['Paraguay','Argentina','España','Brasil','Uruguay','Chile','Colombia','México','Estados Unidos','Otro'];
const DOC_TYPES = ['DNI','Pasaporte','CI','RUC','NIF','CUIT','CURP','Otro'];

const STEPS = [
  { n: 1, title: 'Email verificado',     desc: 'Completado al crear cuenta' },
  { n: 2, title: 'Documento de identidad', desc: 'DNI, Pasaporte, Cédula o equivalente' },
  { n: 3, title: 'Verificación facial',   desc: 'Selfie con liveness (próximamente)' },
  { n: 4, title: 'Screening AML',         desc: 'Control automático listas SEPRELAD' },
];

export default function KYC() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ country: 'Paraguay', doc_type: 'CI', doc_number: '', wallet_address: '' });
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try { setData(await api.get('/kyc/me')); } catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      const r = await api.post('/kyc', form);
      setMsg(`✓ Datos KYC enviados — referencia ${r.reference}. Un administrador revisará tu solicitud.`);
      await load();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  if (!data) return <div className="card">Cargando…</div>;

  const currentStep = data.kyc_status === 'verificado' ? 4
                    : (data.kyc_reference ? 3 : 2);
  const cls = (n) => n < currentStep ? 'done' : n === currentStep ? 'active' : 'pending';

  return (
    <div>
      {err && <div className="alert alert-error">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Verificación de identidad (KYC)</h2>
            <p className="muted">Capa 1 — controles alineados con SEPRELAD Paraguay y UIF Argentina.</p>
          </div>
          <span className={`badge ${data.kyc_status === 'verificado' ? 'badge-good' : data.kyc_status === 'rechazado' ? 'badge-risk' : 'badge-warn'}`}>
            {data.kyc_status === 'verificado' ? '✓ Verificado' : data.kyc_status === 'rechazado' ? 'Rechazado' : 'Pendiente'}
          </span>
        </div>

        {/* Steps timeline */}
        <div className="kyc-steps">
          {STEPS.map(s => (
            <div key={s.n} className={`kyc-step kyc-${cls(s.n)}`}>
              <div className="kyc-step-num">{cls(s.n) === 'done' ? '✓' : s.n}</div>
              <div>
                <strong>{s.title}</strong>
                <p className="muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.kyc_status !== 'verificado' && (
        <div className="card mt">
          <h2>Enviar datos KYC</h2>
          <p className="muted mb">Los datos quedan cifrados y se comparten únicamente con el proveedor de verificación
             y con autoridades competentes ante requerimiento legal.</p>
          <form onSubmit={submit}>
            <div className="grid grid-2">
              <div className="field">
                <label>País de residencia *</label>
                <select required value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Tipo de documento *</label>
                <select required value={form.doc_type} onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))}>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Número de documento *</label>
                <input required value={form.doc_number} onChange={e => setForm(f => ({ ...f, doc_number: e.target.value }))} />
              </div>
              <div className="field">
                <label>Billetera EVM (opcional)</label>
                <input value={form.wallet_address} placeholder="0x…" onChange={e => setForm(f => ({ ...f, wallet_address: e.target.value }))} />
              </div>
            </div>
            <div className="row between mt">
              <span className="muted">Al enviar, aceptás el procesamiento conforme a la Política de Privacidad.</span>
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Enviando…' : 'Enviar verificación'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Estado actual */}
      <div className="card mt">
        <h2>Estado actual</h2>
        <div className="grid grid-2">
          <div>
            <div className="dim" style={{ fontSize: 11, textTransform: 'uppercase' }}>Consentimientos</div>
            <p>Términos: <strong style={{ color: 'var(--cyan-400)' }}>v{data.terms_version || '—'}</strong></p>
            <p className="dim">Firmados el {fmtDate(data.terms_accepted_at)}</p>
          </div>
          <div>
            <div className="dim" style={{ fontSize: 11, textTransform: 'uppercase' }}>Datos KYC</div>
            <p>Documento: <strong>{data.kyc_doc_type || '—'} {data.kyc_doc_number || ''}</strong></p>
            <p className="dim">País: {data.kyc_country || '—'}</p>
            {data.kyc_reference && <p className="dim">Referencia: <code>{data.kyc_reference}</code></p>}
          </div>
        </div>
      </div>
    </div>
  );
}
