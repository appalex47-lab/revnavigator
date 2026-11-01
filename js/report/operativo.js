/**
 * operativo.js — Formato OPERATIVO (Presentation Intelligence · Fase 3).
 *
 * Audiencia: analistas y coordinadores. Objetivo: entender el desempeño, encontrar desviaciones y definir acciones concretas.
 * Reutiliza las páginas que ya arma FP.reportBuilder y agrega tres bloques propios:
 *   channelPacing  Pacing por canal: venta, pedidos, volumen (sesiones, conversaciones o llamadas), conversión y ticket, cada uno contra su plan.
 *   evolution      Evolución de venta y pedidos por semana, mes o día contra el plan de los mismos días.
 *   actions        Acciones, responsables y fechas: las acciones ya registradas en Recuperar.
 *
 * Reglas (las mismas del resto de la herramienta):
 *   - NO calcula con fórmulas nuevas: toma los bloques que ya trae cada serie del forecast (real, plan, brecha y brecha % de los días contados).
 *     Lo único que suma son los días contados de la propia serie (evolución) y venta ÷ pedidos para el ticket real de un grupo.
 *   - Un dato ausente es null y se muestra «No disponible»; nunca un cero. Sin base suficiente, la lámina se omite con su motivo.
 *   - La narrativa son plantillas deterministas sobre esas cifras: dice qué indicador está bajo el plan y cuánto; no explica causas.
 *   - Los umbrales de «bajo el plan» y «la más floja» son provisionales y viven en FP.config.reports.operativo.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  if (!FP.reportProfiles || !FP.reportBlocks) throw new Error('operativo.js necesita profiles.js y blocks.js cargados antes.');
  const PROFILE_ID = 'operativo';
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const num = (v) => (isNum(v) ? v : null);
  const RB = () => FP.reportBuilder, CFG = () => FP.config.reports.operativo;
  /** Umbrales: los que la persona fijó en la herramienta (src.thresholds) o, si no hay, los provisionales de la configuración. */
  const thr = (src, k) => { const v = src && src.thresholds ? src.thresholds[k] : null; return isNum(v) && v > 0 ? v : CFG()[k]; };
  const fmt = (k, v) => RB().fmt(k, v), TAG = () => RB().TAG;
  const page = (id, title, o) => ({ id, title, status: 'included', question: '', headline: '', kpis: [], tables: [], charts: [], notes: [], sources: [], ...o });
  const omit = (id, title, reason) => ({ id, title, status: 'omitted', reason });
  const joinEs = (a) => (a.length < 2 ? (a[0] || '') : `${a.slice(0, -1).join(', ')} y ${a[a.length - 1]}`);
  const pp2 = (v) => (isNum(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(2)} pp` : null);

  /* ---------- periodo (misma lectura que el resto del reporte) ---------- */
  function periodOf(src) {
    const run = src.run, sel = src.selection, year = { kind: 'year', key: null, coll: null, label: `Año ${run.year}` };
    if (!sel || !sel.periodKey) return year;
    const coll = { month: 'months', week: 'weeks', quarter: 'quarters' }[sel.periodType];
    if (!coll || !((run.total || {})[coll] || []).some((r) => r.key === sel.periodKey)) return year;
    const Cal = FP.calendar, lab = sel.periodType === 'week' ? Cal.periodLabel(sel.periodKey, 'week').replace(' · ', ' de ') : Cal.periodLabel(sel.periodKey, sel.periodType);
    return { kind: sel.periodType, key: sel.periodKey, coll, label: lab };
  }
  const rangeOf = (src, per) => {
    const Cal = FP.calendar;
    if (per.kind === 'year') return { from: `${src.run.year}-01-01`, to: `${src.run.year}-12-31` };
    if (per.kind === 'quarter') { const q = Cal.quarterRange(per.key); return { from: q.from, to: q.to }; }
    if (per.kind === 'month') return { from: `${per.key}-01`, to: `${per.key}-${String(Cal.daysInMonth(+per.key.slice(0, 4), +per.key.slice(5, 7))).padStart(2, '0')}` };
    const w = src.run.total.weeks.find((x) => x.key === per.key); return { from: w.weekStart || w.firstDate, to: w.weekEnd || w.lastDate };
  };

  /* ===================== 1 · Pacing por canal ===================== */
  const METRICS = [
    { id: 'revenue', label: 'Venta', fmt: 'moneyC' }, { id: 'orders', label: 'Pedidos', fmt: 'int' }, { id: 'trafficVolume', label: 'Volumen', fmt: 'int' },
    { id: 'conversionRate', label: 'Conversión', fmt: 'pct2' }, { id: 'aov', label: 'Ticket promedio', fmt: 'money' }
  ];
  const cellOf = (b) => (b ? { actual: num(b.actual), plan: num(b.plan), gap: num(b.gap), gapPct: num(b.gapPct) } : { actual: null, plan: null, gap: null, gapPct: null });
  function toDateOf(S, per) {
    if (!S) return null;
    const row = per.kind === 'year' ? S.annual : (S[per.coll] || []).find((r) => r.key === per.key);
    return row && row.toDate ? { td: row.toDate, counted: num(row.countedDays) } : null;
  }
  const NAME = { conversionRate: () => 'conversión', aov: () => 'ticket', orders: () => 'pedidos', trafficVolume: (row) => String(row.noun || 'volumen').toLowerCase() };
  const ORDER = ['conversionRate', 'aov', 'orders', 'trafficVolume'];
  /** Indicadores de un canal por debajo y por encima de su plan (se aparta ≥ umbral), del más al menos apartado. */
  function flagsOf(row, T0) {
    const T = isNum(T0) ? T0 : CFG().belowPlanPct, below = [], above = [];
    ORDER.forEach((id) => { const c = row.cells[id]; if (!c || !isNum(c.gapPct)) return; if (c.gapPct <= -T) below.push({ id, c }); else if (c.gapPct >= T) above.push({ id, c }); });
    below.sort((a, b) => a.c.gapPct - b.c.gapPct); above.sort((a, b) => b.c.gapPct - a.c.gapPct);
    return { below, above };
  }
  const itemTxt = (it, row) => `${NAME[it.id](row)} ${fmt('spct', it.c.gapPct)}${it.id === 'conversionRate' && isNum(it.c.gap) ? ` (${pp2(it.c.gap)})` : ''}`;

  function channelPacing(src) {
    const id = 'channelPacing', title = 'Pacing por canal', run = src.run;
    if (!run || !run.channels || !run.total) return omit(id, title, 'No hay pacing calculado.');
    if (src.channel && src.channel !== 'total') return omit(id, title, 'Con un canal elegido no se comparan canales entre sí; el pacing de ese canal está en «Pacing y forecast».');
    const per = periodOf(src), rows = [], without = [];
    (FP.config.channels || []).forEach((ch) => {
      const t = toDateOf(run.channels[ch.id], per), r = t && t.td.revenue;
      if (!t || !r || !isNum(r.actual) || !isNum(r.plan) || !(t.counted > 0)) { without.push(ch.label); return; }
      const cells = {}; METRICS.forEach((m) => { cells[m.id] = cellOf(t.td[m.id]); });
      rows.push({ key: ch.id, label: ch.label, noun: ch.trafficLabel, cells });
    });
    if (!rows.length) return omit(id, title, 'Ningún canal tiene venta real contada con plan en el periodo.');
    const tt = toDateOf(run.total, per), total = tt && tt.td.revenue && isNum(tt.td.revenue.actual) ? { label: 'Total digital', cells: Object.fromEntries(METRICS.map((m) => [m.id, cellOf(tt.td[m.id])])) } : null;

    const neg = rows.filter((r) => isNum(r.cells.revenue.gap) && r.cells.revenue.gap < 0).sort((a, b) => a.cells.revenue.gap - b.cells.revenue.gap);
    const pos = rows.filter((r) => isNum(r.cells.revenue.gap) && r.cells.revenue.gap > 0).sort((a, b) => b.cells.revenue.gap - a.cells.revenue.gap);
    const worst = neg[0], best = pos[0], money = (v) => fmt('moneyC', Math.abs(v));
    const T = thr(src, 'belowPlanPct'), belowTxt = (r) => { const f = flagsOf(r, T); return f.below.length ? `, con ${joinEs(f.below.map((x) => NAME[x.id](r)))} por debajo` : ''; };
    let conclusion;
    if (worst && best) conclusion = `${worst.label} resta ${money(worst.cells.revenue.gap)} contra su plan${belowTxt(worst)}; ${best.label} suma ${money(best.cells.revenue.gap)}`;
    else if (worst) conclusion = `${worst.label} es el canal que más resta (${money(worst.cells.revenue.gap)}) contra su plan${belowTxt(worst)}`;
    else if (best) conclusion = `Ningún canal queda por debajo de su plan a la fecha; ${best.label} suma ${money(best.cells.revenue.gap)}`;
    else conclusion = 'Pacing por canal: venta, pedidos, volumen, conversión y ticket contra el plan';

    const review = neg.slice(0, 2).map((r) => {
      const f = flagsOf(r, T);
      if (!f.below.length) return `En ${r.label}: ningún indicador (pedidos, ${NAME.trafficVolume(r)}, conversión o ticket) está más de ${+(T * 100).toFixed(1)} % bajo el plan.`;
      return `En ${r.label}: ${joinEs(f.below.map((x) => itemTxt(x, r)))} bajo el plan${f.above.length ? `, con ${joinEs(f.above.map((x) => itemTxt(x, r)))} por encima` : ''}.`;
    });
    const nouns = {}; rows.forEach((r) => { (nouns[String(r.noun).toLowerCase()] = nouns[String(r.noun).toLowerCase()] || []).push(r.label); });
    const notes = [
      `Volumen: ${Object.entries(nouns).map(([n, l]) => `${n} (${l.join(', ')})`).join('; ')}.`,
      'La variación de la conversión se muestra en puntos porcentuales (pp); venta, pedidos, volumen y ticket, en %. «vs plan» compara con el plan de los mismos días con venta real contada.'
    ];
    if (rows.some((r) => METRICS.some((m) => r.cells[m.id].actual === null)) || (total && METRICS.some((m) => total.cells[m.id].actual === null))) notes.push('«No disponible» significa que el dato no está cargado para ese canal o periodo; no es cero.');
    if (without.length) notes.push(`Sin venta real contada en el periodo: ${without.join(', ')}.`);
    return page(id, title, {
      question: '¿Dónde está la desviación?', conclusion, headline: conclusion, ctx: per.label, columns: METRICS, rows, total, review, notes,
      sources: ['Pacing y forecast (series por canal)'], tags: [TAG().obs, TAG().calc]
    });
  }

  /* ===================== 2 · Evolución de venta y pedidos ===================== */
  const UNIT = { week: { one: 'semana', many: 'semanas' }, month: { one: 'mes', many: 'meses' }, day: { one: 'día', many: 'días' } };
  function evolution(src) {
    const id = 'evolution', title = 'Evolución de venta y pedidos', run = src.run;
    const S = run && run.total ? (src.channel && src.channel !== 'total' ? (run.channels || {})[src.channel] : run.total) : null;
    if (!S || !Array.isArray(S.days)) return omit(id, title, 'No hay pacing diario calculado.');
    const per = periodOf(src), Cal = FP.calendar, rg = rangeOf(src, per);
    const months = per.kind === 'quarter' ? Cal.quarterRange(per.key).months : null;
    const inP = (d) => (per.kind === 'year' ? true : per.kind === 'month' ? d.month === per.key : per.kind === 'quarter' ? months.includes(d.month) : d.weekKey === per.key);
    const unit = per.kind === 'month' ? 'week' : per.kind === 'week' ? 'day' : 'month';
    const keyOf = unit === 'week' ? (d) => d.weekKey : unit === 'day' ? (d) => d.date : (d) => d.month;
    const groups = new Map();
    S.days.filter(inP).forEach((d) => { const k = keyOf(d), g = groups.get(k) || { key: k, periodDays: 0, days: [] }; g.periodDays++; if (d.counted) g.days.push(d); groups.set(k, g); });
    const sum = (days, side, m) => { let t = 0; for (const d of days) { const v = d[side] && d[side][m]; if (!isNum(v)) return null; t += v; } return t; };
    const delta = (a, p) => (isNum(a) && isNum(p) && p > 0 ? a / p - 1 : null);
    const dn = FP.config.calendar && FP.config.calendar.dayNamesEs;
    const labelOf = (k) => (unit === 'week' ? `Semana ${+k.slice(6)}` : unit === 'month' ? Cal.periodLabel(k, 'month').split(' ')[0] : `${dn ? dn[Cal.getDateAttributes(k).dayOfWeekIndex - 1].slice(0, 3) : ''} ${+k.slice(8, 10)}`.trim());
    const rows = [...groups.values()].filter((g) => g.days.length > 0).sort((a, b) => (a.key < b.key ? -1 : 1)).map((g) => {
      const ra = sum(g.days, 'actual', 'revenue'), rp = sum(g.days, 'plan', 'revenue'), oa = sum(g.days, 'actual', 'orders'), op = sum(g.days, 'plan', 'orders');
      return { key: g.key, label: labelOf(g.key), days: g.days.length, periodDays: g.periodDays, partial: g.days.length < g.periodDays,
        revenue: { actual: ra, plan: rp, deltaPct: delta(ra, rp) }, orders: { actual: oa, plan: op, deltaPct: delta(oa, op) }, aov: isNum(ra) && isNum(oa) && oa > 0 ? ra / oa : null };
    });
    const u = UNIT[unit];
    if (rows.length < 2) return omit(id, title, `Hay menos de 2 ${u.many} con venta real contada en el periodo; no hay evolución que mostrar.`);

    const comp = rows.filter((r) => !r.partial && isNum(r.revenue.deltaPct)).slice().sort((a, b) => a.revenue.deltaPct - b.revenue.deltaPct);
    const weak = comp[0], strong = comp[comp.length - 1], W = thr(src, 'weakPct'), spct = (v) => fmt('spct', v);
    let conclusion;
    if (weak && weak.revenue.deltaPct <= -W) {
      const head = unit === 'week' ? `La semana ${+weak.key.slice(6)} fue la más floja` : unit === 'month' ? `${weak.label} fue el mes más flojo` : `${weak.label} fue el día más flojo`;
      conclusion = `${head}: venta ${spct(weak.revenue.deltaPct)}${isNum(weak.orders.deltaPct) ? ` y pedidos ${spct(weak.orders.deltaPct)}` : ''} contra su plan`;
    } else if (comp.length) conclusion = `Las ${u.many} completas están en línea con su plan: venta entre ${spct(weak.revenue.deltaPct)} y ${spct(strong.revenue.deltaPct)}`;
    else conclusion = `Evolución de venta y pedidos: ${rows.length} ${u.many} con venta real, todas parciales`;
    let review;
    if (weak && weak.revenue.deltaPct <= -W) review = strong && strong !== weak && strong.revenue.deltaPct > 0
      ? `${strong.label} supera su plan (${spct(strong.revenue.deltaPct)}) y ${weak.label} queda bajo el plan (${spct(weak.revenue.deltaPct)}): conviene comparar qué cambió entre ambas.`
      : `Revisar ${weak.label}: venta ${spct(weak.revenue.deltaPct)} contra su plan.`;
    else review = comp.length ? `Ninguna de las ${u.many} completas se aparta más de ${+(W * 100).toFixed(1)} % de su plan.` : `Todas las ${u.many} tienen días sin contar; se comparan con el plan de los días contados.`;
    const notes = rows.filter((r) => r.partial).map((r) => `${r.label} es parcial: solo tiene ${r.days} de ${r.periodDays} días contados y se compara con el plan de esos días.`);
    notes.push('Venta y pedidos reales son los días contados de la serie; «vs plan» compara con el plan de esos mismos días. El ticket es venta ÷ pedidos del grupo.');
    const bad = (r) => isNum(r.revenue.deltaPct) && r.revenue.deltaPct <= -W;
    return page(id, title, {
      question: `¿Cómo se movió ${unit === 'week' ? 'semana a semana' : unit === 'month' ? 'mes a mes' : 'día a día'}?`, conclusion, headline: conclusion, ctx: `${per.label} · del ${fmt('date', rg.from)} al ${fmt('date', rg.to)}`, unit, review, rows, notes,
      charts: [{ type: 'groupbars', id: 'evo', title: 'Venta real contra el plan de los mismos días', items: rows.map((r) => ({ label: r.label, actual: r.revenue.actual, plan: r.revenue.plan, bad: bad(r), partial: r.partial })) }],
      sources: ['Pacing y forecast (días contados)'], tags: [TAG().obs, TAG().calc]
    });
  }

  /* ===================== 3 · Acciones, responsables y fechas ===================== */
  function actions(src) {
    const id = 'actions', title = 'Acciones, responsables y fechas', run = src.run;
    if (!run) return omit(id, title, 'No hay pacing calculado.');
    const per = periodOf(src), rg = rangeOf(src, per), ch = src.channel || 'total', all = (src.recovery && src.recovery.actions) || [];
    const mine = all.filter((a) => a && a.period && a.period.start <= rg.to && a.period.end >= rg.from && (ch === 'total' || a.channel === ch || a.channel === 'total'));
    if (!mine.length) return omit(id, title, 'No hay acciones registradas en Recuperar para este periodo.');
    const st = (FP.config.recovery && FP.config.recovery.actionStatuses) || {}, chLabel = (c) => (c === 'total' ? 'Total digital' : ((FP.config.channels || []).find((x) => x.id === c) || {}).label || c);
    const metricLabel = (m) => (FP.config.metrics && FP.config.metrics[m] ? FP.config.metrics[m].label : m);
    const rows = mine.map((a) => ({
      id: a.actionId, title: a.title, channel: chLabel(a.channel), owner: a.owner && String(a.owner).trim() ? String(a.owner).trim() : null,
      start: a.startDate || null, end: a.endDate || null, status: st[a.status] || a.status,
      impact: a.expectedImpact && isNum(a.expectedImpact.incrementalValue) ? { value: a.expectedImpact.incrementalValue, recoveryPct: num(a.expectedImpact.recoveryPercent) } : null,
      measurement: a.measurement && a.measurement.metric ? { metric: metricLabel(a.measurement.metric), windowDays: num(a.measurement.windowDays) } : null,
      priority: a.priority && typeof a.priority === 'object' ? { impact: a.priority.simulatedImpact || null, exposure: a.priority.exposure || null, urgency: a.priority.urgency || null, evidence: a.priority.evidence || null } : null
    }));
    const n = rows.length, sin = rows.filter((r) => !r.owner).length;
    const conclusion = n === 1 ? `Hay 1 acción registrada${sin ? ' y todavía no tiene responsable' : ', con responsable'}` : `Hay ${n} acciones registradas${sin ? `; ${sin === n ? 'ninguna tiene' : `${sin} sin`} responsable` : ', todas con responsable'}`;
    const notes = ['La prioridad es descriptiva (impacto simulado, exposición, urgencia y evidencia del plan): no indica cuál acción es mejor ni garantiza resultados.'];
    if (rows.some((r) => r.impact)) notes.push('El impacto simulado es un escenario con supuestos guardado en Recuperar (Estimado), no un resultado; no se suman entre acciones porque pueden compartir la misma base.');
    if (sin) notes.push('«Por asignar»: la acción no tiene responsable en Recuperar.');
    notes.push('El resultado observado de cada acción se mide en Medir; esta lámina no lo calcula.');
    return page(id, title, {
      question: '¿Qué se va a ejecutar y quién responde?', conclusion, headline: conclusion, ctx: per.label, rows, notes,
      kpis: [{ id: 'n', label: 'Acciones registradas', value: n, kind: 'int', tag: TAG().obs }, { id: 'sin', label: 'Sin responsable', value: sin, kind: 'int', tag: TAG().obs }],
      sources: ['Plan de acciones (Recuperar)'], tags: [TAG().obs, TAG().est]
    });
  }

  /* ===================== Perfil OPERATIVO ===================== */
  const legacy = FP.reportProfiles.get('legacy');
  const S = (block, type, depth, o) => ({ block, type, depth, ...(o || {}) });
  const PROFILE = {
    id: PROFILE_ID, status: 'enabled', label: 'Operativo', audience: 'operativo', presentationTypes: ['desempeno'],
    description: 'Para analistas y coordinadores: dónde está la desviación, qué indicador la explica en números y qué acciones están en marcha.',
    depths: [
      { id: 'resumen', label: 'Resumen', description: 'Portada, resumen, pacing por canal, acciones, cierre y decisiones.' },
      { id: 'ejecutivo', label: 'Ejecutivo', description: 'Agrega el desempeño, la evolución, los factores, quién suma y resta y la recuperación.' },
      { id: 'detallado', label: 'Detallado', description: 'Todo lo que tiene datos, con tráfico, productos, clientes y campañas.' }
    ],
    defaultDepth: 'detallado',
    slots: [
      S('cover', 'portada', 'resumen', { required: true }), S('summary', 'analisis', 'resumen'), S('pacing', 'analisis', 'ejecutivo'), S('channelPacing', 'analisis', 'resumen'),
      S('evolution', 'analisis', 'ejecutivo'), S('drivers', 'analisis', 'ejecutivo'), S('traffic', 'analisis', 'detallado'), S('trends', 'analisis', 'detallado'),
      S('categories', 'analisis', 'detallado'), S('customers', 'analisis', 'detallado'), S('campaigns', 'analisis', 'detallado'), S('movers', 'analisis', 'ejecutivo'),
      S('recovery', 'analisis', 'ejecutivo'), S('actions', 'analisis', 'resumen'), S('seasonality', 'analisis', 'detallado'), S('closing', 'cierre', 'resumen'),
      S('decisions', 'cierre', 'resumen'), S('reliability', 'anexo', 'detallado', { embeddedIn: 'annex' }), S('annex', 'anexo', 'detallado')
    ],
    annexes: JSON.parse(JSON.stringify(legacy.annexes)),
    defaultExclude: ['reliability', 'seasonality', 'annex']
  };
  FP.reportProfiles.register(PROFILE);
  FP.reportBlocks.register('channelPacing', channelPacing);
  FP.reportBlocks.register('evolution', evolution);
  FP.reportBlocks.register('actions', actions);

  FP.reportOperativo = { PROFILE_ID, METRICS, periodOf, channelPacing, evolution, actions, flagsOf, pp2 };
})(typeof window !== 'undefined' ? window : globalThis);
