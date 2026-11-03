#!/usr/bin/env node
/* Hardening · fuente única de cálculo: Operativo, Gerencial y Directivo leen las mismas cifras del motor (run) y no las recalculan; los cálculos derivados que sí hay en
   presentación están fijados por un contrato y una prueba de equivalencia; y el orden de carga está declarado (si falta una dependencia, falla con un mensaje claro).   node tools/test-report-fuente-comun.js */
const fs = require('fs'), vm = require('vm');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 400) : '')); if (!c) bad++; };
const mkctx = () => { const c = { console, Math, Number, Object, Array, Date, JSON, Intl, String, Map, Set, Error }; c.globalThis = c; c.window = undefined; vm.createContext(c); return c; };
const LOAD = ['js/config/config.js', 'js/calendar/calendar.js', 'js/forecast/methodAdvisor.js', 'js/report/reportBuilder.js', 'js/report/profiles.js', 'js/report/blocks.js', 'js/report/catalog.js', 'js/report/operativo.js', 'js/report/oportunidades.js', 'js/report/gerencial.js', 'js/report/directivo.js', 'js/report/composer.js', 'js/report/voice.js'];
const ctx = mkctx(); LOAD.forEach((f) => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));
const FP = ctx.FP, O = FP.reportOperativo, G = FP.reportGerencial, D = FP.reportDirectivo, CH = FP.config.channels.map((c) => c.id);
const rev = (a, p) => ({ revenue: { actual: a, plan: p, gap: a - p, gapPct: a / p - 1, compliance: a / p } });
const mk = (vals, fc) => { const ch = {}; CH.forEach((id, i) => { const [a, p] = vals[i] || [1000, 1000]; ch[id] = { annual: { toDate: rev(a, p), countedDays: 10 }, months: [{ key: '2026-09', countedDays: 10, toDate: rev(a, p) }] }; });
  const A = CH.reduce((s, _, i) => s + (vals[i] || [1000, 1000])[0], 0), Pn = CH.reduce((s, _, i) => s + (vals[i] || [1000, 1000])[1], 0);
  return { year: 2026, cutoff: '2026-09-22', method: { id: 'm1' }, channels: ch, total: { annual: { toDate: rev(A, Pn), countedDays: 10 }, months: [{ key: '2026-09', countedDays: 10, toDate: rev(A, Pn), ...(fc === null ? {} : { forecast: { revenue: fc === undefined ? 33400 : fc } }) }] } }; };
