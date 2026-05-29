import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { MEMBERSHIPS, scoreLabel, fmtDate } from '../../lib.js';

export default function Scoring() {
  const [ranking, setRanking] = useState([]);
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    api.get('/users/scoring/ranking').then(setRanking).catch(() => setRanking([]));
    api.get('/users/scoring/recent').then(setRecent).catch(() => setRecent([]));
  }, []);

  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Ranking de reputación</h2>
        <p className="muted mb">Top 50 cuentas activas — Capa 5: motor de scoring.</p>
        <div className="table-wrap"><table className="data">
          <thead><tr><th>#</th><th>Usuario</th><th>Rol</th><th>Membresía</th><th>Score</th></tr></thead>
          <tbody>
            {ranking.map((u, i) => {
              const [lbl, cls] = scoreLabel(Number(u.reputation));
              const mem = MEMBERSHIPS[u.membership] || MEMBERSHIPS.basica;
              return (
                <tr key={u.id}>
                  <td><strong>{i + 1}</strong></td>
                  <td>{u.full_name}<br/><span className="dim">{u.sector || ''}</span></td>
                  <td>{u.role}</td>
                  <td><span className={`badge mem-${mem.cls}`}>{mem.icon} {mem.label}</span></td>
                  <td><span className={`badge badge-${cls === 'good' ? 'good' : cls === 'mid' ? 'warn' : 'risk'}`}>
                    {Math.round(Number(u.reputation))} · {lbl}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>

      <div className="card">
        <h2>Movimientos recientes</h2>
        <p className="muted mb">Últimos 30 ajustes de reputación.</p>
        <div className="table-wrap"><table className="data">
          <thead><tr><th>Fecha</th><th>Usuario</th><th>Motivo</th><th>Δ</th></tr></thead>
          <tbody>
            {recent.map(r => {
              const d = Number(r.delta);
              return (
                <tr key={r.id}>
                  <td className="dim">{fmtDate(r.created_at)}</td>
                  <td>{r.full_name}</td>
                  <td>{r.reason}</td>
                  <td><span className={`badge ${d > 0 ? 'badge-good' : d < 0 ? 'badge-risk' : 'badge-neutral'}`}>
                    {d > 0 ? '+' : ''}{d.toFixed(1)}
                  </span></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
