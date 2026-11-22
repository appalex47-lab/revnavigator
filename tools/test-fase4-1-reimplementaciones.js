#!/usr/bin/env node
/* Fase 4.1 · P-03 — matriz comparativa de las reimplementaciones de brecha, conversión (CR) y AOV contra la función canónica (FP.metrics.calcGap / calcConversionRate / calcAov).
 * Cada sitio se transcribe tal como está en el código (el ANCLA debe seguir existiendo en el archivo: si alguien cambia el sitio, la prueba avisa) y se compara sobre una malla de
 * entradas válidas y degeneradas (0, negativos, null, NaN, undefined). Se clasifica: «equivalente» (mismo resultado en todo el dominio probado), «equivalente en dominio válido»
 * (difiere solo en degenerados) o «difiere» (redondeo, respaldo o semántica distinta). NO se migra nada aquí: la clasificación decide qué se puede migrar sin riesgo.
 * Datos SIMULADOS.   node tools/test-fase4-1-reimplementaciones.js [--json] */
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '..');
global.window = global; global.FP = {}; require(path.join(R, 'js/config/config.js')); require(path.join(R, 'js/calculations/metrics.js'));
const M = FP.metrics, fin = (v) => typeof v === 'number' && Number.isFinite(v);
let bad = 0, n = 0; const t = (name, c, d) => { n++; if (!process.argv.includes('--json')) console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
const same = (a, b) => (a === null || b === null ? a === b : (Number.isNaN(a) && Number.isNaN(b)) || a === b || (Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(a), Math.abs(b))));
const VALID = [0.5, 1, 7, 100, 1234.56, 15233993.8272, 21400]; const DEGEN = [0, -3, null, undefined, NaN, Infinity];
const pairs = (A, B) => A.flatMap((a) => B.map((b) => [a, b]));
const gridValid = pairs(VALID, VALID), gridAll = pairs([...VALID, ...DEGEN], [...VALID, ...DEGEN]);
function classify(site, canon, grid) { const dv = gridValid.filter(([a, b]) => !same(site(a, b), canon(a, b))), da = grid.filter(([a, b]) => !same(site(a, b), canon(a, b)));
  const nonFin = da.filter(([a, b]) => { const v = site(a, b); return typeof v === 'number' && !Number.isFinite(v); }).length;
  return { validDiffs: dv.length, allDiffs: da.length, nonFinite: nonFin, cls: !da.length ? 'equivalente' : dv.length ? 'difiere' : 'equivalente en dominio válido', zeroDen: (() => { const v = site(5, 0); return typeof v === 'number' && !Number.isFinite(v) ? 'devuelve NaN/Infinity' : 'null'; })(), sample: da.slice(0, 3) }; }
const src = (f) => fs.readFileSync(path.join(R, f), 'utf8');
const CR = (o, t0) => M.calcConversionRate(o, t0), AOV = (r, o) => M.calcAov(r, o), GAPABS = (plan, act) => M.calcGap(plan, act).abs, GAPPCT = (plan, act) => M.calcGap(plan, act).pct;
/* (4.2/P-13: GAP-3 y GAP-6 están MIGRADOS: su ancla es ahora la llamada canónica y la transcripción es la fórmula ORIGINAL, conservada para la paridad.)
 * [id, archivo, ancla, función del sitio, canónica, esperado] — argumentos: CR (pedidos, sesiones) · AOV (venta, pedidos) · brecha (plan, real) */
