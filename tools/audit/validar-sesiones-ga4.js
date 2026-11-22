#!/usr/bin/env node
/* Mecanismo para VALIDAR con datos reales la relación serie diaria ↔ segmentos GA4 (no fija tolerancias ni decide). Uso:
 *   node tools/audit/validar-sesiones-ga4.js diario.json segmentos.json [--from 2026-09-01] [--to 2026-09-30] [--tolerance 0.05]
 * diario.json    = [{ "date":"2026-09-01", "channel":"ecommerce", "sessions":12345 }, …]
 * segmentos.json = [{ "date":"2026-09-01", "channel":"ecommerce", "dimension":"device", "segment":"mobile", "sessions":7000 }, …]
 * Imprime el informe `cc.sessions_report/1`. Sin datos reales en el repositorio: se ejerce solo con simulados (tools/test-cierre-4-1-4-2.js). */
const fs = require('fs'), path = require('path'), vm = require('vm');
const args = process.argv.slice(2), flag = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const files = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (files.length < 2) { console.error('uso: node tools/audit/validar-sesiones-ga4.js diario.json segmentos.json [--from F] [--to T] [--tolerance 0.05]'); process.exit(2); }
const c = vm.createContext({}); c.window = c; c.globalThis = c; vm.runInContext(fs.readFileSync(path.join(__dirname, '../../js/commandCenter/metricCatalog.js'), 'utf8'), c);
const rd = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const rep = c.FP.metricCatalog.reconcileSessionsReport(rd(files[0]), rd(files[1]), { from: flag('--from'), to: flag('--to'), tolerancePct: flag('--tolerance') !== undefined ? Number(flag('--tolerance')) : undefined });
console.log(JSON.stringify(rep, null, 2));
