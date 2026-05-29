import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="legal-page">
      <nav className="lp-nav is-scrolled">
        <Link to="/" className="lp-brand">
          <div className="brand-mark">M<span>T</span>P</div>
          <div><strong>MTP Platform</strong><small>Política de Privacidad</small></div>
        </Link>
        <Link to="/" className="btn btn-ghost btn-sm">← Volver al inicio</Link>
      </nav>

      <div className="legal-wrap">
        <aside className="legal-toc">
          <strong>Índice</strong>
          <a href="#p1">1. Responsable del tratamiento</a>
          <a href="#p2">2. Datos recogidos</a>
          <a href="#p3">3. Finalidad del tratamiento</a>
          <a href="#p4">4. Base legal</a>
          <a href="#p5">5. Conservación</a>
          <a href="#p6">6. Compartición con terceros</a>
          <a href="#p7">7. Datos on-chain</a>
          <a href="#p8">8. Derechos del titular</a>
          <a href="#p9">9. Cookies y trackers</a>
          <a href="#p10">10. Seguridad</a>
          <a href="#p11">11. Contacto DPO</a>
        </aside>

        <article className="legal-body">
          <header>
            <span className="lp-eyebrow">DOCUMENTO LEGAL</span>
            <h1>Política de Privacidad</h1>
            <p className="muted">Versión 2026.05 · Última actualización: 29 de mayo de 2026</p>
          </header>

          <section id="p1">
            <h2>1. Responsable del tratamiento</h2>
            <p>El responsable del tratamiento de los datos personales recolectados por la Plataforma es <strong>Aston Mining S.L.</strong> con domicilio en Barcelona, España, y operación principal de la Plataforma en Asunción, Paraguay.</p>
            <p>Datos de contacto del Delegado de Protección de Datos (DPO): <code>dpo@mtp.platform</code>.</p>
          </section>

          <section id="p2">
            <h2>2. Datos recogidos</h2>
            <p>La Plataforma recolecta las siguientes categorías de datos personales:</p>
            <ul>
              <li><strong>Datos de identificación</strong>: nombre completo, razón social, email, DNI/Pasaporte/Cédula, país.</li>
              <li><strong>Datos profesionales</strong>: especialidad, sector, matrícula, certificaciones.</li>
              <li><strong>Datos financieros</strong>: medio de pago, billetera EVM, historial de transacciones on-chain.</li>
              <li><strong>Datos KYC/biométricos</strong>: foto de documento, selfie de liveness, screening AML.</li>
              <li><strong>Datos técnicos</strong>: IP, user-agent, idioma, dispositivo, timestamps.</li>
              <li><strong>Documentos cargados</strong>: archivos PDF/imágenes con sus metadatos y hash SHA-256.</li>
            </ul>
          </section>

          <section id="p3">
            <h2>3. Finalidad del tratamiento</h2>
            <ul>
              <li>Gestión del registro, autenticación y permisos por rol.</li>
              <li>Validación KYC/AML conforme a SEPRELAD (Paraguay) y UIF (Argentina).</li>
              <li>Emisión de certificaciones (CTE/CTPI/CEN/CTK) y minteo de NFT en ETTIOS.</li>
              <li>Cálculo del scoring de reputación (Capa 5).</li>
              <li>Trazabilidad estructural (Capa 4) — log de actividad con IP y timestamps.</li>
              <li>Cumplimiento de obligaciones legales (auditorías, requerimientos judiciales).</li>
              <li>Prevención de fraude, lavado de activos y suplantación de identidad.</li>
            </ul>
          </section>

          <section id="p4">
            <h2>4. Base legal</h2>
            <p>El tratamiento se ampara en: (a) <strong>consentimiento expreso</strong> del Usuario al registrarse, (b) <strong>ejecución del contrato</strong> de servicios entre el Usuario y la Plataforma, (c) <strong>cumplimiento de obligación legal</strong> (SEPRELAD, BCP, INAES), (d) <strong>interés legítimo</strong> de la Plataforma en prevenir fraude.</p>
          </section>

          <section id="p5">
            <h2>5. Conservación</h2>
            <ul>
              <li><strong>Datos de cuenta activa</strong>: mientras dure la relación contractual.</li>
              <li><strong>Datos KYC/AML</strong>: 5 años desde la baja, por exigencia SEPRELAD.</li>
              <li><strong>Log de actividad y consentimientos</strong>: 10 años desde el evento (auditoría legal).</li>
              <li><strong>Documentos certificados y sus NFT</strong>: indefinidamente on-chain — la naturaleza inmutable de ETTIOS impide su borrado.</li>
            </ul>
          </section>

          <section id="p6">
            <h2>6. Compartición con terceros</h2>
            <p>La Plataforma puede compartir datos con:</p>
            <ul>
              <li><strong>Proveedor KYC</strong> (SumSub u Onfido) para verificación de identidad.</li>
              <li><strong>Verificadores y escribanos</strong> asignados a sus documentos — únicamente los datos necesarios para emitir el dictamen.</li>
              <li><strong>SEPRELAD, UIF y autoridades competentes</strong> ante requerimiento legal.</li>
              <li><strong>Proveedores de infraestructura</strong> (hosting, RPC nodes de ETTIOS, almacenamiento) bajo acuerdos de confidencialidad.</li>
              <li><strong>Auditores externos</strong> de los smart contracts y procesos.</li>
            </ul>
            <p>La Plataforma <strong>nunca vende datos personales a terceros con fines publicitarios</strong>.</p>
          </section>

          <section id="p7">
            <h2>7. Datos publicados on-chain</h2>
            <p>Al mintear un NFT en ETTIOS, los siguientes datos quedan públicamente accesibles en <code>scan.ettiosblockchain.io</code>:</p>
            <ul>
              <li>Token ID, dirección del contrato, hash de transacción.</li>
              <li>Dirección de la billetera receptora.</li>
              <li>URI de la metadata pública (nombre, tipo de documento, análisis IA, cantidad de validaciones, reputación del propietario).</li>
              <li>SHA-256 del archivo original (sin el archivo en sí — los archivos NO se publican on-chain).</li>
            </ul>
            <p>El Usuario reconoce que esta información es pública e inmutable, y que el minteo es voluntario.</p>
          </section>

          <section id="p8">
            <h2>8. Derechos del titular (ARCO + portabilidad)</h2>
            <p>El Usuario puede ejercer sus derechos de:</p>
            <ul>
              <li><strong>Acceso</strong>: consultar qué datos tiene la Plataforma.</li>
              <li><strong>Rectificación</strong>: corregir datos inexactos.</li>
              <li><strong>Cancelación</strong>: solicitar el borrado de datos personales (excepto los exigidos por SEPRELAD).</li>
              <li><strong>Oposición</strong>: oponerse al tratamiento para fines no esenciales.</li>
              <li><strong>Portabilidad</strong>: recibir sus datos en formato JSON estructurado.</li>
              <li><strong>Revocación del consentimiento</strong>: el Usuario puede revocar consentimientos en cualquier momento desde <code>/u/legal</code>.</li>
            </ul>
            <p>Para ejercer cualquiera de estos derechos, escribir a <code>dpo@mtp.platform</code>. Plazo máximo de respuesta: 30 días corridos.</p>
          </section>

          <section id="p9">
            <h2>9. Cookies y trackers</h2>
            <p>La Plataforma usa cookies estrictamente necesarias para mantener la sesión (JWT en localStorage) y cookies analíticas anonimizadas para mejorar el servicio. <strong>No se utilizan cookies publicitarias de terceros</strong>.</p>
          </section>

          <section id="p10">
            <h2>10. Seguridad</h2>
            <p>Medidas técnicas y organizativas implementadas:</p>
            <ul>
              <li>Contraseñas almacenadas con <strong>bcrypt</strong> (factor 10).</li>
              <li>Comunicación cifrada extremo a extremo (TLS 1.3).</li>
              <li>Tokens JWT con expiración de 7 días.</li>
              <li>Smart contracts auditados antes del deploy en ETTIOS.</li>
              <li>Logs de actividad con IP y timestamp para detección de accesos anómalos.</li>
              <li>Separación de roles (admin / verificador / usuario / escribano).</li>
            </ul>
          </section>

          <section id="p11">
            <h2>11. Contacto</h2>
            <p>Para consultas sobre privacidad: <code>dpo@mtp.platform</code>.<br/>
            Autoridad de control en Paraguay: Defensoría del Pueblo / SEPRELAD.<br/>
            Autoridad de control en España: Agencia Española de Protección de Datos (AEPD).</p>
          </section>

          <footer className="legal-foot">
            <p className="muted">© 2026 Aston Mining S.L. — Documento legal versión 2026.05</p>
            <p><Link to="/terms">Términos y Condiciones →</Link></p>
          </footer>
        </article>
      </div>
    </div>
  );
}
