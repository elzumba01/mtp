import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login, roleHome } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [err, setErr]     = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const u = await login(email, pass);
      nav(roleHome(u));
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-brand">
          <div className="brand-mark">M<span>T</span>P</div>
          <div>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Acceso al ecosistema</strong>
            <div className="dim">Ingresá con tu cuenta</div>
          </div>
        </div>

        <div className="card">
          {err && <div className="alert alert-error">{err}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input type="password" required value={pass} onChange={e => setPass(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>
          <p className="muted mt" style={{ textAlign: 'center' }}>
            ¿No tenés cuenta? <Link to="/register">Registrate</Link>
          </p>
          <p className="muted" style={{ textAlign: 'center', marginTop: 6 }}>
            <Link to="/" style={{ color: 'var(--ink-soft)' }}>← Volver al marketplace</Link>
          </p>

          <div style={{ marginTop: 20, fontSize: '.78rem', background: 'rgba(0,212,255,.05)',
                       border: '1px dashed rgba(0,212,255,.25)', borderRadius: 10, padding: 12, lineHeight: 1.7 }}>
            <strong>Usuarios demo</strong> (contraseña <code>mtp1234</code>):<br/>
            Admin: <code>admin@mtp.test</code><br/>
            Usuario: <code>empresa@mtp.test</code><br/>
            Verificador: <code>contador@mtp.test</code>
          </div>
        </div>
      </div>
    </div>
  );
}
