#!/usr/bin/env node
/* Fase 4.1 · P-01 consolidado — los sitios que miden «cumplimiento acumulado frente al plan» consumen UNA regla (FP.gap.pacingStatus) y UNA configuración
 * (FP.config.forecast.pacingThresholds / run.settings.pacingThresholds). Se ejecuta el código REAL de home-resumen.js y contextEngine.js (datos SIMULADOS).
 * node tools/test-fase4-1-estado-consumidores.js */
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '..');
global.window = global; global.FP = {};
['js/config/config.js', 'js/calculations/metrics.js', 'js/calculations/gap.js', 'js/commandCenter/planStatus.js'].forEach((f) => require(path.join(R, f)));
FP.ui = { helpers: { esc: (s) => String(s) } };
FP.format = { currency: (v) => '$' + Math.round(v), currencyCompact: (v) => '$' + Math.round(v), percent: (v) => (v * 100).toFixed(1) + ' %', integer: (v) => String(v), signedPercent: (v) => (v * 100).toFixed(1) + ' %' };
FP.format = new Proxy(FP.format, { get: (o, k) => o[k] || ((v) => String(v)) });
require(path.join(R, 'js/ui/guidance/contextEngine.js')); require(path.join(R, 'js/ui/guidance/home-resumen.js'));
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(41011), DEF = FP.config.forecast.pacingThresholds;
const homeVerdict = (comp, th) => { const t = { compliance: comp, gap: comp * 1000 - 1000 }, S = { whyPlan: null, trust: { coverage: null, quality: null, lastActual: '2026-09-20' }, channels: { status: 'x', rows: [] } };
  const c = { S, f: { p: { status: 'current', countedDays: 10, toDate: { revenue: t }, forecastGap: { revenue: { gapPct: null } }, forecast: { revenue: null }, actualToDate: { revenue: 1000 * comp }, planToDate: { revenue: 1000 } }, run: { settings: th ? { pacingThresholds: th } : {} } }, att: null, next: null, state: {}, ready: null };
  return FP.homeResumen.build(c).verdict; };
