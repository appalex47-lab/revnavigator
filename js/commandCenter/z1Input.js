/**
 * z1Input.js — Adaptador: datos YA calculados por los motores de Inicio → entrada del evaluador Z1 (FP.z1). Navegador (`FP.z1Input`) y Node (`module.exports`).
 *
 * Es el PRODUCTOR de la entrada de Z1 (la especificación dice «el agregado de actividad ni siquiera tiene productor»). No calcula indicadores nuevos: copia lo que ya calcularon
 * gap.js / pacing.js / forecastEngine / homeSummaryEngine / attentionEngine, y respeta «ausencia ≠ cero»: una medida que no existe llega como null, nunca como 0.
 *   period.daysCounted ← f.p.countedDays            plan.available ← el periodo tiene plan (origen ≠ none y plan > 0)
 *   revenue ← f.p.planToDate / actualToDate / toDate (brecha y cumplimiento del motor)
 *   activity ← f.p.actualToDate {trafficVolume → sessions, orders, revenue} (null si la medida no existe)
 *   forecast ← f.p.plan / forecast / forecastGap     reliability.coverage ← días comparados ÷ esperados (S.whyPlan.coverage)
 *   reliability.support ← FP.attentionEngine.support(input).level (alto/medio/bajo)     warnings / dataErrors ← calidad de datos (S.trust.quality)
 * No incluye comparabilidad de evolución (`comparable`) ni margen: Z1 los trata como no disponibles.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  const FP = (root.FP = root.FP || {}); FP.z1Input = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const num = (v) => (fin(v) ? v : null);
  const SUPPORT = { alto: 'alto', medio: 'medio', bajo: 'bajo' };
  /** @param {{f:object, S:object, input:object}} c  f = { p, run } (periodo de Inicio) · S = FP.homeSummaryEngine.compute · input = entrada del motor de atención */
  function fromHome(c) {
    const f = c.f || {}, p = f.p || {}, S = c.S || {}, input = c.input || {};
    const rv = (p.toDate && p.toDate.revenue) || {}, plan = p.planToDate && p.planToDate.revenue, act = p.actualToDate || null, fg = (p.forecastGap && p.forecastGap.revenue) || {};
    const cov = (S.whyPlan && S.whyPlan.coverage) || (S.trust && S.trust.coverage) || null, ratio = cov && fin(cov.expected) && cov.expected > 0 ? cov.paired / cov.expected : null;
    const q = (S.trust && S.trust.quality) || null, planSource = input.status && input.status.plan ? input.status.plan.source : (f.run && f.run.plan ? f.run.plan.source : null);
    const sup = FP_support(input);
    return {
      period: { daysCounted: fin(p.countedDays) ? p.countedDays : 0 },
      plan: { available: planSource !== 'none' && fin(p.plan && p.plan.revenue) && p.plan.revenue > 0 },
      revenue: { planToDate: num(plan), actualToDate: num(act && act.revenue), gap: num(rv.gap), compliance: num(rv.compliance), gapPct: num(rv.gapPct) },
      activity: act ? { sessions: num(act.trafficVolume), orders: num(act.orders), revenue: num(act.revenue) } : undefined,
      forecast: { target: num(p.plan && p.plan.revenue), close: num(p.forecast && p.forecast.revenue), gapPct: num(fg.gapPct) },
      reliability: { support: SUPPORT[sup] || 'bajo', coverage: ratio, warnings: q && q.flagged > 0 ? [`Hay ${q.flagged} registro${q.flagged === 1 ? '' : 's'} con aviso de calidad.`] : [], blocking: [], dataErrors: Boolean(q && q.status === 'invalid') }
    };
  }
  function FP_support(input) { const E = root.FP && root.FP.attentionEngine; if (!E || typeof E.support !== 'function') throw new Error('z1Input requiere FP.attentionEngine (js/analytics/attentionEngine.js) cargado antes.'); try { return E.support(input).level; } catch (e) { return 'bajo'; } }
  return { contract: 'cc.z1_input/1', fromHome };
});
