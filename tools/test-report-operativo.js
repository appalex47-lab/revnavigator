#!/usr/bin/env node
/* Presentation Intelligence · Fase 3 — formato Operativo (js/report/blocks.js, js/report/operativo.js).  node tools/test-report-operativo.js */
const fs = require('fs'), vm = require('vm');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 400) : '')); if (!c) bad++; };
const ctx = { console, Math, Number, Object, Array, Date, JSON, Intl, String, Map, Set, Error }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
['js/config/config.js', 'js/calendar/calendar.js', 'js/forecast/methodAdvisor.js', 'js/report/reportBuilder.js', 'js/report/profiles.js', 'js/report/blocks.js', 'js/report/catalog.js', 'js/report/operativo.js', 'js/report/composer.js']
  .forEach((f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));
const FP = ctx.FP, O = FP.reportOperativo, B = FP.reportBlocks, P = FP.reportProfiles, C = FP.reportComposer;

/* ---------- datos de prueba ---------- */
const blk = (a, p) => ({ actual: a, plan: p, gap: a === null || p === null ? null : a - p, gapPct: a === null || !p ? null : a / p - 1, compliance: null });
const td = (r, o, v, c, a) => ({ revenue: blk(...r), orders: blk(...o), trafficVolume: blk(...v), conversionRate: blk(...c), aov: blk(...a) });
const mkA = () => td([900, 1000], [90, 100], [900, 1000], [0.1, 0.1], [10, 10]);          // 1.er canal: -10 % venta
const CH = FP.config.channels.map((c) => c.id), c0 = CH[0], c1 = CH[1];
const day = (date, month, weekKey, counted, ar, pr, ao, po) => ({ date, month, weekKey, counted, actual: { revenue: ar, orders: ao }, plan: { revenue: pr, orders: po } });
const days = [];
[['2026-09-01', 36, 1000, 1000], ['2026-09-02', 36, 1000, 1000], ['2026-09-08', 37, 900, 1000], ['2026-09-09', 37, 900, 1000], ['2026-09-15', 38, 1100, 1000], ['2026-09-16', 38, 1100, 1000], ['2026-09-22', 39, 1000, 1000]]
  .forEach(([d, w, a, p]) => days.push(day(d, '2026-09', `2026-W${w}`, true, a, p, a / 10, p / 10)));
days.push(day('2026-09-23', '2026-09', '2026-W39', false, null, 1000, null, 100));
const run = (over) => { const chA = mkA(); return { year: 2026, channels: { [c0]: { annual: { toDate: chA, countedDays: 20 }, months: [{ key: '2026-09', countedDays: 20, toDate: chA }], days }, [c1]: { annual: { toDate: td([1100, 1000], [110, 100], [1100, 1000], [0.1, 0.1], [10, 10]), countedDays: 20 }, months: [{ key: '2026-09', countedDays: 20, toDate: td([1100, 1000], [110, 100], [1100, 1000], [0.1, 0.1], [10, 10]) }], days } },
  total: { annual: { toDate: td([2000, 2000], [200, 200], [2000, 2000], [0.1, 0.1], [10, 10]), countedDays: 20 }, months: [{ key: '2026-09', countedDays: 20, toDate: td([2000, 2000], [200, 200], [2000, 2000], [0.1, 0.1], [10, 10]) }], weeks: [], days }, ...over }; };
const src = (o) => ({ run: run(), selection: { periodType: 'month', periodKey: '2026-09' }, channel: 'total', recovery: { actions: [] }, ...o });

/* ---------- registro de bloques ---------- */
t('el perfil «operativo» está registrado, habilitado y sirve a la audiencia operativo', (() => { const p = P.get('operativo'); return p && p.status === 'enabled' && p.audience === 'operativo' && p.presentationTypes.join() === 'desempeno'; })());
t('el catálogo habilita Operativo (solo desempeño) y deja gerencial y directivo sin habilitar', (() => { const K = FP.reportCatalog; return K.audiences().filter((a) => a.enabled).map((a) => a.id).join() === 'actual,operativo' && K.resolve('operativo', 'desempeno').id === 'operativo' && K.resolve('gerencial', 'desempeno') === null && K.types('operativo').filter((x) => x.enabled).map((x) => x.id).join() === 'desempeno'; })());
t('los 3 bloques nuevos están registrados; un id repetido lanza', B.list().join() === 'channelPacing,evolution,actions' && (() => { try { B.register('evolution', () => null); return false; } catch (e) { return /Ya existe/.test(e.message); } })());
t('las 3 profundidades de Operativo van de menor a mayor; la lámina de pacing por canal y la de acciones entran desde «Resumen»', (() => { const p = P.get('operativo'), d = (b) => p.slots.find((s) => s.block === b).depth; return p.depths.map((x) => x.id).join() === 'resumen,ejecutivo,detallado' && d('channelPacing') === 'resumen' && d('actions') === 'resumen' && d('evolution') === 'ejecutivo' && d('categories') === 'detallado'; })());
t('Operativo reutiliza los bloques del reporte actual: cada slot es un bloque del reporte o uno registrado', P.get('operativo').slots.every((s) => P.get('legacy').slots.some((x) => x.block === s.block) || B.has(s.block)));

