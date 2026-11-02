/**
 * escenarios.js — Escenarios de recuperación y anexos del formato (Presentation Intelligence · Fase 8).
 *
 * Tres bloques, sin fórmulas nuevas y sin tocar los motores:
 *   scenarios     Escenarios de recuperación: los escenarios guardados en Recuperar para el periodo, de mayor a menor impacto simulado (Estimado), con el cambio
 *                 simulado, el primer supuesto y las advertencias que el motor de escenarios YA guardó, copiados tal cual y recortados a una línea.
 *   annexRules    Anexo «Reglas y umbrales»: umbrales en uso (con su origen: provisional o cambiado por la persona), sellos y límites del formato. Solo configuración.
 *   annexEdits    Anexo «Ediciones e IA»: qué texto es de la persona y qué hipótesis de IA aceptó. Se arma al componer la presentación con las ediciones vigentes
 *                 (página con `needs: 'edits'`: el compositor la deja fuera si no hay ninguna).
 *
 * Reglas: el impacto simulado y el % de la brecha son los que guardó el escenario (recoveryPercent = impacto ÷ brecha de ese escenario); NO se suman entre escenarios;
 * un dato ausente es null («Sin escenario», «—»), nunca cero; si el impacto supera la brecha se avisa (informativo) y por encima de 1000 % se escribe «Supera la brecha»
 * en vez del número. Montos de venta, no de utilidad. Depende de operativo.js (cargado antes); usa gerencial.js, si está, para los umbrales del semáforo.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  if (!FP.reportBlocks || !FP.reportOperativo) throw new Error('escenarios.js necesita blocks.js y operativo.js cargados antes.');
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const fmt = (k, v) => FP.reportBuilder.fmt(k, v), TAG = () => FP.reportBuilder.TAG, O = FP.reportOperativo, G = () => FP.reportGerencial;
  const MAX_ROWS = 5, MAX_TEXT = 110, HUGE = 10;   // HUGE: 10 = 1000 % de la brecha
  const omit = (id, title, reason) => ({ id, title, status: 'omitted', reason });
  const chLabel = (c) => (c === 'total' ? 'Total digital' : ((FP.config.channels || []).find((x) => x.id === c) || {}).label || c || 'Total digital');
  /** Una línea: colapsa espacios y recorta con «…» (el texto completo está en Recuperar). */
  const oneLine = (t, max) => { const s = String(t || '').replace(/\s+/g, ' ').trim(); return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s; };

  /** «Cambio simulado» a partir de las entradas del escenario (mismas unidades que la pantalla de escenarios: fracciones; CR en puntos si crMode es 'pp'). */
  function changesText(c) {
    if (!c || typeof c !== 'object') return null;
    const out = [];
    if (isNum(c.trafficPct) && c.trafficPct !== 0) out.push(`Volumen ${fmt('spct', c.trafficPct)}`);
    if (isNum(c.crValue) && c.crValue !== 0) out.push(c.crMode === 'pp' ? `Conversión ${O.pp2(c.crValue)}` : `Conversión ${fmt('spct', c.crValue)} relativo`);
    if (isNum(c.aovValue) && c.aovValue !== 0) out.push(c.aovMode === 'abs' ? `Ticket ${fmt('smoney', c.aovValue)}` : `Ticket ${fmt('spct', c.aovValue)}`);
    return out.length ? out.join(', ') : null;
  }
  /** Lectura de la recuperación: { text, level } — null si no hay dato; «Supera la brecha» pasando de 1000 %; sin brecha lo dice. */
  function recoveryOf(r) {
    if (isNum(r.gapBefore) && r.gapBefore <= 0) return { text: 'Sin brecha en el periodo', exceeds: true, huge: false };
    if (!isNum(r.recoveryPercent)) return { text: null, exceeds: false, huge: false };
    if (r.recoveryPercent > HUGE) return { text: 'Supera la brecha', exceeds: true, huge: true };
    return { text: fmt('pct', r.recoveryPercent), exceeds: r.recoveryPercent > 1, huge: false };
  }

  function scenarios(src) {
    const id = 'scenarios', title = 'Escenarios de recuperación', all = (src.recovery && src.recovery.scenarios) || [];
    const list = all.filter((s) => s && s.name);
    if (!list.length) return omit(id, title, 'No hay escenarios guardados en Recuperar para este periodo.');
    const per = O.periodOf(src);
    const rows = list.map((s) => {
      const rec = recoveryOf(s), ch = (s.changes && changesText(s.changes)) || null, a0 = Array.isArray(s.assumptions) && s.assumptions.length ? s.assumptions[0] : null, w = Array.isArray(s.warnings) ? s.warnings.filter((x) => typeof x === 'string' && x.trim()) : [];
      return { id: s.id || null, name: String(s.name), channel: chLabel(s.channel), impact: isNum(s.impact) ? s.impact : null, recovery: rec.text, exceeds: rec.exceeds, huge: rec.huge,
        change: ch, assumption: a0 ? oneLine(a0, MAX_TEXT) : null, assumptionsTotal: Array.isArray(s.assumptions) ? s.assumptions.length : 0, warning: w.length ? oneLine(w[0], MAX_TEXT) : null, warningsTotal: w.length };
    }).sort((a, b) => (b.impact === null ? -Infinity : b.impact) - (a.impact === null ? -Infinity : a.impact));
    const shown = rows.slice(0, MAX_ROWS), top = rows.find((r) => r.impact !== null), warned = rows.filter((r) => r.exceeds), n = rows.length;
    const conclusion = top ? `${n} ${n === 1 ? 'escenario guardado' : 'escenarios guardados'}; el de mayor impacto simulado es «${top.name}» (${fmt('smoneyC', top.impact)}, Estimado)` : `${n} ${n === 1 ? 'escenario guardado' : 'escenarios guardados'}, ninguno con impacto simulado calculable`;
    const warning = warned.length ? `En ${warned.length} de ${n} ${n === 1 ? 'escenario' : 'escenarios'} el impacto simulado supera la brecha del periodo (o no hay brecha): revisa los supuestos. Es solo un aviso; no cambia ningún monto ni el orden.` : null;
    const notes = ['El impacto simulado es un escenario con supuestos guardado en Recuperar (Estimado): no es un resultado y no se suma entre escenarios porque pueden compartir la misma base.',
      '«% de la brecha» es el impacto simulado ÷ la brecha de ese escenario. Por encima de 1000 % se escribe «Supera la brecha» en lugar del número.',
      'Los montos son venta, no utilidad: no hay costos ni márgenes. Los supuestos y advertencias se copian de Recuperar recortados a una línea; los completos están allí.'];
    if (n > MAX_ROWS) notes.push(`Se muestran ${MAX_ROWS} de ${n} escenarios, de mayor a menor impacto simulado.`);
    return { id, title, status: 'included', question: '¿Qué escenarios hay sobre la mesa?', conclusion, headline: conclusion, ctx: per.label, kpis: [], tables: [], charts: [], rows: shown, total: n, warning, notes,
      sources: ['Escenarios guardados (Recuperar)'], tags: [TAG().calc, TAG().est] };
  }

  /* ---------- Anexo «Reglas y umbrales» ---------- */
  const SEALS = [{ tag: 'Observado', what: 'viene de tus archivos cargados' }, { tag: 'Calculado', what: 'operación sobre lo observado' }, { tag: 'Estimado', what: 'escenario o proyección con supuestos' }];
  const LIMITS_ALL = ['Los montos son venta, no utilidad: no hay costos, márgenes ni inversión; no se calcula margen, ROI, ROAS ni CAC.', '«Plan a la fecha» es el plan de los días con venta real contada; no es la meta del cierre.', 'Los impactos simulados son escenarios con supuestos y no se suman entre acciones o escenarios.'];
  const LIMITS_BY = { operativo: ['La conversión se compara en puntos porcentuales (pp); venta, pedidos, volumen y ticket, en %.', 'El embudo es de fichas de producto (GA4); sus compras son artículos, no pedidos.'],
    gerencial: ['El semáforo compara la venta real de cada canal con su plan a la fecha.'], directivo: ['El alcance es el canal digital: no hay venta total de la empresa, así que no se calcula cuánto aporta el digital sobre ella.', 'El cierre estimado depende del método del forecast y de su confiabilidad.'] };
  const DEFS = { belowPlanPct: ['Indicador «bajo el plan» desde', 'operativo'], weakPct: ['Semana, mes o día «más flojo» desde', 'operativo'], okPct: ['Canal «en meta» (menos de)', 'semaforo'], alertPct: ['Canal «fuera de meta» desde', 'semaforo'] };
  function annexRules(src, report, profile) {
    const id = 'annexRules', title = 'Reglas y umbrales vigentes', pid = (profile && profile.id) || 'legacy', t = src.thresholds || {}, D = FP.config.reports;
    const keys = pid === 'operativo' ? ['belowPlanPct', 'weakPct'] : (pid === 'gerencial' || pid === 'directivo') ? ['okPct', 'alertPct'] : [];
    const L = G() ? G().limitsOf(src) : { okPct: D.gerencial.okPct, alertPct: D.gerencial.alertPct, fallback: false }, used = (k) => (pid === 'operativo' ? (isNum(t[k]) && t[k] > 0 ? t[k] : D.operativo[k]) : L[k]);
    const own = (k) => (pid === 'operativo' ? isNum(t[k]) && t[k] > 0 : isNum(t[k]) && t[k] > 0 && !L.fallback);
    const thresholds = keys.map((k) => ({ key: k, label: DEFS[k][0], value: used(k), origin: own(k) ? 'Cambiado por la persona' : 'Valor provisional' }));
    const notes = []; if (L.fallback && keys.includes('okPct')) notes.push('Los umbrales escritos no eran consistentes (el de «en meta» debe ser menor que el de «fuera de meta»); se usaron los provisionales.');
    notes.push('Los valores provisionales son criterios propuestos, no referencias de mercado: ajústalos con tu historial.');
    return { id, title, status: 'included', annex: false, question: '¿Cómo se leyó esta presentación?', conclusion: 'Cómo se leyó esta presentación: reglas y umbrales vigentes', headline: 'Cómo se leyó esta presentación: reglas y umbrales vigentes', ctx: (profile && profile.label) || 'Reporte actual',
      kpis: [], tables: [], charts: [], thresholds, seals: SEALS, limits: LIMITS_ALL.concat(LIMITS_BY[pid] || []), notes, sources: ['Configuración del formato'], tags: [TAG().calc] };
  }

  /* ---------- Anexo «Ediciones e IA» (se rellena al componer con las ediciones vigentes; ver report-escenarios-view.js) ---------- */
  function annexEdits() {
    const id = 'annexEdits', title = 'Ediciones e IA';
    return { id, title, status: 'included', needs: 'edits', annex: false, question: '¿Qué texto es de la persona y qué sugirió la IA?', conclusion: 'Qué texto fue editado por la persona y qué sugirió la IA', headline: 'Qué texto fue editado por la persona y qué sugirió la IA', ctx: '',
      kpis: [], tables: [], charts: [], notes: [], sources: ['Ediciones de la persona'], tags: [] };
  }

  FP.reportBlocks.register('scenarios', scenarios);
  FP.reportBlocks.register('annexRules', annexRules);
  FP.reportBlocks.register('annexEdits', annexEdits);
  FP.reportScenarios = { MAX_ROWS, MAX_TEXT, HUGE, changesText, recoveryOf, oneLine, scenarios, annexRules, annexEdits };
})(typeof window !== 'undefined' ? window : globalThis);
