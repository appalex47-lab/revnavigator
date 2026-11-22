#!/usr/bin/env node
/* Fase 4.1 · P-04 (SOLO INVESTIGACIÓN, no se unifica) — qué significan las tolerancias 0.005 (Z1), $0.01 (D-02 / catálogo) y las de config, y si son equivalentes.
 * Se ejecuta la especificación REAL de Z1 y el catálogo. Datos SIMULADOS.   node tools/test-fase4-1-tolerancias.js */
const path = require('path'), R = path.join(__dirname, '..');
global.window = global; global.FP = {}; require(path.join(R, 'js/config/config.js')); require(path.join(R, 'js/commandCenter/metricCatalog.js'));
const Z1 = require('./audit/z1-lectura-ejecutiva.js'), S1 = require('./audit/z1-escenarios.js'), h = S1.helpers, base = S1.SCENARIOS[1].input;
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
const ACT = base.revenue.actualToDate;
const rec = (diff) => Z1.build({ ...base, activity: { sessions: 20000, orders: 900, revenue: ACT + diff } }).data.reconciliation.status;
const cat = (diff) => FP.metricCatalog.reconcile({ value: ACT + diff, universe: { period: 'p', channel: 'c', scope: 's', source: 'x' } }, { value: ACT, universe: { period: 'p', channel: 'c', scope: 's', source: 'x' } }).status;
const probe = rec(0.1);
t('A0 el banco de pruebas alcanza la conciliación de Z1 (diferencia grande → «pendiente»)', probe === 'pendiente', probe);
const cents = (v) => Math.round(v * 100) / 100;
t('B1 con importes redondeados a CENTAVOS ambas reglas coinciden (una diferencia es múltiplo de $0.01: ≥ 0.005 ⇔ > 0.01 cuando es ≥ 0.02; con 0.01 exacto difieren, ver B2)', [0, 0.02, 0.05, 1, 100].every((d) => (rec(d) === 'pendiente') === (cat(d) === 'pendiente_de_conciliacion')));
t('B2 con una diferencia EXACTA de $0.01 difieren: Z1 (≥ 0.005) la marca «pendiente»; D-02 («superior a $0.01») NO', rec(0.01) === 'pendiente' && cat(0.01) === 'sin_diferencia_observada', [rec(0.01), cat(0.01)]);
t('B3 con importes SIN redondear (0.005 ≤ d ≤ 0.01, p. ej. $0.0073) difieren igual: Z1 «pendiente», D-02 «sin diferencia observada»', rec(0.0073) === 'pendiente' && cat(0.0073) === 'sin_diferencia_observada', [rec(0.0073), cat(0.0073)]);
t('B4 por debajo de medio centavo ambas coinciden («sin diferencia observada»)', rec(0.004) === 'sin_diferencia_observada' && cat(0.004) === 'sin_diferencia_observada');
t('B5 en NINGÚN caso ninguna de las dos reglas declara «conciliada»: la conciliación formal sigue sin existir (D-02)', ['pendiente', 'sin_diferencia_observada'].includes(rec(0)) && cat(0) === 'sin_diferencia_observada' && FP.metricCatalog.reconcile({ value: 1, universe: {} }, { value: 1, universe: {} }).formal === false);
const T = FP.config.tolerances;
t('C1 existen CUATRO tolerancias con significados distintos: 0.005 (Z1: precisión de representación, medio centavo), $0.01 (D-02: umbral de decisión de conciliación), 0.005 absoluta técnica (isApproximatelyEqual, comparar flotantes) y 1.00 absoluta de validación de datos (revenue.absolute / hierarchy.absolute)', T.technical.absolute === 0.005 && T.revenue.absolute === 1 && T.hierarchy.absolute === 1);
t('C2 la validación de datos (revenue ±0.5 % o $1) es OTRO propósito (calidad de la carga), no la conciliación entre fuentes: no debe mezclarse con D-02', T.revenue.relative === 0.005 && T.revenue.absolute === 1);
t('C3 en la implementación de D-02 (catálogo) el umbral es parametrizable y NO se declara conciliada; Z1 declara tolerance:null a propósito (no inventa umbral)', (() => { return Z1.build({ ...base, activity: { sessions: 20000, orders: 900, revenue: ACT + 5 } }).data.reconciliation.tolerance === null; })());
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
