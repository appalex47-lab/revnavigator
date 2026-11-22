#!/usr/bin/env node
/* Conversión REPRODUCIBLE del export diario por canal de la app (fecha,canal,venta,pedidos,traffic_volume,…) al formato de E-2: entrada-real/diario-canal.csv (date,channel,sessions).
 * Solo renombra y reformatea: fecha dd/mm/aaaa → aaaa-mm-dd, canal → minúsculas (ecommerce, app, whatsapp, llamadas), traffic_volume → sessions (vacío = ausente). No agrega, no rellena ni estima nada.
 *   node tools/validacion-externa/convertir-actual.js [entrada-real/actual-canal-2026.csv] */
const fs = require('fs'), path = require('path'), L = require('./lib.js');
const src = process.argv[2] || path.join(L.DIRS.real, 'actual-canal-2026.csv'), csv = L.parseCsv(fs.readFileSync(src, 'utf8')), out = ['date,channel,sessions'], errs = [];
csv.rows.forEach((r) => { const d = L.parseDmy(r.fecha), ch = String(r.canal).toLowerCase().trim(); if (!d) return errs.push(`línea ${r._line}: fecha inválida «${r.fecha}»`); out.push(`${d.iso},${ch},${r.traffic_volume}`); });
if (errs.length) { console.error(errs.slice(0, 20).join('\n')); process.exit(1); }
const dst = path.join(L.DIRS.real, 'diario-canal.csv'); fs.writeFileSync(dst, out.join('\n') + '\n'); console.log(`${out.length - 1} filas → ${path.relative(L.ROOT, dst)} · sha256 origen ${L.sha256(fs.readFileSync(src))} · sha256 salida ${L.sha256(fs.readFileSync(dst))}`);
