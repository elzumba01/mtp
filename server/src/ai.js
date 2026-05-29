/**
 * MTP PLATFORM — Capa 2: Motor de IA (heurístico).
 * Aislado acá para poder reemplazarlo más adelante por una IA real
 * (Anthropic Claude, OpenAI, etc.) sin tocar las rutas.
 */
export function analyzeDocument({ title = '', doc_type = '', description = '' }) {
  const text = `${title} ${description}`.toLowerCase();
  const promoWords = ['garantiz', '100%', 'sin riesgo', 'duplica', 'rentabilidad asegurada', 'urgente'];
  const sensitiveTypes = ['financiero', 'juridico'];

  const promoHits = promoWords.filter(w => text.includes(w)).length;
  const tooShort = description.trim().length < 40;
  const sensitive = sensitiveTypes.includes(doc_type);

  let risk = 'bajo';
  let summary = 'El motor IA no detectó inconsistencias relevantes en el análisis preliminar.';

  if (promoHits >= 2 || (promoHits >= 1 && sensitive)) {
    risk = 'alto';
    summary = `El motor IA detectó ${promoHits} señal(es) de lenguaje promocional` +
      (sensitive ? ` en un documento ${doc_type}` : '') +
      ', requiere validación profesional prioritaria.';
  } else if (promoHits >= 1 || (sensitive && tooShort) || tooShort) {
    risk = 'medio';
    summary = 'El motor IA identificó elementos contextuales a revisar mediante validación profesional.';
  }
  return { risk, summary };
}