/* ---------- Pacing por canal ---------- */
const cp = O.channelPacing(src());
t('Pacing por canal: una fila por canal con venta real y plan, más el total; todas las métricas con real, plan y variación', cp.status === 'included' && cp.rows.length === 2 && cp.total && cp.rows.every((r) => O.METRICS.every((m) => 'actual' in r.cells[m.id] && 'gapPct' in r.cells[m.id])), cp.rows && cp.rows.length);
t('Pacing por canal: la variación es la que ya trae el motor (venta −10 %), sin recalcular', Math.abs(cp.rows[0].cells.revenue.gapPct + 0.1) < 1e-12 && cp.rows[0].cells.revenue.gap === -100);
t('Pacing por canal: el titular nombra el canal que más resta y el que más suma, con sus montos', cp.conclusion.startsWith(FP.config.channels[0].label + ' resta') && cp.conclusion.includes(FP.config.channels[1].label + ' suma'), cp.conclusion);
t('Pacing por canal: «qué revisar» dice qué indicador está bajo el plan y solo los que pasan el umbral', cp.review.length === 1 && /por debajo|bajo el plan/.test(cp.review[0]) && /pedidos −10\.0 %|pedidos -10\.0 %/.test(cp.review[0]) , cp.review);
t('Pacing por canal: la conversión varía en puntos porcentuales (pp), no en %', O.pp2(-0.0123) === '−1.23 pp' && O.pp2(0.01) === '+1.00 pp' && O.pp2(null) === null);
t('Pacing por canal: un dato ausente queda null (No disponible) y no se vuelve cero', (() => { const r = run(); r.channels[c0].months[0].toDate.aov = null; const p = O.channelPacing(src({ run: r })); return p.rows[0].cells.aov.actual === null && p.rows[0].cells.aov.gapPct === null && p.notes.some((n) => n.includes('No disponible')); })());
t('Pacing por canal: con un canal elegido se omite con motivo', (() => { const p = O.channelPacing(src({ channel: c0 })); return p.status === 'omitted' && /canal elegido/.test(p.reason); })());
t('Pacing por canal: sin canal con venta real y plan se omite con motivo', (() => { const r = run(); r.channels[c0].months[0].toDate.revenue = blk(null, null); r.channels[c1].months[0].toDate.revenue = blk(null, null); const p = O.channelPacing(src({ run: r })); return p.status === 'omitted' && /Ningún canal/.test(p.reason); })());
t('Pacing por canal: el umbral viene de FP.config.reports.operativo (provisional, congelado)', FP.config.reports.operativo.belowPlanPct === 0.005 && Object.isFrozen(FP.config.reports.operativo));

/* ---------- Evolución ---------- */
const ev = O.evolution(src());
t('Evolución (mes): agrupa por semana y suma solo los días contados; real y plan de los mismos días', ev.status === 'included' && ev.unit === 'week' && ev.rows.length === 4 && ev.rows[1].revenue.actual === 1800 && ev.rows[1].revenue.plan === 2000, ev.rows && ev.rows.map((r) => [r.key, r.revenue]));
t('Evolución: la variación es real ÷ plan − 1 (semana 37: −10 %)', Math.abs(ev.rows[1].revenue.deltaPct + 0.1) < 1e-12 && Math.abs(ev.rows[1].orders.deltaPct + 0.1) < 1e-12);
t('Evolución: el ticket es venta ÷ pedidos del grupo', Math.abs(ev.rows[0].aov - 10) < 1e-9 && ev.rows[0].orders.actual === 200);
t('Evolución: la semana con días sin contar es parcial y se avisa; el día sin contar no suma al real', ev.rows[3].partial === true && ev.rows[3].days === 1 && ev.rows[3].periodDays === 2 && ev.rows[3].revenue.actual === 1000 && ev.notes.some((n) => /parcial/.test(n)), ev.rows[3]);
t('Evolución: el titular marca la semana completa más floja (la parcial no compite)', /^La semana 37 fue la más floja: venta −10\.0 %/.test(ev.conclusion), ev.conclusion);
t('Evolución: la gráfica marca en rojo (bad) solo lo que queda ≥ umbral bajo el plan', ev.charts[0].items.map((i) => i.bad).join() === 'false,true,false,false', ev.charts[0].items);
t('Evolución: año agrupa por mes; semana, por día', (() => { const r = run(), dd = days.concat([day('2026-10-05', '2026-10', '2026-W41', true, 800, 1000, 80, 100)]); r.total.days = dd; const a = O.evolution(src({ run: r, selection: null })); r.total.weeks = [{ key: '2026-W37', weekStart: '2026-09-08', weekEnd: '2026-09-14' }]; const w = O.evolution(src({ run: r, selection: { periodType: 'week', periodKey: '2026-W37' } })); return a.unit === 'month' && a.rows.length === 2 && w.unit === 'day' && w.rows.length === 2; })());
t('Evolución: con menos de 2 grupos con venta contada se omite con motivo', (() => { const r = run(); r.total.days = days.slice(0, 2); const p = O.evolution(src({ run: r })); return p.status === 'omitted' && /menos de 2 semanas/.test(p.reason); })());
t('Evolución: sin plan en un grupo la variación es null, nunca 0', (() => { const r = run(); r.total.days = days.map((d) => ({ ...d, plan: { revenue: null, orders: null } })); const p = O.evolution(src({ run: r })); return p.status === 'included' && p.rows.every((x) => x.revenue.deltaPct === null && x.revenue.plan === null); })());

