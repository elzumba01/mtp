import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';

// Public pages
import Landing from './pages/Landing.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import Verify from './pages/Verify.jsx';

// Usuario
import UDashboard from './pages/usuario/Dashboard.jsx';
import UDocuments from './pages/usuario/Documents.jsx';
import UUpload    from './pages/usuario/Upload.jsx';
import UReputation from './pages/usuario/Reputation.jsx';
import UDocDetail from './pages/usuario/DocumentDetail.jsx';
import UKYC       from './pages/usuario/KYC.jsx';

// Verificador
import VDashboard from './pages/verificador/Dashboard.jsx';
import VQueue     from './pages/verificador/Queue.jsx';
import VHistory   from './pages/verificador/History.jsx';

// Admin
import ADashboard from './pages/admin/Dashboard.jsx';
import AUsers     from './pages/admin/Users.jsx';
import ADocs      from './pages/admin/Documents.jsx';
import AScoring   from './pages/admin/Scoring.jsx';
import ATrace     from './pages/admin/Traceability.jsx';
import ANfts      from './pages/admin/Nfts.jsx';

import Layout from './components/Layout.jsx';

function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && (Array.isArray(role) ? !role.includes(user.role) : user.role !== role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/verify" element={<Verify />} />

      {/* Usuario */}
      <Route path="/u" element={<RequireRole role={['usuario','admin']}><Layout /></RequireRole>}>
        <Route index element={<UDashboard />} />
        <Route path="documents" element={<UDocuments />} />
        <Route path="documents/:id" element={<UDocDetail />} />
        <Route path="upload" element={<UUpload />} />
        <Route path="reputation" element={<UReputation />} />
        <Route path="kyc" element={<UKYC />} />
      </Route>

      {/* Verificador */}
      <Route path="/verificador" element={<RequireRole role={['verificador','admin']}><Layout /></RequireRole>}>
        <Route index element={<VDashboard />} />
        <Route path="queue" element={<VQueue />} />
        <Route path="history" element={<VHistory />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<RequireRole role="admin"><Layout /></RequireRole>}>
        <Route index element={<ADashboard />} />
        <Route path="users" element={<AUsers />} />
        <Route path="documents" element={<ADocs />} />
        <Route path="scoring" element={<AScoring />} />
        <Route path="traceability" element={<ATrace />} />
        <Route path="nfts" element={<ANfts />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
