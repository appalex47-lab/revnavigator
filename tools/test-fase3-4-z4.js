#!/usr/bin/env node
/* Fase 3 · Subfase 3.4 — pruebas de la especificación ejecutable de Z4 «Qué hago» (tools/audit/z4-acciones.js).
 * Pruebas de LÓGICA y de ESPECIFICACIÓN con DATOS SIMULADOS (acciones y elementos de Z3 construidos con los contratos de Fase 2). Ninguna usa datos reales de FESA.
 *   A) 14 escenarios; B) invariantes sobre conjuntos aleatorios; B2) propiedades metamórficas; C) textos incorrectos A1–A7; D) mutaciones.
 *   node tools/test-fase3-4-z4.js */
const fs = require('fs'), path = require('path'), Module = require('module');
const SPEC = path.join(__dirname, 'audit/z4-acciones.js');
const SC = require('./audit/z4-escenarios.js'), S3 = require('./audit/z3-escenarios.js'), Z3 = require('./audit/z3-atencion.js'), CC = require('./audit/command-center-contracts.js');
const WRONG = require('./audit/z4-ejemplos-incorrectos.json');
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 420) : '')); if (!c) bad++; };
const clone = (x) => JSON.parse(JSON.stringify(x));
const BANNED = /utilidad|ganancia|beneficio neto|rentabilidad|\bROI\b|\bROAS\b|\bCAC\b/i;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function scenarioFailures(Z) { const f = []; SC.SCENARIOS.forEach((s) => { try { f.push(...SC.check(Z, s)); } catch (e) { f.push(`${s.n}: excepción ${e.message}`); } }); return f; }

