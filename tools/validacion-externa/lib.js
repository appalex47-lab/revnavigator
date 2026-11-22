/* Biblioteca común del paquete de validación externa (E-1, E-2, E-3). Sin dependencias externas. */
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..'), PKG = __dirname;
const DIRS = { real: process.env.VALEXT_ENTRADA_REAL || path.join(PKG, 'entrada-real'), simulado: path.join(PKG, 'fixtures-simulados') };
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
/** CSV RFC-4180 sencillo (comillas dobles, comas, saltos de línea); quita el BOM. Devuelve { header, rows:[{_line, ...cols}] }. */
function parseCsv(text) {
  const t = text.replace(/^﻿/, ''), out = []; let row = [], cur = '', q = false, line = 1, rowLine = 1;
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else { cur += c; if (c === '\n') line++; } }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.length > 1 || row[0] !== '') out.push({ cells: row, line: rowLine }); row = []; line++; rowLine = line; }
    else cur += c; }
  if (cur !== '' || row.length) { row.push(cur); out.push({ cells: row, line: rowLine }); }
  if (!out.length) return { header: [], rows: [] };
  const header = out[0].cells.map((h) => h.trim());
  return { header, rows: out.slice(1).map((r) => { const o = { _line: r.line, _n: r.cells.length }; header.forEach((h, i) => { o[h] = r.cells[i] === undefined ? '' : r.cells[i].trim(); }); return o; }) };
}
const isDate = (y, m, d) => { const x = new Date(Date.UTC(y, m - 1, d)); return x.getUTCFullYear() === y && x.getUTCMonth() === m - 1 && x.getUTCDate() === d; };
const parseDmy = (s) => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s); return m && isDate(+m[3], +m[2], +m[1]) ? { y: +m[3], m: +m[2], d: +m[1], iso: `${m[3]}-${m[2]}-${m[1]}` } : null; };
const parseIso = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m && isDate(+m[1], +m[2], +m[3]) ? s : null; };
const parseNum = (s) => { if (s === '' || s === undefined) return null; const v = Number(String(s).replace(/[$,\s]/g, '')); return Number.isFinite(v) ? v : NaN; };
/** Resuelve el archivo según el ORIGEN y aplica las reglas de separación real / simulado. Devuelve { file, origen, sha, error }. */
function resolveInput(origen, name, explicit) {
  const dir = DIRS[origen]; if (!dir) return { error: `origen inválido «${origen}» (real | simulado)` };
  const file = path.resolve(explicit || path.join(dir, name));
  const inReal = file.startsWith(DIRS.real + path.sep), inSim = file.startsWith(DIRS.simulado + path.sep) || file.startsWith(require('os').tmpdir());
  if (origen === 'real' && !inReal) return { error: `REAL exige que el archivo esté en ${path.relative(ROOT, DIRS.real)}/ (recibido: ${file})` };
  if (origen === 'real' && inSim) return { error: 'REAL no admite archivos de fixtures ni temporales' };
  if (origen === 'simulado' && inReal) return { error: 'SIMULADO no admite archivos de entrada-real/' };
  if (!fs.existsSync(file)) return { error: `falta el archivo ${path.relative(ROOT, file)}`, missing: true, file };
  const buf = fs.readFileSync(file), sha = sha256(buf);
  if (origen === 'real') { const reg = path.join(DIRS.simulado, 'HASHES.json'); if (fs.existsSync(reg) && Object.values(JSON.parse(fs.readFileSync(reg, 'utf8'))).includes(sha)) return { error: 'el archivo REAL coincide con un fixture simulado (mezcla de datos): rechazado', file, sha }; }
  return { file, origen, sha, bytes: buf.length, text: buf.toString('utf8') };
}
function manifest(origen) {
  const f = path.join(DIRS[origen], 'MANIFIESTO.json'); if (!fs.existsSync(f)) return { error: `falta MANIFIESTO.json en ${path.relative(ROOT, DIRS[origen])}/` };
  let m; try { m = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return { error: 'MANIFIESTO.json no es JSON válido: ' + e.message }; }
  if (m.origen !== origen) return { error: `MANIFIESTO.origen = «${m.origen}» pero se ejecuta como «${origen}»` };
  const miss = ['origen', 'extraido_por', 'fecha_extraccion', 'descripcion'].filter((k) => !m[k]); if (miss.length) return { error: 'MANIFIESTO.json sin: ' + miss.join(', ') };
  return { manifest: m };
}
/** Contexto de navegador limpio con los módulos REALES de la aplicación (misma carga que index.html). */
function appContext() {
  const c = vm.createContext({ console }); c.window = c; c.globalThis = c;
  ['config/config', 'calculations/metrics', 'calculations/gap', 'economics/impactModel', 'analytics/attentionEngine', 'commandCenter/planStatus', 'commandCenter/sampleSufficiency', 'commandCenter/businessState', 'commandCenter/z1', 'commandCenter/reliability', 'commandCenter/metricCatalog']
    .forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8'), c, { filename: f }));
  return c.FP;
}
const banner = (origen) => (origen === 'real' ? 'ORIGEN: REAL' : 'ORIGEN: SIMULADO (no cuenta como validación externa)');
/** Raíz de salidas: por defecto salida/; la autoprueba la redirige (VALEXT_SALIDA) para que sus ejecuciones negativas NUNCA contaminen el reporte real. */
const salidaRoot = () => process.env.VALEXT_SALIDA || path.join(PKG, 'salida');
function writeReport(origen, name, obj, md) { const d = path.join(salidaRoot(), origen); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, name + '.json'), JSON.stringify(obj, null, 2)); fs.writeFileSync(path.join(d, name + '.md'), md); return path.relative(ROOT, path.join(d, name + '.md')); }
const mdTable = (head, rows) => `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}\n`;
module.exports = { salidaRoot, ROOT, PKG, DIRS, sha256, parseCsv, parseDmy, parseIso, parseNum, resolveInput, manifest, appContext, banner, writeReport, mdTable };
