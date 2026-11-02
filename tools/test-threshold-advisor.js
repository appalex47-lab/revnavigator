#!/usr/bin/env node
/* Sugerencia de umbrales con historial (js/forecast/thresholdAdvisor.js).  node tools/test-threshold-advisor.js */
const fs = require('fs'), vm = require('vm');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 400) : '')); if (!c) bad++; };
const ctx = { console, Math, Number, Object, Array, Date, JSON, String, Map, Set, Error }; ctx.globalThis = ctx; ctx.window = undefined; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/forecast/thresholdAdvisor.js', 'utf8'), ctx);
const A = ctx.FP.thresholdAdvisor;
const blk = (gap) => ({ actual: 100 * (1 + gap), plan: 100, gap: 100 * gap, gapPct: gap });
const week = (i, gap, o) => ({ key: `2026-W${String(i).padStart(2, '0')}`, days: 7, countedDays: 7, toDate: { revenue: blk(gap), orders: blk(gap / 2), trafficVolume: blk(gap / 2), conversionRate: blk(gap / 3), aov: blk(gap / 4) }, ...o });
const GAPS = [0.002, -0.004, 0.006, -0.01, 0.012, -0.02, 0.025, -0.03, 0.005, -0.008];   // 10 semanas
const run = (gaps, over) => ({ cutoff: '2026-09-30', total: { weeks: gaps.map((g, i) => week(i + 1, g)) }, channels: { a: { weeks: gaps.map((g, i) => week(i + 1, g)) }, b: { weeks: gaps.map((g, i) => week(i + 1, g)) } }, ...over });

t('percentil: interpolación lineal (mediana y p75 de 1..5; vacío = null)', A.percentile([1, 2, 3, 4, 5], 0.5) === 3 && A.percentile([1, 2, 3, 4, 5], 0.75) === 4 && Math.abs(A.percentile([1, 2, 3, 4], 0.75) - 3.25) < 1e-12 && A.percentile([], 0.5) === null);
const s = A.suggest(run(GAPS));
const abs = GAPS.map(Math.abs), p75 = A.percentile(abs, 0.75), p90 = A.percentile(abs, 0.9);
t('con 10 semanas completas: estado «ready» con las semanas usadas y su rango', s.status === 'ready' && s.weeks === 10 && s.from === '2026-W01' && s.to === '2026-W10' && s.schema === 'threshold_suggestion', s);
t('en meta = percentil 75 y fuera de meta = percentil 90 de |brecha| semanal, redondeados a 0.1 pp', s.presentation.okPct === Math.round(p75 * 1000) / 1000 && s.presentation.alertPct === Math.round(p90 * 1000) / 1000 && s.presentation.weakPct === s.presentation.alertPct, [s.presentation, p75, p90]);
t('«en meta» siempre es menor que «fuera de meta» (al menos 0.1 pp) aunque los percentiles empaten', (() => { const q = A.suggest(run(Array(9).fill(0.01))); return q.status === 'ready' && q.presentation.alertPct - q.presentation.okPct >= 0.001 - 1e-12; })());
t('Forecast: «Arriba del plan desde» = 1 + en meta y «En plan desde» = 1 − en meta (banda simétrica)', Math.abs(s.pacing.aboveFrom - (1 + s.presentation.okPct)) < 1e-9 && Math.abs(s.pacing.onPlanFrom - (1 - s.presentation.okPct)) < 1e-9);
t('«bajo el plan» sale de los indicadores de cada canal (p75 de pedidos, volumen, conversión y ticket), no de la venta', s.presentation.belowPlanPct !== null && s.presentation.belowPlanPct < s.presentation.okPct && s.indicatorSamples === 2 * 4 * 10);
t('todo se acota entre 0.1 % y 20 % (brechas diminutas y enormes)', (() => { const lo = A.suggest(run(Array(10).fill(0.00001))), hi = A.suggest(run([0.9, -0.8, 0.7, 0.9, -0.9, 0.8, 0.9, 0.9, -0.7, 0.8])); return lo.presentation.okPct === 0.001 && hi.presentation.alertPct === 0.2 && hi.presentation.okPct <= 0.2; })());
t('sin historia suficiente (7 semanas) NO inventa: estado «insufficient» con cuántas hay y por qué', (() => { const q = A.suggest(run(GAPS.slice(0, 7))); return q.status === 'insufficient' && q.weeks === 7 && /7 semanas completas/.test(q.reason) && !('presentation' in q) && !('pacing' in q); })());
t('solo cuentan las semanas COMPLETAS con plan y real: las parciales, sin plan o sin real se ignoran', (() => { const w = GAPS.map((g, i) => week(i + 1, g)); w[0].countedDays = 3; w[1].toDate.revenue.plan = null; w[2].toDate.revenue.actual = null; w[3].toDate.revenue.gapPct = NaN; const q = A.suggest({ total: { weeks: w }, channels: {} }); return q.status === 'insufficient' && q.weeks === 6; })());
t('sin corrida, sin semanas o con datos raros no lanza y dice «insufficient»', [null, undefined, {}, { total: {} }, { total: { weeks: 'x' } }, { total: { weeks: [null, 1, {}] } }].every((r) => { try { return A.suggest(r).status === 'insufficient'; } catch (e) { return false; } }));
t('sin canales, «bajo el plan» queda null (no se inventa)', A.suggest({ total: { weeks: GAPS.map((g, i) => week(i + 1, g)) }, channels: {} }).presentation.belowPlanPct === null);
t('la evidencia dice cuántas semanas y qué porcentaje de ellas se aparta menos de lo normal/inusual', /10 semanas completas/.test(s.evidence) && /3 de cada 4/.test(s.evidence) && /9 de cada 10/.test(s.evidence), s.evidence);
t('es determinista y no modifica la corrida', (() => { const r = run(GAPS), j = JSON.stringify(r); const a = JSON.stringify(A.suggest(r)); return JSON.stringify(r) === j && a === JSON.stringify(A.suggest(r)); })());
t('differences(): lista solo lo que cambia contra lo vigente (y nada si no está lista)', (() => { const cur = { presentation: { okPct: s.presentation.okPct, alertPct: 0.5 }, defaults: { weakPct: s.presentation.weakPct, belowPlanPct: s.presentation.belowPlanPct }, pacing: { aboveFrom: s.pacing.aboveFrom, onPlanFrom: 0.5 } }; return A.differences(s, cur).join() === 'alertPct,pacing.onPlanFrom' && A.differences({ status: 'insufficient' }, cur).length === 0 && A.differences(null, cur).length === 0; })());
console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