const src = (vals, o, fc) => ({ run: mk(vals || [], fc), selection: { periodType: 'month', periodKey: '2026-09' }, channel: 'total', recovery: { actions: [] }, lastActual: '2026-09-22', ...o });
const rel = (o) => ({ id: 'reliability', title: 'Confiabilidad', status: 'included', annex: true, warning: null, suficiencia: { confidence: 'Limitada' }, ...o });
const kpi = (p, id) => ((p && p.kpis) || []).find((k) => k.id === id);
const CASES = { 'por debajo': [[900, 1000], [950, 1000], [1000, 1000], [800, 1000]], 'por encima': [[1100, 1000], [1050, 1000], [1200, 1000], [1000, 1000]], 'mixto': [[1500, 1000], [400, 1000], [1000, 1000], [1000, 1000]] };
Object.entries(CASES).forEach(([name, vals]) => {
  const s = src(vals), mo = s.run.total.months[0].toDate.revenue;
  const cp = O.channelPacing(s), sc = G.channelScorecard(s), vd = D.verdict(s, { pages: [] });
  const A = vals.reduce((a, v) => a + v[0], 0), P = vals.reduce((a, v) => a + v[1], 0);
  t(`[${name}] el total que usa el motor es la suma de sus canales (fixture coherente)`, mo.actual === A && mo.plan === P);
  t(`[${name}] Operativo: total del Pacing por canal = total del motor (real, plan y variación % tal cual, sin recalcular)`, cp.total.cells.revenue.actual === mo.actual && cp.total.cells.revenue.plan === mo.plan && Math.abs(cp.total.cells.revenue.gapPct - mo.gapPct) < 1e-12, cp.total && cp.total.cells.revenue);
  t(`[${name}] Gerencial: total del Cumplimiento por canal = total del motor`, sc.total.actual === mo.actual && sc.total.plan === mo.plan && Math.abs(sc.total.gapPct - mo.gapPct) < 1e-12, sc.total);
  t(`[${name}] Directivo: el veredicto trae la misma venta real y plan que el motor`, kpi(vd, 'real') && kpi(vd, 'real').value === mo.actual && kpi(vd, 'plan').value === mo.plan, vd.kpis);
  const rows = (k) => CH.map((id, i) => [id, vals[i] ? vals[i][0] : 1000]);
  t(`[${name}] cada canal de Operativo y de Gerencial coincide con el del motor`, CH.every((id, i) => { const r1 = cp.rows.find((r) => r.key === id), r2 = sc.rows.find((r) => r.key === id); const a = (vals[i] || [1000, 1000])[0]; return r1 && r2 && r1.cells.revenue.actual === a && r2.actual === a; }));
  t(`[${name}] los tres formatos coinciden entre sí: mismo real y mismo plan`, cp.total.cells.revenue.actual === sc.total.actual && sc.total.actual === kpi(vd, 'real').value && cp.total.cells.revenue.plan === sc.total.plan);
});
/* ---- cálculos derivados en presentación: contrato fijado. Si alguien añade otro, esta prueba obliga a documentarlo y probar su equivalencia ---- */
const ratioRe = /\b[a-zA-Z_.]+\s*\/\s*[a-zA-Z_.]+\s*-\s*1\b/g;   // «a / b − 1»: variación contra plan
const hits = {}; fs.readdirSync('js/report').filter((f) => /\.js$/.test(f)).forEach((f) => { const x = fs.readFileSync('js/report/' + f, 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n'); const m = x.match(ratioRe); if (m) hits[f] = m.length; });
t('la variación «a / b − 1» solo se calcula donde está documentado (Evolución de Operativo, sobre días del motor) y el resto la toma del motor', JSON.stringify(Object.keys(hits).filter((f) => f !== 'reportBuilder.js').sort()) === JSON.stringify(['operativo.js']), hits);
const ev = O.evolution && O.evolution.length;
t('Evolución (Operativo): la suma de sus filas por semana = el real del periodo que informa el motor', (() => {
  const days = []; for (let d = 1; d <= 20; d++) { const dd = String(d).padStart(2, '0'); days.push({ date: '2026-09-' + dd, month: '2026-09', weekKey: '2026-W' + (36 + Math.floor((d - 1) / 7)), counted: true, actual: { revenue: 100 + d, orders: 10 }, plan: { revenue: 100, orders: 10 } }); }
  const s = src(); s.run.total.days = days; const e = O.evolution(s); if (e.status !== 'included') return 'omitida: ' + e.reason;
  const sumRows = e.rows.reduce((a, r) => a + r.revenue.actual, 0), sumDays = days.reduce((a, d) => a + d.actual.revenue, 0);
  return Math.abs(sumRows - sumDays) < 1e-9 && e.rows.every((r) => Math.abs(r.revenue.deltaPct - (r.revenue.actual / r.revenue.plan - 1)) < 1e-12);
})() === true);
/* ---- orden de carga declarado: si falta una dependencia, falla fuerte y claro (nunca se comporta distinto en silencio) ---- */
const need = (file, before) => { const c = mkctx(); let err = null; LOAD.filter((f) => f !== before && LOAD.indexOf(f) < LOAD.indexOf(file)).forEach((f) => { try { vm.runInContext(fs.readFileSync(f, 'utf8'), c); } catch (e) { /* una dependencia previa también puede faltar */ } }); try { vm.runInContext(fs.readFileSync(file, 'utf8'), c); } catch (e) { err = e; } return err; };
['js/report/operativo.js', 'js/report/gerencial.js', 'js/report/directivo.js'].forEach((f) => { const e = need(f, 'js/report/blocks.js'); t(`${f} sin blocks.js cargado antes: falla con mensaje explícito (no queda a medias)`, e && /cargad/i.test(e.message), e && e.message); });
if (process.env.DBG) { const s2 = src([[900,1000]]); console.log(JSON.stringify(O.channelPacing(s2).rows[0]).slice(0,300), JSON.stringify(G.channelScorecard(s2).rows[0]).slice(0,300)); }
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
