#!/usr/bin/env node
/* Fase 3 · D-05 (aceptada el 12-nov-2026) — pruebas de la corrección de la afirmación «datos completos» en Z1 (tools/audit/z1-lectura-ejecutiva.js). DATOS SIMULADOS.
 *   A) Regresión contra la especificación aceptada de 3.2 (copia con el mismo hash que la línea base): la corrección NO cambia nivel, modo, estado, economía, conclusiones, alcance ni visibilidad.
 *   B) La frase «datos completos» solo aparece con completitud VERIFICADA (cobertura 100 %, sesiones/pedidos/venta de actividad presentes, sin avisos).
 *   C) Escenarios: sesiones faltantes, datos parciales, completitud no verificable; las métricas calculables siguen mostrándose.
 *   D) Mutaciones: si se rompe una condición, alguna prueba falla.   node tools/test-fase3-d05-completitud.js */
const fs = require('fs'), path = require('path'), Module = require('module'), crypto = require('crypto');
const SPEC = path.join(__dirname, 'audit/z1-lectura-ejecutiva.js'), OLD = path.join(__dirname, 'audit/_historico/z1-lectura-ejecutiva.v3.2-aceptada.js');
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 420) : '')); if (!c) bad++; };
function load(src, asFile) { const m = new Module(asFile, module); m.filename = asFile; m.paths = Module._nodeModulePaths(path.dirname(asFile)); m._compile(src, asFile); return m.exports; }
const Znew = require(SPEC), Zold = load(fs.readFileSync(OLD, 'utf8'), SPEC.replace('.js', '.old.js'));
const S1 = require('./audit/z1-escenarios.js'), h = S1.helpers;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function randomZ1(r) {
  const pick = (a) => a[Math.floor(r() * a.length)], plan = Math.round(1e6 + r() * 5e7), actual = r() < 0.05 ? null : Math.round(plan * (0.7 + r() * 0.6));
  const act = r() < 0.15 ? undefined : { sessions: r() < 0.2 ? null : Math.round(1000 + r() * 4e5), orders: r() < 0.2 ? null : Math.round(10 + r() * 9000), revenue: r() < 0.15 ? null : (actual === null ? null : Math.round(actual * (r() < 0.8 ? 1 : 0.97))) };
  return h.base({ period: h.period({ daysCounted: r() < 0.04 ? 0 : 1 + Math.floor(r() * 29) }), plan: { available: r() > 0.05 }, revenue: { planToDate: plan, actualToDate: actual, gap: actual === null ? null : actual - plan, compliance: actual === null ? null : actual / plan, gapPct: actual === null ? null : actual / plan - 1 },
    activity: act, forecast: { target: plan * 1.5, close: Math.round(plan * 1.5 * (0.85 + r() * 0.3)), gapPct: -0.05 + r() * 0.1 }, comparable: pick([undefined, h.COMP('ok', (r() - 0.5) * 0.4, 1e5, plan * 0.9), h.COMP('sin_base_comparable', null, null, null)]),
    reliability: h.REL({ support: pick(['alto', 'alto', 'alto', 'medio', 'bajo']), coverage: r() < 0.05 ? null : pick([1, 1, 1, 0.95, 0.8, 0.5]), warnings: r() < 0.15 ? ['Aviso de calidad.'] : [], blocking: [], dataErrors: r() < 0.05 }), margin: pick([undefined, S1.MARGIN]) });
}
const SCN = S1.SCENARIOS.map((s) => s.input).concat((S1.ADICIONALES || []).map((s) => s.input).filter(Boolean));
const rr = rng(20261112), INPUTS = SCN.concat(Array.from({ length: 4000 }, () => randomZ1(rr)));
const strip = (o) => ({ rel: o.reliability, state: o.state, cmp: o.comparability, eco: o.economic, comparable: o.comparable, fc: o.forecast, scope: o.scope, data: o.data, concl: o.conclusions, show: o.show, hide: o.hide, kind: o.verdict.kind, emit: o.verdict.emit });
/* ---------- A) regresión ---------- */
let diffs = [], onlyClosing = true, changedVerdict = 0;
INPUTS.forEach((i, k) => { const a = Zold.build(i), b = Znew.build(i); if (JSON.stringify(strip(a)) !== JSON.stringify(strip(b))) diffs.push(k);
  if (a.verdict.text !== b.verdict.text) { changedVerdict++; const base = a.verdict.text.replace(/ Lectura sustentada en datos completos\.$/, ''); if (!b.verdict.text.startsWith(base)) onlyClosing = false; } });