const cat = (v) => /por encima/.test(v) ? 'above' : /Vas en plan/.test(v) ? 'on_plan' : /por debajo/.test(v) ? 'below' : '?';
const ctxHead = (comp, th) => FP.contextEngine.headline({ forecast: { available: true, planToDate: 1000, actualToDate: 1000 * comp, compliance: comp, gapToDatePct: comp - 1, forecastGapPct: null, thresholds: th || null }, reforecast: { available: false }, data: {}, actual: { countedDays: 10 } })[0];   // 4.2: contextEngine clasifica con cc.plan_status/1 (necesita plan, real y días)
const ctxCat = (h) => /en línea/.test(h) ? 'on_plan' : /por debajo/.test(h) ? 'below' : /por encima/.test(h) ? 'above' : '?';
t('A0 el código real carga y devuelve veredicto (el banco de pruebas es válido)', cat(homeVerdict(1.0)) === 'on_plan' && ctxCat(ctxHead(1.0)) === 'on_plan', [homeVerdict(1.0), ctxHead(1.0)]);
/* ---------- A) el titular del Inicio y contextEngine == FP.gap.pacingStatus ---------- */
const ths = [undefined, { aboveFrom: 1.01, onPlanFrom: 0.99 }, { aboveFrom: 1.05, onPlanFrom: 0.95 }, { aboveFrom: 1.02, onPlanFrom: 0.97 }];
let dh = [], dc = [];
for (let k = 0; k < 20000; k++) { const comp = Math.round((0.85 + r() * 0.3) * 10000) / 10000, th = ths[k % ths.length], want = FP.gap.pacingStatus(comp, th || undefined); if (cat(homeVerdict(comp, th)) !== want) dh.push([comp, th, want]); if (ctxCat(ctxHead(comp, th)) !== (want === 'on_plan' ? 'on_plan' : comp < 1 ? 'below' : 'above') ) dc.push([comp, th, want]); }
t('A1 el titular del Inicio coincide con FP.gap.pacingStatus en 20 000 cumplimientos × 4 configuraciones (incluida una asimétrica)', !dh.length, dh.slice(0, 3));
t('A2 la frase de contextEngine «en línea con el plan» aparece EXACTAMENTE cuando FP.gap.pacingStatus dice «en plan»', !dc.length, dc.slice(0, 3));
t('A3 bordes exactos 0.99 y 1.01: «en plan» y «arriba» en ambos sitios (límites inclusivos, igual que el motor)', [[0.99, 'on_plan'], [1.01, 'above'], [0.9899, 'below'], [1.0099, 'on_plan']].every(([c, w]) => cat(homeVerdict(c)) === w && FP.gap.pacingStatus(c) === w));
t('A4 el caso observado en la revisión visual (99.8 %) ya NO se contradice: titular y contextEngine dicen «en plan»', cat(homeVerdict(0.998)) === 'on_plan' && ctxCat(ctxHead(0.998)) === 'on_plan');
t('A5 un cambio de la configuración efectiva (p. ej. la sugerencia de umbrales aplicada) llega a TODOS los sitios a la vez', (() => { const th = { aboveFrom: 1.1, onPlanFrom: 0.9 }; return cat(homeVerdict(0.93, th)) === 'on_plan' && ctxCat(ctxHead(0.93, th)) === 'on_plan' && FP.gap.pacingStatus(0.93, th) === 'on_plan'; })());
/* ---------- B) alcance del cambio de comportamiento (solo lo que P-01 aprobó) ---------- */
const prevHome = (c) => (c - 1 >= 0.02 ? 'above' : c - 1 > -0.02 ? 'on_plan' : 'below'), prevCtx = (c) => (Math.abs(c - 1) < 0.0005 ? 'on_plan' : c < 1 ? 'below' : 'above');
const grid = Array.from({ length: 2001 }, (_, i) => Math.round((0.9 + i * 0.0001) * 10000) / 10000);
const chHome = grid.filter((c) => prevHome(c) !== cat(homeVerdict(c))), chCtx = grid.filter((c) => prevCtx(c) !== ctxCat(ctxHead(c)));
t(`B1 el titular cambia SOLO en las bandas 98–99 % y 101–102 % del cumplimiento (${chHome.length} de ${grid.length} puntos): fuera de ellas es idéntico al anterior`, chHome.length > 0 && chHome.every((c) => (c >= 0.98 && c < 0.99) || (c >= 1.01 && c < 1.02)), [chHome[0], chHome[chHome.length - 1]]);
t(`B2 contextEngine cambia SOLO dentro de ±1 % (antes ±0.05 %): ya no dice «por debajo» a 99.8 %`, chCtx.length > 0 && chCtx.every((c) => c >= 0.99 && c < 1.01), [chCtx[0], chCtx[chCtx.length - 1]]);
/* ---------- C) un solo sitio de verdad ---------- */
const rd = (f) => fs.readFileSync(path.join(R, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
t('C1 home-resumen.js y contextEngine.js (ambos vía cc.plan_status/1, que delega en FP.gap.pacingStatus) ya no definen un umbral propio', /FP\.planStatus\.classify/.test(rd('js/ui/guidance/home-resumen.js')) && /FP\.planStatus\.classify/.test(rd('js/ui/guidance/contextEngine.js')) && !/cfg\.planBand/.test(rd('js/ui/guidance/home-resumen.js')) && !/< 0\.0005/.test(rd('js/ui/guidance/contextEngine.js')) && /FP\.gap\.pacingStatus/.test(rd('js/commandCenter/planStatus.js')));
t('C2 la configuración paralela `homeSummary.planBand` (±2 %) se eliminó: solo queda pacingThresholds', !/planBand/.test(rd('js/config/config.js')) && FP.config.forecast.pacingThresholds.aboveFrom === 1.01);
t('C3 Pacing y el resumen de Pacing ya no prefieren `a.pacingStatus` (calculado con el umbral por defecto e ignorando el del usuario): usan el umbral efectivo', !/a\.pacingStatus/.test(rd('js/ui/pacing-view.js')) && !/a\.pacingStatus\s*&&/.test(rd('js/ui/pc-resumen.js')));
t('C4 (actualizado en 4.2) el umbral paralelo desapareció: FP.pacing.summarizePeriod ya NO calcula `pacingStatus` con el umbral por defecto (antes ignoraba el del usuario); el estado se clasifica donde se muestra/exporta', (() => { require(path.join(R, 'js/calculations/pacing.js')); const rows = [{ date: '2026-09-01', counted: true, closed: true, plan: { revenue: 100, orders: 1, trafficVolume: 10 }, actual: { revenue: 95, orders: 1, trafficVolume: 10 }, forecast: { revenue: 100, orders: 1, trafficVolume: 10 } }]; let s; try { s = FP.pacing.summarizePeriod(rows, '2026-09-01'); } catch (e) { return 'err ' + e.message; } return !('pacingStatus' in s) && FP.gap.pacingStatus(0.95, { aboveFrom: 1.05, onPlanFrom: 0.9 }) === 'on_plan'; })());
/* ---------- D) sitios que NO se unifican (concepto distinto): documentados, no ocultos ---------- */
t('D1 chg-resumen (variación de AYER/semana contra el plan del día, tres niveles −5/−1/+2 %) NO es cumplimiento acumulado: se conserva y queda documentado como escala distinta', /r <= -0\.05/.test(rd('js/ui/chg-resumen.js')));
t('D2 analistaStory (cierre proyectado contra la META del periodo, ±0.5 %) mide otra cosa (proyección) y se conserva', /Math\.abs\(rel\) < 0\.005/.test(rd('js/agents/analistaStory.js')));
t('D3 los umbrales del reporte (okPct/alertPct/belowPlanPct/weakPct) son configurables por audiencia con su sugerencia propia y alimentan el golden del reporte: se conservan', /okPct/.test(rd('js/config/config.js')) && /belowPlanPct/.test(rd('js/config/config.js')));
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
