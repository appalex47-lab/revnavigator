#!/usr/bin/env node
/* Fase 3 · ronda de calidad — pruebas de los 16 escenarios comerciales críticos (datos simulados). node tools/test-fase3-escenarios-comerciales.js */
const fs = require('fs'), path = require('path'), Module = require('module');
const E = require('./audit/escenarios-comerciales.js'), CO = require('./audit/coherencia-zonas.js'), Z1 = require('./audit/z1-lectura-ejecutiva.js'), S1 = require('./audit/z1-escenarios.js');
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 360) : '')); if (!c) bad++; };
const r = E.run();
t('hay 16 escenarios cubriendo las familias pedidas', r.length === 16 && new Set(r.map((x) => x.id)).size === 16);
r.forEach((x) => t(`${x.id} ${x.familia}: todas las comprobaciones pasan y no hay contradicción entre Z1, Z3 y Z4`, !x.fallas.length && !x.contradicciones.length, x.fallas.concat(x.contradicciones)));
t('cada escenario declara datos, interpretación, confiabilidad, mensaje, recomendación y afirmaciones evitadas', r.every((x) => x.datos && x.interpreta && x.confiabilidad && x.mensaje && x.evita.length && Array.isArray(x.recomendacion)));
t('las definiciones de negocio abiertas quedan como decisión pendiente (E07, E08, E10, E12, E13, E14), no como regla inventada', ['E07', 'E08', 'E10', 'E12', 'E13', 'E14'].every((id) => r.find((x) => x.id === id).pendiente));
// C17 plantado: Z3 con conversión cuando Z1 la declara no verificable
const k = S1.SCENARIOS.find((s) => s.n === 2).input, o1 = Z1.build({ ...k, activity: { sessions: null, orders: 9000, revenue: 9300000 } });
const Z3 = require('./audit/z3-atencion.js'), Z4 = require('./audit/z4-acciones.js'), S3 = require('./audit/z3-escenarios.js'), S4 = require('./audit/z4-escenarios.js');
const k0 = S3.K(undefined), o3 = Z3.build({ findings: [k0.gap], reliability: { level: o1.reliability.level }, missing: [] }), o4 = Z4.build({ attention: o3, actions: [] });
const fake = { ...o3, cards: [...o3.cards, { ...o3.cards.find((c) => !c.isData), id: 'x:driver-plantado', title: 'La conversión explica la mayor parte de la variación' }] };
t('el detector reconoce C17 cuando Z3 habla de conversión y Z1 la declara no verificable (caso plantado) y no la reconoce sin ese elemento', o1.conclusions.conversion === 'no_verificable' && CO.check(o1, fake, o4).some((m) => /C17/.test(m)) && !CO.check(o1, o3, o4).some((m) => /C17/.test(m)), CO.check(o1, fake, o4));
// mutaciones: quitar la compuerta de conversión verificable debe hacer fallar escenarios
function mutate(from, to) { const src = fs.readFileSync(path.join(__dirname, 'audit/coherencia-zonas.js'), 'utf8'); if (!src.includes(from)) return 'sin patrón'; const tmp = path.join(__dirname, 'audit/_mut_coh.js'); fs.writeFileSync(tmp, src.replace(from, to)); const keys = Object.keys(require.cache).filter((k) => /coherencia-zonas|escenarios-comerciales/.test(k)); keys.forEach((k) => delete require.cache[k]);
  const orig = Module._resolveFilename; Module._resolveFilename = function (req, ...a) { return /coherencia-zonas/.test(req) ? tmp : orig.call(this, req, ...a); };
  try { const M = require('./audit/escenarios-comerciales.js'); return M.run().filter((x) => x.fallas.length || x.contradicciones.length).length; } finally { Module._resolveFilename = orig; fs.unlinkSync(tmp); Object.keys(require.cache).filter((k) => /coherencia-zonas|escenarios-comerciales|_mut_coh/.test(k)).forEach((k) => delete require.cache[k]); } }
const m1 = mutate("if (convOk && i.comparable", "if (i.comparable"), m2 = mutate("if (convOk) out.push(rec('o:conv'", "if (true) out.push(rec('o:conv'");
t('mutación: sin la compuerta de conversión verificable en el driver, algún escenario lo detecta', typeof m1 === 'number' && m1 > 0, m1);
t('mutación: sin la compuerta en la alternativa de conversión, algún escenario lo detecta', typeof m2 === 'number' && m2 > 0, m2);
t('el documento generado coincide con los datos (sin edición manual)', (() => { const md = fs.readFileSync(path.join(__dirname, '../docs/command-center/ESCENARIOS_COMERCIALES_CRITICOS.md'), 'utf8'); return r.every((x) => md.includes(`| ${x.id} |`)); })());
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
