#!/usr/bin/env node
/* Fase 3 · ronda final de calidad — pruebas de COHERENCIA ENTRE CAPAS (Z1 ↔ Z3 ↔ Z4) con la especificación tools/audit/coherencia-zonas.js.
 * Son pruebas de lógica y de especificación con DATOS SIMULADOS; ninguna usa datos reales de FESA.
 *   A) el detector encuentra contradicciones REALES: las que tenía el prototipo 3.5 antes de esta ronda (situaciones armadas a mano con elementos de otro escenario) y casos plantados;
 *   B) 3 000 lecturas de Z1 aleatorias → Z3 y Z4 derivados → el detector no encuentra ninguna contradicción (y se verifican los invariantes de cada derivación);
 *   C) mutaciones: se rompe la derivación y se exige que el detector (o los invariantes) lo noten.
 *   node tools/test-fase3-coherencia.js */
const fs = require('fs'), path = require('path'), Module = require('module');
const SPEC = path.join(__dirname, 'audit/coherencia-zonas.js');
const Z1 = require('./audit/z1-lectura-ejecutiva.js'), Z3 = require('./audit/z3-atencion.js'), Z4 = require('./audit/z4-acciones.js'), S1 = require('./audit/z1-escenarios.js'), S3 = require('./audit/z3-escenarios.js'), S4 = require('./audit/z4-escenarios.js');
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 420) : '')); if (!c) bad++; };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const h = S1.helpers;
function randomZ1(r) {
  const pick = (a) => a[Math.floor(r() * a.length)], plan = Math.round(1e6 + r() * 5e7), roll = r(), conv0 = r() < 0.1;
  const actual = roll < 0.05 ? null : roll < 0.08 ? -1000 : conv0 ? 0 : Math.round(plan * (0.7 + r() * 0.6)), target = plan * 1.5, close = r() < 0.1 ? null : Math.round(target * (0.85 + r() * 0.3));
  const act = r() < 0.12 ? undefined : { sessions: r() < 0.05 ? 0 : (r() < 0.06 ? null : Math.round(1000 + r() * 4e5)), orders: conv0 ? 0 : (r() < 0.06 ? null : Math.round(10 + r() * 9000)), revenue: actual === null ? null : (r() < 0.05 ? Math.round(actual * 0.99) : actual) };
  return h.base({ period: h.period({ daysCounted: r() < 0.04 ? 0 : 1 + Math.floor(r() * 29) }), plan: { available: r() > 0.05 }, revenue: { planToDate: plan, actualToDate: actual, gap: actual === null ? null : actual - plan, compliance: actual === null ? null : actual / plan, gapPct: actual === null ? null : actual / plan - 1 },
    activity: act, forecast: close === null ? {} : { target, close, gapPct: close / target - 1 },
    comparable: pick([undefined, h.COMP('ok', (r() - 0.5) * 0.4, 1e5, plan * 0.9), h.COMP('ok', (r() - 0.5) * 0.4, 1e5, plan * 0.9), h.COMP('sin_base_comparable', null, null, null), h.COMP('cambio_de_composicion', 0.1, 1e5, plan), h.COMP('recuperacion_desde_cero', null, 1e5, 0), h.COMP('conversion_cero_actual', -1, -1e5, 1e5)]),
    reliability: h.REL({ support: pick(['alto', 'alto', 'medio', 'bajo']), coverage: r() < 0.05 ? null : (r() < 0.12 ? 0.4 : 0.6 + r() * 0.4), warnings: r() < 0.3 ? ['Los datos traen avisos de calidad (3 registros).'] : [], blocking: r() < 0.07 ? ['Falta la meta anual definida.'] : [], dataErrors: r() < 0.08 }),
    findings: [], margin: pick([undefined, S1.MARGIN, { marginEnabled: true, grossMarginPct: 0, updatedAt: '2026-11-01', source: 'manual' }, { marginEnabled: true, grossMarginPct: -5, updatedAt: 'x', source: 'manual' }]) });
}
function pipeline(CO, i) {
  const o1 = Z1.build(i), findings = CO.findingsFromZ1(i, o1), missing = findings.filter((f) => /^data_/.test(f.rule.family) && (f.severity === 'critica' || f.rule.family === 'data_errores')).map((f) => ({ label: f.title, view: 'calidad' }));
  const o3 = Z3.build({ findings, reliability: { level: o1.reliability.level }, missing }), actions = CO.actionsFromZ3(o3), o4 = Z4.build({ attention: o3, actions });
  return { o1, findings, o3, actions, o4, viol: CO.check(o1, o3, o4) };
}
function pipelineFailures(CO, N = 3000) {
  const f = [], r = rng(20261114), add = (c, m, x) => { if (!c && f.length < 10) f.push(`${m} | ${x.o1.reliability.level}/${x.o1.reliability.cause} · Z3 ${x.o3.header} · Z4 ${x.o4.header}`); };
  for (let k = 0; k < N; k++) {
    const i = randomZ1(r); let x; try { x = pipeline(CO, i); } catch (e) { f.push('excepción: ' + e.message); continue; }
    add(x.viol.length === 0, `contradicción entre capas: ${x.viol}`, x);
    add(x.o3.rejected.length === 0 && x.o4.rejected.length === 0, `la derivación produjo elementos o acciones inválidos: ${JSON.stringify([...x.o3.rejected, ...x.o4.rejected].map((y) => y.id + ':' + y.errors[0]))}`, x);
    add(x.o4.unlinked.length === 0, 'la derivación produjo acciones sin elemento a la vista', x);
    const p = x.o1.economic.primary;
    add(!(p && p.kind === 'brecha') || x.o3.cards.every((c) => c.clase === 'hallazgo' || c.isData || x.o1.reliability.level === 'Alta' || x.o1.reliability.level === 'Media'), 'D1 con brecha pero confiabilidad baja solo hay hallazgos y datos', x);
    add(!(x.o1.data && x.o1.data.issues.length) || x.o3.cards.some((c) => c.isData && /pendiente|concilia/i.test(c.title)) || x.o1.reliability.level === 'Insuficiente', 'D2 una inconsistencia de datos de Z1 figura como elemento de datos en Z3', x);
    add(!x.o1.reliability.causes.includes('sin_actividad') || x.o3.cards.some((c) => /actividad/.test(c.id)), 'D3 sin actividad verificable Z3 lo dice', x);
    add(x.o4.cards.every((c) => c.kind === 'datos' || x.o3.cards.some((y) => c.cites.some((z) => z.id === y.id))), 'D4 toda acción del negocio cita un elemento visible', x);
    const gap = x.o3.cards.find((c) => c.family === 'pacing_gap'); add(!gap || !p || p.kind !== 'brecha' || gap.impact.sales.point === p.amount, 'D5 el importe de la brecha es el mismo en Z1 y Z3', x);
  }
  return f;
}
/* ---------- A) contradicciones reales ---------- */
const CO = require(SPEC);
function planted(CO) {
  const z1in = (n) => S1.SCENARIOS.find((s) => s.n === n).input, k0 = S3.K(undefined), b7 = S3.base7(undefined), C = S4.C, out = {};
  const viejas = [['alta', 2, { findings: b7, reliability: { level: 'Alta' }, missing: [] }, [C.gap, C.canal, C.cierre, C.driver, C.rec]], ['media', 4, { findings: b7, reliability: { level: 'Media' }, missing: [] }, [C.gap, C.cierre]], ['baja', 5, { findings: b7, reliability: { level: 'Baja' }, missing: [S4.MISS.filas] }, [C.gap, C.filas]]];
  out.viejas = viejas.map(([id, nn, z3, a4]) => { const o1 = Z1.build(z1in(nn)), o3 = Z3.build(z3), o4 = Z4.build({ attention: o3, actions: a4 }); return [id, CO.check(o1, o3, o4)]; });
  const o1 = Z1.build(z1in(8)), o3 = Z3.build({ findings: [k0.datoCritico, k0.gap], reliability: { level: 'Alta' }, missing: [] }), o4 = Z4.build({ attention: o3, actions: [C.gap] }); out.c2 = CO.check(o1, o3, o4);
  const o3b = Z3.build({ findings: [k0.gap], reliability: { level: 'Media' }, missing: [] }), o4b = Z4.build({ attention: o3b, actions: [C.gap] }); out.c1 = CO.check(Z1.build(z1in(2)), o3b, o4b);
  const o3c = Z3.build({ findings: [k0.gap, k0.rec1], reliability: { level: 'Alta' }, missing: [] }), o4c = Z4.build({ attention: o3c, actions: [{ ...C.rec, motivatedBy: [S4.key(k0.rec1)] }] });
  out.c8 = CO.check(Z1.build(z1in(2)), o3c, { ...o4c, cards: o4c.cards.map((c) => ({ ...c, cites: [{ ...c.cites[0], id: 'f:otro' }] })) });
  const o3d = Z3.build({ findings: [k0.gap], reliability: { level: 'Alta' }, missing: [] }); out.c15 = CO.check(Z1.build(z1in(2)), o3d, Z4.build({ attention: o3d, actions: [C.gap] }));   // Z1 dice que el cierre no alcanzaría la meta y Z3 no muestra el riesgo
  const o3e = Z3.build({ findings: [], reliability: { level: 'Insuficiente' }, missing: [] }); out.c16 = CO.check(Z1.build(z1in(6)), o3e, Z4.build({ attention: o3e, actions: [] }));
  return out;
}
function plantedFailures(CO) {
  const r = planted(CO), f = [];
  if (!(r.viejas.find((x) => x[0] === 'media')[1].some((m) => /C3/.test(m)) && r.viejas.every((x) => x[1].some((m) => /C4/.test(m))))) f.push('no detecta las contradicciones del prototipo anterior (C3, C4)');
  if (!r.c2.some((m) => /C2/.test(m))) f.push('no detecta C2'); if (!r.c1.some((m) => /C1 la confiabilidad de Z3/.test(m))) f.push('no detecta C1'); if (!r.c8.some((m) => /C8/.test(m))) f.push('no detecta C8');
  if (!r.c15.some((m) => /C15/.test(m))) f.push('no detecta C15'); if (!r.c16.some((m) => /C16/.test(m))) f.push('no detecta C16');
  return f;
}
{
  const r = planted(CO);
  t('A · el detector encuentra las contradicciones que tenía el prototipo 3.5 antes de esta ronda (la situación «media» decía en Z1 que el cierre superaba la meta y en Z3 mostraba un riesgo de cierre por debajo; las brechas de Z1 y Z3 no coincidían)', r.viejas.find((x) => x[0] === 'media')[1].some((m) => /C3/.test(m)) && r.viejas.every((x) => x[1].some((m) => /C4/.test(m))), r.viejas);
  t('A · detector: un faltante crítico en Z3 con confiabilidad Alta en Z1 se señala (Z1 contradice a Z3)', r.c2.some((m) => /C2/.test(m)));
  t('A · detector: niveles distintos entre Z1 y Z3 se señalan (C1)', r.c1.some((m) => /C1 la confiabilidad de Z3/.test(m)));
  t('A · detector: una recomendación que cita un elemento que no está a la vista se señala (C8)', r.c8.some((m) => /C8/.test(m)));
  t('A · detector: Z1 dice que el cierre no alcanzaría la meta y Z3 no muestra ese riesgo (omisión, C15)', r.c15.some((m) => /C15/.test(m)));
  t('A · detector: con confiabilidad Insuficiente, Z3 no dice qué falta (C16)', r.c16.some((m) => /C16/.test(m)));
}
/* ---------- B) lecturas aleatorias ---------- */
const fb = pipelineFailures(CO);
t('B · 3 000 lecturas de Z1 aleatorias: Z3 y Z4 derivados no se contradicen con Z1 en ninguna de las 14 reglas, la derivación no produce nada inválido y los invariantes D1–D5 se cumplen', fb.length === 0, fb.slice(0, 3));
{
  const inputs = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((nn) => S1.SCENARIOS.find((s) => s.n === nn).input).concat(S1.ADICIONALES.map((s) => s.input));
  const bads = inputs.map((i, k) => { const x = pipeline(CO, i); return x.viol.length || x.o3.rejected.length || x.o4.rejected.length ? [k, x.viol, x.o3.rejected.map((y) => y.errors[0])] : null; }).filter(Boolean);
  t(`B · los ${inputs.length} escenarios de Z1 (14 obligatorios, 16 adicionales) producen, con Z3 y Z4 derivados, capas coherentes y válidas`, bads.length === 0, bads.slice(0, 3));
}
/* ---------- C) mutaciones ---------- */
function load(src) { const m = new Module(SPEC, null); m.filename = SPEC; m.paths = Module._nodeModulePaths(path.dirname(SPEC)); m._compile(src, SPEC); return m.exports; }
const SRC = fs.readFileSync(SPEC, 'utf8');
const MUT = [
  ['la brecha de Z3 usa un importe distinto del de Z1', "economics: gapImp('gap_to_date', gap)", "economics: gapImp('gap_to_date', gap * 0.98)"],
  ['el canal concentra más brecha que la total', "gapImp('gap_ecommerce', gap * SHARE.canal, 'ecommerce')", "gapImp('gap_ecommerce', gap * 1.3, 'ecommerce')"],
  ['no se deriva el riesgo de cierre aunque Z1 proyecte un cierre por debajo', "if (i.forecast && fin(i.forecast.gapPct) && i.forecast.gapPct < -0.01 && (lvl === 'Alta' || lvl === 'Media')) {", "if (false) {"],
  ['se deriva un riesgo de cierre aunque Z1 proyecte un cierre en línea', "i.forecast.gapPct < -0.01 && (lvl", "i.forecast.gapPct < 0.5 && (lvl"],
  ['se ignoran los bloqueos de Z1', "(i.reliability.blocking || []).forEach((b, k) => dataF(", "[].forEach((b, k) => dataF("],
  ['se ignora la falta de actividad', "if (o1.reliability.causes.includes('sin_actividad')) dataF(", "if (false) dataF("],
  ['el detector no compara la confiabilidad de Z3', "add(o3.level === lvl, `C1 la confiabilidad de Z3", "add(true, `C1 la confiabilidad de Z3"],
  ['el detector no revisa que la acción cite un elemento a la vista', "add(o4.cards.every((c) => c.cites.every((x) => vis.has(x.id))) &&", "add(true || o4.cards.every((c) => c.cites.every((x) => vis.has(x.id))) &&"],
  ['las oportunidades se presentan con un importe observado', "category: 'alcanzable', provenance: 'projected', amount: { point: -gap * k }", "category: 'alcanzable', provenance: 'observed', amount: { point: -gap * k }"],
  ['se omite la inconsistencia de datos de Z1 en Z3', "if (o1.data && o1.data.issues.length) o1.data.issues.forEach(", "if (false) o1.data.issues.forEach("]
];
MUT.forEach(([name, from, to]) => {
  if (!SRC.includes(from)) { t(`C · mutación «${name}»: el patrón existe en la especificación`, false, from.slice(0, 80)); return; }
  let killed = false, how = '';
  try { const M = load(SRC.replace(from, to)); const f = [...plantedFailures(M), ...pipelineFailures(M, 800)]; killed = f.length > 0; how = killed ? 'coherencia' : ''; } catch (e) { killed = true; how = 'excepción'; }
  t(`C · mutación «${name}» detectada (${how || 'SOBREVIVE'})`, killed);
});
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
