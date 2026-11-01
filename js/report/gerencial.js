/**
 * gerencial.js — Formato GERENCIAL (Presentation Intelligence · Fase 4).
 *
 * Audiencia: gerentes y líderes de área. Pregunta: «¿cómo vamos contra la meta, qué nos separa de ella y qué decisión toca?».
 * Menos detalle por indicador que el formato Operativo y más conclusión. Reutiliza las páginas del reporte actual (resumen, brecha y factores,
 * pacing y forecast, quién suma y resta, recuperación, decisiones) y agrega un bloque propio:
 *   channelScorecard   Cumplimiento por canal: venta real contra el plan a la fecha, brecha y semáforo (en meta / en seguimiento / fuera de meta).
 *
 * Reglas: sin fórmulas nuevas (real, plan, brecha y brecha % salen del bloque toDate de cada serie del forecast); sin margen, ROI, ROAS ni CAC porque
 * no hay datos para calcularlos; un dato ausente no entra al semáforo (se muestra «No disponible»); el estado se dice con palabra y símbolo, no solo con
 * color. Los umbrales del semáforo son provisionales (FP.config.reports.gerencial) y la persona los puede cambiar en la pantalla de la presentación.
 * Con oportunidades.js (cargado antes) suma la lámina «Oportunidades priorizadas». Depende de operativo.js para leer el periodo y el bloque toDate (misma lectura que el resto del reporte).
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  if (!FP.reportProfiles || !FP.reportBlocks || !FP.reportOperativo) throw new Error('gerencial.js necesita profiles.js, blocks.js y operativo.js cargados antes.');
  const PROFILE_ID = 'gerencial', O = FP.reportOperativo;
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const CFG = () => FP.config.reports.gerencial, fmt = (k, v) => FP.reportBuilder.fmt(k, v), TAG = () => FP.reportBuilder.TAG;
  const STATUS = { ok: { label: 'En meta', mark: '●' }, watch: { label: 'En seguimiento', mark: '▲' }, alert: { label: 'Fuera de meta', mark: '■' } };

  /** Umbrales vigentes: los de la persona (src.thresholds) si son válidos y consistentes (en meta < fuera de meta); si no, los provisionales. */
  function limitsOf(src) {
    const t = (src && src.thresholds) || {}, D = CFG(), pick = (k) => (isNum(t[k]) && t[k] > 0 ? t[k] : null);
    const ok = pick('okPct'), al = pick('alertPct'), o = ok === null ? D.okPct : ok, a = al === null ? D.alertPct : al;
    return o < a ? { okPct: o, alertPct: a, fallback: false } : { okPct: D.okPct, alertPct: D.alertPct, fallback: ok !== null || al !== null };
  }
  /** Estado de una brecha %: null si no hay dato. */
  const statusOf = (gapPct, L) => (!isNum(gapPct) ? null : gapPct > -L.okPct ? 'ok' : gapPct <= -L.alertPct ? 'alert' : 'watch');
  const pctTxt = (v) => `${+(v * 100).toFixed(2)} %`;

  function channelScorecard(src) {
    const id = 'channelScorecard', title = 'Cumplimiento por canal', run = src.run, omit = (reason) => ({ id, title, status: 'omitted', reason });
    if (!run || !run.channels || !run.total) return omit('No hay pacing calculado.');
    if (src.channel && src.channel !== 'total') return omit('Con un canal elegido no se comparan canales entre sí; el cumplimiento de ese canal está en «Pacing y forecast».');
    const per = O.periodOf(src), L = limitsOf(src), rows = [], without = [];
    (FP.config.channels || []).forEach((ch) => {
      const t = O.toDateOf(run.channels[ch.id], per), r = t && t.td.revenue;
      if (!t || !r || !isNum(r.actual) || !isNum(r.plan) || !(t.counted > 0)) { without.push(ch.label); return; }
      rows.push({ key: ch.id, label: ch.label, actual: r.actual, plan: r.plan, gap: isNum(r.gap) ? r.gap : null, gapPct: isNum(r.gapPct) ? r.gapPct : null, status: statusOf(r.gapPct, L) });
    });
    if (!rows.length) return omit('Ningún canal tiene venta real contada con plan en el periodo.');
    const tt = O.toDateOf(run.total, per), tr = tt && tt.td.revenue && isNum(tt.td.revenue.actual) && isNum(tt.td.revenue.plan) ? tt.td.revenue : null;
    const total = tr ? { label: 'Total digital', actual: tr.actual, plan: tr.plan, gap: isNum(tr.gap) ? tr.gap : null, gapPct: isNum(tr.gapPct) ? tr.gapPct : null, status: statusOf(tr.gapPct, L) } : null;

    const graded = rows.filter((r) => r.status), n = graded.length, count = (k) => graded.filter((r) => r.status === k).length;
    const worst = graded.filter((r) => r.status !== 'ok').sort((a, b) => a.gapPct - b.gapPct)[0], ch = (n === 1 ? 'canal' : 'canales');
    let conclusion;
    if (!n) conclusion = 'Cumplimiento por canal: venta real contra el plan a la fecha';
    else if (!worst) conclusion = `${n === 1 ? 'El único canal está' : `Los ${n} canales están`} en meta a la fecha: ${n === 1 ? 'su venta no se aparta' : 'ninguno se aparta'} más de ${pctTxt(L.okPct)} por debajo del plan`;
    else conclusion = `${count('ok')} de ${n} ${ch} en meta a la fecha; ${worst.label} es el que más se aparta (${fmt('spct', worst.gapPct)}, ${fmt('smoneyC', worst.gap)} contra su plan)`;
    const alerts = graded.filter((r) => r.status === 'alert').sort((a, b) => a.gapPct - b.gapPct), watch = graded.filter((r) => r.status === 'watch');
    const review = [];
    if (alerts.length) review.push(`Fuera de meta: ${alerts.map((r) => `${r.label} (${fmt('spct', r.gapPct)})`).join(', ')}.`);
    if (watch.length) review.push(`En seguimiento: ${watch.map((r) => `${r.label} (${fmt('spct', r.gapPct)})`).join(', ')}.`);
    const notes = [`Estado: «en meta» si la venta real está por encima del plan o a menos de ${pctTxt(L.okPct)} por debajo; «fuera de meta» si queda ${pctTxt(L.alertPct)} o más por debajo; en medio, «en seguimiento».`,
      '«Plan a la fecha» es el plan de los días con venta real contada; no es la meta del cierre. El pacing al cierre está en «Pacing y forecast».',
      'Los umbrales son provisionales y se pueden cambiar al preparar la presentación.'];
    if (L.fallback) notes.push('Los umbrales escritos no eran consistentes (el de «en meta» debe ser menor que el de «fuera de meta»); se usaron los provisionales.');
    if (without.length) notes.push(`Sin venta real contada en el periodo: ${without.join(', ')}.`);
    return { id, title, status: 'included', question: '¿Qué canales cumplen y cuáles se apartan?', conclusion, headline: conclusion, ctx: per.label, kpis: [], tables: [], charts: [], limits: L,
      counts: { ok: count('ok'), watch: count('watch'), alert: count('alert') }, rows, total, review, notes, sources: ['Pacing y forecast (series por canal)'], tags: [TAG().obs, TAG().calc] };
  }

  /* ===================== Perfil GERENCIAL ===================== */
  const legacy = FP.reportProfiles.get('legacy');
  const S = (block, type, depth, o) => ({ block, type, depth, ...(o || {}) });
  FP.reportProfiles.register({
    id: PROFILE_ID, status: 'enabled', label: 'Gerencial', audience: 'gerencial', presentationTypes: ['desempeno'],
    description: 'Para gerentes y líderes de área: cómo vamos contra la meta, qué nos separa de ella y qué decisión toca. Menos detalle por indicador, más conclusión.',
    depths: [
      { id: 'resumen', label: 'Resumen', description: 'Portada, resumen, brecha y factores, cierre y decisiones.' },
      { id: 'ejecutivo', label: 'Ejecutivo', description: 'Agrega pacing, cumplimiento por canal, quién suma y resta y la recuperación.' },
      { id: 'detallado', label: 'Detallado', description: 'Todo lo que tiene datos, con tráfico, categorías, clientes y campañas.' }
    ],
    defaultDepth: 'ejecutivo',
    slots: [
      S('cover', 'portada', 'resumen', { required: true }), S('summary', 'analisis', 'resumen'), S('drivers', 'analisis', 'resumen'), S('pacing', 'analisis', 'ejecutivo'),
      S('channelScorecard', 'analisis', 'ejecutivo'), S('opportunities', 'analisis', 'ejecutivo'), S('movers', 'analisis', 'ejecutivo'), S('recovery', 'analisis', 'ejecutivo'), S('traffic', 'analisis', 'detallado'),
      S('categories', 'analisis', 'detallado'), S('trends', 'analisis', 'detallado'), S('customers', 'analisis', 'detallado'), S('campaigns', 'analisis', 'detallado'),
      S('seasonality', 'analisis', 'detallado'), S('closing', 'cierre', 'resumen'), S('decisions', 'cierre', 'resumen'),
      S('reliability', 'anexo', 'detallado', { embeddedIn: 'annex' }), S('annex', 'anexo', 'detallado')
    ],
    annexes: JSON.parse(JSON.stringify(legacy.annexes)),
    defaultExclude: ['reliability', 'seasonality', 'annex']
  });
  FP.reportBlocks.register('channelScorecard', channelScorecard);

  FP.reportGerencial = { PROFILE_ID, STATUS, limitsOf, statusOf, channelScorecard };
})(typeof window !== 'undefined' ? window : globalThis);
