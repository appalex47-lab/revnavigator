#!/usr/bin/env node
/* Presentation Intelligence · Fase 4 — formato Gerencial (js/report/gerencial.js).  node tools/test-report-gerencial.js */
const fs = require('fs'), vm = require('vm');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 400) : '')); if (!c) bad++; };
const ctx = { console, Math, Number, Object, Array, Date, JSON, Intl, String, Map, Set, Error }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
['js/config/config.js', 'js/calendar/calendar.js', 'js/forecast/methodAdvisor.js', 'js/report/reportBuilder.js', 'js/report/profiles.js', 'js/report/blocks.js', 'js/report/catalog.js', 'js/report/operativo.js', 'js/report/gerencial.js', 'js/report/composer.js']
  .forEach((f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));
const FP = ctx.FP, G = FP.reportGerencial, B = FP.reportBlocks, P = FP.reportProfiles, C = FP.reportComposer;
const CH = FP.config.channels.map((c) => c.id);
const rev = (a, p) => ({ revenue: { actual: a, plan: p, gap: a - p, gapPct: a / p - 1, compliance: a / p } });
const mk = (vals) => { const ch = {}; CH.forEach((id, i) => { const [a, p] = vals[i] || [1000, 1000]; ch[id] = { annual: { toDate: rev(a, p), countedDays: 10 }, months: [{ key: '2026-09', countedDays: 10, toDate: rev(a, p) }] }; });
  const A = CH.reduce((s, _, i) => s + (vals[i] || [1000, 1000])[0], 0), Pn = CH.reduce((s, _, i) => s + (vals[i] || [1000, 1000])[1], 0);
  return { year: 2026, channels: ch, total: { annual: { toDate: rev(A, Pn), countedDays: 10 }, months: [{ key: '2026-09', countedDays: 10, toDate: rev(A, Pn) }] } }; };
const src = (vals, o) => ({ run: mk(vals), selection: { periodType: 'month', periodKey: '2026-09' }, channel: 'total', ...o });

t('el perfil «gerencial» está registrado y habilitado; la audiencia gerencial se habilita en el catálogo (solo desempeño)', (() => { const K = FP.reportCatalog, p = P.get('gerencial'); return p && p.status === 'enabled' && K.audiences().filter((a) => a.enabled).map((a) => a.id).join() === 'actual,operativo,gerencial' && K.resolve('gerencial', 'desempeno').id === 'gerencial' && K.resolve('directivo', 'desempeno') === null; })());
t('el bloque «channelScorecard» está registrado y la profundidad inicial de Gerencial es «ejecutivo»', B.has('channelScorecard') && P.get('gerencial').defaultDepth === 'ejecutivo');
t('Gerencial lista cada bloque del reporte actual (nada queda fuera del perfil sin decirlo) más el nuevo', P.get('legacy').slots.every((s) => P.get('gerencial').slots.some((x) => x.block === s.block)) && P.get('gerencial').slots.some((x) => x.block === 'channelScorecard'));

/* ---- semáforo ---- */
const L0 = G.limitsOf({});
t('Umbrales provisionales: en meta hasta 1 %, fuera de meta desde 5 %', L0.okPct === 0.01 && L0.alertPct === 0.05 && !L0.fallback && Object.isFrozen(FP.config.reports.gerencial));
t('Estado por brecha: +3 % y −0.99 % = en meta; −1 % y −4.9 % = en seguimiento; −5 % y peor = fuera de meta; sin dato = null', G.statusOf(0.03, L0) === 'ok' && G.statusOf(-0.0099, L0) === 'ok' && G.statusOf(-0.01, L0) === 'watch' && G.statusOf(-0.049, L0) === 'watch' && G.statusOf(-0.05, L0) === 'alert' && G.statusOf(-0.3, L0) === 'alert' && G.statusOf(null, L0) === null && G.statusOf(NaN, L0) === null);
t('Umbrales de la persona: válidos cambian el estado; inconsistentes (en meta ≥ fuera de meta) o inválidos vuelven a los provisionales y lo avisan', (() => { const a = G.limitsOf({ thresholds: { okPct: 0.02, alertPct: 0.1 } }), b = G.limitsOf({ thresholds: { okPct: 0.1, alertPct: 0.02 } }), c = G.limitsOf({ thresholds: { okPct: 'x', alertPct: -1 } }); return a.okPct === 0.02 && a.alertPct === 0.1 && !a.fallback && b.okPct === 0.01 && b.fallback && c.okPct === 0.01 && !c.fallback; })());

