/**
 * directivo.js — Formato DIRECTIVO (Presentation Intelligence · Fase 6).
 *
 * Audiencia: dirección. Pregunta: «¿cómo va el canal digital, dónde está el riesgo y qué decisión toca?». Pocas láminas, una idea por lámina, casi sin tablas.
 * Reutiliza las páginas del reporte actual (portada, decisiones, pacing, quién suma y resta, anexo) y la lámina «Oportunidades priorizadas» (Fase 5), y agrega:
 *   verdict   Veredicto: una frase y tres cifras (venta real, plan a la fecha y cierre estimado del periodo), con la confiabilidad que el reporte ya calculó.
 *   riskOpp   Riesgo y oportunidad: el semáforo de Gerencial en conteos y los canales que restan y suman.
 *
 * Reglas: nada de cifras ni conclusiones que no estén ya en el reporte (todo sale de toDate, de la fila del periodo y de las páginas ya armadas); sin la
 * contribución del canal digital sobre la venta total de la empresa (no hay datos de la venta total); sin margen, ROI, ROAS ni CAC; el cierre estimado lleva sello
 * Estimado y un dato ausente se muestra «No disponible». El perfil es «strict»: las páginas del reporte que no lista quedan fuera del formato.
 * Depende de operativo.js, oportunidades.js y gerencial.js (cargados antes).
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  if (!FP.reportOperativo || !FP.reportGerencial || !FP.reportOpportunities) throw new Error('directivo.js necesita operativo.js, oportunidades.js y gerencial.js cargados antes.');
  const PROFILE_ID = 'directivo', O = FP.reportOperativo, G = FP.reportGerencial, isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const fmt = (k, v) => FP.reportBuilder.fmt(k, v), TAG = () => FP.reportBuilder.TAG;
  const omit = (id, title, reason) => ({ id, title, status: 'omitted', reason });
  const normal = (v) => (isNum(v) ? v : null);

  /* ===================== Veredicto ===================== */
  function verdict(src, report) {
    const id = 'verdict', title = 'Veredicto', run = src.run;
    if (!run || !run.total) return omit(id, title, 'No hay pacing calculado.');
    const sel = src.channel && src.channel !== 'total' ? run.channels[src.channel] : run.total;
    const per = O.periodOf(src), row = O.rowOf(sel, per), r = row && row.toDate && row.toDate.revenue;
    if (!r || !isNum(r.actual) || !(row.countedDays > 0)) return omit(id, title, 'Todavía no hay días contados con venta real en el periodo.');
    const hasPlan = isNum(r.plan), gapPct = hasPlan && isNum(r.gapPct) ? r.gapPct : null, gap = hasPlan && isNum(r.gap) ? r.gap : null;
    const fc = row.forecast && isNum(row.forecast.revenue) ? row.forecast.revenue : null;
    const scope = src.channel && src.channel !== 'total' ? ((FP.config.channels || []).find((c) => c.id === src.channel) || {}).label || src.channel : 'Canal digital';
    let conclusion;
    if (!hasPlan) conclusion = `${scope} lleva ${fmt('moneyC', r.actual)} de venta real; no hay plan a la fecha para medir el avance`;
    else if (Math.abs(gapPct) < 0.005) conclusion = `${scope} va a la par del plan: la venta real está ${fmt('pct', Math.abs(gapPct))} ${gap < 0 ? 'por debajo' : 'por encima'} a la fecha`;
    else conclusion = `${scope} va ${fmt('pct', Math.abs(gapPct))} ${gap < 0 ? 'por debajo' : 'por encima'} de su plan a la fecha (${fmt('smoneyC', gap)})`;
    // Confiabilidad: solo lo que la página de confiabilidad ya trae (nivel y aviso de divergencia entre métodos); nada propio.
    const rel = (report && report.pages || []).find((p) => p.id === 'reliability' && p.status === 'included');
    const conf = rel && rel.suficiencia && rel.suficiencia.confidence ? rel.suficiencia.confidence : null, divergence = Boolean(rel && rel.warning);
    const caution = [];
    if (conf) caution.push(`Confiabilidad del cierre estimado: ${String(conf).toLowerCase()}.`);
    if (divergence) caution.push('Los métodos de proyección difieren de forma material: usa el cierre estimado como rango, no como cifra exacta.');
    const lag = src.lastActual && run.cutoff && src.lastActual < run.cutoff ? `La venta real llega al ${fmt('date', src.lastActual)}, antes del corte (${fmt('date', run.cutoff)}); falta cargar esos días.` : null;
    if (lag) caution.push(lag);
    return { id, title, status: 'included', question: '¿Cómo vamos?', conclusion, headline: conclusion, ctx: per.label, tables: [], charts: [],
      kpis: [{ id: 'real', label: 'Venta real', value: r.actual, kind: 'moneyC', tag: TAG().obs, sub: `${row.countedDays} días contados` },
        { id: 'plan', label: 'Plan a la fecha', value: hasPlan ? r.plan : null, kind: 'moneyC', tag: TAG().calc, sub: 'de los mismos días' },
        { id: 'forecast', label: 'Cierre estimado', value: fc, kind: 'moneyC', tag: TAG().est, sub: fc === null ? 'No hay método con datos suficientes' : `${per.label}${run.method ? ` · método ${run.method.id}` : ''}` }],
      caution, notes: ['«Plan a la fecha» es el plan de los días con venta real contada; no es la meta del cierre.', 'Alcance: canal digital. La herramienta no mide la venta total de la empresa, por eso no se calcula cuánto aporta el digital sobre ella.'],
      sources: ['Pacing y forecast', 'Confiabilidad del forecast'], tags: [TAG().obs, TAG().calc, TAG().est] };
  }

  /* ===================== Riesgo y oportunidad ===================== */
  function riskOpp(src) {
    const id = 'riskOpp', title = 'Riesgo y oportunidad', sc = G.channelScorecard(src);
    if (sc.status !== 'included') return omit(id, title, sc.reason);
    const sub = sc.rows.filter((r) => r.gap !== null), sorted = sub.slice().sort((a, b) => a.gap - b.gap);
    const subtract = sorted.filter((r) => r.gap < 0).slice(0, 3), add = sorted.filter((r) => r.gap > 0).reverse().slice(0, 3);
    const money = (v) => fmt('moneyC', Math.abs(v));
    let conclusion;
    if (subtract[0] && add[0]) conclusion = `${subtract[0].label} concentra la brecha (${money(subtract[0].gap)}); ${add[0].label} la compensa en parte (${money(add[0].gap)})`;
    else if (subtract[0]) conclusion = `${subtract[0].label} es el canal que más resta (${money(subtract[0].gap)}) y ninguno suma sobre el plan`;
    else if (add[0]) conclusion = `Ningún canal resta contra su plan a la fecha; ${add[0].label} suma ${money(add[0].gap)}`;
    else conclusion = 'Los canales están en el plan a la fecha';
    return { id, title, status: 'included', question: '¿Dónde está el riesgo?', conclusion, headline: conclusion, ctx: sc.ctx, kpis: [], tables: [], charts: [], counts: sc.counts, limits: sc.limits,
      total: sc.total, subtract, add, notes: sc.notes.slice(0, 1).concat('Los montos son venta, no utilidad: no hay costos ni márgenes.'), sources: sc.sources, tags: sc.tags };
  }

  /* ===================== Perfil DIRECTIVO ===================== */
  const legacy = FP.reportProfiles.get('legacy');
  const S = (block, type, depth, o) => ({ block, type, depth, ...(o || {}) });
  FP.reportProfiles.register({
    id: PROFILE_ID, status: 'enabled', label: 'Directivo', audience: 'directivo', presentationTypes: ['desempeno'], strict: true,
    description: 'Para dirección: cómo va el canal digital, dónde está el riesgo y qué decisión toca. Pocas láminas, una idea por lámina.',
    depths: [
      { id: 'resumen', label: 'Resumen', description: 'Portada, veredicto y decisiones.' },
      { id: 'ejecutivo', label: 'Ejecutivo', description: 'Agrega riesgo y oportunidad y las oportunidades priorizadas.' },
      { id: 'detallado', label: 'Detallado', description: 'Agrega el pacing y forecast completo y quién suma y resta.' }
    ],
    defaultDepth: 'ejecutivo',
    slots: [
      S('cover', 'portada', 'resumen', { required: true }), S('verdict', 'analisis', 'resumen'), S('riskOpp', 'analisis', 'ejecutivo'), S('opportunities', 'analisis', 'ejecutivo'), S('scenarios', 'analisis', 'detallado'),
      S('pacing', 'analisis', 'detallado'), S('movers', 'analisis', 'detallado'), S('decisions', 'cierre', 'resumen'),
      S('annexRules', 'anexo', 'detallado'), S('annexEdits', 'anexo', 'detallado'), S('reliability', 'anexo', 'detallado', { embeddedIn: 'annex' }), S('annex', 'anexo', 'detallado')
    ],
    annexes: JSON.parse(JSON.stringify(legacy.annexes)),
    defaultExclude: ['reliability', 'annex', 'annexRules', 'annexEdits']
  });
  FP.reportBlocks.register('verdict', verdict);
  FP.reportBlocks.register('riskOpp', riskOpp);

  FP.reportDirectivo = { PROFILE_ID, verdict, riskOpp };
})(typeof window !== 'undefined' ? window : globalThis);
