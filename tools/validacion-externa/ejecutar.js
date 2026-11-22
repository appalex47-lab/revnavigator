#!/usr/bin/env node
/* Orquestador del paquete de validación externa.
 *   node tools/validacion-externa/ejecutar.js --origen real --from 2026-09-01 --to 2026-09-30 [--tolerance 0.05]
 *   node tools/validacion-externa/ejecutar.js --origen simulado --from 2026-09-01 --to 2026-09-30         (solo prueba el paquete)
 * Ejecuta E-1, E-2 y E-3 con el MISMO origen, y regenera salida/REPORTE_VALIDACION_EXTERNA.md con DOS secciones separadas (real / simulado). Solo los resultados REALES cuentan para aceptar 4.1/4.2. */
const cp = require('child_process'), fs = require('fs'), path = require('path'), L = require('./lib.js');
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; }, origen = arg('--origen');
if (!['real', 'simulado'].includes(origen)) { console.error('uso: node tools/validacion-externa/ejecutar.js --origen real|simulado --from F --to T [--tolerance X]'); process.exit(2); }
const common = ['--origen', origen], p = (f) => path.join(__dirname, f), extra2 = [...(arg('--from') ? ['--from', arg('--from')] : []), ...(arg('--to') ? ['--to', arg('--to')] : []), ...(arg('--tolerance') ? ['--tolerance', arg('--tolerance')] : [])];
const run = (f, a) => { const r = cp.spawnSync(process.execPath, [p(f), ...a], { encoding: 'utf8', maxBuffer: 1e8 }); return r.status; };
const codes = { 'E-1': run('e1-productos.js', common), 'E-2': run('e2-sesiones.js', [...common, ...extra2]), 'E-3': run('e3-z1.js', common) };
console.log(`códigos de salida (${origen}):`, JSON.stringify(codes));
/* ---------- reporte consolidado: lee lo que exista de AMBOS orígenes ---------- */
const read = (o, n) => { const f = path.join(L.salidaRoot(), o, n + '.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; };
const row = (o, id, n) => { const j = read(o, n); return j ? [id, j.veredicto, j.generado.slice(0, 19).replace('T', ' '), (j.archivos && Object.values(j.archivos).map((x) => x.sha256.slice(0, 12)).join(', ')) || (j.sha256 ? j.sha256.slice(0, 12) : '—')] : [id, 'NO EJECUTADA', '—', '—']; };
const sec = (o) => L.mdTable(['validación', 'veredicto', 'generado', 'sha256 de entradas (12)'], [row(o, 'E-1 productos / forecast', 'e1-productos'), row(o, 'E-2 sesiones GA4', 'e2-sesiones'), row(o, 'E-3 Z1 / reliability', 'e3-z1')]);
const realOk = ['e1-productos', 'e2-sesiones', 'e3-z1'].map((n) => read('real', n)).map((j) => (j ? j.veredicto : 'NO EJECUTADA'));
const aprobada = realOk[0] === 'APROBADA' && /^CONCILIACIÓN EJECUTADA/.test(realOk[1]) && realOk[2] === 'APROBADA';
let discr = 0; try { const j = JSON.parse(fs.readFileSync(path.join(L.salidaRoot(), 'real', 'e2-sesiones.json'), 'utf8')); discr = (j.conciliacion.filas || []).filter((f) => f.estado === 'discrepancia_sin_criterio').length; } catch (e) { /* sin e2 real */ }
const md = `# Reporte de validación externa (E-1, E-2, E-3)\n\nGenerado: ${new Date().toISOString()}\n\n> Los resultados **SIMULADOS** solo demuestran que el paquete funciona. **Únicamente los resultados REALES cuentan** para aceptar las Fases 4.1 y 4.2.\n\n## Resultados REALES\n${sec('real')}\n## Resultados SIMULADOS (no son validación)\n${sec('simulado')}\n## Estado de la validación externa\n**${aprobada && discr ? `E-1 y E-3 REALES aprobadas; E-2 REAL ejecutada pero con ${discr} pares canal×dimensión en «discrepancia_sin_criterio» (sin tolerancia aprobada): NO es un verde. La aceptación de 4.1/4.2 no puede evaluarse hasta que el usuario clasifique y resuelva esa discrepancia.` : aprobada ? 'Las tres validaciones REALES están ejecutadas y en verde: la aceptación puede evaluarse (la decisión sigue siendo del usuario).' : 'Validación externa REAL incompleta: 4.1 y 4.2 NO pueden darse por aceptadas.'}**\n\nDetalle por validación: \`salida/real/*.md\` y \`salida/simulado/*.md\`.\n`;
fs.mkdirSync(L.salidaRoot(), { recursive: true }); fs.writeFileSync(path.join(L.salidaRoot(), 'REPORTE_VALIDACION_EXTERNA.md'), md); console.log(md);
process.exit(Object.values(codes).some((c) => c === 1) ? 1 : Object.values(codes).some((c) => c === 2) ? 2 : 0);
