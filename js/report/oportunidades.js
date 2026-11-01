/**
 * oportunidades.js — Economía de oportunidades y priorización (Presentation Intelligence · Fase 5).
 *
 * Bloque «opportunities» (Oportunidades priorizadas): une dos cosas que la herramienta YA calcula y las ordena por tamaño, sin inventar una calificación:
 *   · Dónde está la brecha (Observado): brecha de venta de cada canal contra su plan a la fecha (bloque toDate de la serie), solo los canales por debajo del plan.
 *   · Qué se puede recuperar (Estimado): las acciones registradas en Recuperar con su impacto simulado, de mayor a menor.
 *
 * Reglas:
 *   - Sin fórmulas nuevas de negocio: la brecha y el impacto simulado salen de los motores; lo único que se calcula aquí es la participación de cada canal en la
 *     suma de brechas negativas (cociente) y el orden.
 *   - Los impactos simulados NO se suman entre acciones (pueden compartir base) y siempre llevan el sello Estimado.
 *   - Valor = venta, no utilidad: la herramienta no tiene costos, márgenes, inversión ni atribución, así que no se calcula margen, ROI, ROAS ni CAC. La lámina lo dice.
 *   - La prioridad que se muestra (urgencia, evidencia, exposición) es la descriptiva de Recuperar; el orden es por monto, no por una puntuación propia.
 * Depende de operativo.js (periodo, bloque toDate y filas de acciones).
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  if (!FP.reportBlocks || !FP.reportOperativo) throw new Error('oportunidades.js necesita blocks.js y operativo.js cargados antes.');
  const O = FP.reportOperativo, isNum = (v) => typeof v === 'number' && Number.isFinite(v), fmt = (k, v) => FP.reportBuilder.fmt(k, v), TAG = () => FP.reportBuilder.TAG;
  const MAX_GAPS = 4, MAX_ACTIONS = 5;

  function opportunities(src) {
    const id = 'opportunities', title = 'Oportunidades priorizadas', run = src.run, omit = (reason) => ({ id, title, status: 'omitted', reason });
    if (!run || !run.channels || !run.total) return omit('No hay pacing calculado.');
    const per = O.periodOf(src), all = !src.channel || src.channel === 'total';
    // Brecha observada por canal (solo con venta real contada y plan); con un canal elegido, solo ese canal.
    const gaps = [];
    (FP.config.channels || []).filter((c) => all || c.id === src.channel).forEach((ch) => {
      const t = O.toDateOf(run.channels[ch.id], per), r = t && t.td.revenue;
      if (t && r && isNum(r.actual) && isNum(r.plan) && t.counted > 0 && isNum(r.gap) && r.gap < 0) gaps.push({ key: ch.id, label: ch.label, gap: r.gap, gapPct: isNum(r.gapPct) ? r.gapPct : null });
    });
    gaps.sort((a, b) => a.gap - b.gap);
    const sumNeg = gaps.reduce((s, g) => s + g.gap, 0);
    gaps.forEach((g) => { g.share = sumNeg < 0 ? g.gap / sumNeg : null; });
    const tt = all ? O.toDateOf(run.total, per) : null, tr = tt && tt.td.revenue && isNum(tt.td.revenue.gap) ? tt.td.revenue : null;
    const totalGap = tr ? { gap: tr.gap, gapPct: isNum(tr.gapPct) ? tr.gapPct : null } : null;

    const act = O.actions(src), rows = act.status === 'included' ? act.rows.slice().sort((a, b) => (b.impact ? b.impact.value : -Infinity) - (a.impact ? a.impact.value : -Infinity)) : [];
    if (!gaps.length && !rows.length) return omit('Ningún canal queda por debajo de su plan a la fecha y no hay acciones registradas: no hay oportunidad que priorizar.');

    const money = (v) => fmt('moneyC', Math.abs(v)), lead = gaps[0], top = rows.find((r) => r.impact);
    const parts = [];
    if (lead) parts.push(gaps.length === 1 ? `La brecha de ${money(lead.gap)} está en ${lead.label}` : `${lead.label} concentra ${fmt('pct', lead.share)} de la brecha por canal (${money(lead.gap)} de ${money(sumNeg)})`);
    else parts.push('Ningún canal queda por debajo de su plan a la fecha');
    if (top) parts.push(`la acción con mayor impacto simulado es «${top.title}» (${fmt('smoneyC', top.impact.value)}, Estimado)`);
    else if (rows.length) parts.push(`hay ${rows.length} ${rows.length === 1 ? 'acción registrada' : 'acciones registradas'}, ninguna con impacto simulado`);
    else parts.push('no hay acciones registradas en Recuperar para este periodo');
    const conclusion = parts.join('; ');
    const notes = [
      'Brecha = venta real − plan a la fecha de cada canal (Observado); solo se listan los canales por debajo de su plan. La participación es la parte de cada canal en la suma de esas brechas.',
      'El impacto simulado es un escenario con supuestos guardado en Recuperar (Estimado): no es un resultado y no se suma entre acciones porque pueden compartir la misma base.',
      'Los montos son venta, no utilidad: la herramienta no tiene costos ni márgenes, por eso no se calcula margen, ROI, ROAS ni CAC.',
      'El orden es por monto. La urgencia y la evidencia son la prioridad descriptiva de Recuperar, no una puntuación propia.'
    ];
    if (gaps.length > MAX_GAPS) notes.push(`Se muestran ${MAX_GAPS} de ${gaps.length} canales por debajo del plan.`);
    if (rows.length > MAX_ACTIONS) notes.push(`Se muestran ${MAX_ACTIONS} de ${rows.length} acciones, de mayor a menor impacto simulado.`);
    return { id, title, status: 'included', question: '¿Dónde está la oportunidad y qué la puede recuperar?', conclusion, headline: conclusion, ctx: per.label, kpis: [], tables: [], charts: [],
      gaps: gaps.slice(0, MAX_GAPS), gapsTotal: gaps.length, totalGap, actions: rows.slice(0, MAX_ACTIONS), actionsTotal: rows.length, notes,
      sources: ['Pacing y forecast (series por canal)', 'Plan de acciones (Recuperar)'], tags: [TAG().obs, TAG().calc, TAG().est] };
  }

  FP.reportBlocks.register('opportunities', opportunities);
  FP.reportOpportunities = { opportunities, MAX_GAPS, MAX_ACTIONS };
})(typeof window !== 'undefined' ? window : globalThis);
