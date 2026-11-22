/* Fixture de PRUEBA: reutiliza (sin copiarlas) las entradas sintéticas de tools/test-attention-engine.js para ejecutar el motor REAL js/analytics/attentionEngine.js en Node.
 * No es código de la aplicación. Devuelve { AE, mk, under }. */
const fs = require('fs'), path = require('path');
global.window = global; global.FP = global.FP || {}; FP.config = FP.config || { forecast: { pacingThresholds: { aboveFrom: 1.01, onPlanFrom: 0.99 } } };
const R = path.join(__dirname, '../../');
['js/calculations/metrics.js', 'js/calculations/gap.js', 'js/analytics/attentionEngine.js'].forEach((f) => require(path.join(R, f)));
const src = fs.readFileSync(path.join(R, 'tools/test-attention-engine.js'), 'utf8');
const a = src.indexOf('const readyAll'), b = src.search(/\n(let|const) r = AE\.evaluate/);
const f = new Function('AE', src.slice(a, b) + '\n; return { mk, under, readyAll };');
module.exports = Object.assign({ AE: FP.attentionEngine }, f(FP.attentionEngine));
