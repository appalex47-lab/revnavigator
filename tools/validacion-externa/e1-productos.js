#!/usr/bin/env node
/* E-1 · Validación del forecast de tendencias con el export de ventas por producto.
 *   node tools/validacion-externa/e1-productos.js --origen real     [--archivo <ruta dentro de entrada-real/>]
 *   node tools/validacion-externa/e1-productos.js --origen simulado [--archivo <ruta>]      (solo prueba el paquete; NO cuenta como validación)
 * 1) valida la ESTRUCTURA del CSV (columnas, fechas, números, volumen, historia mínima); 2) ejecuta las 7 aserciones de tools/test-phase21-real.js sobre ESE archivo;
 * 3) escribe salida/<origen>/e1-productos.{json,md}. Código de salida: 0 = APROBADA, 1 = FALLIDA, 2 = PENDIENTE (faltan datos) */
const cp = require('child_process'), path = require('path'), L = require('./lib.js');
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
const origen = arg('--origen'), res = L.resolveInput(origen, 'productos.csv', arg('--archivo'));
const out = { id: 'E-1', origen, banner: L.banner(origen), generado: new Date().toISOString() };
const ASERCIONES = ['CSV tiene 85k+ filas', 'hay productos con >=6 periodos', 'entidad real tiene historia suficiente', 'forecast real disponible', 'forecast real conserva patrón', 'backtest real calculado', 'periodos futuros son posteriores'];
function finish(verdict, code) { out.veredicto = verdict; const md = render(); const rel = L.writeReport(origen, 'e1-productos', out, md); console.log(md); console.log('Reporte: ' + rel); process.exit(code); }
function render() {
  let s = `# E-1 · Forecast de tendencias con ventas por producto\n\n**${out.banner}** · veredicto: **${out.veredicto}**\n\n`;
  if (out.error) return s + `Motivo: ${out.error}\n`;
  s += `Archivo: \`${out.archivo}\` · sha256 \`${out.sha256}\` · ${out.bytes} bytes\n\n## Estructura\n- filas de datos: ${out.estructura.estadisticas.filas} · productos: ${out.estructura.estadisticas.productos} · periodos (mes): ${out.estructura.estadisticas.periodos.join(', ')}\n- productos con ≥ 6 periodos: ${out.estructura.estadisticas.candidatos}\n- errores: ${out.estructura.errores.length} · advertencias: ${out.estructura.advertencias.length}\n`;
  out.estructura.errores.slice(0, 20).forEach((e) => { s += `  - ERROR ${e}\n`; }); out.estructura.advertencias.slice(0, 20).forEach((e) => { s += `  - aviso ${e}\n`; });
  s += `\n## Aserciones de tools/test-phase21-real.js (7 esperadas)\n` + L.mdTable(['aserción', 'resultado'], out.aserciones.map((a) => [a.nombre, a.resultado]));
  if (out.entidad) s += `\nEntidad analizada: ${out.entidad}\n`; return s;
}
if (res.error) { out.error = res.error; finish(res.missing ? 'PENDIENTE (faltan datos)' : 'FALLIDA', res.missing ? 2 : 1); }
if (origen === 'real') { const m = L.manifest('real'); if (m.error) { out.error = m.error; finish('FALLIDA', 1); } out.manifiesto = m.manifest; }
out.archivo = path.relative(L.ROOT, res.file); out.sha256 = res.sha; out.bytes = res.bytes;
/* ---------- estructura ---------- */
const csv = L.parseCsv(res.text), errores = [], adv = [], need = ['fecha', 'producto', 'venta'], hdr = csv.header.map((h) => h.toLowerCase());
need.filter((c) => !hdr.includes(c)).forEach((c) => errores.push(`falta la columna «${c}» (encabezado recibido: ${csv.header.join(', ') || '(vacío)'})`));
const sums = new Map(), years = new Set(), prods = new Set(); let neg = 0, zero = 0, filas = 0;
if (!errores.length) csv.rows.forEach((r) => { filas++;
  const d = L.parseDmy(r[csv.header[hdr.indexOf('fecha')]] || ''), p = r[csv.header[hdr.indexOf('producto')]], v = L.parseNum(r[csv.header[hdr.indexOf('venta')]]);
  if (!d) { if (errores.length < 200) errores.push(`línea ${r._line}: fecha inválida (formato dd/mm/aaaa y calendario válido)`); return; }
  if (!p) { if (errores.length < 200) errores.push(`línea ${r._line}: producto vacío`); return; }
  if (v === null || Number.isNaN(v)) { if (errores.length < 200) errores.push(`línea ${r._line}: venta no numérica («${r[csv.header[hdr.indexOf('venta')]]}»)`); return; }
  if (v < 0) neg++; if (v === 0) zero++;
  years.add(d.y); prods.add(p); const k = p + '|' + d.y + '-' + String(d.m).padStart(2, '0'); sums.set(k, (sums.get(k) || 0) + v); });
const perProd = new Map(); for (const [k, v] of sums) { const [p, per] = k.split('|'); if (!perProd.has(p)) perProd.set(p, []); perProd.get(p).push({ per, v }); }
const cand = [...perProd.entries()].filter(([, s]) => s.length >= 6);
if (!errores.length && filas <= 85000) errores.push(`solo ${filas} filas de datos: la aserción pide MÁS de 85 000`);
if (!errores.length && !cand.length) errores.push('ningún producto tiene ≥ 6 periodos (meses) con venta: la aserción de historia suficiente no puede cumplirse');
if (neg) adv.push(`${neg} filas con venta negativa (se suman tal cual, como en la prueba)`); if (zero) adv.push(`${zero} filas con venta 0`);
if (years.size && !years.has(2026)) adv.push(`no hay fechas de 2026 (años: ${[...years].join(', ')}); el nombre histórico del archivo es «Venta Productos 2026»`);
if (csv.rows.some((r) => r._n < 3)) adv.push('hay filas con menos de 3 columnas');
const per = [...new Set([...sums.keys()].map((k) => k.split('|')[1]))].sort();
out.estructura = { ok: errores.length === 0, errores, advertencias: adv, estadisticas: { filas, productos: prods.size, periodos: per, candidatos: cand.length, negativas: neg } };
if (errores.length) { out.aserciones = ASERCIONES.map((a) => ({ nombre: a, resultado: 'NO EJECUTADA (estructura inválida)' })); finish('FALLIDA', 1); }
/* ---------- aserciones reales (el script existente, sin modificarlo) ---------- */
const r = cp.spawnSync(process.execPath, [path.join(L.ROOT, 'tools', 'test-phase21-real.js')], { env: { ...process.env, REAL_PRODUCT_CSV: res.file }, encoding: 'utf8', maxBuffer: 1e8 });
const lines = (r.stdout || '').split('\n'), found = lines.filter((l) => /^(PASS|FAIL) /.test(l)).map((l) => ({ nombre: l.replace(/^(PASS|FAIL) /, '').split(' ').slice(0).join(' ').replace(/\s+(false|\w+Error.*)$/, ''), resultado: l.startsWith('PASS') ? 'PASS' : 'FAIL' }));
out.aserciones = ASERCIONES.map((a) => { const f = found.find((x) => x.nombre.startsWith(a)); return { nombre: a, resultado: f ? f.resultado : 'NO EJECUTADA' }; });
const ent = lines.find((l) => l.startsWith('REAL_ENTITY')); if (ent) out.entidad = ent.replace(/^REAL_ENTITY /, '');
const ok = out.aserciones.every((a) => a.resultado === 'PASS') && r.status === 0;
finish(ok ? 'APROBADA' : 'FALLIDA', ok ? 0 : 1);
