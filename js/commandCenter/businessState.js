/**
 * businessState.js — Estado general del negocio (`classifyBusinessState`, Fase 2 · 2.1) portado a js/ (Fase 4.2). Navegador (`FP.businessState`) y Node (`module.exports`).
 *
 * ORIGEN: tools/audit/command-center-contracts.js (aceptado en Fase 2). ÚNICA DIFERENCIA INTENCIONAL: el eje de cumplimiento (arriba / en plan / debajo) ya no repite las
 * comparaciones de umbral: delega en FP.gap.pacingStatus (fuente única de la clasificación frente al plan, P-01). La prueba tools/test-fase4-2-z1-evaluador.js demuestra que la salida
 * es idéntica a la especificación en todas las entradas probadas. Lo consume Z1 (js/commandCenter/z1.js). Sin consumidores en vistas todavía.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  const FP = (root.FP = root.FP || {}); FP.businessState = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const gapStatus = (c, th) => { if (!root.FP || !root.FP.gap) throw new Error('businessState.js requiere FP.gap (js/calculations/gap.js) cargado antes.'); return root.FP.gap.pacingStatus(c, th); };
  const OWN_BANDS = { growth: 0.03, flat: 0.01, minCoverage: 0.6 };   // bandas propias del estado del negocio (Fase 2)
  /** Bandas efectivas: los umbrales de CUMPLIMIENTO salen de FP.config.forecast.pacingThresholds (fuente única); no se copian aquí. */
  const defaultBands = () => { const c = root.FP && root.FP.config && root.FP.config.forecast && root.FP.config.forecast.pacingThresholds; if (!c) throw new Error('businessState.js requiere FP.config.forecast.pacingThresholds (js/config/config.js) cargado antes.'); return { aboveFrom: c.aboveFrom, onPlanFrom: c.onPlanFrom, ...OWN_BANDS }; };
  function classifyBusinessState(x, bands) {
    const b = { ...defaultBands(), ...bands }, why = [];
    const cov = fin(x.coverage) ? x.coverage : null;
    // Excepción 0: sin base suficiente no se emite estado (se muestran las acciones de datos)
    if (x.blockingData || !fin(x.compliance) || (cov !== null && cov < b.minCoverage)) return { state: 'sin_base', qualifiers: [], why: ['Datos insuficientes: no se emite un estado del negocio.'] };
    const C = ({ above: 'arriba', on_plan: 'en_plan', below: 'debajo' })[gapStatus(x.compliance, { aboveFrom: b.aboveFrom, onPlanFrom: b.onPlanFrom })];   // eje de cumplimiento = FP.gap.pacingStatus (única regla; en Fase 2 era una comparación propia)
    const G = !fin(x.growthVsComparable) ? 'sin_dato' : x.growthVsComparable >= b.growth ? 'crece' : x.growthVsComparable <= -b.growth ? 'cae' : Math.abs(x.growthVsComparable) < b.flat ? 'plano' : (x.growthVsComparable > 0 ? 'crece_poco' : 'cae_poco');
    const F = !fin(x.forecastGapPct) ? 'sin_dato' : 1 + x.forecastGapPct < b.onPlanFrom ? 'riesgo' : 'ok';
    const crit = (x.findings || []).some((f) => f.severity === 'critica'), imp = (x.findings || []).some((f) => f.severity === 'importante');
    why.push(`Cumplimiento ${C}`, `Evolución ${G}`, `Cierre ${F}`);
    const q = [];
    if ((x.findings || []).some((f) => f.type === 'opportunity' && f.economics && f.economics.category === 'alcanzable' && f.economics.status === 'ok' && f.material)) q.push('oportunidad_aceleracion');
    if (F === 'riesgo') q.push('cierre_en_riesgo');
    if (x.concentration) q.push('concentracion_en_un_canal');
    if (x.dataWarnings) q.push('datos_con_avisos');
    let state;
    if (G === 'cae' && (C === 'debajo' || F === 'riesgo' || crit)) state = 'deterioro';
    else if (crit) state = 'riesgo_cumplimiento';                                              // un hallazgo crítico activo prevalece
    else if (G === 'crece' && (C === 'debajo' || F === 'riesgo')) state = 'creciendo_bajo_potencial';   // crece, pero no alcanza el plan o el cierre
    else if (C === 'debajo' || F === 'riesgo') state = 'riesgo_cumplimiento';
    else if (G === 'crece' && !imp) state = 'creciendo';
    else if (!imp && (G === 'plano' || G === 'crece_poco' || G === 'cae_poco' || G === 'sin_dato' || G === 'crece')) state = 'saludable';
    else state = 'riesgo_cumplimiento';   // hallazgo importante activo con cumplimiento en plan: se vigila como riesgo
    return { state, qualifiers: q, axes: { C, G, F }, why };
  }
  return { contract: 'cc.business_state/1', defaultBands, classifyBusinessState };
});
