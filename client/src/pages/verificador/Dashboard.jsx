import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';

export default function VDashboard() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [hist, setHist] = useState([]);
  useEffect(() => {
    api.get('/validations/queue').then(setQueue).catch(() => setQueue([]));
    api.get('/validations/mine').then(setHist).catch(() => setHist([]));
  }, []);
  const aprobados = hist.filter(h => h.result === 'aprobado').length;

  return (
    <div>
      <div className="grid grid-4">
        <div className="card stat"><div className="stat-val">{queue.length}</div><div className="stat-lbl">En cola</div></div>
        <div className="card stat"><div className="stat-val">{hist.length}</div><div className="stat-lbl">Dictámenes emitidos</div></div>
        <div className="card stat"><div className="stat-val">{aprobados}</div><div className="stat-lbl">Aprobados</div></div>
        <div className="card stat"><div className="stat-val">{Math.round(Number(user.reputation))}</div><div className="stat-lbl">Reputación</div></div>
      </div>
      <div className="card mt">
        <div className="card-head"><h2>Acciones</h2></div>
        <div className="row">
          <Link className="btn btn-primary" to="/verificador/queue">▤ Ver cola de validación</Link>
          <Link className="btn btn-ghost" to="/verificador/history">Historial de dictámenes</Link>
        </div>
      </div>
    </div>
  );
}