/* ---------- Acciones ---------- */
const act = (o) => ({ actionId: 'ACT_1', title: 'Recuperar tráfico', channel: c0, period: { start: '2026-09-01', end: '2026-09-22', label: 'x' }, owner: null, status: 'proposed', priority: { simulatedImpact: 'alto', exposure: 'media', urgency: 'alta', evidence: 'n/d' }, expectedImpact: { incrementalValue: 5000, recoveryPercent: 0.4 }, measurement: { metric: 'revenue', windowDays: 14 }, startDate: '2026-09-01', endDate: '2026-09-22', ...o });
const ac = O.actions(src({ recovery: { actions: [act(), act({ actionId: 'ACT_2', owner: 'Ana', period: { start: '2026-12-01', end: '2026-12-10' } })] } }));
t('Acciones: solo las que se cruzan con el periodo; sin responsable queda «Por asignar» (owner null), no un nombre inventado', ac.status === 'included' && ac.rows.length === 1 && ac.rows[0].owner === null && /todavía no tiene responsable/.test(ac.conclusion), ac.rows);
t('Acciones: el impacto simulado se rotula Estimado y no se suma entre acciones', ac.tags.some((x) => /stim/i.test(JSON.stringify(x))) && ac.notes.some((n) => /no se suman/.test(n)));
t('Acciones: con responsable el titular lo dice; sin acciones se omite con motivo', (() => { const a = O.actions(src({ recovery: { actions: [act({ owner: 'Ana' })] } })), z = O.actions(src()); return /con responsable/.test(a.conclusion) && z.status === 'omitted' && /No hay acciones registradas/.test(z.reason); })());
t('Acciones: lleva el impacto simulado tal como lo guardó Recuperar (5000), sin derivar otra cifra', ac.rows[0].impact.value === 5000);
t('Acciones: un impacto ausente es «sin escenario» (null), no cero', O.actions(src({ recovery: { actions: [act({ expectedImpact: null })] } })).rows[0].impact === null);
t('Acciones: filtra por canal elegido (acciones de otro canal quedan fuera)', O.actions(src({ channel: c1, recovery: { actions: [act()] } })).status === 'omitted');

/* ---------- Periodo Q ---------- */
(() => {
  const r = run(), dd = days.concat([day('2026-08-10', '2026-08', '2026-W33', true, 900, 1000, 90, 100), day('2026-08-11', '2026-08', '2026-W33', true, 900, 1000, 90, 100)]);
  r.total.days = dd; r.total.quarters = [{ key: '2026-Q3', countedDays: 9 }]; Object.values(r.channels).forEach((c) => { c.quarters = [{ key: '2026-Q3', countedDays: 9, toDate: mkA() }]; c.days = dd; });
  const s = src({ run: r, selection: { periodType: 'quarter', periodKey: '2026-Q3' }, recovery: { actions: [act({ period: { start: '2026-07-15', end: '2026-07-30' } })] } });
  const e = O.evolution(s), c = O.channelPacing(s), a = O.actions(s);
  t('Q: la evolución va por mes (ago y sep) y el periodo se nombra Q3 2026 con su rango', e.status === 'included' && e.unit === 'month' && e.rows.length === 2 && /Q3 2026/.test(e.ctx) && e.ctx.startsWith('Q3 2026 · del '), e.ctx);
  t('Q: el pacing por canal lee el trimestre de la serie (no el mes ni el año)', c.status === 'included' && c.ctx === 'Q3 2026' && c.rows.length === 2, [c.status, c.reason, c.ctx]);
  t('Q: las acciones se cruzan con el rango del trimestre (julio cuenta)', a.status === 'included' && a.rows.length === 1);
})();

