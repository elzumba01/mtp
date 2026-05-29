import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const CERTS = [
  { code: 'CTE',  name: 'Certificado de Trazabilidad Económica',
    desc: 'Evalúa proyectos, empresas, inversiones, compliance, estructuras financieras y reputación económica.',
    icon: '◧', ico: 'ti-chart-line' },
  { code: 'CTPI', name: 'Certificado de Trazabilidad de Procesos Inteligentes',
    desc: 'Evalúa procesos judiciales, administrativos, sanitarios, productivos, industriales y gubernamentales.',
    icon: '◴', ico: 'ti-settings' },
  { code: 'CEN',  name: 'Certificado Escritural Notarial',
    desc: 'Escribano digital verificado rubrica y certifica documentos contractuales, poderes y escrituras con validez legal blockchain.',
    icon: '✍', ico: 'ti-writing-sign' },
  { code: 'CTK',  name: 'Certificado de Tokenización',
    desc: 'Certifica activos reales tokenizados en ETTIOS: inmuebles, ganado, vehículos eléctricos, clubes deportivos y municipios.',
    icon: '★', ico: 'ti-coin' },
];

const HOW_STEPS = [
  { n: '01', title: 'Cargá tu documento',     desc: 'Subís el documento que querés validar. La IA hace un análisis preliminar de riesgo en segundos.' },
  { n: '02', title: 'Verificador profesional', desc: 'Un profesional certificado (abogado, contador, ingeniero, escribano) emite el dictamen humano.' },
  { n: '03', title: 'Scoring dinámico',        desc: 'Tu reputación y la del documento se actualizan en el motor de scoring (0-100).' },
  { n: '04', title: 'NFT en ETTIOS',           desc: 'El certificado se mintea como NFT en ETTIOS Blockchain con metadatos verificables on-chain.' },
];

const USE_CASES = [
  { tag: 'Inmobiliario', title: 'Fideicomisos tokenizados',  desc: 'Fideicomisos inmobiliarios con cuotapartes en NFT y dictamen jurídico permanente.' },
  { tag: 'Agro',         title: 'Ganadería trazable',         desc: 'Feedlots Brangus con trazabilidad por res, certificado de tenencia tokenizado.' },
  { tag: 'Deporte',      title: 'Clubes y fan tokens',        desc: 'Clubes deportivos tokenizan derechos económicos sobre estrellas y eventos.' },
  { tag: 'Municipios',   title: 'Bonos municipales',          desc: 'Municipios emiten bonos verdes y de infraestructura con certificación on-chain.' },
];

const FAQS = [
  { q: '¿Qué es la fe pública blockchain?',
    a: 'Es la rúbrica notarial trasladada a blockchain. El escribano digital firma criptográficamente el documento; el resultado se ancla on-chain con validez legal equivalente a la escritura tradicional bajo el marco EMPE/BCP de Paraguay.' },
  { q: '¿Cómo se calcula el scoring?',
    a: 'La reputación (0-100) combina KYC, calidad y cantidad de validaciones recibidas, historial profesional y antigüedad. Cada dictamen aprobado suma 8 puntos; cada uno rechazado resta 10.' },
  { q: '¿Qué red blockchain usan?',
    a: 'ETTIOS Blockchain — una Layer 1 EVM-compatible con Chain ID 2237, regulada bajo el marco EMPE/BCP de Paraguay. Los smart contracts están auditados y el explorer público es scan.ettiosblockchain.io.' },
  { q: '¿Quién puede ser verificador?',
    a: 'Profesionales con título habilitante: abogados, contadores, ingenieros, escribanos, auditores. Pasan un KYC reforzado y se les asigna una membresía Profesional o Premium según validaciones realizadas.' },
  { q: '¿Los NFTs se pueden transferir?',
    a: 'Los certificados (CTE/CTPI/CEN) son NFTs Soulbound — no transferibles, atados a la identidad. Los CTK (Tokenización) sí son transferibles porque representan activos reales con liquidez secundaria.' },
];

