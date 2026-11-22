#!/usr/bin/env node
/* Fase 4.2 · Bloque E (P-13) — migración controlada de fórmulas. Solo se migran los casos MATEMÁTICAMENTE IDÉNTICOS: GAP-3 (changeEngine: brecha) y GAP-6 (driverEngine: delta contra base).
 * Hallazgo de 4.2: GAP-4 (changeEngine `pct = a/b − 1`) NO es idéntico bit a bit a `calcGap(...).pct = (a − b)/b` (difiere en el último dígito en ≈78 % de los casos): por eso la reapertura lo migra a una función canónica con la MISMA fórmula (calcRelativeChange), sin cambiar resultados.
 * Compara la fórmula ORIGINAL (transcrita) con la canónica de forma EXACTA (Object.is, no con tolerancia) y verifica que el código real ya usa la función canónica. Datos SIMULADOS.
 * node tools/test-fase4-2-p13-migracion.js */
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '..');
global.window = global; global.FP = {}; ['config/config.js', 'calculations/metrics.js'].forEach((f) => require(path.join(R, 'js', f)));
const M = FP.metrics, fin = (v) => typeof v === 'number' && Number.isFinite(v);
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
const src = (f) => fs.readFileSync(path.join(R, f), 'utf8'), strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const same = (a, b) => Object.is(a, b);
let rs = 4242; const rnd = () => { rs = (rs * 1664525 + 1013904223) >>> 0; return rs / 4294967296; };
const DEG = [0, -0, -3, 1e-9, 1e15, null, undefined, NaN, Infinity, -Infinity, 0.1, 0.2, 0.3];
const pairs = []; for (let i = 0; i < 200000; i++) { const p = Math.round((1e3 + rnd() * 5e7) * 100) / 100; pairs.push([p, Math.round(p * (0.6 + rnd() * 0.8) * 100) / 100]); }
DEG.forEach((a) => DEG.forEach((b) => pairs.push([a, b])));
/* ---------- fórmulas originales vs canónica ---------- */
const orig3 = (plan, actual) => (fin(actual) && fin(plan) ? actual - plan : null);                      // changeEngine.js (antes)
const orig6 = (base, cur) => (fin(cur) && fin(base) ? cur - base : null);                               // driverEngine.js (antes)
const origPct = (plan, actual) => (fin(actual) && fin(plan) && plan !== 0 ? actual / plan - 1 : null);  // changeEngine.js `pct` (NO migrado)
const d3 = pairs.filter(([p, a]) => !same(orig3(p, a), M.calcGap(p, a).abs)), d6 = pairs.filter(([b, c]) => !same(orig6(b, c), M.calcGap(b, c).abs));
t(`P1 GAP-3 (brecha del canal en changeEngine): la fórmula original y FP.metrics.calcGap(plan, real).abs son IDÉNTICAS bit a bit en ${pairs.length} pares (importes con centavos y 169 degenerados: 0, −0, negativos, null, undefined, NaN, ±Infinity)`, d3.length === 0, d3.slice(0, 3));
t(`P2 GAP-6 (delta contra base en driverEngine): idénticas bit a bit en los mismos ${pairs.length} pares`, d6.length === 0, d6.slice(0, 3));
t('P3 entradas, unidades y redondeo: ninguna de las dos redondea (MXN sin redondeo intermedio), ambas devuelven null ante un dato ausente o no finito y 0 solo cuando la diferencia es 0 real', pairs.filter(([a, b]) => !fin(a) || !fin(b)).every(([a, b]) => M.calcGap(a, b).abs === null) && M.calcGap(5, 5).abs === 0);
const dp = pairs.filter(([p, a]) => !same(origPct(p, a), M.calcGap(p, a).pct)); const validPairs = pairs.filter(([p, a]) => fin(p) && fin(a) && p !== 0);
t(`P4 HALLAZGO / NO MIGRAR GAP-4: `+'`a/b − 1` frente a `(a − b)/b` difiere en el último bit en ' + dp.filter(([p, a]) => fin(p) && fin(a) && p !== 0).length + ' de ' + validPairs.length + ' pares válidos: equivalente numéricamente, NO idéntico → queda fuera de P-13', dp.filter(([p, a]) => fin(p) && fin(a) && p !== 0).length > validPairs.length * 0.3);
/* ---------- el código real ya usa la función canónica ---------- */
t('M1 changeEngine.js usa FP.metrics.calcGap para la brecha y ya no contiene `actual − plan` inline', /gap: M\(\)\.calcGap\(plan, actual\)\.abs/.test(src('js/analytics/changeEngine.js')) && !/fin\(actual\) && fin\(plan\) \? actual - plan : null/.test(src('js/analytics/changeEngine.js')));
t('M2 driverEngine.js usa FP.metrics.calcGap para el delta y ya no contiene `cur − base` inline', /delta: M\(\)\.calcGap\(base, cur\)\.abs/.test(src('js/diagnostics/driverEngine.js')) && !/fin\(cur\) && fin\(base\) \? cur - base : null/.test(src('js/diagnostics/driverEngine.js')));
t('M3 (reapertura) GAP-4 (cambio relativo `a/b − 1`) se migró a la función canónica FP.metrics.calcRelativeChange —que conserva EXACTAMENTE esa fórmula, por eso es idéntica bit a bit, ver P4/B7 de test-reapertura-formulas— y GAP-5 (centavos) usa cents(calcGap().abs): el redondeo a centavos se conserva', /const pct = \(a, b\) => M\(\)\.calcRelativeChange\(a, b\)/.test(src('js/analytics/changeEngine.js')) && /cents\(FP\.metrics\.calcGap\(planToDate\.revenue, actualToDate\.revenue\)\.abs\)/.test(src('js/forecast/reforecastEngine.js')));
t('M4 (reapertura) los sitios de CR/AOV y brecha restantes también consumen la función canónica (migración completa; paridad de motores reales en test-reapertura-formulas)', [['js/ui/segments-view.js', /FP\.metrics\.calcConversionRate/], ['js/analytics/trafficConversionEngine.js', /FP\.metrics\.calcConversionRate/], ['js/projection/projection.js', /FP\.metrics\.calcConversionRate/], ['js/forecast/reforecastEngine.js', /FP\.metrics\.calcConversionRate/], ['js/promotions/opportunityEngine.js', /FP\.metrics\.calcAov/], ['js/ui/segmentInsights.js', /FP\.metrics\.calcConversionRate/], ['js/diagnostics/attribution.js', /FP\.metrics\.calcConversionRate/], ['js/report/reportBuilder.js', /FP\.metrics\.calcGap/], ['js/analytics/planBridgeEngine.js', /FP\.metrics\.calcGap/]].every(([f, re]) => re.test(src(f))));
t('M5 impactModel.js (y combineImpacts) intacto: hash de la línea base', require('crypto').createHash('sha256').update(src('js/economics/impactModel.js')).digest('hex') === JSON.parse(src('docs/command-center/generated/HASHES_BASE_3_3.json')).codigo_aplicacion['js/economics/impactModel.js']);
/* ---------- consumidores: el resultado del motor real no cambia ---------- */
t('C1 el motor real changeEngine (21 pruebas existentes) y atribución/diagnóstico (escenarios) siguen en verde con la función canónica', (() => { const cp = require('child_process'); return ['test-change-engine.js', 'test-atribucion-escenarios.js'].every((f) => { try { cp.execFileSync('node', [path.join(R, 'tools', f)], { stdio: 'pipe' }); return true; } catch (e) { return false; } }); })());
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