/* ---------- extend(): integración y LEGACY intacto ---------- */
const rep = () => ({ schema: 'executive_report', schemaVersion: '1.0.0', pages: [{ id: 'cover', title: 'Portada', status: 'included', number: 1 }, { id: 'pacing', title: 'Pacing', status: 'included', number: 2 }, { id: 'annex', title: 'Anexo', status: 'included', number: 3, omitted: [] }], included: ['cover', 'pacing', 'annex'], omitted: [], total: 3 });
t('extend con perfil LEGACY devuelve el mismo reporte sin tocarlo (idéntico campo a campo)', (() => { const r = rep(), before = JSON.stringify(r), out = B.extend(r, src(), P.get('legacy')); return out === r && JSON.stringify(out) === before; })());
t('extend con perfil Operativo agrega los 3 bloques antes del anexo, renumera y actualiza included/total/profile', (() => { const r = B.extend(rep(), src({ recovery: { actions: [act()] } }), P.get('operativo')); return r.included.join() === 'cover,pacing,channelPacing,evolution,actions,annex' && r.total === 6 && r.pages.map((p) => p.number).join() === '1,2,3,4,5,6' && r.profile === 'operativo'; })());
t('extend: una página sin datos queda omitida con su motivo en omitted y en el Anexo, y no cuenta en total', (() => { const r = B.extend(rep(), src({ channel: c0 }), P.get('operativo')); const o = r.omitted.find((x) => x.id === 'channelPacing'); return o && o.reason && r.pages.find((p) => p.id === 'annex').omitted.some((x) => x.reason === o.reason) && !r.included.includes('channelPacing'); })());
t('extend no agrega un bloque que el reporte ya trae', (() => { const r = rep(); r.pages.splice(2, 0, { id: 'evolution', title: 'x', status: 'included', number: 3 }); r.included.splice(2, 0, 'evolution'); const out = B.extend(r, src(), P.get('operativo')); return out.pages.filter((p) => p.id === 'evolution').length === 1; })());
t('extend rechaza un constructor que devuelve una página con otro id', (() => { B.register('zz_malo', () => ({ id: 'otro', status: 'included' })); try { B.extend(rep(), src(), { id: 'x', slots: [{ block: 'zz_malo' }] }); return false; } catch (e) { return /no devolvió una página válida/.test(e.message); } })());
t('extend no modifica src (solo lee)', (() => { const s = src({ recovery: { actions: [act()] } }), j = JSON.stringify(s); B.extend(rep(), s, P.get('operativo')); return JSON.stringify(s) === j; })());

/* ---------- compositor con el perfil Operativo ---------- */
const full = B.extend(rep(), src({ recovery: { actions: [act()] } }), P.get('operativo'));
const plan = (d) => C.compose(full, { profile: 'operativo', depth: d, exclude: [] }).slides.map((s) => s.id).join();
t('Compositor: Resumen = portada + pacing por canal + acciones (sin análisis profundo)', plan('resumen') === 'cover,channelPacing,actions', plan('resumen'));
t('Compositor: Ejecutivo suma pacing y evolución; el orden es el del perfil', plan('ejecutivo') === 'cover,pacing,channelPacing,evolution,actions', plan('ejecutivo'));
t('Compositor: la portada de Operativo no se puede quitar', (() => { const s = C.toggle(full, { profile: 'operativo', depth: 'detallado', exclude: [], include: [] }, 'cover'); return s.exclude.length === 0; })());
t('Compositor: quitar una lámina nueva y volverla a poner funciona', (() => { const s1 = C.toggle(full, { profile: 'operativo', depth: 'detallado', exclude: [], include: [] }, 'evolution'); const s2 = C.toggle(full, { profile: 'operativo', depth: 'detallado', ...s1 }, 'evolution'); return s1.exclude.includes('evolution') && !s2.exclude.includes('evolution'); })());

/* ---------- el contrato de contenido acepta las páginas nuevas ---------- */
(() => { try { vm.runInContext(fs.readFileSync('js/report/contentModel.js', 'utf8'), ctx); } catch (e) { return t('contentModel carga', false, e.message); }
  const CM = ctx.FP.reportContent;
  t('El modelo de contenido describe las 3 páginas nuevas sin inventar cifras (numbersOf finito)', CM && ['channelPacing', 'evolution', 'actions'].every((id) => { const p = full.pages.find((x) => x.id === id); try { return CM.describe(p) && CM.numbersOf(p).every((n) => Number.isFinite(n.value)); } catch (e) { return false; } }));
})();

console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
