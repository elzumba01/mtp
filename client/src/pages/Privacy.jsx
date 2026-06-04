import { Link } from 'react-router-dom';

const SECTIONS = [
  ['1. Responsable del tratamiento', 'Aston Mining S.L., con domicilio en Madrid, España.'],
  ['2. Datos que recopilamos', 'Identificación KYC, datos de contacto, documentos cargados, metadatos de uso, IPs y user-agents.'],
  ['3. Finalidad', 'Cumplimiento KYC/AML, gestión de la plataforma, emisión de certificaciones, comunicación.'],
  ['4. Conservación SEPRELAD', '10 años desde el último contacto (obligación legal AML / SEPRELAD).'],
  ['5. Compartición de datos', 'Solo con verificadores asignados, autoridades competentes y proveedores estrictamente necesarios.'],
  ['6. Cookies', 'Solo cookies técnicas estrictamente necesarias. Sin tracking publicitario.'],
  ['7. Derechos del usuario', 'Acceso, rectificación, supresión, oposición, limitación, portabilidad. Ejercer en contacto@mtp.platform.'],
  ['8. Seguridad', 'Cifrado en reposo (AES-256) y en tránsito (TLS 1.3). Backups encriptados. Hash SHA-256 de cada documento.'],
  ['9. Blockchain', 'Los hashes SHA-256 de los documentos se anclan en ETTIOS Blockchain. La info on-chain es pública y permanente.'],
  ['10. Transferencias internacionales', 'Servidores en UE y Paraguay. Contratos de transferencia internacional adecuados.'],
  ['11. Autoridad de control', 'AEPD (España) · SEPRELAD (Paraguay).'],
];

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to="/" className="lp-brand" style={{ marginBottom: 30 }}>
          <div className="brand-mark">M<span>T</span>P</div>
          <div><strong>MTP Platform</strong></div>
        </Link>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 30 }}>
          <aside style={{ position: 'sticky', top: 20, alignSelf: 'start' }}>
            <div className="card" style={{ padding: 18 }}>
              <strong style={{ color: 'var(--cyan-600)', fontSize: '.78rem', letterSpacing: '.06em', textTransform: 'uppercase' }}>Secciones</strong>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 12, fontSize: '.86rem', color: 'var(--ink-soft)', lineHeight: 2 }}>
                {SECTIONS.map(([title], i) => <li key={i}><a href={`#s${i}`}>{title}</a></li>)}
              </ul>
            </div>
          </aside>
          <main>
            <h1 style={{ fontSize: '2.5rem', marginBottom: 10 }}>Política de Privacidad</h1>
            <p className="muted">Conforme a RGPD (UE) y normativa SEPRELAD (Paraguay).</p>
            <div className="alert alert-info mt">
              <strong>Importante:</strong> conservamos datos KYC durante 10 años conforme a obligaciones AML / SEPRELAD.
            </div>
            <div className="card mt">
              {SECTIONS.map(([title, body], i) => (
                <div key={i} id={`s${i}`} style={{ marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
                  <h3 style={{ color: 'var(--cyan-600)', fontSize: '1rem', marginBottom: 8 }}>{title}</h3>
                  <p className="muted">{body}</p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
