import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const PLANS = [
  { id: 'basica',      name: 'Básica',      icon: '◌', price: 'Gratis',   unit: '',
    feats: ['Acceso al marketplace', 'Perfil público', 'Hasta 3 documentos/mes'], hl: false },
  { id: 'profesional', name: 'Profesional', icon: '◆', price: 'USD 29',   unit: '/ mes',
    feats: ['Documentos ilimitados', 'Badge "Profesional"', 'Prioridad en IA'], hl: false },
  { id: 'premium',     name: 'Premium',     icon: '★', price: 'USD 79',   unit: '/ mes',
    feats: ['Todo lo Profesional', 'Top + destacado', 'Mint de NFT incluido', 'Soporte 24h'], hl: true },
];

export default function Register() {
  const { register, roleHome } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    full_name: '', email: '', password: '', password2: '',
    entity_type: 'empresa', company_name: '', document_id: '',
    sector: '', wallet_address: '',
    as_verifier: false, specialty: '',
    membership: 'basica',
    accept_terms: false, accept_privacy: false, accept_kyc: false,
  });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault(); setErr(null);
    if (form.password.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres');
    if (form.password !== form.password2) return setErr('Las contraseñas no coinciden');
    if (!form.accept_terms || !form.accept_privacy || !form.accept_kyc)
      return setErr('Debés aceptar los Términos, la Política de Privacidad y consentir el KYC/AML para continuar.');
    setLoading(true);
    try {
      const { password2, ...payload } = form;
      const u = await register(payload);
      nav(roleHome(u));
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box" style={{ maxWidth: 860 }}>
        <div className="auth-brand">
          <div className="brand-mark">M<span>T</span>P</div>
          <div>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Crear cuenta</strong>
            <div className="dim">Unite a la infraestructura de validación verificable</div>
          </div>
        </div>

        <div className="card">
          {err && <div className="alert alert-error">{err}</div>}
          <form onSubmit={submit}>
            <div className="grid grid-2">
              <div className="field">
                <label>Nombre completo / Razón social *</label>
                <input required value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div className="field">
                <label>Email *</label>
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="field">
                <label>Tipo de entidad</label>
                <select value={form.entity_type} onChange={e => set('entity_type', e.target.value)}>
                  <option value="empresa">Empresa</option>
                  <option value="profesional">Profesional</option>
                  <option value="organizacion">Organización</option>
                  <option value="proyecto">Proyecto</option>
                  <option value="inversor">Inversor</option>
                </select>
              </div>
              <div className="field">
                <label>Sector</label>
                <input value={form.sector} placeholder="Inmobiliario, Agro, Finanzas…" onChange={e => set('sector', e.target.value)} />
              </div>
              <div className="field">
                <label>Empresa / organización</label>
                <input value={form.company_name} onChange={e => set('company_name', e.target.value)} />
              </div>
              <div className="field">
                <label>DNI / CUIT / NIF</label>
                <input value={form.document_id} onChange={e => set('document_id', e.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Billetera EVM en ETTIOS (opcional, para recibir NFTs)</label>
                <input value={form.wallet_address} placeholder="0x…" onChange={e => set('wallet_address', e.target.value)} />
              </div>
              <div className="field">
                <label>Contraseña *</label>
                <input type="password" required minLength={6} value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div className="field">
                <label>Repetir contraseña *</label>
                <input type="password" required minLength={6} value={form.password2} onChange={e => set('password2', e.target.value)} />
              </div>
            </div>

            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(0,212,255,.05)',
                           border: '1px solid rgba(0,212,255,.2)', borderRadius: 10, padding: 14, marginBottom: 18 }}>
              <input type="checkbox" style={{ marginTop: 3 }} checked={form.as_verifier}
                     onChange={e => set('as_verifier', e.target.checked)} />
              <span>
                <strong>Registrarme como verificador profesional</strong>
                <div className="dim">Abogados, contadores, ingenieros y auditores que emiten dictámenes (Capa 3).</div>
                {form.as_verifier && (
                  <input style={{ marginTop: 8, width: '100%' }} placeholder="Especialidad (contador, abogado…)"
                         value={form.specialty} onChange={e => set('specialty', e.target.value)} />
                )}
              </span>
            </label>

            {/* Selector de membresía */}
            <div className="row between" style={{ marginBottom: 12, alignItems: 'baseline' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: 0 }}>Elegí tu membresía</h3>
              <span className="muted">Podés cambiarla más adelante</span>
            </div>
            <div className="plans">
              {PLANS.map(p => (
                <label key={p.id} className={`plan ${p.id === 'premium' ? 'is-premium' : ''}`}>
                  <input type="radio" name="membership" value={p.id}
                         checked={form.membership === p.id}
                         onChange={() => set('membership', p.id)} />
                  <div className="plan-inner">
                    {p.hl && <span className="plan-badge">RECOMENDADO</span>}
                    <div className="plan-top">
                      <div className="plan-name">{p.name}</div>
                      <div className="plan-ico">{p.icon}</div>
                    </div>
                    <div className="plan-price">{p.price}<small>{p.unit}</small></div>
                    <ul className="plan-feats">
                      {p.feats.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                </label>
              ))}
            </div>

            <div className="legal-consents">
              <strong>Marco legal — aceptación obligatoria</strong>
              <label className="lc-row">
                <input type="checkbox" checked={form.accept_terms}
                       onChange={e => set('accept_terms', e.target.checked)} />
                <span>He leído y acepto los <Link to="/terms" target="_blank">Términos y Condiciones</Link> (v2026.05).</span>
              </label>
              <label className="lc-row">
                <input type="checkbox" checked={form.accept_privacy}
                       onChange={e => set('accept_privacy', e.target.checked)} />
                <span>He leído y acepto la <Link to="/privacy" target="_blank">Política de Privacidad</Link> y autorizo el tratamiento de mis datos.</span>
              </label>
              <label className="lc-row">
                <input type="checkbox" checked={form.accept_kyc}
                       onChange={e => set('accept_kyc', e.target.checked)} />
                <span>Consiento someterme a controles <strong>KYC/AML</strong> conforme a <strong>SEPRELAD</strong> (Paraguay) y UIF (Argentina), incluyendo verificación de identidad, documento y screening de listas restrictivas.</span>
              </label>
              <p className="dim" style={{ marginTop: 8, fontSize: '.78rem' }}>
                Tu IP y el momento exacto de aceptación quedarán registrados de forma inmutable en el log de consentimientos legales (Ley 6534/20 de Paraguay).
              </p>
            </div>

            <div className="row between mt">
              <Link className="btn btn-ghost" to="/">← Volver al inicio</Link>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Creando…' : 'Crear cuenta'}
              </button>
            </div>
          </form>
          <p className="muted mt" style={{ textAlign: 'center' }}>
            ¿Ya tenés cuenta? <Link to="/login">Ingresá acá</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
