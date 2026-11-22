#!/usr/bin/env node
/* Conversión REPRODUCIBLE para E-3: entrada-real/planning_export.json (daily_plan[canal][].metrics.revenue.value, exportado por la app)
 * + entrada-real/actual-canal-2026.csv (fecha,canal,venta,pedidos,traffic_volume,…) → entrada-real/diario-plan-real.csv (date,channel,plan_revenue,actual_revenue,sessions,orders).
 * Solo une por (fecha, canal) y reformatea: no rellena ni estima. Una fecha/canal sin plan queda con plan_revenue vacío (y se informa).
 *   node tools/validacion-externa/convertir-plan.js [planning_export.json] [actual-canal-2026.csv] */
const fs = require('fs'), path = require('path'), L = require('./lib.js');
const pf = process.argv[2] || path.join(L.DIRS.real, 'planning_export.json'), af = process.argv[3] || path.join(L.DIRS.real, 'actual-canal-2026.csv');
const plan = JSON.parse(fs.readFileSync(pf, 'utf8')); if (plan.schema !== 'planning_export' || !plan.daily_plan) { console.error('No es un planning_export con daily_plan'); process.exit(1); }
const P = {}; Object.entries(plan.daily_plan).forEach(([ch, days]) => days.forEach((d) => { P[d.date + '|' + ch] = d.metrics.revenue.value; }));
const csv = L.parseCsv(fs.readFileSync(af, 'utf8')), out = ['date,channel,plan_revenue,actual_revenue,sessions,orders'], errs = [], sinPlan = []; const seen = new Set();
csv.rows.forEach((r) => { const d = L.parseDmy(r.fecha), ch = String(r.canal).toLowerCase().trim(); if (!d) return errs.push(`línea ${r._line}: fecha inválida «${r.fecha}»`);
  const k = d.iso + '|' + ch; if (seen.has(k)) return errs.push(`línea ${r._line}: duplicado ${k}`); seen.add(k);
  const p = P[k]; if (p === undefined || p === null) sinPlan.push(k);
  out.push([d.iso, ch, p ?? '', r.venta, r.traffic_volume, r.pedidos].join(',')); });
if (errs.length) { console.error(errs.slice(0, 20).join('\n')); process.exit(1); }
const dst = path.join(L.DIRS.real, 'diario-plan-real.csv'); fs.writeFileSync(dst, out.join('\n') + '\n');
console.log(`${out.length - 1} filas → ${path.relative(L.ROOT, dst)} · filas sin plan: ${sinPlan.length}${sinPlan.length ? ' (' + sinPlan.slice(0, 5).join(', ') + '…)' : ''}`);
console.log(`plan: ${plan.source.app} ${plan.source.version} · schema ${plan.schemaVersion} · generado ${plan.generatedAt} · sha256 ${L.sha256(fs.readFileSync(pf))}`);
console.log(`actual sha256 ${L.sha256(fs.readFileSync(af))} · salida sha256 ${L.sha256(fs.readFileSync(dst))}`);
