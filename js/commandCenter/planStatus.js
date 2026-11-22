/**
 * planStatus.js — Contrato `cc.plan_status` v1 (Fase 4.1): UNA sola regla para el estado comercial frente al plan.
 *
 * Qué hace: CLASIFICA (no calcula nada nuevo). Recibe cifras ya calculadas por los motores (venta real a la fecha, plan a la fecha, días contados) y devuelve un
 * estado determinista. Es pura (sin DOM, red ni almacenamiento) y funciona en navegador y en Node.
 *
 * Estados: above · on_plan · below · no_activity · insufficient_data · plan_unavailable · not_comparable.
 *
 * Fuente única de la tolerancia: `FP.config.forecast.pacingThresholds` ({ aboveFrom, onPlanFrom }; valores por defecto definidos solo ahí). Es el mismo umbral que ya usan
 * `FP.gap.pacingStatus`, `attentionEngine`, las píldoras de Pacing y el contrato de Fase 2 (`DEFAULT_BANDS`). Para estados above/on_plan/below la salida es IDÉNTICA
 * a `FP.gap.pacingStatus` (probado en tools/test-fase4-1-estado-comercial.js). Los demás estados son nuevos: no confunden falta de información con desempeño.
 *
 * ESTADO DE ADOPCIÓN: este módulo NO está cableado a ninguna vista ni se carga desde index.html (Fase 4.1). Migrar los consumidores con otros umbrales
 * (home-resumen ±2 %, contextEngine 0.05 %, chg-resumen, analistaStory, copy del reporte) requiere aprobar la tolerancia única: ver docs/fase-4-1-integridad.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const STATES = ['above', 'on_plan', 'below', 'no_activity', 'insufficient_data', 'plan_unavailable', 'not_comparable'];
  const LABELS = { above: 'Por encima del plan', on_plan: 'En línea con el plan', below: 'Por debajo del plan', no_activity: 'Sin actividad', insufficient_data: 'Datos insuficientes', plan_unavailable: 'Plan no disponible', not_comparable: 'Periodo no comparable' };

  function thresholdsFrom(opts) {
    const cfg = FP.config && FP.config.forecast && FP.config.forecast.pacingThresholds;   // ÚNICA fuente; sin valores de respaldo copiados (cierre 4.1/4.2)
    const t = (opts && opts.thresholds) || cfg;
    if (!t || !fin(t.aboveFrom) || !fin(t.onPlanFrom)) throw new Error('planStatus requiere umbrales: FP.config.forecast.pacingThresholds (js/config/config.js) o opts.thresholds {aboveFrom, onPlanFrom}.');
    return { aboveFrom: t.aboveFrom, onPlanFrom: t.onPlanFrom };
  }

  /**
   * @param {object} x { planToDate, actualToDate, daysCounted, planAvailable, comparable, activityVerifiedZero, reliabilityLevel }
   *   planAvailable: false si no hay plan del periodo · comparable: false si el periodo no es comparable con el plan (otra composición, días distintos)
   *   activityVerifiedZero: true solo si sesiones, pedidos y venta son CERO VERIFICADO (no «sin dato») · reliabilityLevel: 'Alta'|'Media'|'Baja'|'Insuficiente' (opcional)
   * @param {object} [opts] { thresholds }
   * @returns {{state, label, compliance, gap, gapPct, observedValid, preliminary, reasons, thresholds, contract}}
   */
  function classify(x, opts) {
    const th = thresholdsFrom(opts), r = [], i = x || {};
    const out = (state, extra) => Object.assign({ state, label: LABELS[state], compliance: null, gap: null, gapPct: null, observedValid: false, preliminary: false, reasons: r, thresholds: th, contract: 'cc.plan_status/1' }, extra || {});
    const actualOk = fin(i.actualToDate) && i.actualToDate >= 0, daysOk = fin(i.daysCounted) ? i.daysCounted > 0 : true;
    // 1 · actividad: el cero verificado es un hecho (sin actividad); la ausencia de dato NO es cero
    if (i.activityVerifiedZero === true) { r.push('actividad_cero_verificada'); return out('no_activity', { observedValid: true }); }
    // 2 · valores imposibles o ausentes: falta de información ≠ desempeño negativo
    if (fin(i.actualToDate) && i.actualToDate < 0) { r.push('venta_negativa'); return out('insufficient_data'); }
    if (!actualOk) r.push('venta_real_no_disponible');
    if (!daysOk) r.push('sin_dias_contados');
    // 3 · plan: sin plan (o plan cero) no hay estado frente al plan; la venta observada válida se conserva
    if (i.planAvailable === false) { r.push('plan_no_disponible'); return out('plan_unavailable', { observedValid: actualOk && daysOk }); }
    if (!fin(i.planToDate)) { r.push('plan_a_la_fecha_no_numerico'); return out('plan_unavailable', { observedValid: actualOk && daysOk }); }
    if (i.planToDate < 0) { r.push('plan_negativo'); return out('insufficient_data'); }
    if (i.planToDate === 0) { r.push('plan_igual_a_cero'); return out('plan_unavailable', { observedValid: actualOk && daysOk }); }
    if (!actualOk || !daysOk) return out('insufficient_data');
    // 4 · comparabilidad y confiabilidad (no se «promueve» a en plan lo que no se puede demostrar)
    if (i.comparable === false) { r.push('periodo_no_comparable'); return out('not_comparable', { observedValid: true }); }
    if (i.reliabilityLevel === 'Insuficiente') { r.push('confiabilidad_insuficiente'); return out('insufficient_data', { observedValid: true }); }
    // 5 · clasificación: la hace FP.gap.pacingStatus (fuente central; mismos límites inclusivos, sin épsilon)
    const compliance = i.actualToDate / i.planToDate, gap = i.actualToDate - i.planToDate;
    if (!FP.gap || typeof FP.gap.pacingStatus !== 'function') throw new Error('planStatus.js requiere FP.gap (js/calculations/gap.js) cargado antes: la clasificación arriba/en plan/debajo es de FP.gap.pacingStatus.');
    const state = FP.gap.pacingStatus(compliance, th);   // ÚNICA regla (4.2): ya no se repiten las comparaciones de umbral aquí
    if (i.reliabilityLevel === 'Baja') r.push('lectura_preliminar');
    return out(state, { compliance, gap, gapPct: gap / i.planToDate, observedValid: true, preliminary: i.reliabilityLevel === 'Baja' });
  }

  FP.planStatus = { STATES, LABELS, classify, thresholdsFrom, contract: 'cc.plan_status/1' };
  if (typeof module === 'object' && module.exports) module.exports = FP.planStatus;
})(typeof window !== 'undefined' ? window : globalThis);
