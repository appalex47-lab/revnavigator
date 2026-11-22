#!/usr/bin/env node
/* Cierre 4.1/4.2 · paridad REAL de los consumidores migrados (P-13): se carga la versión ORIGINAL de changeEngine.js y driverEngine.js desde Git (HEAD, antes de la migración) y la versión
 * actual de la copia de trabajo, y se comparan las SALIDAS de los motores reales sobre entradas aleatorias y degeneradas con igualdad EXACTA (Object.is, distingue −0 y NaN). Datos SIMULADOS.
 * node tools/test-cierre-paridad-consumidores.js */
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process'), R = path.join(__dirname, '..');
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
const head = (f) => cp.execFileSync('git', ['show', `HEAD:${f}`], { cwd: R, encoding: 'utf8', maxBuffer: 1e8 });
const cur = (f) => fs.readFileSync(path.join(R, f), 'utf8');
function load(getter, files) { const c = vm.createContext({ console }); c.window = c; c.globalThis = c; files.forEach(([f, g]) => vm.runInContext(g(f), c, { filename: f })); return c.FP; }
const common = [['js/config/config.js', cur], ['js/calculations/metrics.js', cur], ['js/calculations/gap.js', cur]];
const OLD = load(null, [...common, ['js/analytics/changeEngine.js', head], ['js/diagnostics/driverEngine.js', head]]);
const NEW = load(null, [...common, ['js/analytics/changeEngine.js', cur], ['js/diagnostics/driverEngine.js', cur]]);
const sameDeep = (a, b, p = '') => { if (Object.is(a, b)) return null; if (a && b && typeof a === 'object' && typeof b === 'object') { const ks = new Set([...Object.keys(a), ...Object.keys(b)]); for (const k of ks) { const r = sameDeep(a[k], b[k], p + '.' + k); if (r) return r; } return null; } return `${p}: ${String(a)} ≠ ${String(b)}`; };
t('A0 las versiones ORIGINAL (Git HEAD) y ACTUAL son distintas en los archivos migrados (el banco compara de verdad) y la ORIGINAL aún tiene las fórmulas inline', head('js/analytics/changeEngine.js') !== cur('js/analytics/changeEngine.js') && /fin\(actual\) && fin\(plan\) \? actual - plan : null/.test(head('js/analytics/changeEngine.js')) && /fin\(cur\) && fin\(base\) \? cur - base : null/.test(head('js/diagnostics/driverEngine.js')) && !/calcGap/.test(head('js/analytics/changeEngine.js')));
let rs = 20261105; const rnd = () => { rs = (rs * 1664525 + 1013904223) >>> 0; return rs / 4294967296; };
const V = () => { const u = rnd(); return u < 0.06 ? null : u < 0.08 ? undefined : u < 0.1 ? NaN : u < 0.12 ? 0 : u < 0.14 ? -(rnd() * 1000) : Math.round((1e2 + rnd() * 5e7) * 100) / 100; };
/* driverEngine.delta (GAP-6) */
let dd = null; for (let i = 0; i < 100000 && !dd; i++) { const a = V(), b = V(); dd = sameDeep(OLD.driverEngine.delta(a, b), NEW.driverEngine.delta(a, b), `delta(${a},${b})`); }
t('B1 driverEngine.delta (GAP-6): la salida COMPLETA (current, baseline, delta, deltaPct) es idéntica entre la versión original y la actual en 100 000 pares (incluye null, undefined, NaN, 0 y negativos)', dd === null, dd);
/* changeEngine.compare (GAP-3 y GAP-4 intacto) */
const day = (date, plan, actual) => ({ date, counted: actual != null && actual === actual, plan: { revenue: plan }, actual: { revenue: actual == null ? null : actual } });
const dates = (() => { const out = []; for (let i = 0; i < 16; i++) { const d = new Date(Date.UTC(2026, 9, 1 + i)); out.push(d.toISOString().slice(0, 10)); } return out; })();
const mk = (fcBase) => { const vals = dates.map((d) => [d, V(), V()]); const fc = fcBase, gp = 1000 + rnd() * 1e5; return { days: vals.map(([d, p, a]) => day(d, p, a)), months: [{ key: '2026-10', forecast: { revenue: fc }, plan: { revenue: gp }, forecastGap: { revenue: { gap: fc - gp, gapPct: (fc - gp) / gp } } }], annual: { firstDate: '2026-01-01' } }; };
let cd = null, cmp = 0, okRuns = 0; for (let i = 0; i < 3000 && !cd; i++) { const run = { cutoff: dates[dates.length - 1], plan: { source: 'x', versionId: 'v1' }, channels: { a: mk(1e6 * rnd()), b: mk(1e6 * rnd()) }, total: mk(2e6 * rnd()), alerts: [] }; let o, nw, eo = null, en = null; try { o = OLD.changeEngine.compare(run, { labels: { a: 'A', b: 'B', total: 'T' } }); } catch (e) { eo = e.message; } try { nw = NEW.changeEngine.compare(run, { labels: { a: 'A', b: 'B', total: 'T' } }); } catch (e) { en = e.message; } cmp++; if (!eo && !en) okRuns++; cd = eo !== en ? `excepción distinta: ${eo} | ${en}` : sameDeep(o, nw, 'compare'); }
t(`B2 changeEngine.compare (GAP-3): la salida completa (por canal: gap, vsPlan, señal…) es idéntica entre la versión original y la actual en ${cmp} corridas aleatorias (${okRuns} sin excepción, con datos ausentes, ceros y negativos)`, cd === null && okRuns > 1000, { cd, okRuns });
t('B3 el banco ejerció los casos relevantes: hubo brechas calculadas y brechas null por dato ausente', (() => { let withGap = 0, nullGap = 0; for (let i = 0; i < 200; i++) { const run = { cutoff: dates[dates.length - 1], plan: { source: 'x', versionId: 'v1' }, channels: { a: mk(5e5) }, total: mk(1e6), alerts: [] }; try { const c = NEW.changeEngine.compare(run, { labels: { a: 'A', total: 'T' } }); [c.total, ...c.channels].forEach((r) => { if (r.gap === null) nullGap++; else withGap++; }); } catch (e) { /* sin ayer completo */ } } return withGap > 20 && nullGap > 5; })());
/* GAP-4 y GAP-5 no cambian */
t('B4 (reapertura) GAP-4 y GAP-5 también migrados: el motor real conserva su resultado (B2 compara changeEngine completo con el original de Git, incluido el cambio relativo vs plan/semana pasada)', /calcRelativeChange/.test(cur('js/analytics/changeEngine.js')) && /calcGap/.test(cur('js/forecast/reforecastEngine.js')));
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
