#!/usr/bin/env node
/* Presentation Intelligence · Fase 6 — formato Directivo (js/report/directivo.js, perfil «strict»).  node tools/test-report-directivo.js */
const fs = require('fs'), vm = require('vm');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 400) : '')); if (!c) bad++; };
const ctx = { console, Math, Number, Object, Array, Date, JSON, Intl, String, Map, Set, Error }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
['js/config/config.js', 'js/calendar/calendar.js', 'js/forecast/methodAdvisor.js', 'js/report/reportBuilder.js', 'js/report/profiles.js', 'js/report/blocks.js', 'js/report/catalog.js', 'js/report/operativo.js', 'js/report/oportunidades.js', 'js/report/gerencial.js', 'js/report/directivo.js', 'js/report/composer.js']
  .forEach((f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));
const FP = ctx.FP, D = FP.reportDirectivo, B = FP.reportBlocks, P = FP.reportProfiles, C = FP.reportComposer, CH = FP.config.channels.map((c) => c.id);
const rev = (a, p) => ({ revenue: { actual: a, plan: p, gap: a - p, gapPct: a / p - 1, compliance: a / p } });
const mk = (vals, fc) => { const ch = {}; CH.forEach((id, i) => { const [a, p] = vals[i] || [1000, 1000]; ch[id] = { annual: { toDate: rev(a, p), countedDays: 10 }, months: [{ key: '2026-09', countedDays: 10, toDate: rev(a, p) }] }; });
  const A = CH.reduce((s, _, i) => s + (vals[i] || [1000, 1000])[0], 0), Pn = CH.reduce((s, _, i) => s + (vals[i] || [1000, 1000])[1], 0);
  return { year: 2026, cutoff: '2026-09-22', method: { id: 'm1' }, channels: ch, total: { annual: { toDate: rev(A, Pn), countedDays: 10 }, months: [{ key: '2026-09', countedDays: 10, toDate: rev(A, Pn), ...(fc === null ? {} : { forecast: { revenue: fc === undefined ? 33400 : fc } }) }] } }; };
const src = (vals, o, fc) => ({ run: mk(vals || [], fc), selection: { periodType: 'month', periodKey: '2026-09' }, channel: 'total', recovery: { actions: [] }, lastActual: '2026-09-22', ...o });
const rel = (o) => ({ id: 'reliability', title: 'Confiabilidad', status: 'included', annex: true, warning: null, suficiencia: { confidence: 'Limitada' }, ...o });

t('el perfil «directivo» está registrado, habilitado, estricto y la audiencia se habilita en el catálogo (solo desempeño)', (() => { const p = P.get('directivo'), K = FP.reportCatalog; return p && p.status === 'enabled' && p.strict === true && p.defaultDepth === 'ejecutivo' && K.resolve('directivo', 'desempeno').id === 'directivo' && K.audiences().filter((a) => a.enabled).map((a) => a.id).join() === 'actual,operativo,gerencial,directivo'; })());
t('los bloques «verdict» y «riskOpp» están registrados; «strict» solo se acepta como verdadero o falso', B.has('verdict') && B.has('riskOpp') && P.validate({ id: 'x', label: 'x', status: 'planned', slots: [{ block: 'cover', type: 'portada' }], strict: 'si' }).some((m) => /strict/.test(m)));

/* ---- veredicto ---- */
const v = D.verdict(src([[990, 1000]]), { pages: [rel({ warning: 'divergence' })] });
t('Veredicto: tres cifras (real, plan a la fecha y cierre estimado del periodo) con sus sellos', v.status === 'included' && v.kpis.map((k) => k.id).join() === 'real,plan,forecast' && v.kpis[0].tag === 'Observado' && v.kpis[2].tag === 'Estimado' && v.kpis[2].value === 33400, v.kpis);
t('Veredicto: real y plan salen del bloque toDate del total (sin recalcular)', v.kpis[0].value === 990 + (CH.length - 1) * 1000 && v.kpis[1].value === CH.length * 1000);
t('Veredicto: la frase dice «Canal digital» y que va por debajo (o a la par) según la brecha', /^Canal digital va 0\.\d % por debajo|^Canal digital va a la par/.test(v.conclusion), v.conclusion);
t('Veredicto: con brecha de −10 % el titular lo dice con el monto', (() => { const q = D.verdict(src([[900, 1000], [900, 1000], [900, 1000], [900, 1000]]), { pages: [] }); return CH.length !== 4 || /va 10\.0 % por debajo de su plan a la fecha \(−\$400\)/.test(q.conclusion); })());
t('Veredicto: la confiabilidad y la divergencia salen de la página de confiabilidad que ya existe; sin esa página no se inventa aviso', v.caution.some((c) => /Confiabilidad del cierre estimado: limitada/.test(c)) && v.caution.some((c) => /difieren de forma material/.test(c)) && D.verdict(src([[1000, 1000]]), { pages: [] }).caution.length === 0);
t('Veredicto: sin cierre estimado muestra null (No disponible) y no cero', D.verdict(src([[1000, 1000]], {}, null), { pages: [] }).kpis[2].value === null);
t('Veredicto: avisa si la venta real llega antes del corte', D.verdict(src([[1000, 1000]], { lastActual: '2026-09-20' }), { pages: [] }).caution.some((c) => /antes del corte/.test(c)));
t('Veredicto: sin plan lo dice y no calcula brecha', (() => { const r = mk([[1000, 1000]]); r.total.months[0].toDate.revenue = { actual: 5000, plan: null, gap: null, gapPct: null }; const q = D.verdict({ run: r, selection: src([]).selection, channel: 'total' }, { pages: [] }); return q.kpis[1].value === null && /no hay plan a la fecha/.test(q.conclusion); })());
t('Veredicto: aclara el alcance (canal digital, sin la venta total de la empresa) y no trae margen, ROI, ROAS ni CAC', v.notes.some((n) => /no mide la venta total de la empresa/.test(n)) && !/margen|ROI|ROAS|CAC/i.test(JSON.stringify(v.kpis) + v.conclusion));
t('Veredicto: sin días contados se omite con motivo', (() => { const r = mk([]); r.total.months[0].countedDays = 0; return D.verdict({ run: r, selection: src([]).selection, channel: 'total' }, { pages: [] }).status === 'omitted'; })());

