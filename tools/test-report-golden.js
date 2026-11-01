#!/usr/bin/env node
/* Presentation Intelligence · Fase 0 — línea base del ARMADOR (reportBuilder) con las llamadas sintéticas de test-report-builder.js.
   Cubre láminas que los escenarios de navegador no generan con datos (tráfico, campañas, estacionalidad, recuperación, foco, selección…).
     node tools/test-report-golden.js            compara contra tools/regression/data/report_builder_golden.json
     UPDATE=1 node tools/test-report-golden.js   reescribe la línea base (solo con una diferencia identificada y justificada) */
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const GOLD = path.join(__dirname, 'regression/data/report_builder_golden.json'), tmp = path.join(os.tmpdir(), `rb_golden_${process.pid}.json`);
const r = cp.spawnSync(process.execPath, [path.join(__dirname, 'test-report-builder.js')], { env: { ...process.env, RB_GOLDEN_OUT: tmp }, encoding: 'utf8' });
if (r.status !== 0) { console.log('✘ test-report-builder.js falla por sí mismo; no se compara la línea base'); process.stdout.write((r.stdout || '').split('\n').filter((l) => l.startsWith('✘')).join('\n') + '\n'); process.exit(1); }
const cur = JSON.parse(fs.readFileSync(tmp, 'utf8')); fs.unlinkSync(tmp);
if (process.env.UPDATE) { fs.writeFileSync(GOLD, JSON.stringify(cur)); console.log(`línea base escrita: ${cur.length} llamadas a build, ${cur.reduce((s, c) => s + c.pages.length, 0)} páginas, ${Math.round(fs.statSync(GOLD).size / 1024)} KB`); process.exit(0); }
const base = JSON.parse(fs.readFileSync(GOLD, 'utf8')), diffs = [];
if (base.length !== cur.length) diffs.push(`llamadas a build: ${base.length} ≠ ${cur.length}`);
base.forEach((b, i) => {
  const c = cur[i]; if (!c) return;
  ['schema', 'total'].forEach((k) => { if (b[k] !== c[k]) diffs.push(`#${i} ${k}: ${b[k]} ≠ ${c[k]}`); });
  if (JSON.stringify(b.included) !== JSON.stringify(c.included)) diffs.push(`#${i} páginas incluidas/orden: ${b.included.join(',')} ≠ ${c.included.join(',')}`);
  if (JSON.stringify(b.omitted) !== JSON.stringify(c.omitted)) diffs.push(`#${i} omisiones/motivos distintos`);
  b.pages.forEach((p, j) => { const q = c.pages[j]; if (!q) return; if (p.sha !== q.sha) diffs.push(`#${i} página «${p.id}» cambió${p.headline !== q.headline ? ` (titular: «${String(p.headline).slice(0, 60)}» → «${String(q.headline).slice(0, 60)}»)` : ''}`); });
});
const ok = diffs.length === 0;
console.log((ok ? '✔ ' : '✘ ') + `GOLD armador: ${base.length} llamadas a build idénticas a la línea base (páginas, orden, títulos, titulares, contenido, omisiones y sellos)${ok ? '' : ' — ' + diffs.slice(0, 8).join(' | ')}`);
process.exit(ok ? 0 : 1);
