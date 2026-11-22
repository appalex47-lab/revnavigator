#!/usr/bin/env node
/* Fase 4.1 · Decisión 1 — pruebas del contrato `cc.plan_status` (js/commandCenter/planStatus.js). Datos SIMULADOS.
 *   A) escenarios de negocio (los 12 pedidos) · B) equivalencia exacta con FP.gap.pacingStatus (100 000 casos + bordes) y con el contrato de Fase 2 ·
 *   C) determinismo · D) CARACTERIZACIÓN de las reglas divergentes que hoy conviven en la aplicación (documenta el defecto; cambiará al migrar en 4.2) · E) mutaciones.
 *   node tools/test-fase4-1-estado-comercial.js */
const fs = require('fs'), path = require('path'), Module = require('module');
global.window = global; global.FP = {};
const R = path.join(__dirname, '..');
['js/config/config.js', 'js/calculations/metrics.js', 'js/calculations/gap.js', 'js/commandCenter/planStatus.js'].forEach((f) => require(path.join(R, f)));
const PS = FP.planStatus, CC = require('./audit/command-center-contracts.js');
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
const S = (o) => PS.classify({ planToDate: 1000, actualToDate: 1000, daysCounted: 10, planAvailable: true, ...o }).state;

/* ---------- A) escenarios ---------- */
t('A1 arriba del plan (1.05)', S({ actualToDate: 1050 }) === 'above');
t('A2 exactamente en el plan (1.00)', S({ actualToDate: 1000 }) === 'on_plan');
t('A3 dentro de tolerancia por debajo (0.995) y por encima (1.005)', S({ actualToDate: 995 }) === 'on_plan' && S({ actualToDate: 1005 }) === 'on_plan');
t('A4 fuera de tolerancia: 0.98 es «por debajo» y 1.02 «por encima»', S({ actualToDate: 980 }) === 'below' && S({ actualToDate: 1020 }) === 'above');
t('A5 por debajo del plan (0.90)', S({ actualToDate: 900 }) === 'below');
t('A6 plan igual a cero: plan no disponible (no se divide ni se inventa un estado)', S({ planToDate: 0 }) === 'plan_unavailable');
t('A7 plan inexistente: plan no disponible', S({ planAvailable: false }) === 'plan_unavailable' && S({ planToDate: null }) === 'plan_unavailable');
t('A8 venta observada SIN plan: la venta válida se conserva (observedValid) aunque no haya estado', (() => { const r = PS.classify({ planAvailable: false, actualToDate: 5000, daysCounted: 10 }); return r.state === 'plan_unavailable' && r.observedValid === true && r.compliance === null; })());
t('A9 sin actividad verificada (cero) ≠ sin dato', S({ activityVerifiedZero: true, actualToDate: 0 }) === 'no_activity' && S({ actualToDate: null }) === 'insufficient_data');
t('A10 datos insuficientes: sin venta real, sin días contados o negativos', S({ actualToDate: null }) === 'insufficient_data' && S({ daysCounted: 0 }) === 'insufficient_data' && S({ actualToDate: -5 }) === 'insufficient_data');
t('A11 periodo no comparable: no se promueve a «en plan»', S({ comparable: false }) === 'not_comparable' && S({ comparable: false, actualToDate: 1000 }) !== 'on_plan');
t('A12 confiabilidad Insuficiente no clasifica; Baja clasifica como preliminar', S({ reliabilityLevel: 'Insuficiente' }) === 'insufficient_data' && (() => { const r = PS.classify({ planToDate: 1000, actualToDate: 900, daysCounted: 5, planAvailable: true, reliabilityLevel: 'Baja' }); return r.state === 'below' && r.preliminary === true; })());
t('A13 venta real cero con actividad NO verificada como cero: es «por debajo» (0 % del plan), no «sin dato»', S({ actualToDate: 0 }) === 'below');
t('A14 canales y agregaciones: cada nivel se clasifica con SU cumplimiento; el total no es el promedio de los estados', (() => { const ch = [{ p: 600, a: 660 }, { p: 400, a: 340 }], tot = { p: 1000, a: 1000 }; return PS.classify({ planToDate: ch[0].p, actualToDate: ch[0].a, daysCounted: 5, planAvailable: true }).state === 'above' && PS.classify({ planToDate: ch[1].p, actualToDate: ch[1].a, daysCounted: 5, planAvailable: true }).state === 'below' && PS.classify({ planToDate: tot.p, actualToDate: tot.a, daysCounted: 5, planAvailable: true }).state === 'on_plan'; })());
t('A15 el estado lleva sus razones y su contrato; no se confunde falta de información con desempeño negativo', (() => { const r = PS.classify({ planAvailable: false, actualToDate: 1, daysCounted: 1 }); return r.contract === 'cc.plan_status/1' && r.reasons.includes('plan_no_disponible') && r.state !== 'below'; })());

