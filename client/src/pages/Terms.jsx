import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="legal-page">
      <nav className="lp-nav is-scrolled">
        <Link to="/" className="lp-brand">
          <div className="brand-mark">M<span>T</span>P</div>
          <div><strong>MTP Platform</strong><small>Términos y Condiciones</small></div>
        </Link>
        <Link to="/" className="btn btn-ghost btn-sm">← Volver al inicio</Link>
      </nav>

      <div className="legal-wrap">
        <aside className="legal-toc">
          <strong>Índice</strong>
          <a href="#art1">1. Objeto y aceptación</a>
          <a href="#art2">2. Definiciones</a>
          <a href="#art3">3. Servicios ofrecidos</a>
          <a href="#art4">4. Registro y cuentas</a>
          <a href="#art5">5. KYC / AML — SEPRELAD</a>
          <a href="#art6">6. Certificaciones CTE/CTPI/CEN/CTK</a>
          <a href="#art7">7. Tokenización en ETTIOS</a>
          <a href="#art8">8. Membresías y precios</a>
          <a href="#art9">9. Obligaciones del usuario</a>
          <a href="#art10">10. Responsabilidad</a>
          <a href="#art11">11. Propiedad intelectual</a>
          <a href="#art12">12. Marco regulatorio</a>
          <a href="#art13">13. Modificaciones</a>
          <a href="#art14">14. Jurisdicción y contacto</a>
        </aside>

        <article className="legal-body">
          <header>
            <span className="lp-eyebrow">DOCUMENTO LEGAL</span>
            <h1>Términos y Condiciones de uso</h1>
            <p className="muted">Versión 2026.05 · Última actualización: 29 de mayo de 2026</p>
          </header>

          <section id="art1">
            <h2>1. Objeto y aceptación</h2>
            <p>El presente documento regula el acceso y uso de la plataforma <strong>MTP Platform</strong> (en adelante, "la Plataforma"), operada por <strong>Aston Mining S.L.</strong>, en su rol de Infraestructura de Validación Económica Verificable basada en <strong>ETTIOS Blockchain</strong> (Chain ID 2237).</p>
            <p>Al registrarse, el Usuario declara haber leído, comprendido y aceptado en su totalidad estos Términos, la Política de Privacidad y el Consentimiento KYC/AML, los cuales conforman un acuerdo vinculante.</p>
          </section>

          <section id="art2">
            <h2>2. Definiciones</h2>
            <ul>
              <li><strong>Plataforma</strong>: el conjunto de servicios web, API, smart contracts y herramientas de validación que componen MTP.</li>
              <li><strong>Usuario</strong>: persona física o jurídica registrada bajo cualquier rol (usuario, verificador, escribano, admin).</li>
              <li><strong>Verificador</strong>: profesional habilitado (abogado, contador, ingeniero, escribano) que emite dictámenes con impacto en el scoring.</li>
              <li><strong>Certificación</strong>: documento validado emitido como NFT en ETTIOS (CTE, CTPI, CEN o CTK).</li>
              <li><strong>NFT</strong>: token no fungible ERC-721 que representa una certificación on-chain.</li>
              <li><strong>ETTIA</strong>: token nativo de ETTIOS Blockchain utilizado para gas y honorarios.</li>
            </ul>
          </section>

          <section id="art3">
            <h2>3. Servicios ofrecidos</h2>
            <p>La Plataforma ofrece: (a) marketplace público de profesionales verificados, (b) carga y análisis de documentos con IA, (c) emisión de dictámenes profesionales (Capa 3), (d) motor de scoring dinámico (0-100), (e) trazabilidad estructural con SHA-256 (Capa 4), (f) tokenización de certificaciones como NFT en ETTIOS (Capa 7).</p>
          </section>

          <section id="art4">
            <h2>4. Registro y cuentas</h2>
            <h3>4.1 Creación de cuenta</h3>
            <p>El registro requiere: nombre completo / razón social, email válido, contraseña ≥ 6 caracteres, y aceptación expresa de Términos, Privacidad y consentimiento KYC. Opcionalmente puede vincularse una billetera EVM compatible con ETTIOS.</p>
            <h3>4.2 Veracidad de la información</h3>
            <p>El Usuario garantiza que la información proporcionada es verdadera, precisa y actualizada. La Plataforma puede solicitar verificación KYC reforzada para roles de verificador, escribano, o cuando se supere el umbral establecido por SEPRELAD.</p>
            <h3>4.3 Seguridad de la cuenta</h3>
            <p>El Usuario es responsable de mantener seguras sus credenciales y claves privadas. <strong>La Plataforma nunca solicita la clave privada o seed phrase</strong>. Notifique inmediatamente cualquier acceso no autorizado a <code>soporte@mtp.platform</code>.</p>
            <h3>4.4 Suspensión y cancelación</h3>
            <p>La Plataforma se reserva el derecho de suspender o eliminar cuentas en caso de: (a) violación de estos Términos, (b) actividad fraudulenta, (c) incumplimiento KYC/AML, (d) uso de bots o automatización no autorizada, (e) requerimiento de autoridad competente.</p>
          </section>

          <section id="art5">
            <h2>5. KYC / AML — Cumplimiento SEPRELAD</h2>
            <p>El Usuario acepta someterse a controles de identidad (KYC) y prevención de lavado de activos (AML) alineados con la normativa de la <strong>Secretaría de Prevención de Lavado de Dinero y Bienes (SEPRELAD)</strong> de Paraguay, en la que el escribano actúa como sujeto obligado.</p>
            <h3>5.1 Pasos de verificación</h3>
            <ol>
              <li><strong>Email verificado</strong> — completado al crear cuenta.</li>
              <li><strong>Documento de identidad</strong> — DNI, Pasaporte, Cédula, RUC, NIF o CURP según país.</li>
              <li><strong>Verificación facial (liveness)</strong> — selfie con video corto.</li>
              <li><strong>Screening AML</strong> — control automático contra listas restrictivas internacionales.</li>
            </ol>
            <h3>5.2 Conservación de datos</h3>
            <p>Los datos de KYC se conservan por <strong>5 años</strong> desde la baja de la cuenta, conforme lo exige la normativa SEPRELAD.</p>
            <div className="legal-note">
              <strong>ℹ Usuarios en Paraguay</strong>: la Plataforma cumple con SEPRELAD y la Subsecretaría de Estado de Tributación (SET) incluyendo facturación electrónica conforme a la Ley N° 6380/2019.<br/>
              <strong>ℹ Usuarios en Argentina</strong>: cumplimiento con INAES y Unidad de Información Financiera (UIF).
            </div>
          </section>

          <section id="art6">
            <h2>6. Certificaciones CTE / CTPI / CEN / CTK</h2>
            <p>La Plataforma emite cuatro estándares de certificación como NFT en ETTIOS:</p>
            <ul>
              <li><strong>CTE</strong> — Certificado de Trazabilidad Económica (proyectos, balances, compliance).</li>
              <li><strong>CTPI</strong> — Certificado de Trazabilidad de Procesos Inteligentes (procesos judiciales, sanitarios, productivos).</li>
              <li><strong>CEN</strong> — Certificado Escritural Notarial (rubrica de escribano con fe pública blockchain).</li>
              <li><strong>CTK</strong> — Certificado de Tokenización de activos reales (inmuebles, ganado, vehículos eléctricos).</li>
            </ul>
            <p>Los certificados CTE, CTPI y CEN son emitidos como NFT <strong>Soulbound (no transferibles)</strong>. Los CTK sí son transferibles porque representan activos con liquidez secundaria.</p>
          </section>

          <section id="art7">
            <h2>7. Tokenización en ETTIOS</h2>
            <p>El minteo de un NFT es una acción irreversible registrada on-chain en ETTIOS (Chain ID 2237). La Plataforma actúa como emisor técnico autorizado por el contrato <code>MTPValidationNFT</code>. El Usuario reconoce que: (a) los costos de gas pueden variar según congestión de red, (b) las direcciones blockchain incorrectas resultan en pérdida irrecuperable del NFT, (c) la metadata se ancla mediante hash SHA-256 para garantizar integridad.</p>
          </section>

          <section id="art8">
            <h2>8. Membresías y precios</h2>
            <p>La Plataforma ofrece tres planes:</p>
            <ul>
              <li><strong>Básica</strong> (gratis) — marketplace + hasta 3 documentos/mes, sin NFT incluido.</li>
              <li><strong>Profesional</strong> (USD 29/mes) — documentos ilimitados, badge profesional, NFT a USD 5 c/u.</li>
              <li><strong>Premium</strong> (USD 79/mes) — todo lo anterior + mint NFT ilimitado + acceso a escribanos digitales + soporte 24h.</li>
            </ul>
            <p>Los precios pueden actualizarse con preaviso de 30 días. Los pagos pueden efectuarse en moneda fiat (tarjeta, transferencia) o en el token nativo <strong>ETTIA</strong>.</p>
          </section>

          <section id="art9">
            <h2>9. Obligaciones del usuario</h2>
            <p>El Usuario se compromete a: (a) no cargar documentación falsa o adulterada, (b) no usar la Plataforma para legitimación de activos de origen ilícito, (c) respetar la propiedad intelectual de terceros, (d) no intentar vulnerar la seguridad técnica de la Plataforma o de ETTIOS, (e) mantener actualizado su perfil profesional cuando ejerza el rol de verificador o escribano.</p>
          </section>

          <section id="art10">
            <h2>10. Responsabilidad</h2>
            <p>La Plataforma actúa como infraestructura técnica de validación. Los dictámenes son responsabilidad del verificador o escribano que los emite. La Plataforma <strong>no es responsable por decisiones de inversión, daños derivados de bugs en smart contracts auditados, ni por la pérdida de claves privadas del Usuario</strong>.</p>
          </section>

          <section id="art11">
            <h2>11. Propiedad intelectual</h2>
            <p>El código del Smart Contract MTPValidationNFT y la arquitectura del sistema son propiedad de Aston Mining S.L. Los documentos cargados son propiedad del Usuario, quien otorga a la Plataforma una licencia limitada para procesarlos, validarlos y emitir las certificaciones correspondientes.</p>
          </section>

          <section id="art12">
            <h2>12. Marco regulatorio</h2>
            <p>La Plataforma opera bajo el marco <strong>EMPE/BCP de Paraguay</strong> para tokenización de activos, en cumplimiento con SEPRELAD para prevención de lavado, e integra los requisitos de INAES Argentina y de las jurisdicciones donde se ofrezca tokenización local. ETTIOS Blockchain está regulada bajo el marco de activos virtuales del Banco Central del Paraguay.</p>
          </section>

          <section id="art13">
            <h2>13. Modificaciones</h2>
            <p>La Plataforma puede modificar estos Términos notificando al Usuario con preaviso de 15 días vía email. El uso continuado posterior a la entrada en vigor implica aceptación. Cada nueva versión queda registrada con su número y fecha en el historial de consentimientos del Usuario.</p>
          </section>

          <section id="art14">
            <h2>14. Jurisdicción y contacto</h2>
            <p>Estos Términos se rigen por la legislación de la República del Paraguay. Cualquier controversia se resolverá en los tribunales ordinarios de la ciudad de Asunción, sin perjuicio de las opciones de mediación y arbitraje disponibles en la Plataforma (Capa 6).</p>
            <p>Contacto legal: <code>legal@mtp.platform</code> · Oficial de Protección de Datos: <code>dpo@mtp.platform</code> · Cumplimiento SEPRELAD: <code>compliance@mtp.platform</code>.</p>
          </section>

          <footer className="legal-foot">
            <p className="muted">© 2026 Aston Mining S.L. — Documento legal versión 2026.05</p>
            <p><Link to="/privacy">Política de Privacidad →</Link></p>
          </footer>
        </article>
      </div>
    </div>
  );
}
