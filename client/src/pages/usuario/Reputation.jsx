import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { scoreLabel, fmtDate } from '../../lib.js';

export default function Reputation() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  useEffect(() => { api.get('/activity/my-scoring').then(setHistory).catch(() => setHistory([])); }, []);
  const sc = Number(user.reputation || 0);
  const [lbl, cls] = scoreLabel(sc);

  return (
    <div>
      <div className="card">
        <div className="card-head">
          <h2>Mi reputación</h2>
          <span className={`badge badge-${cls === 'good' ? 'good' : cls === 'mid' ? 'warn' : 'risk'}`}>{lbl}</span>
        </div>
        <div className="row between" style={{ alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>
              {Math.round(sc)}<span className="dim" style={{ fontSize: '1rem', fontWeight: 400 }}> / 100</span>
            </div>
            <p className="muted mt">El scoring se calcula a partir de tu KYC, validaciones recibidas y
               actividad en la plataforma (Capa 5).</p>
          </div>
        </div>
        <div className="scorebar mt"><span style={{ width: `${sc}%` }} /></div>
      </div>

      <div className="card mt">
        <h2>Movimientos recientes</h2>
        {history.length === 0 ? <p className="muted">Sin movimientos todavía.</p> : (
          <div className="table-wrap"><table className="data">
            <thead><tr><th>Fecha</th><th>Motivo</th><th>Antes</th><th>Δ</th><th>Después</th></tr></thead>
            <tbody>
              {history.map(h => {
                const d = Number(h.delta);
                return (
                  <tr key={h.id}>
                    <td className="dim">{fmtDate(h.created_at)}</td>
                    <td>{h.reason}</td>
                    <td>{Number(h.previous_score).toFixed(1)}</td>
                    <td><span className={`badge ${d > 0 ? 'badge-good' : d < 0 ? 'badge-risk' : 'badge-neutral'}`}>
                      {d > 0 ? '+' : ''}{d.toFixed(1)}
                    </span></td>
                    <td><strong>{Number(h.new_score).toFixed(1)}</strong></td>
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