/* ---------- B) equivalencia ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(20261201); let diff = [], N = 100000;
for (let k = 0; k < N; k++) { const plan = Math.round(1e4 + r() * 5e7) / 100, comp = 0.9 + r() * 0.2, actual = Math.round(plan * comp * 100) / 100; const ref = FP.gap.pacingStatus(actual / plan), mine = PS.classify({ planToDate: plan, actualToDate: actual, daysCounted: 7, planAvailable: true }).state; if (ref !== mine) diff.push([plan, actual, ref, mine]); }
t(`B1 equivalencia exacta con FP.gap.pacingStatus en ${N} casos aleatorios (estados above/on_plan/below)`, !diff.length, diff.slice(0, 3));
const edges = [0.98999999, 0.99, 0.99000001, 1.00999999, 1.01, 1.01000001].map((c) => Math.round(c * 1e8) / 1e8);
t('B2 equivalencia en los bordes exactos de la tolerancia (0.99 y 1.01)', edges.every((c) => FP.gap.pacingStatus(c) === PS.classify({ planToDate: 1e8, actualToDate: c * 1e8, daysCounted: 3, planAvailable: true }).state) && [99, 100, 101, 98, 102].every((v) => FP.gap.pacingStatus(v / 100) === PS.classify({ planToDate: 100, actualToDate: v, daysCounted: 3, planAvailable: true }).state));
const MAP = { arriba: 'above', en_plan: 'on_plan', debajo: 'below' };
t('B3 equivalencia con el eje de cumplimiento del contrato aceptado de Fase 2 (classifyBusinessState)', Array.from({ length: 2000 }, () => 0.9 + r() * 0.2).every((c) => { const cc = CC.classifyBusinessState({ compliance: c, coverage: 1 }).axes.C; return MAP[cc] === PS.classify({ planToDate: 1, actualToDate: c, daysCounted: 5, planAvailable: true }).state; }));
t('B4 la tolerancia sale de UNA fuente: FP.config.forecast.pacingThresholds; el contrato NO define umbrales propios ni de respaldo (cierre 4.1/4.2): sin configuración ni umbrales explícitos falla con mensaje claro', (() => { const th = PS.thresholdsFrom(); const c = FP.config.forecast.pacingThresholds; const noCfg = (() => { const saved = FP.config; FP.config = undefined; try { PS.thresholdsFrom(); return null; } catch (e) { return e.message; } finally { FP.config = saved; } })(); const explicit = (() => { const saved = FP.config; FP.config = undefined; try { return PS.thresholdsFrom({ thresholds: { aboveFrom: 1.2, onPlanFrom: 0.8 } }); } finally { FP.config = saved; } })(); return th.aboveFrom === c.aboveFrom && th.onPlanFrom === c.onPlanFrom && /requiere umbrales/.test(noCfg || '') && explicit.aboveFrom === 1.2; })());
t('B5 los umbrales por parámetro (opts.thresholds) sustituyen a la configuración sin modificarla', PS.classify({ planToDate: 100, actualToDate: 97, daysCounted: 3, planAvailable: true }, { thresholds: { aboveFrom: 1.05, onPlanFrom: 0.95 } }).state === 'on_plan' && FP.config.forecast.pacingThresholds.onPlanFrom === 0.99);

/* ---------- C) determinismo ---------- */
t('C1 la misma entrada produce exactamente el mismo resultado (determinismo) y la entrada no se modifica', (() => { const i = Object.freeze({ planToDate: 1234.56, actualToDate: 1200, daysCounted: 9, planAvailable: true }); return JSON.stringify(PS.classify(i)) === JSON.stringify(PS.classify(i)); })());