const S = [
  ['CR-1', 'js/ui/segments-view.js', /a\.orders\s*\/\s*a\.traffic/, (o, t0) => (t0 > 0 ? o / t0 : null), CR, 'equivalente en dominio válido'],
  ['CR-2', 'js/ui/segments-view.js', /x\.traffic > 0 \? x\.orders \/ x\.traffic : null/, (o, t0) => (t0 > 0 ? o / t0 : null), CR, 'equivalente en dominio válido'],
  ['CR-3', 'js/ui/segments-view.js', /last\.traffic \? last\.orders \/ last\.traffic : null/, (o, t0) => (t0 ? o / t0 : null), CR, 'equivalente en dominio válido'],
  ['CR-4', 'js/analytics/trafficConversionEngine.js', /tb\.t > 0 \? tb\.o \/ tb\.t : null/, (o, t0) => (t0 > 0 ? o / t0 : null), CR, 'equivalente en dominio válido'],
  ['CR-5', 'js/projection/projection.js', /trf > 0 \? ord \/ trf : null/, (o, t0) => (t0 > 0 ? o / t0 : null), CR, 'equivalente en dominio válido'],
  ['CR-6', 'js/forecast/reforecastEngine.js', /fin\(orders\) && fin\(traffic\) && traffic > 0 \? orders \/ traffic : \(fin\(a\.conversionRate\)/, (o, t0) => (fin(o) && fin(t0) && t0 > 0 ? o / t0 : null), CR, 'equivalente'],
  ['CR-7', 'js/ui/segmentInsights.js', /p\.orders \/ p\.traffic/, (o, t0) => o / t0, CR, 'equivalente en dominio válido'],
  ['CR-8', 'js/diagnostics/attribution.js', /base\.o \/ base\.t/, (o, t0) => o / t0, CR, 'equivalente en dominio válido'],
  ['AOV-1', 'js/ui/segments-view.js', /a\.orders > 0 \? a\.revenue \/ a\.orders/, (r, o) => (o > 0 ? r / o : null), AOV, 'equivalente en dominio válido'],
  ['AOV-2', 'js/analytics/trafficConversionEngine.js', /tb\.o > 0 \? tb\.r \/ tb\.o : null/, (r, o) => (o > 0 ? r / o : null), AOV, 'equivalente en dominio válido'],
  ['AOV-3', 'js/projection/projection.js', /ord > 0 \? rev \/ ord : null/, (r, o) => (o > 0 ? r / o : null), AOV, 'equivalente en dominio válido'],
  ['AOV-4', 'js/forecast/reforecastEngine.js', /fin\(orders\) && orders > 0 \? revenue \/ orders : \(fin\(a\.aov\)/, (r, o) => (fin(o) && o > 0 ? r / o : null), AOV, 'equivalente en dominio válido'],
  ['AOV-5', 'js/promotions/opportunityEngine.js', /x\.orders > 0 && fin\(x\.revenue\) \? x\.revenue \/ x\.orders : null/, (r, o) => (o > 0 && fin(r) ? r / o : null), AOV, 'equivalente en dominio válido'],
  ['AOV-6', 'js/ui/segmentInsights.js', /p\.revenue \/ p\.orders/, (r, o) => r / o, AOV, 'equivalente en dominio válido'],
  ['AOV-7', 'js/diagnostics/attribution.js', /base\.r \/ base\.o/, (r, o) => r / o, AOV, 'equivalente en dominio válido'],
  ['GAP-1', 'js/report/reportBuilder.js', /real\.value - plan\.value/, (plan, act) => act - plan, GAPABS, 'equivalente en dominio válido'],
  ['GAP-2', 'js/analytics/planBridgeEngine.js', /actual - plan\.total/, (plan, act) => act - plan, GAPABS, 'equivalente en dominio válido'],
  ['GAP-3', 'js/analytics/changeEngine.js', /gap: M\(\)\.calcGap\(plan, actual\)\.abs/, (plan, act) => (fin(act) && fin(plan) ? act - plan : null), GAPABS, 'equivalente'],
  ['GAP-4', 'js/analytics/changeEngine.js', /const pct = \(a, b\) => \(fin\(a\) && fin\(b\) && b !== 0 \? a \/ b - 1 : null\)/, (plan, act) => (fin(act) && fin(plan) && plan !== 0 ? act / plan - 1 : null), GAPPCT, 'equivalente'],
  ['GAP-5', 'js/forecast/reforecastEngine.js', /cents\(actualToDate\.revenue - planToDate\.revenue\)/, (plan, act) => Math.round((act - plan) * 100) / 100, GAPABS, 'difiere'],
  ['GAP-6', 'js/diagnostics/driverEngine.js', /delta: M\(\)\.calcGap\(base, cur\)\.abs/, (base, cur) => (fin(cur) && fin(base) ? cur - base : null), GAPABS, 'equivalente']
];
const OUT = [];
S.forEach(([id, file, anchor, site, canon, expected]) => {
  const present = anchor.test(src(file)), c = classify(site, canon, gridAll);
  OUT.push({ id, file, present, ...c, expected });
  const migrado = !['GAP-3', 'GAP-6'].includes(id);   // reapertura 4.1/4.2: la fórmula ORIGINAL ya no está en el código (migrada); GAP-3/GAP-6 se migraron antes y su ancla es la llamada canónica
  t(`${id} ${file}: ${migrado ? 'MIGRADO (la fórmula original ya no está en el código)' : 'migrado (ancla = llamada canónica)'}; la fórmula ORIGINAL es «${c.cls}» frente a la canónica actual (clase esperada: «${expected}»)`, (migrado ? !present : present) && c.cls === expected, { present, got: c.cls, sample: c.sample });
});
/* ---------- consecuencias medibles ---------- */
const r = (() => { let a = 7; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; })();
let maxCents = 0, over = 0; for (let k = 0; k < 100000; k++) { const p = r() * 5e7, a = p * (0.8 + r() * 0.4), d = Math.abs(Math.round((a - p) * 100) / 100 - (a - p)); maxCents = Math.max(maxCents, d); if (d > 0.005 + 1e-9) over++; }
t(`R1 GAP-5 (reforecastEngine) redondea la brecha a centavos: la diferencia con la brecha exacta es ≤ $0.005 (máx. observado ${maxCents.toFixed(6)}), compatible con la tolerancia D-02 de $0.01 pero NO idéntica a la función canónica (por eso no se sustituye sin autorización de redondeo)`, maxCents <= 0.005 + 1e-9 && over === 0);
t('R2 en el dominio válido (valores finitos positivos) las 21 transcripciones producen el mismo resultado que la canónica salvo GAP-5 (redondeo a centavos)', OUT.filter((o) => o.validDiffs > 0).map((o) => o.id).join() === 'GAP-5');
t('R3 los sitios CR-7, CR-8, AOV-6 y AOV-7 NO tienen guarda de denominador cero (devuelven NaN/Infinity donde la canónica devuelve null); en datos válidos coinciden y las guardas viven aguas arriba. Los demás sitios devuelven null como la canónica', ['CR-7', 'CR-8', 'AOV-6', 'AOV-7'].every((id) => OUT.find((x) => x.id === id).zeroDen === 'devuelve NaN/Infinity') && OUT.filter((x) => !['CR-7', 'CR-8', 'AOV-6', 'AOV-7', 'GAP-1', 'GAP-2', 'GAP-5'].includes(x.id)).every((x) => x.zeroDen === 'null' || x.id.startsWith('GAP')));
t('R4 CR-3 (original de segments-view, guarda «verdadero/falso»): difería de la canónica ACTUAL (denominador > 0) solo con numerador ausente/no finito, denominador negativo o infinito: casos que no entran con datos importados (los negativos van a cuarentena: NEGATIVE_TRAFFIC)', (() => { const f = (x, y) => (y ? x / y : null); return gridAll.filter(([a, b]) => !same(f(a, b), CR(a, b))).every(([a, b]) => !fin(a) || (typeof b === 'number' && (b < 0 || Math.abs(b) === Infinity))); })());
const nullNum = OUT.filter((o) => o.id !== 'GAP-5' && !o.id.startsWith('GAP')).filter((o) => { const site = S.find((x) => x[0] === o.id)[3]; return site(null, 5) === 0 || Object.is(site(null, 5), -0); }).map((o) => o.id);
t(`R6 hallazgo de integridad (D-05 «falta de dato ≠ cero»): ${nullNum.length} de los 15 sitios de CR/AOV convierten un numerador AUSENTE en 0 (la canónica devuelve null); en la práctica las guardas aguas arriba lo evitan, pero el contrato canónico lo hace imposible por construcción`, nullNum.length >= 10, nullNum);
/* ---------- las líneas anteriores de la auditoría que NO eran reimplementaciones ---------- */
t('R5 corrección de la auditoría previa: px-ficha.js y px-view.js solo LEEN cr/aov (rx.current, m.tc.aov), no los calculan; planningEngine.js no existe como archivo (la fórmula vive en otro módulo): no son reimplementaciones', !/orders\s*\/\s*\w*traffic|revenue\s*\/\s*\w*orders/.test(src('js/ui/px-ficha.js')) && !/\.orders\s*\/|revenue\s*\/\s*\w+\.orders/.test(src('js/ui/px-view.js')) && !fs.existsSync(path.join(R, 'js/analytics/planningEngine.js')));
const sw = OUT.filter((o) => o.cls === 'equivalente').length, sv = OUT.filter((o) => o.cls === 'equivalente en dominio válido').length, sd = OUT.filter((o) => o.cls === 'difiere').length;
if (process.argv.includes('--json')) console.log(JSON.stringify({ sitios: OUT.length, equivalente: sw, equivalenteDominioValido: sv, difiere: sd, detalle: OUT }, null, 1));
else console.log(`\n${OUT.length} sitios: ${sw} equivalentes, ${sv} equivalentes en dominio válido, ${sd} difieren\n${n - bad} bien, ${bad} mal`);
process.exit(bad ? 1 : 0);
