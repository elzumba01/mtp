import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { fmtDate, shortHash } from '../lib.js';

/**
 * QR code rendered as data-URL via Google Charts public service.
 * (En producción se reemplaza por una librería local — para la demo,
 * el endpoint público alcanza y no agrega dependencias al bundle.)
 */
function QrCode({ value, size = 180 }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=00d4ff&bgcolor=0f1729&margin=10`;
  return (
    <div className="verify-qr">
      <img src={url} alt="QR de verificación" width={size} height={size} />
      <p className="dim">Escaneá para verificar</p>
    </div>
  );
}

export default function Verify() {
  const [params] = useSearchParams();
  const initialQuery = params.get('h') || params.get('token') || params.get('id') || '';
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function lookup(ident) {
    setErr(null); setData(null); setLoading(true);
    try {
      const r = await api.get(`/verify/${encodeURIComponent(ident)}`);
      if (!r.found) setErr(r.error || 'No se encontró un certificado con ese identificador.');
      else setData(r);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (initialQuery) lookup(initialQuery);
    // eslint-disable-next-line
  }, []);

  function submit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    lookup(query.trim());
  }

  return (
    <div className="verify-page">
      <nav className="lp-nav is-scrolled">
        <Link to="/" className="lp-brand">
          <div className="brand-mark">M<span>T</span>P</div>
          <div><strong>MTP Platform</strong><small>Verificación pública de certificados</small></div>
        </Link>
        <Link to="/" className="btn btn-ghost btn-sm">← Volver al inicio</Link>
      </nav>

      <div className="verify-wrap">
        <header className="verify-head">
          <span className="lp-eyebrow">VERIFICACIÓN ON-CHAIN</span>
          <h1>Verificá cualquier certificado MTP.</h1>
          <p className="muted">Ingresá el hash SHA-256 del archivo, el token ID del NFT o el ID interno del certificado.
             Los datos se consultan directamente de la blockchain ETTIOS (Chain ID 2237).</p>
        </header>

        <form onSubmit={submit} className="verify-form">
          <input value={query} onChange={e => setQuery(e.target.value)}
                 placeholder="Hash SHA-256, token ID o ID del certificado…"
                 spellCheck="false" autoFocus />
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Verificando…' : 'Verificar →'}
          </button>
        </form>

        <div className="verify-hint">
          Ejemplos:
          {' '}<button type="button" className="verify-chip" onClick={() => { setQuery('1'); lookup('1'); }}>id=1</button>
          {' '}<button type="button" className="verify-chip" onClick={() => { setQuery('142'); lookup('142'); }}>token=142</button>
        </div>

        {err && <div className="alert alert-error">{err}</div>}

        {data && data.ok && (
          <CertificateView data={data} />
        )}
      </div>
    </div>
  );
}

function CertificateView({ data }) {
  const { certificate: c, owner, validations, score_breakdown: sb, nft, verification_status } = data;
  const verifUrl = `${window.location.origin}/verify?h=${c.file_hash || c.id}`;
  const statusBadge = verification_status === 'on_chain' ? 'on_chain'
                    : verification_status === 'validado' ? 'validado'
                    : 'unverified';

  return (
    <div>
      {/* Status banner */}
      <div className={`verify-banner verify-banner-${statusBadge}`}>
        {statusBadge === 'on_chain' && (
          <>
            <i className="verify-icon">✓</i>
            <div>
              <strong>Certificado verificado on-chain</strong>
              <p>Este certificado existe en ETTIOS Blockchain como NFT con metadatos públicos.</p>
            </div>
          </>
        )}
        {statusBadge === 'validado' && (
          <>
            <i className="verify-icon">✓</i>
            <div>
              <strong>Certificado validado profesionalmente</strong>
              <p>El dictamen profesional fue emitido pero el NFT todavía no se mintió.</p>
            </div>
          </>
        )}
        {statusBadge === 'unverified' && (
          <>
            <i className="verify-icon" style={{ background: 'var(--warn)' }}>!</i>
            <div>
              <strong>Documento sin validación profesional</strong>
              <p>Este documento existe en la plataforma pero todavía no fue validado.</p>
            </div>
          </>
        )}
      </div>

      {/* Certificate card */}
      <div className="verify-cert">
        <div className="verify-cert-head">
          <div>
            <span className="lp-eyebrow">CERTIFICADO MTP</span>
            <h2>{c.title}</h2>
            <p className="muted">{c.doc_type.toUpperCase()} · emitido el {fmtDate(c.created_at)}</p>
          </div>
          <div className="verify-seal">◈</div>
        </div>

        <div className="verify-cert-body">
          <div>
            <dl className="verify-dl">
              <dt>Titular</dt>
              <dd>{owner.name}{owner.company_name ? ` · ${owner.company_name}` : ''}</dd>
              <dt>Sector</dt>
              <dd>{owner.sector || '—'}</dd>
              <dt>Reputación</dt>
              <dd><strong style={{ color: 'var(--cyan-400)' }}>{Math.round(owner.reputation)}/100</strong></dd>
              <dt>Membresía</dt>
              <dd>{owner.membership}</dd>
              <dt>KYC</dt>
              <dd>{owner.kyc_status === 'verificado'
                ? <span className="badge badge-good">✓ Verificado</span>
                : <span className="badge badge-warn">{owner.kyc_status}</span>}</dd>
              {nft && <>
                <dt>Token ID</dt>
                <dd><span className="nft-pill">★ #{nft.token_id}</span></dd>
                <dt>Chain</dt>
                <dd>ETTIOS · Chain ID {nft.chain_id}</dd>
              </>}
            </dl>
          </div>

          <div className="verify-qr-wrap">
            <QrCode value={verifUrl} />
          </div>
        </div>

        {/* Score breakdown */}
        <div className="verify-score">
          <h3>Desglose del score</h3>
          <div className="grid grid-2">
            {[
              ['Económico',  sb.economico],
              ['Tributario', sb.tributario],
              ['Financiero', sb.financiero],
              ['Laboral',    sb.laboral],
            ].map(([name, v]) => (
              <div key={name} className="verify-score-row">
                <div className="row between">
                  <span>{name}</span>
                  <strong style={{ color: 'var(--cyan-400)' }}>{v}/100</strong>
                </div>
                <div className="scorebar"><span style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Hash & blockchain proofs */}
        <div className="verify-proofs">
          {c.file_hash && (
            <div>
              <span className="lp-eyebrow">HASH SHA-256 DEL ARCHIVO</span>
              <div className="tx-hash">{c.file_hash}</div>
            </div>
          )}
          {nft && (
            <>
              <div>
                <span className="lp-eyebrow">TRANSACTION HASH (ETTIOS)</span>
                <div className="tx-hash">{nft.tx_hash}</div>
              </div>
              <div>
                <span className="lp-eyebrow">CONTRATO MTPVALIDATIONNFT</span>
                <div className="tx-hash">{nft.contract_address}</div>
              </div>
              <div>
                <span className="lp-eyebrow">BLOCK NUMBER</span>
                <div className="tx-hash">{nft.block_number}</div>
              </div>
              <a className="btn btn-ghost btn-sm" href={nft.explorer_url}
                 target="_blank" rel="noreferrer">Ver en scan.ettiosblockchain.io →</a>
            </>
          )}
        </div>
      </div>

      {/* Validations */}
      {validations.length > 0 && (
        <div className="card mt">
          <h2>Dictámenes profesionales (Capa 3)</h2>
          <div className="table-wrap"><table className="data">
            <thead><tr><th>Verificador</th><th>Tipo</th><th>Resultado</th><th>Opinión</th><th>Fecha</th></tr></thead>
            <tbody>
              {validations.map((v, i) => {
                const c = v.result === 'aprobado' ? 'badge-good'
                        : v.result === 'observado' ? 'badge-warn' : 'badge-risk';
                return (
                  <tr key={i}>
                    <td><strong>{v.verifier_name}</strong>{v.specialty && <><br/><span className="dim">{v.specialty}</span></>}<br/><span className="dim">Reputación {Math.round(Number(v.verifier_reputation))}</span></td>
                    <td>{v.val_type}</td>
                    <td><span className={`badge ${c}`}>{v.result}</span></td>
                    <td>{v.opinion}</td>
                    <td className="dim">{fmtDate(v.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
