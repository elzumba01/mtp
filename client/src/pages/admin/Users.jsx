import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { MEMBERSHIPS, ENTITY_LABELS, fmtDate } from '../../lib.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);

  async function load() {
    setUsers(await api.get(`/users${filter ? `?role=${filter}` : ''}`).catch(() => []));
  }
  useEffect(() => { load(); /* eslint-disable-line */ }, [filter]);

  async function action(id, fn, label) {
    setErr(null); setMsg(null);
    try { await fn(); setMsg(`✓ ${label}`); await load(); }
    catch (e) { setErr(e.message); }
  }

  return (
    <div>
      {err && <div className="alert alert-error">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card">
        <div className="card-head">
          <h2>Usuarios del ecosistema</h2>
          <div className="filters">
            {['', 'usuario', 'verificador', 'admin'].map(r => (
              <button key={r || 'all'} className={`filter-chip ${filter === r ? 'active' : ''}`}
                      onClick={() => setFilter(r)}>{r || 'Todos'}</button>
            ))}
          </div>
        </div>
        <div className="table-wrap"><table className="data">
          <thead><tr><th>Usuario</th><th>Rol</th><th>Entidad</th><th>Reputación</th><th>KYC</th><th>Membresía</th><th>Estado</th><th>Alta</th><th>Acciones</th></tr></thead>
          <tbody>
            {users.map(u => {
              const mem = MEMBERSHIPS[u.membership] || MEMBERSHIPS.basica;
              return (
                <tr key={u.id}>
                  <td><strong>{u.full_name}</strong><br/><span className="dim">{u.email}</span></td>
                  <td>
                    <select value={u.role} onChange={e => action(u.id,
                        () => api.patch(`/users/${u.id}/role`, { role: e.target.value }),
                        `Rol actualizado a ${e.target.value}`)}>
                      <option value="usuario">usuario</option>
                      <option value="verificador">verificador</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{ENTITY_LABELS[u.entity_type]}<br/><span className="dim">{u.sector || '—'}</span></td>
                  <td><strong>{Math.round(Number(u.reputation))}</strong></td>
                  <td>
                    <select value={u.kyc_status} onChange={e => action(u.id,
                        () => api.patch(`/users/${u.id}/kyc`, { status: e.target.value }),
                        'KYC actualizado')}>
                      <option value="pendiente">pendiente</option>
                      <option value="verificado">verificado</option>
                      <option value="rechazado">rechazado</option>
                    </select>
                  </td>
                  <td>
                    <select value={u.membership} onChange={e => action(u.id,
                        () => api.patch(`/users/${u.id}/membership`, { membership: e.target.value }),
                        'Membresía actualizada')}>
                      <option value="basica">Básica</option>
                      <option value="profesional">Profesional</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td><span className={`badge ${u.status === 'activo' ? 'badge-good' : 'badge-risk'}`}>{u.status}</span></td>
                  <td className="dim">{fmtDate(u.created_at)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => action(u.id,
                        () => api.patch(`/users/${u.id}/status`),
                        'Estado cambiado')}>
                      {u.status === 'activo' ? 'Suspender' : 'Activar'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
