import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { statusBadge, fmtDate, shortHash } from '../../lib.js';

export default function DocumentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [walletInput, setWalletInput] = useState('');
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [minting, setMinting] = useState(false);

  async function load() {
    setErr(null);
    try { setData(await api.get(`/documents/${id}`)); }
    catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); /* eslint-disable-line */ }, [id]);

  async function mintNFT() {
    setErr(null); setMsg(null); setMinting(true);
    try {
      const body = walletInput.trim() ? { to: walletInput.trim() } : {};
      const r = await api.post(`/nft/mint/${id}`, body);
      setMsg(`✓ NFT #${r.nft.token_id} minteado en ETTIOS · tx ${shortHash(r.nft.tx_hash)}`);
      await load();
    } catch (e) { setErr(e.message); }
    finally { setMinting(false); }
  }

  if (err && !data) return <div className="card alert alert-error">{err}</div>;
  if (!data) return <div className="card">Cargando…</div>;
  const { document: d, validations } = data;
  const s = statusBadge(d.status);
  const riskCls = d.ai_risk === 'alto' ? 'badge-risk' : d.ai_risk === 'medio' ? 'badge-warn' : 'badge-good';
  const canMint = d.status === 'validado' && !d.nft_token_id && (d.user_id === user.id || user.role === 'admin');
  const hasWallet = !!d.owner_wallet || !!walletInput.trim();

  return (
    <div>
      <Link to="/u/documents" className="dim">← Volver</Link>

      {err && <div className="alert alert-error mt">{err}</div>}
      {msg && <div className="alert alert-success mt">{msg}</div>}

      {/* NFT ya minteado */}
      {d.nft_token_id && (
        <div className="nft-card mt">
          <div className="row between">
            <div>
              <span className="nft-pill">★ NFT en ETTIOS BLOCKCHAIN</span>
              <h2 style={{ marginTop: 10 }}>Token ID #{d.nft_token_id}</h2>
              <p className="dim">Este documento está tokenizado on-chain (Chain ID 2237).
                 La metadata pública es referenciable desde cualquier marketplace ERC-721.</p>
            </div>
          </div>
          <div className="mt"><strong>Transaction hash:</strong></div>
          <div className="tx-hash">{d.nft_tx_hash}</div>
          {d.metadata_uri && (
            <>
              <div className="mt"><strong>Metadata URI:</strong></div>
              <div className="tx-hash">{d.metadata_uri}</div>
            </>
          )}
          <div className="mt"><strong>Link público de verificación:</strong></div>
          <div className="tx-hash">{window.location.origin}/verify?token={d.nft_token_id}</div>
          <a className="btn btn-accent btn-sm mt" href={`/verify?token=${d.nft_token_id}`} target="_blank" rel="noreferrer">
            ★ Abrir verificador público →
          </a>
        </div>
      )}

      <div className="card mt">
        <div className="card-head">
          <div>
            <h2>{d.title}</h2>
            <p className="muted">{d.doc_type} · creado el {fmtDate(d.created_at)}</p>
          </div>
          <span className={`badge ${s.cls}`}>{s.label}</span>
        </div>

        {d.description && <p>{d.description}</p>}

        <div className="grid grid-2 mt">
          <div>
            <strong>Análisis IA (Capa 2)</strong>
            <div className="mt">
              {d.ai_risk
                ? <span className={`badge ${riskCls}`}>Riesgo {d.ai_risk}</span>
                : <span className="dim">Pendiente</span>}
            </div>
            {d.ai_summary && <p className="muted mt">{d.ai_summary}</p>}
          </div>
          <div>
            <strong>Trazabilidad (Capa 4)</strong>
            <p className="muted mt">
              Propietario: {d.owner_name}<br/>
              {d.file_hash && <>SHA-256 archivo: <span className="tx-hash">{shortHash(d.file_hash)}</span><br/></>}
              {d.assigned_to && <>Verificador asignado #{d.assigned_to}<br/></>}
            </p>
            {d.file_path && <a className="btn btn-ghost btn-sm mt" href={`/api/documents/${d.id}/file`} target="_blank" rel="noreferrer">↓ Descargar archivo</a>}
          </div>
        </div>
      </div>

      {/* Acción de mint */}
      {canMint && (
        <div className="card mt" style={{ borderColor: 'var(--yellow-400)', borderWidth: 2 }}>
          <div className="card-head">
            <h2>Mintear NFT en ETTIOS Blockchain</h2>
            <span className="nft-pill">Chain ID 2237</span>
          </div>
          <p className="muted">Este documento fue validado profesionalmente. Podés emitir ahora el NFT que
             certifica la validación. Los metadatos (tipo, riesgo IA, dictámenes, reputación)
             quedan asociados al token on-chain.</p>
          {!d.owner_wallet && (
            <div className="field mt">
              <label>Billetera EVM destino (no tenés una guardada en tu perfil)</label>
              <input value={walletInput} onChange={e => setWalletInput(e.target.value)}
                     placeholder="0x…" />
            </div>
          )}
          {d.owner_wallet && (
            <p className="muted">Se enviará a tu billetera: <span className="tx-hash">{d.owner_wallet}</span></p>
          )}
          <button className="btn btn-accent mt" disabled={minting || !hasWallet} onClick={mintNFT}>
            {minting ? 'Minteando en ETTIOS…' : '★ Mintear NFT en ETTIOS'}
          </button>
        </div>
      )}

      {/* Dictámenes */}
      <div className="card mt">
        <h2>Dictámenes profesionales (Capa 3)</h2>
        {validations.length === 0 ? <p className="muted">Sin dictámenes todavía.</p> : (
          <div className="table-wrap"><table className="data">
            <thead><tr><th>Verificador</th><th>Tipo</th><th>Resultado</th><th>Δ Score</th><th>Opinión</th><th>Fecha</th></tr></thead>
            <tbody>
              {validations.map(v => {
                const resCls = v.result === 'aprobado' ? 'badge-good' : v.result === 'observado' ? 'badge-warn' : 'badge-risk';
                return (
                  <tr key={v.id}>
                    <td><strong>{v.verifier_name}</strong>{v.specialty && <><br/><span className="dim">{v.specialty}</span></>}</td>
                    <td>{v.val_type}</td>
                    <td><span className={`badge ${resCls}`}>{v.result}</span></td>
                    <td>{Number(v.score_impact) > 0 ? '+' : ''}{Number(v.score_impact)}</td>
                    <td>{v.opinion}</td>
                    <td className="dim">{fmtDate(v.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