/* ---------- conjuntos aleatorios: elementos de Z3 + acciones del catálogo + acciones sueltas ---------- */
function randomInput(r) {
  const pick = (a) => a[Math.floor(r() * a.length)], k = S3.K(undefined), cat = Object.values(k), findings = [];
  cat.forEach((f) => { if (r() < 0.65) { const g = clone(f); if (r() < 0.3) g.severity = pick(['seguimiento', 'importante', 'critica']); if (r() < 0.2) g.certainty.support = pick(['alto', 'medio', 'bajo']); findings.push(g); } });
  const level = pick(['Alta', 'Alta', 'Media', 'Baja', 'Insuficiente']), missing = r() < 0.5 ? [SC.MISS.filas] : [];
  const keys = findings.map((f) => CC.dedupKey(f)), kinds = ['revisar', 'investigar', 'decidir', 'datos'], actions = [];
  const m = Math.floor(r() * 7);
  for (let i = 0; i < m; i++) { const kind = pick(kinds), mk = keys.length ? [pick(keys), ...(r() < 0.3 ? [pick(keys)] : [])] : [];
    actions.push({ id: `a:r${i}`, kind, label: pick(['Abrir el detalle del elemento', 'Revisar el pronóstico de cierre', 'Comparar el embudo por semana', 'Evaluar las alternativas de recuperación', 'Corregir las filas rechazadas de la carga']), destination: { view: pick(['diagnostico', 'canales', 'embudo', 'calidad']), label: 'Destino' },
      source: { engine: pick(['attentionEngine', 'guide', 'recoveryEngine']), field: 'next' }, basis: 'Base de prueba de la recomendación.', motivatedBy: kind === 'datos' && r() < 0.5 ? [] : mk, requires: kind === 'datos' && r() < 0.6 ? [SC.MISS.filas.label] : [] }); }
  if (r() < 0.25) actions.push(clone(pick(Object.values(SC.C))));
  return { z3in: { findings, reliability: { level }, missing }, actions, level };
}
function invariantFailures(Z, N = 2000) {
  const f = [], r = rng(20261113), add = (c, name, o, att) => { if (!c && f.length < 12) f.push(`${name} | ${att.level} · ${o.header} · ${o.cards.map((x) => x.kind[0] + ':' + x.id).join(' ')}`); };
  for (let k = 0; k < N; k++) {
    const i = randomInput(r), att = Z3.build(i.z3in); let o; try { o = Z.build({ attention: att, actions: i.actions }); } catch (e) { f.push('excepción: ' + e.message); continue; }
    const ids = o.cards.map((c) => c.id), vis = new Set(att.cards.map((c) => c.id));
    add(new Set(ids).size === ids.length && o.featured.length === Math.min(3, o.cards.length) && o.featured.every((x) => ids.includes(x)), 'I1 destacadas: sin repetidas, dentro del universo y exactamente min(3, M)', o, att);
    add(o.cards.every((c) => c.kind === 'datos' ? (c.cites.length >= 1 || c.requires.length >= 1) : c.cites.length >= 1), 'I2 toda recomendación cita al menos un elemento (o, si es de datos, su requisito)', o, att);
    add(o.cards.every((c) => c.cites.every((x) => vis.has(x.id))), 'I3 solo se cita lo que está a la vista en Z3 (nada retenido ni inexistente)', o, att);
    add(o.cards.every((c) => c.level === 'accion' && c.levelLabel === 'Recomendación'), 'I4 una acción es una recomendación (nivel «acción»), nunca un hecho ni una conclusión', o, att);
    if (att.level === 'Insuficiente') add(o.cards.every((c) => c.kind === 'datos'), 'I5 confiabilidad Insuficiente: solo acciones de datos', o, att);
    if (att.level === 'Baja') add(o.cards.every((c) => c.kind === 'datos' || c.kind === 'revisar'), 'I6 confiabilidad Baja: solo datos y revisión de lo observado', o, att);
    add(o.cards.every((c) => !/\b(owner|assignee|responsible|dueDate|deadline|status|progress)\b/.test(Object.keys(c).join(' '))), 'I7 sin responsables, fechas ni estatus (gestión de tareas fuera de alcance)', o, att);
    add(o.cards.every((c) => !('amount' in c) && !('economics' in c) && !('impact' in c)), 'I8 una acción no tiene importe propio; solo cita el del elemento (sin doble conteo)', o, att);
    add(o.cards.every((c) => c.cites.every((x) => !x.impactRef || /no es un importe de la acción/.test(x.impactRef.note))), 'I9 el importe citado se rotula como del elemento', o, att);
    add(o.cards.every((c) => Z.checkActionText(c.label, c).length === 0 && !BANNED.test(c.label + ' ' + c.why)), 'I10 los textos cumplen A1–A7', o, att);
    add(o.cards.every((c) => !(c.kind === 'decidir' && ['hipotesis', 'senal'].includes(c.basisCertainty.level))), 'I11 nunca se recomienda decidir sobre una señal o una hipótesis', o, att);
    add(o.cards.every((c) => !['hipotesis', 'senal'].includes(c.basisCertainty.level) || c.tags.some((x) => /comprobación/.test(x))), 'I12 la acción apoyada en una señal o hipótesis se rotula como comprobación', o, att);
    add(o.header === (o.cards.length ? `${o.featured.length} de ${o.cards.length}` : null) && o.seeAll.visible === (o.cards.length > o.featured.length) && o.seeAll.filters[0].count === o.cards.length && Object.keys(Z.KINDS).reduce((a, x) => a + o.counts[x], 0) === o.cards.length, 'I13 D-03: «3 de M», «Ver todas» y los filtros son coherentes con el universo', o, att);
    const dFirst = o.cards.findIndex((c) => c.kind !== 'datos'); add(dFirst < 0 || !o.cards.slice(dFirst).some((c) => c.kind === 'datos'), 'I14 las acciones de datos van antes que las demás', o, att);
    let ordered = true; const nd = o.cards.filter((c) => c.kind !== 'datos'); for (let j = 1; j < nd.length; j++) if (nd[j - 1].rank > nd[j].rank) ordered = false; add(ordered, 'I15 el resto sigue el orden del elemento que las motiva en Z3', o, att);
    add(!o.cards.length === !!o.fallback && (!o.fallback || ['que_falta', 'sin_base', 'vacio'].includes(o.fallback.type)), 'I16 sin acciones se dice qué falta o que no hay nada; nunca se inventa una recomendación', o, att);
    const kk = o.cards.map((c) => `${c.kind}|${c.destination.view}|${c.cites.map((x) => x.dedupKey).sort().join(',')}|${c.requires.slice().sort().join(',')}`); add(new Set(kk).size === kk.length, 'I17 la misma acción de dos motores es una sola', o, att);
    add(o.rejected.length + o.unlinked.length + o.held.count + o.cards.length + o.cards.reduce((a, c) => a + c.alsoFrom.length, 0) === i.actions.length, 'I18 nada se pierde: cada acción propuesta se muestra, se une a otra, se retiene, se vincula mal o se rechaza', o, att);
    add(o.cards.every((c) => c.kind === 'datos' || !c.requires.some((q) => (att.dataPanel.items || []).some((m) => m.label === q))), 'I21 una recomendación que requiere datos que faltan no se muestra (no puede ejecutarse)', o, att);
    add(JSON.stringify(Z.build({ attention: att, actions: i.actions })) === JSON.stringify(o), 'I19 determinista', o, att);
    const rv = { attention: att, actions: i.actions.slice().reverse() }; const o2 = Z.build(rv); add(o2.cards.map((c) => c.id).join() === ids.join() || o2.cards.map((c) => c.kind + c.rank).join() === o.cards.map((c) => c.kind + c.rank).join(), 'I20 el orden de llegada no cambia el orden mostrado', o, att);
  }
  return f;
}
function metamorphicFailures(Z, N = 600) {
  const f = [], r = rng(881), add = (c, name) => { if (!c && f.length < 8) f.push(name); };
  for (let k = 0; k < N; k++) {
    const i = randomInput(r), att = Z3.build(i.z3in), o = Z.build({ attention: att, actions: i.actions });
    const lv = ['Alta', 'Baja', 'Insuficiente'].map((l) => { const a = Z3.build({ ...i.z3in, reliability: { level: l } }); return Z.build({ attention: a, actions: i.actions }).cards.length; }); add(lv[0] >= lv[1] && lv[1] >= lv[2], 'M1 bajar la confiabilidad nunca muestra más recomendaciones');
    const gen = { ...clone(SC.C.generica), id: 'a:gen' }; add(Z.build({ attention: att, actions: [...i.actions, gen] }).cards.length === o.cards.length, 'M2 añadir una recomendación genérica no cambia lo que se muestra');
    const tk = i.actions.map((a) => ({ ...a, owner: 'X', dueDate: '2026-10-01', status: 'en curso' })); add(Z.build({ attention: att, actions: tk }).cards.map((c) => c.id).join() === o.cards.map((c) => c.id).join(), 'M3 los campos de gestión de tareas no cambian nada');
    if (i.actions.length) { const dup = { ...clone(i.actions[0]), id: 'a:dup', source: { engine: 'narrativeEngine', field: 'cita' } }; add(Z.build({ attention: att, actions: [...i.actions, dup] }).cards.length === o.cards.length, 'M4 la misma acción de otro motor no añade una tarjeta'); }
    for (const lim of [1, 2, 5]) add(Z.build({ attention: att, actions: i.actions, limit: lim }).featured.length === Math.min(lim, o.cards.length), 'M5 el límite de destacadas se respeta');
    const ag = { ...clone(SC.C.huerfana), id: 'a:huerfana' }; add(Z.build({ attention: att, actions: [...i.actions, ag] }).cards.length === o.cards.length, 'M6 una acción cuyo motivo no existe no se muestra');
  }
  return f;
}

