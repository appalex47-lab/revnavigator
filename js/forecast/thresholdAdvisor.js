/**
 * thresholdAdvisor.js — Sugerencia de umbrales a partir del historial (Presentation Intelligence · endurecimiento).
 *
 * Los umbrales «bajo el plan», «en meta» y «fuera de meta» (presentación) y «Arriba del plan desde» / «En plan desde» (Forecast) son criterios de negocio.
 * Este módulo NO los decide: mide cuánto se aparta normalmente tu venta de su plan, semana a semana, y propone valores con esa evidencia. La persona decide si los aplica.
 *
 * Método (todo a partir de lo que el forecast ya calculó; sin fórmulas de negocio nuevas):
 *   · Serie: la brecha % (real ÷ plan − 1) de cada semana COMPLETA del total digital (todos sus días contados, con plan y real). Se necesitan ≥ MIN_WEEKS semanas.
 *   · «Lo normal» = el percentil 75 de |brecha %| (3 de cada 4 semanas se apartan menos que eso); «lo inusual» = el percentil 90 (solo 1 de cada 10 se aparta más).
 *   · En meta (okPct) = lo normal; fuera de meta (alertPct) = lo inusual (siempre al menos 0.1 pp mayor que el anterior); semana «más floja» (weakPct) = lo inusual.
 *   · Indicador «bajo el plan» (belowPlanPct) = el percentil 75 de |brecha %| de los indicadores de cada canal (pedidos, volumen, conversión y ticket) en esas semanas.
 *   · Forecast: «Arriba del plan desde» = 1 + lo normal; «En plan desde» = 1 − lo normal (misma banda, simétrica).
 *   Todo se redondea a 0.1 pp y se acota a 0.1 %–20 %. Sin historia suficiente NO se inventa nada: estado «insufficient» con cuántas semanas hay.
 * Es puro: recibe la corrida del forecast y devuelve la sugerencia con su evidencia.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const SCHEMA = 'threshold_suggestion', VERSION = 1, MIN_WEEKS = 8, LO = 0.001, HI = 0.2;
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const clamp = (v) => Math.min(HI, Math.max(LO, v));
  const round1 = (v) => Math.round(v * 1000) / 1000;   // 0.1 pp
  /** Percentil con interpolación lineal (p entre 0 y 1) de una lista de números. */
  function percentile(list, p) {
    if (!list.length) return null;
    const a = list.slice().sort((x, y) => x - y), i = (a.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
    return a[lo] + (a[hi] - a[lo]) * (i - lo);
  }
  const completeWeek = (w) => w && isNum(w.countedDays) && isNum(w.days) && w.days > 0 && w.countedDays === w.days;
  const gapOf = (td, k) => { const b = td && td[k]; return b && isNum(b.actual) && isNum(b.plan) && b.plan > 0 && isNum(b.gapPct) ? b.gapPct : null; };

  /** @param run salida del forecast ({ total: { weeks }, channels: { id: { weeks } }, cutoff }) @returns sugerencia (schema threshold_suggestion v1) */
  function suggest(run) {
    const base = { schema: SCHEMA, version: VERSION, minWeeks: MIN_WEEKS, method: 'Percentil 75 y 90 de la desviación semanal contra el plan (semanas completas del total digital).' };
    const weeks = run && run.total && Array.isArray(run.total.weeks) ? run.total.weeks.filter(completeWeek) : [];
    const rows = weeks.map((w) => ({ key: w.key, gap: gapOf(w.toDate, 'revenue') })).filter((r) => r.gap !== null);
    if (rows.length < MIN_WEEKS) return { ...base, status: 'insufficient', weeks: rows.length, reason: `Hay ${rows.length} ${rows.length === 1 ? 'semana completa' : 'semanas completas'} con venta real y plan; se necesitan al menos ${MIN_WEEKS} para medir cuánto se aparta lo normal.` };
    const abs = rows.map((r) => Math.abs(r.gap)), normal = percentile(abs, 0.75), unusual = percentile(abs, 0.9);
    const ind = []; const keys = new Set(rows.map((r) => r.key));
    Object.values((run && run.channels) || {}).forEach((c) => (c.weeks || []).filter((w) => completeWeek(w) && keys.has(w.key)).forEach((w) => ['orders', 'trafficVolume', 'conversionRate', 'aov'].forEach((k) => { const g = gapOf(w.toDate, k); if (g !== null) ind.push(Math.abs(g)); })));
    const okPct = round1(clamp(normal)), alertPct = Math.min(HI, Math.max(round1(clamp(unusual)), round1(okPct + LO))), weakPct = alertPct;
    const belowPlanPct = ind.length >= MIN_WEEKS ? round1(clamp(percentile(ind, 0.75))) : null;
    return { ...base, status: 'ready', weeks: rows.length, from: rows[0].key, to: rows[rows.length - 1].key, cutoff: (run && run.cutoff) || null,
      normalPct: normal, unusualPct: unusual, indicatorSamples: ind.length,
      presentation: { okPct, alertPct, weakPct, belowPlanPct }, pacing: { aboveFrom: round1(1 + okPct), onPlanFrom: round1(1 - okPct) },
      evidence: `En las ${rows.length} semanas completas (${rows[0].key} a ${rows[rows.length - 1].key}), 3 de cada 4 se apartaron menos de ${(normal * 100).toFixed(1)} % de su plan y 9 de cada 10 menos de ${(unusual * 100).toFixed(1)} %.` };
  }

  /** ¿Cambia algo respecto de lo vigente? `current` = { presentation: {…|null}, pacing: {aboveFrom,onPlanFrom} }. Devuelve las claves donde la sugerencia difiere. */
  function differences(sug, current) {
    if (!sug || sug.status !== 'ready') return [];
    const out = [], cur = current || {};
    Object.keys(sug.presentation).forEach((k) => { const v = sug.presentation[k]; if (v !== null && Math.abs((cur.presentation && isNum(cur.presentation[k]) ? cur.presentation[k] : (cur.defaults && cur.defaults[k])) - v) > 1e-9) out.push(k); });
    ['aboveFrom', 'onPlanFrom'].forEach((k) => { if (cur.pacing && isNum(cur.pacing[k]) && Math.abs(cur.pacing[k] - sug.pacing[k]) > 1e-9) out.push(`pacing.${k}`); });
    return out;
  }

  FP.thresholdAdvisor = { SCHEMA, VERSION, MIN_WEEKS, LO, HI, percentile, suggest, differences };
})(typeof window !== 'undefined' ? window : globalThis);
