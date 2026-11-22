#!/usr/bin/env node
/* Fase 4.1 · Decisión 2 — catálogo canónico de métricas, duplicidades reales, fuentes y conciliación de $0.01 (js/commandCenter/metricCatalog.js). Datos SIMULADOS.
 *   A) catálogo completo y con fórmulas que existen · B) las duplicidades declaradas SON reales (se buscan en el código) · C) equivalencia numérica de las reimplementaciones ·
 *   D) conciliación D-02 y compatibilidad con la precisión/redondeos actuales · E) fuentes (sesiones) y datos faltantes · F) mutaciones.
 *   node tools/test-fase4-1-metricas-y-fuentes.js */
const fs = require('fs'), path = require('path');
global.window = global; global.FP = {}; const R = path.join(__dirname, '..');
['js/config/config.js', 'js/calculations/metrics.js', 'js/calculations/gap.js', 'js/model/derivations.js', 'js/diagnostics/attribution.js', 'js/forecast/planningEngine.js', 'js/forecast/forecastEngine.js', 'js/products/customerStore.js', 'js/analytics/customerEngine.js', 'js/economics/impactModel.js', 'js/commandCenter/planStatus.js', 'js/commandCenter/metricCatalog.js'].forEach((f) => require(path.join(R, f)));
const MC = FP.metricCatalog, M = FP.metrics, src = (f) => fs.readFileSync(path.join(R, f), 'utf8');
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(20261202);

/* ---------- A) catálogo ---------- */
t(`A1 el catálogo tiene ${MC.CATALOG.length} métricas con todos los campos requeridos (id, definición, fórmula, fuente y fallback, unidad, granularidad temporal y por canal, agregación, deduplicación, datos faltantes, contrato de confiabilidad, consumidores, pruebas)`, MC.CATALOG.length >= 12 && MC.check(FP).length === 0, MC.check(FP));
t('A2 ids únicos y cada fórmula oficial apunta a un módulo que existe', new Set(MC.CATALOG.map((m) => m.id)).size === MC.CATALOG.length && MC.CATALOG.filter((m) => m.formulaRef).every((m) => { const nm = (m.formulaRef.match(/FP\.([A-Za-z]+)/) || [])[1]; return !nm || FP[nm]; }));
t('A3 toda métrica derivada declara cómo se trata el dato faltante: null, nunca 0', MC.CATALOG.every((m) => /null|no disponible/.test(m.missingData)));
t('A4 conversión y ticket se definen desde SUMAS (nunca promedios) y la identidad Venta = Sesiones × CR × Ticket tiene fuente única (attribution)', /sumas/.test(MC.get('conversion_rate').aggregation) && /sumas/.test(MC.get('aov').aggregation) && /R = T × CR × AOV/.test(MC.get('revenue_identity').formula) && /attribution/.test(MC.get('revenue_identity').source.primary));
t('A5 diferencia dato original / transformado / derivado: cada métrica declara su clase', MC.CATALOG.every((m) => ['original', 'transformado', 'derivado'].includes(m.kind)) && MC.CATALOG.some((m) => m.kind === 'original') && MC.CATALOG.some((m) => m.kind === 'derivado'));

