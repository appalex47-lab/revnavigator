#!/usr/bin/env node
/* Genera datos SIMULADOS y deterministas en fixtures-simulados/ (con HASHES.json y MANIFIESTO.json origen «simulado») para probar el paquete. NUNCA son datos reales. */
const fs = require('fs'), path = require('path'), L = require('./lib.js');
const D = L.DIRS.simulado; fs.mkdirSync(D, { recursive: true });
let s = 20261201; const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
/* E-1: >85 000 filas, 60 productos × 8 meses */
const prod = ['fecha,producto,venta']; for (let p = 0; p < 60; p++) { const b = 50 + r() * 500, sl = (r() - 0.4) * 8; for (let m = 0; m < 8; m++) for (let k = 0; k < 190 + Math.floor(r() * 60); k++) prod.push(`${String(1 + Math.floor(r() * 27)).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/2026,Producto ${p},${Math.max(1, b + sl * m * 10 + (r() - 0.5) * b * 0.4).toFixed(2)}`); }
fs.writeFileSync(path.join(D, 'productos.csv'), prod.join('\n'));
/* E-2 y E-3: septiembre 2026, 4 canales; GA4 con 3 dimensiones del mismo universo (ecommerce y app) */
const days = Array.from({ length: 30 }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`), CH = ['ecommerce', 'app', 'whatsapp', 'llamadas'];
const daily = ['date,channel,sessions'], seg = ['date,channel,dimension,segment,sessions'], plan = ['date,channel,plan_revenue,actual_revenue,sessions,orders'];
days.forEach((d, di) => CH.forEach((ch) => { const base = { ecommerce: 20000, app: 8000, whatsapp: 600, llamadas: 300 }[ch] * (0.9 + r() * 0.2), ses = Math.round(base), pl = Math.round(ses * 0.02 * 700 * 100) / 100, ac = di < 20 ? Math.round(pl * (0.93 + r() * 0.12) * 100) / 100 : '', or = di < 20 ? Math.round(ses * 0.02 * (0.9 + r() * 0.2)) : '';
  daily.push(`${d},${ch},${ses}`); plan.push(`${d},${ch},${pl},${ac},${di < 20 ? ses : ''},${or}`);
  if (ch === 'ecommerce' || ch === 'app') { const dims = { device: ['mobile', 'desktop', 'tablet'], source: ['google', 'direct', 'meta', 'email'], campaign: ['(not set)', 'otoño', 'bf'] }; Object.entries(dims).forEach(([dm, sgs]) => { let left = ses; sgs.forEach((sg, i) => { const v = i === sgs.length - 1 ? left : Math.round(ses * (0.2 + 0.4 / (i + 1)) * 0.5); const x = Math.min(left, v); left -= x; seg.push(`${d},${ch},${dm},${sg},${x}`); }); }); } }));
fs.writeFileSync(path.join(D, 'diario-canal.csv'), daily.join('\n')); fs.writeFileSync(path.join(D, 'segmentos-ga4.csv'), seg.join('\n')); fs.writeFileSync(path.join(D, 'diario-plan-real.csv'), plan.join('\n'));
fs.writeFileSync(path.join(D, 'config-z1.json'), JSON.stringify({ corte: '2026-09-20', periodo: { tipo: 'mes', clave: '2026-09' }, calidad: { ecommerce: 'ready', app: 'ready', whatsapp: 'warnings', llamadas: 'ready' }, esperados: { ecommerce: { nivel: 'Alta' }, whatsapp: { nivel: 'Media' } } }, null, 2));
fs.writeFileSync(path.join(D, 'MANIFIESTO.json'), JSON.stringify({ origen: 'simulado', extraido_por: 'generar-fixtures.js (determinista)', fecha_extraccion: '2026-11-13', descripcion: 'Datos SIMULADOS para probar el paquete de validación externa; no son datos reales' }, null, 2));
const H = {}; ['productos.csv', 'diario-canal.csv', 'segmentos-ga4.csv', 'diario-plan-real.csv', 'config-z1.json'].forEach((f) => { H[f] = L.sha256(fs.readFileSync(path.join(D, f))); }); fs.writeFileSync(path.join(D, 'HASHES.json'), JSON.stringify(H, null, 2));
console.log('fixtures simulados generados en ' + path.relative(L.ROOT, D));