/* ---- lámina ---- */
const nCh = CH.length;
const sc = G.channelScorecard(src([[900, 1000], [1100, 1000], [970, 1000]]));
t('Cumplimiento por canal: una fila por canal con real, plan, brecha y brecha % tal como las trae el forecast, más el total', sc.status === 'included' && sc.rows.length === nCh && sc.total && sc.rows[0].actual === 900 && sc.rows[0].plan === 1000 && sc.rows[0].gap === -100 && Math.abs(sc.rows[0].gapPct + 0.1) < 1e-12, sc.rows);
t('Cumplimiento por canal: asigna estado según el umbral (−10 % fuera de meta, +10 % en meta)', sc.rows[0].status === 'alert' && sc.rows[1].status === 'ok' && (nCh < 3 || sc.rows[2].status === 'watch'), sc.rows.map((r) => r.status));
t('Cumplimiento por canal: los conteos suman los canales con estado y el titular nombra el que más se aparta', sc.counts.ok + sc.counts.watch + sc.counts.alert === nCh && sc.conclusion.includes(FP.config.channels[0].label + ' es el que más se aparta') && /−10\.0 %/.test(sc.conclusion), sc.conclusion);
t('Cumplimiento por canal: todos en meta → titular lo dice y no hay «qué revisar»', (() => { const p = G.channelScorecard(src([[1000, 1000], [1050, 1000], [1000, 1000]])); return /en meta a la fecha/.test(p.conclusion) && p.review.length === 0 && p.counts.alert === 0; })());
t('Cumplimiento por canal: «qué revisar» lista fuera de meta y en seguimiento con su %', /Fuera de meta: .*−10\.0 %/.test(sc.review[0]) && (nCh < 3 || /En seguimiento: .*−3\.0 %/.test(sc.review[1])), sc.review);
t('Cumplimiento por canal: las notas explican el estado, que el plan es a la fecha (no la meta del cierre) y que los umbrales son provisionales', sc.notes.some((n) => /en meta/.test(n)) && sc.notes.some((n) => /no es la meta del cierre/.test(n)) && sc.notes.some((n) => /provisionales/.test(n)));
t('Cumplimiento por canal: con umbrales de la persona cambia el estado (−10 % pasa a «en seguimiento» con fuera de meta desde 20 %)', G.channelScorecard(src([[900, 1000]], { thresholds: { alertPct: 0.2 } })).rows[0].status === 'watch');
t('Cumplimiento por canal: un canal sin venta o plan queda fuera (se nombra), no cuenta como cero', (() => { const r = mk([[900, 1000]]); r.channels[CH[1]].months[0].toDate.revenue = { actual: null, plan: null, gap: null, gapPct: null }; const p = G.channelScorecard({ run: r, selection: src([]).selection, channel: 'total' }); return p.rows.length === nCh - 1 && p.notes.some((n) => n.includes('Sin venta real contada') && n.includes(FP.config.channels[1].label)); })());
t('Cumplimiento por canal: con un canal elegido se omite con motivo; sin ningún canal con venta y plan también', (() => { const a = G.channelScorecard(src([], { channel: CH[0] })); const r = mk([]); CH.forEach((id) => { r.channels[id].months[0].toDate.revenue = { actual: null, plan: null, gap: null, gapPct: null }; }); const b = G.channelScorecard({ run: r, selection: src([]).selection, channel: 'total' }); return a.status === 'omitted' && /canal elegido/.test(a.reason) && b.status === 'omitted' && /Ningún canal/.test(b.reason); })());
t('Cumplimiento por canal: no incluye margen, ROI, ROAS ni CAC', !/margen|ROI|ROAS|CAC/i.test(JSON.stringify(sc)));

/* ---- integración con el compositor ---- */
const rep = () => ({ schema: 'executive_report', schemaVersion: '1.0.0', pages: ['cover', 'summary', 'drivers', 'pacing', 'movers', 'trends', 'closing', 'decisions', 'annex'].map((id, i) => ({ id, title: id, status: 'included', number: i + 1, ...(id === 'annex' ? { omitted: [] } : {}) })), included: [], omitted: [], total: 9 });
const full = B.extend(rep(), src([[900, 1000], [1100, 1000], [970, 1000]]), P.get('gerencial'));
const plan = (d) => C.compose(full, { profile: 'gerencial', depth: d, exclude: [] }).slides.map((s) => s.id).join();
t('extend con Gerencial agrega la lámina antes del anexo y marca el perfil', full.profile === 'gerencial' && full.pages.findIndex((p) => p.id === 'channelScorecard') === full.pages.findIndex((p) => p.id === 'annex') - 1);
t('Compositor: Resumen = portada, resumen, brecha, cierre y decisiones (sin pacing ni semáforo)', plan('resumen') === 'cover,summary,drivers,closing,decisions', plan('resumen'));
t('Compositor: Ejecutivo suma pacing, cumplimiento por canal y quién suma y resta, en el orden del perfil', plan('ejecutivo') === 'cover,summary,drivers,pacing,channelScorecard,movers,closing,decisions', plan('ejecutivo'));
t('Compositor: Detallado agrega lo que tiene datos (tendencias)', plan('detallado').includes('trends') && plan('detallado').includes('channelScorecard'));
t('Operativo y Gerencial no se pisan: el bloque de semáforo solo está en Gerencial y la lámina de pacing por canal solo en Operativo', P.get('operativo').slots.every((s) => s.block !== 'channelScorecard') && P.get('gerencial').slots.every((s) => s.block !== 'channelPacing'));

console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