export default function Landing() {
  const { user, roleHome, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    api.get('/marketplace/stats').then(setStats).catch(() => {});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp">
      {/* Sticky navbar */}
      <nav className={`lp-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <Link to="/" className="lp-brand">
          <div className="brand-mark">M<span>T</span>P</div>
          <div><strong>MTP Platform</strong><small>Infraestructura de validación verificable</small></div>
        </Link>
        <div className="lp-nav-links">
          <a href="#certs">Certificaciones</a>
          <a href="#blockchain">Blockchain</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#legal">Marco legal</a>
          <a href="#pricing">Precios</a>
          <Link to="/verify">Verificar</Link>
          <Link to="/marketplace">Marketplace</Link>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {user
            ? <>
                <Link className="btn btn-ghost btn-sm" to={roleHome()}>Mi panel</Link>
                <button className="btn btn-primary btn-sm" onClick={logout}>Salir</button>
              </>
            : <>
                <Link className="btn btn-ghost btn-sm" to="/login">Ingresar</Link>
                <Link className="btn btn-primary btn-sm" to="/register">Comenzar</Link>
              </>}
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-glow" />
        <div className="lp-hero-inner">
          <div>
            <span className="lp-tag">★ Powered by ETTIOS Blockchain · Chain ID 2237</span>
            <h1>Infraestructura global de <em>inteligencia trazable</em> con fe pública blockchain.</h1>
            <p>Certificación con IA, verificadores humanos, escribanos digitales y NFTs en ETTIOS. Una plataforma para que documentos, procesos y activos lleven validez verificable on-chain.</p>
            <div className="row" style={{ gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary">Crear cuenta</Link>
              <Link to="/verify" className="btn btn-accent">★ Verificar certificado</Link>
              <Link to="/marketplace" className="btn btn-ghost">Ver marketplace →</Link>
            </div>
            {stats && (
              <div className="lp-hero-stats">
                <div><strong>{stats.professionals}</strong><span>profesionales</span></div>
                <div><strong>{Math.round(stats.avg_reputation)}</strong><span>reputación media</span></div>
                <div><strong>{stats.sectors}</strong><span>sectores</span></div>
                <div><strong>{stats.nfts_minted}</strong><span>NFTs en ETTIOS</span></div>
              </div>
            )}
          </div>
          <div className="lp-hero-card">
            <div className="row between">
              <div>
                <div className="dim" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>Score on-chain</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--cyan-400)', lineHeight: 1 }}>88<span style={{ fontSize: 16, color: 'var(--ink-soft)' }}> / 100</span></div>
              </div>
              <span className="nft-pill">★ Token #142</span>
            </div>
            <div className="scorebar" style={{ marginTop: 14 }}><span style={{ width: '88%' }} /></div>
            <div className="lp-hero-row">
              <span>KYC</span><span style={{ color: 'var(--cyan-400)' }}>✓ Verificado</span>
            </div>
            <div className="lp-hero-row">
              <span>Validaciones</span><span>12 dictámenes</span>
            </div>
            <div className="lp-hero-row">
              <span>Última cert.</span><span style={{ color: 'var(--cyan-400)' }}>CTE · 2 días</span>
            </div>
            <div className="lp-hero-row" style={{ borderBottom: 0 }}>
              <span>Contrato NFT</span><code style={{ fontSize: 10, color: 'var(--cyan-300)' }}>0x9c4a…f2e1</code>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-eyebrow">CÓMO FUNCIONA</span>
          <h2>De documento sin verificar a NFT con fe pública en 4 pasos.</h2>
        </div>
        <div className="grid grid-4">
          {HOW_STEPS.map(s => (
            <div key={s.n} className="card lp-step">
              <div className="lp-step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p className="muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="lp-section" id="certs">
        <div className="lp-section-head">
          <span className="lp-eyebrow">CERTIFICACIONES</span>
          <h2>Cuatro estándares de certificación on-chain.</h2>
          <p className="muted" style={{ maxWidth: 640 }}>Cada certificado se emite como NFT en ETTIOS con metadatos públicos verificables desde scan.ettiosblockchain.io.</p>
        </div>
        <div className="grid grid-2">
          {CERTS.map(c => (
            <div key={c.code} className="card lp-cert">
              <div className="lp-cert-head">
                <div className="lp-cert-icon"><span>{c.icon}</span></div>
                <div>
                  <div className="lp-cert-code">{c.code}</div>
                  <div className="lp-cert-name">{c.name}</div>
                </div>
              </div>
              <p className="muted">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Escribanos */}
      <section className="lp-section">
        <div className="grid grid-2" style={{ alignItems: 'center', gap: 36 }}>
          <div>
            <span className="lp-eyebrow">ESCRIBANOS DIGITALES</span>
            <h2 className="mt">Fe pública trasladada a blockchain.</h2>
            <p className="muted mt">Escribanos certificados emiten <strong style={{ color: 'var(--cyan-400)' }}>CEN — Certificados Escriturales Notariales</strong> con firma criptográfica anclada en ETTIOS. Poderes, escrituras de compraventa, actas societarias y rúbricas con la misma validez legal que el papel — pero verificables públicamente por cualquiera con el hash.</p>
            <ul className="lp-list">
              <li>Firma criptográfica ECDSA + hash SHA-256 del documento</li>
              <li>Anclaje on-chain en ETTIOS (Chain ID 2237) con explorer público</li>
              <li>Honorarios liquidados en el token nativo ETTIA</li>
              <li>Cumplimiento EMPE/BCP Paraguay + integración INAES Argentina</li>
            </ul>
          </div>
          <div className="card lp-notary-card">
            <div className="row between">
              <div>
                <div className="dim" style={{ fontSize: 11, textTransform: 'uppercase' }}>Escritura digital</div>
                <h3 style={{ marginTop: 4 }}>Cesión de cuotapartes</h3>
              </div>
              <span className="badge badge-good">CEN-2026-0042</span>
            </div>
            <div className="lp-hero-row mt"><span>Escribano</span><span style={{ color: 'var(--ink)' }}>Dr. M. González (Reg. 247)</span></div>
            <div className="lp-hero-row"><span>Hash documento</span><code style={{ fontSize: 10, color: 'var(--cyan-300)' }}>3f8b9e2c…7a4d</code></div>
            <div className="lp-hero-row"><span>Tx ETTIOS</span><code style={{ fontSize: 10, color: 'var(--cyan-300)' }}>0xc12a…91ee</code></div>
            <div className="lp-hero-row" style={{ borderBottom: 0 }}><span>Estado</span><span style={{ color: 'var(--cyan-400)' }}>✓ Rubricado on-chain</span></div>
          </div>
        </div>
      </section>

      {/* Blockchain */}
      <section className="lp-section lp-section-dark" id="blockchain">
        <div className="lp-section-head">
          <span className="lp-eyebrow">ETTIOS BLOCKCHAIN</span>
          <h2>Layer 1 EVM con regulación EMPE/BCP de Paraguay.</h2>
        </div>
        <div className="grid grid-3">
          <div className="card lp-bc-card">
            <h3>⛓️ Layer 1 propia</h3>
            <p className="muted">Chain ID <strong style={{ color: 'var(--cyan-400)' }}>2237</strong>, EVM-compatible, regulada bajo marco EMPE/BCP. Compatible con cualquier wallet Web3.</p>
          </div>
          <div className="card lp-bc-card">
            <h3>🪙 Token ETTIA nativo</h3>
            <p className="muted">Honorarios de escribanos y verificadores se liquidan en ETTIA. Gas, staking y gobernanza usan el mismo token.</p>
          </div>
          <div className="card lp-bc-card">
            <h3>📜 7 smart contracts</h3>
            <p className="muted">Auditados: emisión, renovación, revocación, staking de verificadores, marketplace y bridge a fiat.</p>
          </div>
          <div className="card lp-bc-card">
            <h3>🔍 Explorer público</h3>
            <p className="muted">Verificá cualquier certificado en <code style={{ color: 'var(--cyan-400)' }}>scan.ettiosblockchain.io</code> con hash o QR.</p>
          </div>
          <div className="card lp-bc-card">
            <h3>🌐 RPC público</h3>
            <p className="muted"><code style={{ color: 'var(--cyan-400)' }}>rpc.ettiosblockchain.io</code> — cualquier DApp puede consultar certificados y emitir transacciones.</p>
          </div>
          <div className="card lp-bc-card">
            <h3>🏛️ Marco regulatorio</h3>
            <p className="muted">EMPE/BCP Paraguay + integración INAES Argentina. Soportado por escribanos colegiados.</p>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="lp-section" id="use-cases">
        <div className="lp-section-head">
          <span className="lp-eyebrow">CASOS DE USO</span>
          <h2>Lo que se está validando hoy en MTP.</h2>
        </div>
        <div className="grid grid-2">
          {USE_CASES.map(u => (
            <div key={u.title} className="card lp-usecase">
              <span className="badge badge-good">{u.tag}</span>
              <h3 style={{ marginTop: 12 }}>{u.title}</h3>
              <p className="muted">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap — 6 fases */}
      <section className="lp-section lp-section-dark" id="roadmap">
        <div className="lp-section-head">
          <span className="lp-eyebrow">ROADMAP · 6 FASES</span>
          <h2>De Desarrollo Fundacional a Infraestructura Económica Global.</h2>
          <p className="muted" style={{ maxWidth: 680, margin: '14px auto 0' }}>El plan de evolución del ecosistema MTP en seis fases. La Fase 1 está activa hoy; las siguientes despliegan progresivamente la escalabilidad multisectorial, la automatización IA y la interoperabilidad global.</p>
        </div>
        <div className="roadmap">
          {[
            { n: '01', title: 'Desarrollo Fundacional',          desc: 'Infraestructura base + 7 capas operativas + smart contracts ERC-721 en ETTIOS.',  tag: 'Activo',    state: 'active' },
            { n: '02', title: 'Escalabilidad Multisectorial',    desc: 'Onboarding masivo de profesionales (legal, contable, técnico, escribanos) + sectores agro/inmobiliario/deporte.', tag: 'Próximo',   state: 'next' },
            { n: '03', title: 'Automatización IA',                desc: 'Reemplazo del motor IA heurístico por LLM real (Claude/GPT). Pre-validación automática y triage inteligente.', tag: 'Futuro',    state: 'future' },
            { n: '04', title: 'Interoperabilidad Global',         desc: 'Bridges a Ethereum, Polygon, BSC. Adopción del estándar MiCA y reconocimiento legal cruzado PY/AR/UE.', tag: 'Futuro',    state: 'future' },
            { n: '05', title: 'Blockchain Readiness',             desc: 'Tokens ERC-1155 para fracción de activos, marketplace secundario, integración con custodios regulados.',     tag: 'Futuro',    state: 'future' },
            { n: '06', title: 'Infraestructura Económica Global', desc: 'MTP como capa estándar de validación verificable adoptada por gobiernos, municipios y bancos centrales.',   tag: 'Futuro',    state: 'future' },
          ].map(p => (
            <div key={p.n} className={`roadmap-phase roadmap-${p.state}`}>
              <div className="roadmap-num">{p.n}</div>
              <div className="roadmap-body">
                <div className="row between" style={{ alignItems: 'flex-start' }}>
                  <h3>{p.title}</h3>
                  <span className={`badge ${p.state === 'active' ? 'badge-good' : p.state === 'next' ? 'badge-warn' : 'badge-neutral'}`}>{p.tag}</span>
                </div>
                <p className="muted">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="lp-section" id="pricing">
        <div className="lp-section-head">
          <span className="lp-eyebrow">PRECIOS</span>
          <h2>Tres planes. Mintear NFT incluido en Premium.</h2>
        </div>
        <div className="plans" style={{ maxWidth: 900, margin: '0 auto' }}>
          <label className="plan">
            <input type="radio" name="lp-plan" />
            <div className="plan-inner">
              <div className="plan-top">
                <div className="plan-name">Básica</div>
                <div className="plan-ico">◌</div>
              </div>
              <div className="plan-price">Gratis</div>
              <ul className="plan-feats">
                <li>Acceso al marketplace</li>
                <li>Perfil público</li>
                <li>Hasta 3 documentos/mes</li>
                <li>Sin NFT incluido</li>
              </ul>
            </div>
          </label>
          <label className="plan">
            <input type="radio" name="lp-plan" />
            <div className="plan-inner">
              <div className="plan-top">
                <div className="plan-name">Profesional</div>
                <div className="plan-ico">◆</div>
              </div>
              <div className="plan-price">USD 29<small>/ mes</small></div>
              <ul className="plan-feats">
                <li>Documentos ilimitados</li>
                <li>Badge "Profesional"</li>
                <li>Prioridad en IA</li>
                <li>NFT a USD 5 c/u</li>
              </ul>
            </div>
          </label>
          <label className="plan is-premium">
            <input type="radio" name="lp-plan" defaultChecked />
            <div className="plan-inner">
              <span className="plan-badge">RECOMENDADO</span>
              <div className="plan-top">
                <div className="plan-name">Premium</div>
                <div className="plan-ico">★</div>
              </div>
              <div className="plan-price">USD 79<small>/ mes</small></div>
              <ul className="plan-feats">
                <li>Todo lo Profesional</li>
                <li>Top + destacado en buscador</li>
                <li>Mint de NFT ilimitado</li>
                <li>Acceso a escribanos digitales</li>
                <li>Soporte 24h</li>
              </ul>
            </div>
          </label>
        </div>
      </section>

      {/* Marco legal */}
      <section className="lp-section lp-section-dark" id="legal">
        <div className="lp-section-head">
          <span className="lp-eyebrow">MARCO LEGAL</span>
          <h2>Fe pública notarial y cumplimiento SEPRELAD.</h2>
          <p className="muted" style={{ maxWidth: 700, margin: '14px auto 0' }}>El escribano digital actúa como sujeto obligado bajo SEPRELAD Paraguay. Toda operación queda protocolizada y anclada on-chain con prueba de integridad por hash SHA-256.</p>
        </div>
        <div className="grid grid-3">
          <div className="card lp-bc-card">
            <h3>🛡️ Rol notarial</h3>
            <p className="muted">Tokenización legalmente válida, trazable y protegida ante disputas mediante <strong style={{ color: 'var(--cyan-400)' }}>fe pública y protocolización</strong>.</p>
          </div>
          <div className="card lp-bc-card">
            <h3>⚖️ Validez legal</h3>
            <p className="muted">Protocolización de actos, autenticación de smart contracts, certificación de identidad, validación de títulos e inscripción registral.</p>
          </div>
          <div className="card lp-bc-card">
            <h3>👁️ Transparencia</h3>
            <p className="muted">Consentimiento informado, capacidad legal, actas de asamblea, whitepaper y documentos de oferta certificados.</p>
          </div>
          <div className="card lp-bc-card">
            <h3>🔒 Prevención de fraude</h3>
            <p className="muted">Verificación biométrica y documental, detección de gravámenes y <strong style={{ color: 'var(--cyan-400)' }}>KYC/AML alineado con SEPRELAD</strong>.</p>
          </div>
          <div className="card lp-bc-card">
            <h3>📁 Gestión documental</h3>
            <p className="muted">Escrituras, reglamentos, contratos de emisión/suscripción y ciclo de vida del token (mint, burn, transfer).</p>
          </div>
          <div className="card lp-bc-card">
            <h3>⚖️ Resolución de conflictos</h3>
            <p className="muted">Mediación, certificación de transacciones on-chain como prueba y arbitraje entre token-holders.</p>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <Link to="/terms" className="btn btn-ghost">📄 Términos y Condiciones</Link>
          <Link to="/privacy" className="btn btn-ghost">🔐 Política de Privacidad</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section">
        <div className="lp-section-head">
          <span className="lp-eyebrow">PREGUNTAS FRECUENTES</span>
          <h2>Lo que más nos preguntan.</h2>
        </div>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {FAQS.map((f, i) => (
            <div key={i} className={`lp-faq ${openFaq === i ? 'is-open' : ''}`}
                 onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
              <div className="lp-faq-q">
                <span>{f.q}</span>
                <span className="lp-faq-toggle">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <p className="lp-faq-a muted">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <h2>¿Listo para validar tu economía en blockchain?</h2>
        <p className="muted mt">Creá tu cuenta gratis y empezá a cargar documentos. El primer dictamen profesional corre por nuestra cuenta.</p>
        <div className="row" style={{ justifyContent: 'center', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary">Crear cuenta gratis</Link>
          <Link to="/marketplace" className="btn btn-ghost">Ver marketplace</Link>
        </div>
      </section>

      <footer className="lp-foot">
        <div className="row between" style={{ flexWrap: 'wrap', gap: 20 }}>
          <div>
            <strong style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>MTP Platform</strong>
            <p className="dim mt">Infraestructura de Validación Económica Verificable</p>
            <p className="dim">© 2026 · Aston Mining S.L. · Todos los derechos reservados.</p>
          </div>
          <div className="dim" style={{ textAlign: 'right' }}>
            <div>ETTIOS Blockchain · Chain ID 2237</div>
            <code style={{ fontSize: 11, color: 'var(--cyan-400)' }}>rpc.ettiosblockchain.io</code><br/>
            <code style={{ fontSize: 11, color: 'var(--cyan-400)' }}>scan.ettiosblockchain.io</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