/* ---- riesgo y oportunidad ---- */
const ro = D.riskOpp(src([[900, 1000], [1100, 1000], [970, 1000]]));
t('Riesgo y oportunidad: nombra el canal que más resta y el que más suma, con conteos del semáforo', ro.status === 'included' && ro.subtract[0].label === FP.config.channels[0].label && ro.add[0].label === FP.config.channels[1].label && ro.counts.ok + ro.counts.watch + ro.counts.alert === CH.length && /concentra la brecha/.test(ro.conclusion) && /la compensa en parte/.test(ro.conclusion), ro.conclusion);
t('Riesgo y oportunidad: solo muestra hasta 3 que restan y 3 que suman, de mayor a menor', ro.subtract.length <= 3 && ro.add.length <= 3 && ro.subtract.every((r) => r.gap < 0) && ro.add.every((r) => r.gap > 0));
t('Riesgo y oportunidad: usa el mismo semáforo y los mismos umbrales que Gerencial (los de la persona también)', D.riskOpp(src([[900, 1000]], { thresholds: { alertPct: 0.2 } })).counts.alert === 0 && D.riskOpp(src([[900, 1000]])).counts.alert === 1);
t('Riesgo y oportunidad: con un canal elegido se omite con el motivo del semáforo', D.riskOpp(src([[900, 1000]], { channel: CH[0] })).status === 'omitted');

/* ---- compositor: perfil estricto ---- */
const pg = (id, extra) => ({ id, title: id, status: 'included', ...(extra || {}) });
const rep = () => ({ schema: 'executive_report', schemaVersion: '1.0.0', pages: [pg('cover'), pg('summary'), pg('drivers'), pg('pacing'), pg('movers'), pg('trends'), pg('closing'), pg('decisions'), rel(), pg('annex', { omitted: [] })], included: [], omitted: [], total: 0 });
const full = B.extend(rep(), src([[900, 1000], [1100, 1000], [970, 1000]], { recovery: { actions: [{ actionId: 'A', title: 'Acción', channel: CH[0], period: { start: '2026-09-01', end: '2026-09-22' }, owner: null, status: 'proposed', priority: {}, expectedImpact: { incrementalValue: 100, recoveryPercent: 0.1 }, startDate: '2026-09-01', endDate: '2026-09-22' }] } }), P.get('directivo'));
const plan = (d) => C.compose(full, { profile: 'directivo', depth: d, exclude: [] });
t('Compositor: Resumen = portada, veredicto y decisiones', plan('resumen').slides.map((s) => s.id).join() === 'cover,verdict,decisions', plan('resumen').slides.map((s) => s.id).join());
t('Compositor: Ejecutivo suma riesgo y oportunidad y oportunidades priorizadas, antes de las decisiones', plan('ejecutivo').slides.map((s) => s.id).join() === 'cover,verdict,riskOpp,opportunities,decisions');
t('Compositor: Detallado agrega pacing y quién suma y resta; el anexo, si no se quita, va al final', (() => { const s = plan('detallado').slides.map((x) => x.id).join(); return s.startsWith('cover,verdict,riskOpp,opportunities,pacing,movers,decisions') && s.endsWith('annex,annex,annex'); })());
t('Compositor: las páginas del reporte que el formato no lista (resumen, factores, tendencias, cierre) quedan fuera con el motivo «fuera-de-perfil»', (() => { const e = plan('detallado').excluded.filter((x) => x.kind === 'fuera-de-perfil').map((x) => x.block).sort().join(); return e === 'closing,drivers,summary,trends' && plan('detallado').excluded.find((x) => x.block === 'summary').reason === 'No forma parte del formato «Directivo».'; })());
t('Perfiles no estrictos no cambian: Gerencial y Operativo no excluyen páginas por «fuera-de-perfil»', ['gerencial', 'operativo', 'legacy'].every((id) => !C.compose(B.extend(rep(), src([]), P.get(id)), { profile: id, exclude: [] }).excluded.some((x) => x.kind === 'fuera-de-perfil')));
t('No modifica la entrada', (() => { const s = src([[900, 1000]]), j = JSON.stringify(s); D.verdict(s, { pages: [] }); D.riskOpp(s); return JSON.stringify(s) === j; })());
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