function unitFailures(Z) {
  const f = [], bads = { generica: SC.C.generica, sinMotivo: SC.C.sinMotivo, importeTexto: SC.C.conImporteEnTexto, importePropio: SC.C.conImportePropio, causal: SC.C.causal, asignada: SC.C.asignada,
    financiera: { ...SC.C.gap, id: 'a:fin', label: 'Revisar el ROAS de las campañas de App' }, tarea: SC.C.conTarea };
  Object.entries(bads).forEach(([k, a]) => { if (Z.validateAction(a).ok) f.push(`validateAction acepta la acción inválida «${k}»`); });
  const att = Z3.build({ findings: S3.base7(undefined), reliability: { level: 'Alta' }, missing: [SC.MISS.filas] }), x = Z.build({ attention: att, actions: [{ ...SC.C.cierre, id: 'a:cierre-req', requires: [SC.MISS.filas.label] }, SC.C.gap] });
  if (x.cards.map((c) => c.id).join() !== 'a:gap') f.push('se ofrece como ejecutable una recomendación que requiere datos que faltan');
  return f;
}
/* ---------- ejecución real ---------- */
const Z = require(SPEC);
const fa = scenarioFailures(Z);
t('A · los 14 escenarios producen exactamente el comportamiento esperado (3.1 §7.4, D-03 y la aclaración B)', fa.length === 0, fa.slice(0, 5));
SC.SCENARIOS.forEach((s) => { const { o } = SC.run(Z, s); t(`   ${s.n} ${s.titulo}: ${o.header || o.status} · ${o.featured.join(', ') || '—'}`, true); });
const fb = invariantFailures(Z); t('B · 21 invariantes de contradicción se cumplen en 2 000 conjuntos aleatorios', fb.length === 0, fb.slice(0, 3));
const fm = metamorphicFailures(Z); t('B2 · 6 propiedades metamórficas se cumplen en 600 conjuntos aleatorios', fm.length === 0, fm.slice(0, 3));
{
  const valid = Object.entries(SC.C).filter(([k]) => !['generica', 'sinMotivo', 'conImporteEnTexto', 'conImportePropio', 'causal', 'asignada', 'conTarea'].includes(k));
  t('validateAction rechaza las 8 acciones inválidas (genérica, sin motivo, importe en el texto, importe propio, causal, asignación, término financiero, campos de tarea)', unitFailures(Z).length === 0, unitFailures(Z));
  t('las acciones válidas del catálogo cumplen el formato propuesto y las inválidas se rechazan con su motivo', valid.every(([, a]) => Z.validateAction(a).ok) && ['generica', 'sinMotivo', 'conImporteEnTexto', 'conImportePropio', 'causal', 'asignada'].every((k) => !Z.validateAction(SC.C[k]).ok), valid.filter(([, a]) => !Z.validateAction(a).ok).map(([k, a]) => [k, Z.validateAction(a).errors[0]]));
  t('el tipo de acción se deriva de los pasos que ya emiten los motores (complete_data, review_gap, investigate_…) sin inventar pasos', Z.kindOfStep('complete_data') === 'datos' && Z.kindOfStep('fix_quality') === 'datos' && Z.kindOfStep('review_gap') === 'revisar' && Z.kindOfStep('investigate_cr') === 'investigar' && Z.kindOfStep('otro') === null);
  const o1 = SC.run(Z, SC.SCENARIOS[0]).o, rec = o1.cards.find((c) => c.id === 'a:rec');
  t('D-03 · «3 de 5», «Ver todas (5)» con filtros por tipo y explicación del orden; cada acción cita el elemento que la motiva con su clase y su certeza', o1.header === '3 de 5' && o1.seeAll.label === 'Ver todas (5)' && o1.seeAll.filters.length === 5 && o1.cards.every((c) => c.cites[0].symbol && c.cites[0].certaintyLabel) && o1.order.criteria.length === 3);
  t('economía · la acción que cita dos oportunidades muestra el importe de cada elemento y NO lo suma: ninguna acción tiene importe propio', rec.cites.length === 2 && rec.cites.every((c) => c.impactRef && /no es un importe de la acción/.test(c.impactRef.note)) && o1.cards.every((c) => !('amount' in c)));
  { const att = Z3.build({ findings: S3.base7(undefined), reliability: { level: 'Alta' }, missing: [SC.MISS.filas] }); const x = Z.build({ attention: att, actions: [{ ...SC.C.cierre, id: 'a:cierre-req', requires: [SC.MISS.filas.label] }, SC.C.gap] });
    t('una recomendación que requiere datos que faltan se retiene (con su motivo) y no se ofrece como ejecutable', x.cards.map((c) => c.id).join() === 'a:gap' && x.held.items.some((h) => h.id === 'a:cierre-req' && /requiere datos que faltan/.test(h.reason))); }
  const o9 = SC.run(Z, SC.SCENARIOS[8]).o; t('RGT fuera de alcance · responsable, fecha y estatus se ignoran y se informa cuáles se descartaron', o9.stripped.length === 1 && o9.stripped[0].fields.join() === 'owner,dueDate,status');
  const o8 = SC.run(Z, SC.SCENARIOS[7]).o; t('sin recomendaciones genéricas · «Mejorar las ventas» se rechaza; una acción sobre una hipótesis solo puede ser comprobarla', o8.rejected.some((x) => /genérica/.test(x.errors.join())) && o8.rejected.some((x) => /hipótesis/.test(x.errors.join())));
}
/* ---------- C) textos incorrectos ---------- */
{
  const card = (basis) => ({ basisCertainty: { level: basis || 'calculo' } });
  const miss = WRONG.map((e) => ({ e, v: Z.checkActionText(e.texto, card(e.basis)) })).filter(({ e, v }) => [...e.reglas].sort().join() !== [...v].sort().join());
  t(`C · los ${WRONG.length} textos INCORRECTOS infringen exactamente las reglas atribuidas`, miss.length === 0, miss.map(({ e, v }) => `${e.id}: esperaba ${e.reglas} y obtuvo ${v}`));
  t('C · cada regla A1–A7 tiene al menos un ejemplo que la ejercita', Object.keys(Z.RULES).every((r) => WRONG.some((e) => e.reglas.includes(r))));
  const okAll = SC.SCENARIOS.flatMap((s) => SC.run(Z, s).o.cards).filter((c) => Z.checkActionText(c.label, c).length); t('C · los textos de todas las acciones mostradas en los 14 escenarios no infringen ninguna regla', okAll.length === 0, okAll.map((c) => c.id));
}
/* ---------- D) mutaciones ---------- */
function load(src) { const m = new Module(SPEC, null); m.filename = SPEC; m.paths = Module._nodeModulePaths(path.dirname(SPEC)); m._compile(src, SPEC); return m.exports; }
const SRC = fs.readFileSync(SPEC, 'utf8');
const MUT = [
  ['se destacan cuatro en lugar de tres', "const LIMIT = 3;", "const LIMIT = 4;"],
  ['una acción puede no citar ningún elemento', "if (a.kind !== 'datos') need(Array.isArray(a.motivatedBy) && a.motivatedBy.length >= 1,", "if (a.kind !== 'datos') need(true || a.motivatedBy.length >= 1,"],
  ['se aceptan recomendaciones genéricas', "need(!GENERIC.test(a.label.trim()), 'Recomendación genérica: no dice qué hacer ni dónde.');", ""],
  ['se aceptan términos financieros', "need(!BANNED.test(`${a.label} ${a.basis || ''}`), 'Usa un término financiero no permitido.');", ""],
  ['se aceptan responsables, fechas y estatus en el texto', "need(!TASK.test(`${a.label} ${a.basis || ''}`),", "need(true || !TASK.test(`${a.label} ${a.basis || ''}`),"],
  ['los campos de gestión de tareas pasan a la tarjeta', "if (!TASK_FIELDS.includes(k)) o[k] = raw[k]; return o;", "o[k] = raw[k]; return o;"],
  ['una acción puede tener importe propio', "need(a.amount === undefined && a.economics === undefined && a.impact === undefined,", "need(true || a.amount === undefined,"],
  ['se recomienda decidir sobre una hipótesis', "if (weakest && WEAK.has(weakest.certainty.level) && a.kind === 'decidir') {", "if (false) {"],
  ['una acción sobre una hipótesis puede redactarse como decisión', "includes('A7')) { rejected.push(", "includes('A7_') && false) { rejected.push("],
  ['la acción sobre una hipótesis no se rotula como comprobación', "if (weakest && WEAK.has(weakest.certainty.level)) tags.push(", "if (false) tags.push("],
  ['con confiabilidad Baja se recomiendan acciones del negocio', "level === 'Baja' ? (k === 'datos' || k === 'revisar') : k === 'datos';", "level === 'Baja' ? true : k === 'datos';"],
  ['con confiabilidad Insuficiente se recomienda revisar el negocio', "level === 'Baja' ? (k === 'datos' || k === 'revisar') : k === 'datos';", "level === 'Baja' ? (k === 'datos' || k === 'revisar') : (k === 'datos' || k === 'revisar');"],
  ['se recomienda ejecutar algo que necesita datos que faltan', "if (blockedBy.length) {", "if (false) {"],
  ['las acciones de datos dejan de ir primero', "uniq.sort((x, y) => (x.kind === 'datos' ? 0 : 1) - (y.kind === 'datos' ? 0 : 1) ||", "uniq.sort((x, y) =>"],
  ['el orden ignora el elemento que motiva la acción', "|| x.rank - y.rank ||", "||"],
  ['no se deduplican las acciones iguales de dos motores', "if (seen.has(k)) seen.get(k).alsoFrom.push(c.source); else {", "if (false) seen.get(k).alsoFrom.push(c.source); else {"],
  ['se muestran acciones cuyo elemento no está a la vista', "if (a.kind === 'datos' ? !(cites.length || reqOk) : !(cites.length && allKeysKnown)) {", "if (false) {"],
  ['«Ver todas» no aparece aunque haya más acciones', "seeAll: { visible: uniq.length > featured.length,", "seeAll: { visible: false,"],
  ['sin acciones se inventa una recomendación', "const fallback = uniq.length ? null :", "const fallback = null; const _unused = uniq.length ? null :"],
  ['la acción cita importes sin rotularlos como del elemento', "note: 'Importe del elemento citado; no es un importe de la acción y no se suma.'", "note: ''"],
  ['se permite lenguaje causal', "need(!CC.CAUSAL.test(`${a.label} ${a.basis || ''}`) && !/\\b(porque|a causa de)\\b/i.test(a.label), 'Una recomendación no afirma causas.');", ""],
  ['se permiten importes en el texto de la acción', "need(!/\\$\\s?\\d/.test(a.label), 'El texto de la acción no lleva importes (el impacto es el del elemento que la motiva).');", ""]
];
MUT.forEach(([name, from, to]) => {
  if (!SRC.includes(from)) { t(`D · mutación «${name}»: el patrón existe en la especificación`, false, from.slice(0, 80)); return; }
  let killed = false, how = '';
  try { const M = load(SRC.replace(from, to)); const u = unitFailures(M), a = u.length ? u : scenarioFailures(M), b = a.length ? [] : invariantFailures(M, 400), m = a.length || b.length ? [] : metamorphicFailures(M, 150); killed = a.length + b.length + m.length > 0; how = u.length ? 'validación' : a.length ? 'escenarios' : b.length ? 'invariantes' : m.length ? 'metamórficas' : ''; }
  catch (e) { killed = true; how = 'excepción'; }
  t(`D · mutación «${name}» detectada (${how || 'SOBREVIVE'})`, killed);
});
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
