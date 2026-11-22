#!/usr/bin/env node
/* Conversión REPRODUCIBLE del export GA4 multidimensional (una fila por combinación de dimensiones) al formato de E-2: entrada-real/segmentos-ga4.csv (date,channel,dimension,segment,sessions).
 * Reglas (declaradas, no estimadas):
 *  - Canal por «Plataforma»: web → ecommerce; iOS y Android → app (SUPUESTO DECLARADO: GA4 no trae canal; si no coincide con la definición de canal de la app, la conciliación lo mostrará).
 *  - Cada dimensión (plataforma, dispositivo, fuente_medio, campana, pagina_destino, nuevo_recurrente) = suma de «Sesiones» agrupando SOLO por esa dimensión (mismo universo en cada una). No se suman dimensiones entre sí.
 *  - Un valor VACÍO en el origen se etiqueta «(vacío en origen)» (no se descarta: sus sesiones cuentan en el total; no se afirma que sea «(not set)» de GA4).
 *  - Sin filtros, sin tolerancias, sin truncar «(not set)» ni «(other)». Fecha dd/mm/aaaa → aaaa-mm-dd.
 *   node tools/validacion-externa/convertir-ga4.js [entrada-real/ga4-export.csv] */
const fs = require('fs'), path = require('path'), L = require('./lib.js');
const src = process.argv[2] || path.join(L.DIRS.real, 'ga4-export.csv'), csv = L.parseCsv(fs.readFileSync(src, 'utf8'));
const COL = { fecha: 'Fecha', plataforma: 'Plataforma', dispositivo: 'Categoría de dispositivo', fuente_medio: 'Fuente/medio de la sesión', campana: 'Campaña de la sesión', pagina_destino: 'Página de destino y cadena de consulta', nuevo_recurrente: 'Nuevo/Recurrente' }, SES = 'Sesiones';
const miss = [...Object.values(COL), SES].filter((c) => !csv.header.includes(c)); if (miss.length) { console.error('Faltan columnas: ' + miss.join(', ')); process.exit(1); }
const CH = { web: 'ecommerce', ios: 'app', android: 'app' }, acc = new Map(), errs = []; let tot = 0;
csv.rows.forEach((r) => { const d = L.parseDmy(r[COL.fecha]), ch = CH[String(r[COL.plataforma]).toLowerCase().trim()], s = Number(r[SES]);
  if (!d) return errs.push(`línea ${r._line}: fecha inválida`); if (!ch) return errs.push(`línea ${r._line}: plataforma sin canal «${r[COL.plataforma]}»`); if (!Number.isFinite(s)) return errs.push(`línea ${r._line}: sesiones no numéricas`);
  tot += s; Object.keys(COL).filter((k) => k !== 'fecha').forEach((k) => { const key = [d.iso, ch, k, r[COL[k]] === '' ? '(vacío en origen)' : r[COL[k]]].join('\u0001'); acc.set(key, (acc.get(key) || 0) + s); }); });
if (errs.length) { console.error(errs.slice(0, 20).join('\n') + (errs.length > 20 ? `\n… ${errs.length} errores` : '')); process.exit(1); }
const q = (v) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v), out = ['date,channel,dimension,segment,sessions'];
[...acc.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).forEach(([k, v]) => { const [d, ch, dm, sg] = k.split('\u0001'); out.push([d, ch, dm, q(sg), v].join(',')); });
const dst = path.join(L.DIRS.real, 'segmentos-ga4.csv'); fs.writeFileSync(dst, out.join('\n') + '\n');
console.log(`${csv.rows.length} filas GA4 (sesiones totales ${tot}) → ${out.length - 1} filas → ${path.relative(L.ROOT, dst)}\nsha256 origen ${L.sha256(fs.readFileSync(src))} · sha256 salida ${L.sha256(fs.readFileSync(dst))}`);
