/**
 * attentionContract.js — Consumidor de los contratos del Command Center para el motor de atención (Fase 4.1/4.2, reapertura). Navegador (`FP.attentionContract`) y Node.
 *
 * Toma el resultado del motor determinístico de atención (attentionEngine.evaluate) y los datos de Inicio y devuelve, SIN modificar el motor ni inventar nada:
 *   · reliability  → FP.reliability.assess(FP.z1Input.fromHome(...)): nivel, dimensiones, usos permitidos y explicación (el nivel lo decide Z1, ninguna IA);
 *   · sample       → FP.sampleSufficiency.evaluate para «estimar un impacto» (¿hay muestra para el cierre proyectado?);
 *   · findings     → cada hallazgo en cc.finding/1.1 (FP.findings.fromAttentionItem), validado y deduplicado, con `kind` (hecho / desviación / hipótesis / riesgo…) y `causality`
 *                    (una hipótesis NUNCA se presenta como causa comprobada), y la confiabilidad de datos con la que se emitió.
 * Los hallazgos que no cumplen el contrato se reportan en `invalid` (no se descartan en silencio).
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  const FP = (root.FP = root.FP || {}); FP.attentionContract = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const KIND_LABEL = { hecho_observado: 'Hecho observado', desviacion: 'Desviación calculada', hipotesis: 'Hipótesis por validar', causa_comprobada: 'Causa comprobada', oportunidad: 'Oportunidad', riesgo: 'Riesgo (estimación)', recomendacion: 'Recomendación' };
  const need = (k) => { const FP = root.FP; if (!FP || !FP[k]) throw new Error(`attentionContract requiere FP.${k} cargado antes.`); return FP[k]; };
  /** @param {object} att resultado de attentionEngine.evaluate · @param {{f,S,input}} c datos de Inicio */
  function build(att, c) {
    const z1in = need('z1Input').fromHome(c);
    const days = z1in.period.daysCounted, plan = z1in.revenue.planToDate;
    const sample = need('sampleSufficiency').evaluate({ operation: 'estimate_impact', metricType: 'amount', plan, daysCounted: days, periodDays: c.f && c.f.p && fin(c.f.p.days) ? c.f.p.days : undefined, windowCoverage: z1in.reliability.coverage === null ? undefined : z1in.reliability.coverage });
    // P-17: la dimensión «muestra» de la confiabilidad se evalúa con el criterio contextual de FP.sampleSufficiency (mínimo de la aplicación), no con un umbral propio
    if (fin(sample.min)) z1in.sample = { n: days, min: sample.min };
    const rel = need('reliability').assess(z1in);
    const S = c.S || {}, input = c.input || {}, ctx = { period: S.period ? { type: S.period.type, key: S.period.key } : null, channel: S.channel || 'total', today: input.referenceDate, dataReliability: rel.level };
    const F = need('findings'), items = (att && att.findings) || [], raw = items.map((it) => F.fromAttentionItem(it, ctx)), valid = [], invalid = [];
    raw.forEach((cf, i) => { const v = F.validate(cf); (v.ok ? valid : invalid).push(v.ok ? cf : { id: cf.id, attentionId: items[i].id, errors: v.errors }); });
    const merged = F.mergeFindings(valid), byAttentionId = {};
    raw.forEach((cf, i) => { if (valid.includes(cf)) byAttentionId[items[i].id] = cf; });
    return { contract: 'cc.attention_contract/1', reliability: rel, sample, findings: merged, byAttentionId, invalid, z1Input: z1in, kindLabel: (k) => KIND_LABEL[k] || k };
  }
  return { contract: 'cc.attention_contract/1', KIND_LABEL, build };
});
