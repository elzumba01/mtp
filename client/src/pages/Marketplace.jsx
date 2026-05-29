import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { MEMBERSHIPS, ENTITY_LABELS, scoreLabel } from '../lib.js';

export default function Marketplace() {
  const { user, roleHome, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const sector = params.get('sector') || '';
  const [pros, setPros] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get(`/marketplace/professionals${sector ? `?sector=${encodeURIComponent(sector)}` : ''}`)
      .then(setPros).catch(() => setPros([]));
  }, [sector]);

  useEffect(() => {
    api.get('/marketplace/sectors').then(setSectors).catch(() => setSectors([]));
    api.get('/marketplace/stats').then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div>
      <nav className="pub-nav">
        <Link to="/" className="pub-brand" style={{ color: '#fff' }}>
          <div className="brand-mark">M<span>T</span>P</div>
          <div><strong>MTP Platform</strong><small>Marketplace de profesionales verificados</small></div>
        </Link>
        <div className="row">
          {user ? (
            <>
              <Link className="btn btn-ghost btn-sm" style={{ color: '#eafff2', borderColor: 'rgba(255,255,255,.25)' }} to={roleHome()}>Mi panel</Link>
              <button className="btn btn-accent btn-sm" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm" style={{ color: '#eafff2', borderColor: 'rgba(255,255,255,.25)' }} to="/login">Ingresar</Link>
              <Link className="btn btn-accent btn-sm" to="/register">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <header className="pub-hero">
        <div className="pub-hero-inner">
          <h1>Encontrá <em>profesionales verificados</em> para validar tu economía.</h1>
          <p>Abogados, contadores, ingenieros y especialistas que validan documentación con
             scoring dinámico, trazabilidad estructural y certificados emitidos como NFT en ETTIOS Blockchain.</p>
          <div className="pub-metrics">
            <div className="pub-metric"><strong>{stats?.professionals ?? '—'}</strong><span>profesionales activos</span></div>
            <div className="pub-metric"><strong>{stats ? Math.round(stats.avg_reputation) : '—'}</strong><span>reputación promedio</span></div>
            <div className="pub-metric"><strong>{stats?.sectors ?? '—'}</strong><span>sectores cubiertos</span></div>
            <div className="pub-metric"><strong>{stats?.nfts_minted ?? '—'}</strong><span>NFTs emitidos en ETTIOS</span></div>
          </div>
        </div>
      </header>

      <main className="pub-wrap">
        <div className="pub-toolbar">
          <div className="filters">
            <button className={`filter-chip ${sector === '' ? 'active' : ''}`}
                    onClick={() => setParams({})}>Todos</button>
            {sectors.map(s => (
              <button key={s} className={`filter-chip ${sector === s ? 'active' : ''}`}
                      onClick={() => setParams({ sector: s })}>{s}</button>
            ))}
          </div>
          <Link className="btn btn-primary btn-sm" to="/register">+ Sumate como profesional</Link>
        </div>

        {pros === null ? (
          <div className="card empty-box"><h2>Cargando…</h2></div>
        ) : pros.length === 0 ? (
          <div className="card empty-box">
            <h2>No hay profesionales en este sector todavía</h2>
            <p className="muted">Probá con otro filtro o registrate para ser el primero.</p>
            <Link className="btn btn-accent mt" to="/register">Registrarse</Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {pros.map(p => {
              const mem = MEMBERSHIPS[p.membership] || MEMBERSHIPS.basica;
              const isPremium = p.membership === 'premium';
              const [scLbl, scCls] = scoreLabel(Number(p.reputation));
              return (
                <div key={p.id} className={`card pro-card ${isPremium ? 'pro-card-premium' : ''}`}>
                  {isPremium && <div className="pro-ribbon">★ Premium</div>}
                  <div className="pro-top">
                    <div className="pro-ava">{p.full_name[0]?.toUpperCase()}</div>
                    <div>
                      <div className="pro-name">{p.full_name}</div>
                      <div className="pro-meta">
                        {ENTITY_LABELS[p.entity_type] || p.entity_type}
                        {p.sector ? ` · ${p.sector}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="pro-tags">
                    <span className={`badge mem-${mem.cls}`}>{mem.icon} {mem.label}</span>
                    {p.specialty && <span className="badge badge-info">{p.specialty}</span>}
                    {p.kyc_status === 'verificado'
                      ? <span className="badge badge-good">✓ KYC verificado</span>
                      : <span className="badge badge-neutral">KYC pendiente</span>}
                    <span className="badge badge-neutral">{p.dictamenes} dictámenes</span>
                  </div>
                  <div className="pro-foot">
                    <div className={`score-pill score-${scCls}`} style={{ flexDirection: 'row', gap: 8, padding: '4px 12px' }}>
                      <span className="score-num">{Math.round(p.reputation)}</span>
                      <span className="dim">{scLbl}</span>
                    </div>
                    <Link className="btn btn-ghost btn-sm" to={user ? roleHome() : '/register'}>
                      {user ? 'Ver panel' : 'Contactar'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="pub-foot">
        MTP Platform · Infraestructura de Validación Económica Verificable<br/>
        v2.0 · 2026 — Aston Mining S.L. · Tokenización en ETTIOS Blockchain (Chain ID 2237)
      </footer>
    </div>
  );
}