/* ---------- D) caracterización HISTÓRICA: las reglas divergentes ANTES de P-01 (home ±2 %, contextEngine 0.05 % se conservan aquí como constantes para documentar el defecto D-1 y dimensionar el cambio) ---------- */
const src = (f) => fs.readFileSync(path.join(R, f), 'utf8');
const bands = { homePlanBand: FP.config.diagnostics ? null : null };
const cfg = src('js/config/config.js'), home = src('js/ui/guidance/home-resumen.js'), ctx = src('js/ui/guidance/contextEngine.js'), chg = src('js/ui/chg-resumen.js'), story = src('js/agents/analistaStory.js');
t('D0 estado ACTUAL del código (reapertura): home-resumen y contextEngine consumen cc.plan_status/1 (que delega en FP.gap.pacingStatus); las escalas de chg-resumen y analistaStory (otro concepto) siguen; el reporte ya no tiene escala propia (P-11); el umbral de config es único', /FP\.planStatus\.classify/.test(home) && /FP\.planStatus\.classify/.test(ctx) && !/planBand/.test(cfg) && /r <= -0\.05/.test(chg) && /Math\.abs\(rel\) < 0\.005/.test(story) && /pacingThresholds: \{ aboveFrom: 1\.01, onPlanFrom: 0\.99 \}/.test(cfg) && !/c >= 1\.02/.test(src('js/report/reportCopy.js')) && /belowPlanPct:\s*0\.005/.test(cfg) && /okPct:\s*0\.01/.test(cfg));
const SITES = {
  canonico: (c) => PS.classify({ planToDate: 1, actualToDate: c, daysCounted: 5, planAvailable: true }).state === 'above' ? 'arriba' : PS.classify({ planToDate: 1, actualToDate: c, daysCounted: 5, planAvailable: true }).state === 'on_plan' ? 'en_plan' : 'debajo',
  homeResumen: (c) => (c - 1 >= 0.02 ? 'arriba' : c - 1 > -0.02 ? 'en_plan' : 'debajo'),
  contextEngine: (c) => (Math.abs(c - 1) < 0.0005 ? 'en_plan' : c < 1 ? 'debajo' : 'arriba'),
  chgResumen: (c) => { const rr = c - 1; return rr <= -0.05 ? 'debajo' : rr <= -0.01 ? 'debajo (ligero)' : rr >= 0.02 ? 'arriba' : 'en_plan'; },
  analistaStory: (c) => (Math.abs(c - 1) < 0.005 ? 'en_plan' : c < 1 ? 'debajo' : 'arriba')
};
const probe = [0.985, 0.995, 0.998, 1.005, 1.015];
const rows = probe.map((c) => ({ c, ...Object.fromEntries(Object.entries(SITES).map(([k, fn]) => [k, fn(c)])) }));
const contradictory = rows.filter((x) => new Set(Object.values(x).slice(1).map((v) => v.replace(' (ligero)', ''))).size > 1);
t(`D1 (defecto D-1 documentado) la misma cifra se clasifica distinto según el sitio: ${contradictory.length} de ${probe.length} cumplimientos de prueba producen estados contradictorios`, contradictory.length >= 4, rows);
t('D2 el caso observado en la revisión visual (99.8 %): el titular del Inicio dice «en plan» y el indicador de contextEngine «por debajo»', SITES.homeResumen(0.998) === 'en_plan' && SITES.contextEngine(0.998) === 'debajo');
t('D3 el contrato único NO coincide con la banda ±2 % del titular del Inicio (por eso migrar exige aprobar la tolerancia): 98.5 % es «debajo» en el canónico y «en plan» en el titular', SITES.canonico(0.985) === 'debajo' && SITES.homeResumen(0.985) === 'en_plan');

/* ---------- E) mutaciones ---------- */
const FILE = path.join(R, 'js/commandCenter/planStatus.js'), SRC = fs.readFileSync(FILE, 'utf8');
function mutate(from, to) { if (!SRC.includes(from)) return 'sin patrón'; const m = new Module(FILE.replace('.js', '.mut.js'), module); m.filename = FILE.replace('.js', '.mut.js'); m.paths = Module._nodeModulePaths(path.dirname(FILE)); const g = { FP: { config: FP.config, gap: FP.gap } }; const sandbox = new Function('window', 'globalThis', 'module', SRC.replace(from, to).replace('typeof window !== \'undefined\' ? window : globalThis', 'window')); const mod = { exports: {} }; sandbox(g, g, mod); return g.FP.planStatus; }
const probes = [[1050, 'above'], [1015, 'above'], [1000, 'on_plan'], [995, 'on_plan'], [900, 'below'], [980, 'below']];
const caught = (P) => typeof P === 'string' || probes.some(([a, e]) => P.classify({ planToDate: 1000, actualToDate: a, daysCounted: 5, planAvailable: true }).state !== e) || P.classify({ planAvailable: false, actualToDate: 5, daysCounted: 1 }).state !== 'plan_unavailable' || P.classify({ planToDate: 0, actualToDate: 5, daysCounted: 1, planAvailable: true }).state !== 'plan_unavailable' || P.classify({ planToDate: 1000, actualToDate: 1000, daysCounted: 1, planAvailable: false }).state !== 'plan_unavailable' || P.classify({ planToDate: 1000, actualToDate: 1000, daysCounted: 5, planAvailable: true, comparable: false }).state !== 'not_comparable' || P.classify({ activityVerifiedZero: true, planToDate: 1, actualToDate: 0, daysCounted: 5, planAvailable: true }).state !== 'no_activity';
t('E1 mutación (4.2: la clasificación se delega en FP.gap.pacingStatus): el contrato deja de pasar los umbrales efectivos → se detecta', caught(mutate('FP.gap.pacingStatus(compliance, th)', 'FP.gap.pacingStatus(compliance, { aboveFrom: 1.02, onPlanFrom: 0.99 })')));
t('E2 mutación: plan igual a cero deja de ser «plan no disponible» → se detecta', caught(mutate("i.planToDate === 0", 'false')));
t('E3 mutación: el periodo no comparable se ignora → se detecta', caught(mutate('i.comparable === false', 'false')));
t('E4 mutación: la ausencia de plan se trata como cumplimiento → se detecta', caught(mutate('i.planAvailable === false', 'false')));
t('E5 mutación: la actividad cero verificada se ignora → se detecta', caught(mutate('i.activityVerifiedZero === true', 'false')));
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
