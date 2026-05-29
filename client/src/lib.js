/** Helpers de presentación compartidos por las páginas. */

export const MEMBERSHIPS = {
  basica:      { label: 'Básica',      icon: '◌', cls: 'basic',   price: 'Gratis',    unit: '' },
  profesional: { label: 'Profesional', icon: '◆', cls: 'pro',     price: 'USD 29',    unit: '/ mes' },
  premium:     { label: 'Premium',     icon: '★', cls: 'premium', price: 'USD 79',    unit: '/ mes' },
};

export const ENTITY_LABELS = {
  empresa: 'Empresa', profesional: 'Profesional', organizacion: 'Organización',
  proyecto: 'Proyecto', inversor: 'Inversor',
};

export const DOC_TYPES = [
  ['cte',           'CTE — Certificado de Trazabilidad Económica'],
  ['ctpi',          'CTPI — Certificado de Trazabilidad de Procesos Inteligentes'],
  ['cen',           'CEN — Certificado Escritural Notarial'],
  ['ctk',           'CTK — Certificado de Tokenización'],
  ['contrato',       'Contrato'],
  ['balance',        'Balance contable'],
  ['informe_tecnico','Informe técnico'],
  ['whitepaper',    'Whitepaper'],
  ['certificacion', 'Certificación'],
  ['juridico',      'Documento jurídico'],
  ['financiero',    'Documento financiero'],
  ['antecedente',   'Antecedente'],
  ['otro',          'Otro'],
];

export const STATUS_LABEL = {
  cargado:         ['Cargado',         'badge-neutral'],
  en_analisis_ia:  ['Análisis IA',     'badge-info'],
  asignado:        ['Asignado',        'badge-warn'],
  en_validacion:   ['En validación',   'badge-warn'],
  validado:        ['Validado ✓',      'badge-good'],
  rechazado:       ['Rechazado',       'badge-risk'],
  pendiente:       ['Pendiente',       'badge-warn'],
  verificado:      ['Verificado',      'badge-good'],
  activo:          ['Activo',          'badge-good'],
  suspendido:      ['Suspendido',      'badge-risk'],
};

export function scoreLabel(s) {
  if (s >= 80) return ['Confianza alta',  'good'];
  if (s >= 55) return ['Confianza media', 'mid'];
  if (s >= 30) return ['Confianza baja',  'low'];
  return ['Riesgo', 'risk'];
}

export function statusBadge(status) {
  const [label, cls] = STATUS_LABEL[status] || [status, 'badge-neutral'];
  return { label, cls };
}

export function shortHash(h) {
  if (!h) return '';
  return h.slice(0, 10) + '…' + h.slice(-6);
}

export function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}