t(`A1 la corrección no cambia nivel, modo, estado, comparabilidad, economía, pronóstico, alcance, datos, conclusiones ni visibilidad en ${INPUTS.length} entradas`, diffs.length === 0, diffs.slice(0, 5));
t('A2 el único cambio del veredicto es la frase final sobre la completitud (el resto del texto es idéntico)', onlyClosing, changedVerdict);
/* ---------- B) la frase solo con completitud verificada ---------- */
const PH = /datos completos/i; let leak = [], missingShown = 0, verified = 0, nonV = 0;
INPUTS.forEach((i, k) => { const o = Znew.build(i), all = [o.verdict.text, o.narrative.short, ...Object.values(o.narrative.long)].join(' ');
  if (PH.test(all) && !(o.completeness.status === 'verificada' && o.reliability.mode === 'definitiva')) leak.push(k);
  if (o.completeness.status === 'verificada') { verified++; } else nonV++;
  if (o.reliability.level === 'Alta' && o.completeness.status !== 'verificada' && PH.test(o.verdict.text)) leak.push('Alta ' + k);
  if (o.completeness.status === 'incompleta' && !o.completeness.missing.length) missingShown++; });
t('B1 «datos completos» solo aparece con completitud verificada y lectura definitiva', !leak.length, leak.slice(0, 5));
t('B2 toda completitud «incompleta» identifica qué falta', missingShown === 0);
t(`B3 el conjunto de pruebas cubre ambos lados (${verified} verificadas, ${nonV} no verificadas)`, verified > 50 && nonV > 500);
t('B4 la completitud verificada exige cobertura 100 %, sesiones, pedidos y venta de actividad presentes y sin avisos (comprobado en todas las entradas)', INPUTS.every((i) => { const o = Znew.build(i); if (o.completeness.status !== 'verificada') return true; const a = i.activity || {}, r = i.reliability; return r.coverage === 1 && [a.sessions, a.orders, a.revenue].every((x) => typeof x === 'number') && !(r.warnings || []).length && !r.dataErrors && r.support !== 'bajo'; }));
/* ---------- C) escenarios ---------- */
const base = S1.SCENARIOS[1].input;                                       // escenario 2: Alta, brecha negativa
const full = Znew.build(base), noSes = Znew.build({ ...base, activity: { sessions: null, orders: 21400, revenue: 15233993.8272 } }), noAct = Znew.build({ ...base, activity: undefined });
const noOrd = Znew.build({ ...base, activity: { sessions: 1120000, orders: null, revenue: 15233993.8272 } }), cov = Znew.build({ ...base, reliability: { ...base.reliability, coverage: 0.8 } });
t('C0 control: con datos verificados la afirmación se mantiene', full.completeness.status === 'verificada' && PH.test(full.verdict.text));
t('C1 sesiones faltantes: no se declara completitud; se dice que la información está incompleta y qué falta', !PH.test(noSes.verdict.text) && /incompleta/.test(noSes.verdict.text) && noSes.completeness.status === 'incompleta' && noSes.completeness.missing.includes('sesiones') && /sesiones/.test(noSes.narrative.long.limitaciones));
t('C2 sesiones faltantes: las métricas calculables NO se invalidan (misma confiabilidad, brecha y cumplimiento visibles, venta observada); la conversión queda no verificable', noSes.reliability.level === full.reliability.level && noSes.economic.primary && noSes.economic.primary.amount === full.economic.primary.amount && noSes.conclusions.cumplimiento === full.conclusions.cumplimiento && noSes.conclusions.ventaObservada === 'valida' && noSes.conclusions.conversion === 'no_verificable');
t('C3 pedidos faltantes: igual criterio', noOrd.completeness.missing.includes('pedidos') && !PH.test(noOrd.verdict.text) && noOrd.economic.primary.amount === full.economic.primary.amount);
t('C4 datos parciales (cobertura 80 %): incompleta, identifica los días sin comparar y conserva las métricas', cov.completeness.status === 'incompleta' && cov.completeness.missing.includes('días sin comparar') && !PH.test(cov.verdict.text) && /20 %/.test(cov.narrative.long.limitaciones));
t('C5 sin medida de actividad: no es posible confirmar la integridad; no se sustituye la incertidumbre por una afirmación positiva', noAct.completeness.status === 'no_verificable' && !PH.test(noAct.verdict.text) && /No es posible confirmar/.test(noAct.verdict.text));
t('C6 el veredicto sigue cumpliendo R1–R14 (≤ 34 palabras, sin cifras ni causas) en los cuatro casos', [full, noSes, noOrd, cov, noAct].every((o) => Znew.checkVerdictText(o.verdict.text, o).length === 0), [full, noSes, noAct, cov].map((o) => Znew.checkVerdictText(o.verdict.text, o)));
t('C7 sin lectura (bloqueo duro) no afirma completitud ni la confirma', INPUTS.filter((i) => Znew.build(i).reliability.mode === 'sin_lectura').every((i) => !PH.test(Znew.build(i).verdict.text)));
t('C8 la nota de completitud no atribuye causas a la ausencia de información (D-05)', INPUTS.every((i) => !/\b(se debe|debido a|porque|provoc\w*|explica\w*)\b/i.test(Znew.build(i).completeness.note)));
t('C9 se diferencia «incompleta» (falta algo conocido) de «no verificable» (no se puede saber)', noSes.completeness.status !== noAct.completeness.status);
/* ---------- D) mutaciones ---------- */
function mutate(from, to) { const src = fs.readFileSync(SPEC, 'utf8'); if (!src.includes(from)) return 'sin patrón'; const Zm = load(src.replace(from, to), SPEC.replace('.js', '.mut.js'));
  const fl = []; INPUTS.slice(0, 600).forEach((i) => { const o = Zm.build(i); if (PH.test(o.verdict.text) && o.completeness.status !== 'verificada') fl.push(1); });
  const s2 = Zm.build({ ...base, activity: { sessions: null, orders: 21400, revenue: 15233993.8272 } }); return fl.length + (PH.test(s2.verdict.text) ? 1 : 0) + (s2.completeness.status !== 'incompleta' ? 1 : 0)
    + (Zm.build({ ...base, reliability: { ...base.reliability, coverage: 0.8 } }).completeness.status !== 'incompleta' ? 1 : 0) + (Zm.build({ ...base, activity: undefined }).completeness.status !== 'no_verificable' ? 1 : 0); }
t('D1 mutación: afirmar siempre «datos completos» → se detecta', mutate("cpl.status === 'verificada' ? ' Lectura sustentada en datos completos.'", "true ? ' Lectura sustentada en datos completos.'") > 0);
t('D2 mutación: ignorar las sesiones faltantes → se detecta', mutate("if (!fin(act.sessions)) missing.push('sesiones');", '') > 0);
t('D3 mutación: ignorar la cobertura parcial → se detecta', mutate("if (fin(r.coverage) && r.coverage < 1) missing.push('días sin comparar');", '') > 0);
t('D4 mutación: tratar la actividad ausente como verificada → se detecta', mutate("(!act.known || !fin(r.coverage)) ? 'no_verificable'", "false ? 'no_verificable'") > 0);
t('E1 la copia de la especificación aceptada conserva el hash de la línea base de 3.3', (() => { const b = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/command-center/generated/HASHES_BASE_3_3.json'), 'utf8')); return crypto.createHash('sha256').update(fs.readFileSync(OLD)).digest('hex') === b.especificacion_aceptada['tools/audit/z1-lectura-ejecutiva.js']; })());
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