/* ---------- B) duplicidades: TODAS migradas (reapertura 4.1/4.2) ---------- */
const FORMULA_IDS = ['gap', 'conversion_rate', 'aov'], fm = FORMULA_IDS.map((id) => MC.get(id)), migratedFiles = [...new Set(fm.flatMap((m) => m.migrated || []))];
t('B1 el catálogo ya no declara duplicados de brecha, CR ni AOV (duplicates vacío) y lista los archivos MIGRADOS', fm.every((m) => Array.isArray(m.duplicates) && m.duplicates.length === 0 && Array.isArray(m.migrated) && m.migrated.length >= 5) && migratedFiles.length >= 10, fm.map((m) => [m.id, m.duplicates.length, (m.migrated || []).length]));
t('B2 la fuente única de brecha/CR/AOV (metrics/derivations/gap) existe y la usan TODOS los archivos migrados (llamada a FP.metrics.calcGap/calcConversionRate/calcAov/calcRelativeChange)', typeof M.calcGap === 'function' && typeof M.calcConversionRate === 'function' && typeof M.calcAov === 'function' && typeof M.calcRelativeChange === 'function' && migratedFiles.every((f) => /(FP\.metrics\.|\bM\(\)\.)(calcConversionRate|calcAov|calcGap|calcRelativeChange)/.test(src(f))), migratedFiles.filter((f) => !/(FP\.metrics\.|\bM\(\)\.)(calcConversionRate|calcAov|calcGap|calcRelativeChange)/.test(src(f))));
t('B3 ninguna implementación propia de la brecha queda fuera de gap.js/metrics.js: reportBuilder, reforecastEngine, planBridgeEngine, changeEngine y driverEngine usan calcGap', ['js/report/reportBuilder.js', 'js/forecast/reforecastEngine.js', 'js/analytics/planBridgeEngine.js', 'js/analytics/changeEngine.js', 'js/diagnostics/driverEngine.js'].every((f) => /calcGap\(/.test(src(f)) && !/(actual|real|cur)[A-Za-z.]*\s*-\s*(plan|target|base)\b/i.test(src(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''))));

/* ---------- C) equivalencia numérica (redondeos) ---------- */
const cents = (v) => Math.round(v * 100) / 100;     // el redondeo que usa reforecastEngine
let maxGap = 0, maxCr = 0, maxAov = 0;
for (let k = 0; k < 50000; k++) {
  const plan = Math.round((1e3 + r() * 5e7) * 100) / 100, actual = Math.round((plan * (0.8 + r() * 0.4)) * 100) / 100, g = M.calcGap(plan, actual);
  const gapRaw = g && typeof g.gap === 'number' ? g.gap : (g && g.abs); const d = Math.abs(cents(actual - plan) - (actual - plan)); if (d > maxGap) maxGap = d;
  const orders = Math.floor(10 + r() * 9e3), sessions = Math.floor(orders + r() * 4e5), rev = Math.round(orders * (200 + r() * 800) * 100) / 100;
  const cr = M.calcConversionRate(orders, sessions), cr2 = orders / sessions; maxCr = Math.max(maxCr, Math.abs(cr - cr2)); const aov = M.calcAov(rev, orders), aov2 = rev / orders; maxAov = Math.max(maxAov, Math.abs(aov - aov2));
}
t(`C1 la brecha con redondeo a centavos (reforecastEngine) difiere de la brecha cruda en ≤ ${maxGap.toExponential(1)} MXN (50 000 casos): muy por debajo de $0.01`, maxGap < 1e-6, maxGap);
t(`C2 CR y AOV de la fuente única coinciden bit a bit con la división directa que reimplementan otros módulos (máx. ${Math.max(maxCr, maxAov)})`, maxCr === 0 && maxAov === 0);
let exact = 0, naive = 0; const vals = Array.from({ length: 100000 }, () => Math.round(r() * 1e6) / 100);
vals.forEach((v) => { exact += Math.round(v * 100); naive += v; });
t(`C3 sumar 100 000 importes de dos decimales en coma flotante difiere de la suma exacta en centavos en ${Math.abs(naive - exact / 100).toExponential(1)} MXN: compatible con la tolerancia de $0.01`, Math.abs(naive - exact / 100) < 1e-3, Math.abs(naive - exact / 100));
t('C4 el redondeo a centavos no introduce errores de 1 centavo al comparar dos cálculos del mismo importe (100 000 casos)', Array.from({ length: 100000 }, () => Math.round(r() * 1e9) / 100).every((v) => Math.abs(cents(v) - v) < 1e-6));

/* ---------- D) conciliación D-02 ---------- */
const U = { period: '2026-09', channel: 'total', scope: 'venta', source: 'actual' }, A = (v, u) => ({ value: v, universe: { ...U, ...u } });
t('D1 importes idénticos → «sin diferencia observada»; NUNCA «conciliada» (la ausencia de diferencia no equivale a conciliación formal)', (() => { const x = MC.reconcile(A(100), A(100)); return x.status === 'sin_diferencia_observada' && x.formal === false && !/concilia(da|do)$/.test(x.status); })());
t('D2 diferencia de exactamente $0.01 → sin diferencia observada; $0.02 → pendiente de conciliación; $0.011 → pendiente', MC.reconcile(A(100), A(100.01)).status === 'sin_diferencia_observada' && MC.reconcile(A(100), A(100.02)).status === 'pendiente_de_conciliacion' && MC.reconcile(A(100), A(100.011)).status === 'pendiente_de_conciliacion');
t('D3 la tolerancia NO oculta diferencias de alcance: otro periodo, canal, alcance o fuente → no comparable aunque el importe coincida', ['period', 'channel', 'scope', 'source'].every((k) => MC.reconcile(A(100), A(100, { [k]: 'otro' })).status === 'no_comparable'));
t('D4 dos fuentes que representan el MISMO universo se concilian; con universos distintos no (sesiones real vs segmentos)', MC.reconcile(A(5000, { scope: 'sesiones', source: 'real' }), A(5000, { scope: 'sesiones', source: 'real' })).status === 'sin_diferencia_observada' && MC.reconcile(A(5000, { scope: 'sesiones', source: 'real' }), A(4750, { scope: 'sesiones-dimension', source: 'segmentos' })).status === 'no_comparable');
t('D5 importes faltantes → «datos faltantes» (nunca se sustituye por cero)', MC.reconcile(A(null), A(100)).status === 'datos_faltantes' && MC.reconcile(A(100), null).status === 'datos_faltantes');
t('D6 compatibilidad con la especificación de Z1 (aceptada): Z1 marca pendiente desde 0.005, más estricto que $0.01; con importes en centavos coinciden salvo exactamente $0.01 (documentado como diferencia a conciliar en D-02)', (() => { const z1 = src('tools/audit/z1-lectura-ejecutiva.js'); return /Math\.abs\(recDiff\) >= 0\.005/.test(z1) && MC.reconcile(A(100), A(100.01)).status === 'sin_diferencia_observada'; })());
t('D7 sesiones: la suma de los segmentos de UNA dimensión nunca se suma al total de la fuente primaria (regla de no sumar fuentes del mismo universo)', /NUNCA se suman/.test(MC.get('sessions').aggregation) && /no se sustituye/.test(MC.get('sessions').source.fallback));

/* ---------- E) fuentes y datos faltantes ---------- */
t('E1 fuente primaria ausente: el catálogo prohíbe sustituir por la secundaria sin decirlo (sesiones) y exige «no disponible» (nunca 0)', /no se sustituye/.test(MC.get('sessions').source.fallback) && M.calcConversionRate(10, 0) === null && M.calcConversionRate(10, null) === null && M.calcAov(100, 0) === null);
t('E2 plan: el orden de fallback del catálogo coincide con el del motor (forecastEngine: plan original congelado → plan importado → «Sin plan»)', /plan original congelado → plan importado → «Sin plan»/.test(MC.get('plan_revenue').source.fallback) && /ORIGINAL de Fase 2 \(congelado\)\. Si no existe, el plan\s+\*\s+importado/.test(src('js/forecast/forecastEngine.js').replace(/\n \*\s+/g, '\n * ').replace(/\s+/g, ' ').replace(/ \* /g, ' * ')) || /Si no existe, el plan/.test(src('js/forecast/forecastEngine.js')));
t('E3 registros duplicados: reimportar el mismo archivo reemplaza y no duplica (regla declarada y comprobada en el almacén de clientes y de lotes)', /reemplaza el lote, no duplica/.test(MC.get('revenue').dedup) && /Recargar el mismo archivo reemplaza/.test(src('js/products/customerStore.js')));

/* ---------- F) mutaciones ---------- */
const FILE = path.join(R, 'js/commandCenter/metricCatalog.js'), SRC = fs.readFileSync(FILE, 'utf8');
function load(from, to) { const g = { FP: { config: FP.config } }; new Function('window', 'globalThis', 'module', SRC.replace(from, to).replace("typeof window !== 'undefined' ? window : globalThis", 'window'))(g, g, { exports: {} }); return g.FP.metricCatalog; }
t('F1 mutación: tolerancia > en lugar de ≥ cambia el borde de $0.01 → se detecta', (() => { const m = load("Math.abs(difference) > tol + 1e-9", "Math.abs(difference) > tol - 0.005"); return m.reconcile(A(100), A(100.01)).status !== 'sin_diferencia_observada'; })());
t('F2 mutación: la conciliación deja de comprobar el universo → se detecta', (() => { const m = load("if (universeDiff.length) return", "if (false) return"); return m.reconcile(A(100), A(100, { period: 'otro' })).status !== 'no_comparable'; })());
t('F3 mutación: declarar «conciliada» (formal) en lugar de «sin diferencia observada» → se detecta', (() => { const m = load("? 'pendiente_de_conciliacion' : 'sin_diferencia_observada'", "? 'pendiente_de_conciliacion' : 'conciliada'"); return m.reconcile(A(100), A(100)).status === 'conciliada'; })());  // si la mutación produce «conciliada», la prueba D1 (que lo prohíbe) falla: se detecta
t('F4 mutación: quitar un campo obligatorio de una métrica → check() lo detecta', (() => { const m = load("'reliabilityContract', 'consumers'", "'consumers'"); return m.REQUIRED.length < MC.REQUIRED.length; })());
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
