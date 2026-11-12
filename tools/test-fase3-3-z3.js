#!/usr/bin/env node
/* Fase 3 · Subfase 3.3 — pruebas de la especificación ejecutable de Z3 «Qué merece atención» (tools/audit/z3-atencion.js).
 * Todas son pruebas de LÓGICA y de ESPECIFICACIÓN con DATOS SIMULADOS (hallazgos construidos con el contrato real de Fase 2). Ninguna usa datos reales de FESA.
 *   A) 14 escenarios contra el comportamiento esperado, razonado desde D-02, D-03, la aclaración B y los contratos de Fase 2;
 *   B) invariantes de contradicción sobre miles de conjuntos aleatorios de hallazgos (semilla fija);
 *   B2) propiedades metamórficas (qué debe pasar al MODIFICAR la entrada);
 *   C) ejemplos de texto incorrecto contra las reglas T1–T6;
 *   D) mutaciones: se rompe a propósito la especificación y se exige que A, B o B2 lo detecten.
 *   node tools/test-fase3-3-z3.js */
const fs = require('fs'), path = require('path'), Module = require('module');
const SPEC = path.join(__dirname, 'audit/z3-atencion.js');
const SC = require('./audit/z3-escenarios.js'), CC = require('./audit/command-center-contracts.js'), ECON = require('../js/economics/impactModel.js');
const WRONG = require('./audit/z3-ejemplos-incorrectos.json');
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 420) : '')); if (!c) bad++; };
const BANNED = /utilidad|ganancia|beneficio neto|rentabilidad|\bROI\b|\bROAS\b|\bCAC\b/i;
const clone = (x) => JSON.parse(JSON.stringify(x));
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function scenarioFailures(Z) { const f = []; SC.SCENARIOS.forEach((s) => { try { f.push(...SC.check(Z, s)); } catch (e) { f.push(`${s.n}: excepción ${e.message}`); } }); return f; }

/* ---------- generador de conjuntos aleatorios ---------- */
function randomSet(r) {
  const margin = r() < 0.5 ? SC.MARGIN : undefined, k = SC.K(margin), pick = (a) => a[Math.floor(r() * a.length)];
  const pool = Object.values(k), out = [];
  pool.forEach((f) => { if (r() < 0.6) { const g = clone(f);
    if (r() < 0.35) g.severity = pick(['seguimiento', 'importante', 'critica']);
    if (r() < 0.25) g.certainty.support = pick(['alto', 'medio', 'bajo']);
    if (r() < 0.15) g.validity.status = pick(['activo', 'vigilancia', 'resuelto', 'vencido']);
    out.push(g); } });
  if (r() < 0.2 && out.length) { const d = clone(out[0]); d.id += '-dup'; d.lineage = [{ engine: 'analistaDetectors', id: 'dup', role: 'origin', family: 'agentes' }]; out.push(d); }
  if (r() < 0.15) out.push({ ...clone(k.canal), id: 'x:invalido', evidence: [SC.ev({ source: null })] });
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return { findings: out, reliability: { level: pick(['Alta', 'Alta', 'Media', 'Baja', 'Insuficiente']) }, missing: r() < 0.4 ? [{ label: 'Definir la meta anual', view: 'metas' }] : [], margin };
}
function invariantFailures(Z, N = 2500) {
  const f = [], r = rng(20261112), add = (c, name, o) => { if (!c && f.length < 12) f.push(`${name} | nivel ${o.level} · ${o.header} · ${o.cards.map((x) => x.clase[0] + ':' + x.severity.id[0] + (x.certainty.support === 'bajo' ? '!' : '')).join(' ')}`); };
  for (let k = 0; k < N; k++) {
    const i = randomSet(r); let o; try { o = Z.build(i); } catch (e) { f.push('excepción: ' + e.message); continue; }
    const valid = i.findings.filter((x) => CC.validateFinding(x).ok && !Z.extraErrors(x).length), merged = CC.mergeFindings(valid), ids = o.cards.map((c) => c.id);
    add(new Set(ids).size === ids.length && o.featured.every((x) => ids.includes(x)) && o.featured.length === Math.min(3, o.cards.length), 'I1 destacados: sin repetidos, dentro del universo visible y exactamente min(3, N)', o);
    add(o.cards.every((c) => c.clase === Z.CLASS_OF[c.type] && c.symbol === Z.CLASSES[c.clase].symbol && c.claseLabel === Z.CLASSES[c.clase].label), 'I2 D-02: cada elemento conserva su clase, su símbolo y su nombre', o);
    add(o.cards.length + o.withheld.count + o.closed.count === merged.length && o.rejected.length === i.findings.length - valid.length, 'I3 nada se pierde: visibles + retenidos + cerrados = universo válido deduplicado; lo inválido queda listado', o);
    if (o.level === 'Baja') add(o.cards.every((c) => c.clase === 'hallazgo' || c.isData) && !o.featured.some((id) => ['riesgo', 'oportunidad'].includes(o.cards.find((c) => c.id === id).clase)), 'I4 confiabilidad Baja: solo lo observado; ningún riesgo ni oportunidad', o);
    if (o.level === 'Insuficiente') add(o.cards.every((c) => c.isData), 'I5 confiabilidad Insuficiente: solo hallazgos de datos', o);
    if (o.level === 'Baja' || o.level === 'Insuficiente') add(Object.values(o.totals).every((x) => !x.lines.length) && o.notice && o.dataPanel.visible, 'I6 sin conclusiones no hay totales, y se avisa y se muestra qué falta', o);
    add(o.header === (o.cards.length ? `${o.featured.length} de ${o.cards.length}` : null) && o.seeAll.visible === (o.cards.length > o.featured.length), 'I7 D-03: «3 de N» y «Ver todos» coherentes con el universo', o);
    add(o.seeAll.filters.find((x) => x.id === 'todos').count === o.cards.length && ['hallazgo', 'riesgo', 'oportunidad'].reduce((a, c) => a + o.seeAll.filters.find((x) => x.id === c).count, 0) === o.cards.length, 'I8 los filtros por clase suman el universo', o);
    let sorted = true; for (let j = 1; j < o.cards.length; j++) if (Z.compare(o.cards[j - 1], o.cards[j]) > 0) sorted = false;
    add(sorted, 'I9 el universo está ordenado por el criterio declarado', o);
    const blk = (c) => c.isData && c.severity.id === 'critica', firstNon = o.cards.findIndex((c) => !blk(c));
    add(firstNon < 0 || !o.cards.slice(firstNon).some(blk), 'I10 lo que bloquea el análisis va primero', o);
    add(!o.cards.some((c, a) => c.certainty.support === 'bajo' && o.cards.slice(a + 1).some((d) => d.certainty.support !== 'bajo' && d.severity.id === c.severity.id && blk(d) === blk(c))), 'I11 un elemento con respaldo bajo no precede a uno mejor sustentado de la misma urgencia', o);
    add(o.cards.every((c) => c.certainty.support !== 'bajo' || c.tags.some((x) => /Respaldo bajo/.test(x))), 'I12 el respaldo bajo siempre va rotulado', o);
    add(o.cards.every((c) => c.impact.status !== 'disponible' || (c.impact.contribution.status === 'disponible') === (c.impact.contribution.display !== null && c.impact.contribution.display !== undefined)), 'I13 la contribución solo trae importe si está disponible (sin margen nunca hay cifra ni 0)', o);
    add(o.cards.every((c) => { if (c.impact.status !== 'disponible' || c.impact.contribution.status !== 'disponible') return true; return Math.abs(c.impact.contribution.point - c.impact.sales.point * 25 / 100) < 1e-6; }), 'I14 integridad matemática: contribución = impacto en ventas × margen / 100 (no se recalcula)', o);
    add(o.cards.every((c) => !BANNED.test(`${c.title} ${c.description} ${c.impact.sales ? c.impact.sales.label : ''} ${c.impact.contribution && c.impact.contribution.label || ''}`)), 'I15 sin utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS ni CAC', o);
    add(o.cards.every((c) => c.impact.status !== 'disponible' || Z.ALLOWED[c.clase].includes(c.impact.sales.category)), 'I16 el tipo de impacto corresponde a la clase (una oportunidad nunca lleva un importe observado)', o);
    add(o.cards.every((c) => c.clase !== 'oportunidad' || (['estimacion', 'hipotesis'].includes(c.certainty.level) && (c.impact.status !== 'disponible' || (c.impact.sales.estimate && c.impact.sales.assumptions.length >= 1)))), 'I17 una oportunidad siempre es una estimación con supuestos', o);
    add(o.cards.every((c) => c.hypotheses.every((h) => !c.evidence.some((e) => e.text === h.text)) && c.title && !c.hypotheses.some((h) => h.text === c.title)), 'I18 las hipótesis van aparte: no titulan ni sostienen el elemento', o);
    add(Object.entries(o.totals).every(([cls, x]) => x.lines.every((l) => Z.ALLOWED[cls].includes(l.category) && (l.overlap ? l.display === null : l.low <= l.point + 1e-9 && l.point <= l.high + 1e-9))), 'I19 los totales nunca mezclan clases, respetan low ≤ point ≤ high y no dan cifra cuando hay superposición', o);
    const alc = o.cards.filter((c) => c.clase === 'oportunidad' && c.impact.status === 'disponible' && c.impact.sales.exclusiveGroup);
    if (alc.length >= 2 && o.totals.oportunidad.lines.length) { const l = o.totals.oportunidad.lines.find((x) => x.category === 'alcanzable'); add(l && l.high < alc.reduce((a, c) => a + c.impact.sales.point, 0) && l.isRange, 'I20 las alternativas que cierran la misma brecha son un rango, nunca una suma', o); }
    add(o.cards.every((c) => c.validity.status === 'activo' || c.validity.status === 'vigilancia'), 'I21 lo resuelto o vencido no está en la portada', o);
    add(o.cards.every((c) => c.evidence.length >= 1 && c.evidence.every((e) => / · /.test(e.source)) && c.lineage.length >= 1), 'I22 toda tarjeta trae evidencia con fuente y linaje (trazabilidad)', o);
    add(JSON.stringify(Z.build(i)) === JSON.stringify(o), 'I23 determinista', o);
    const sh = clone(i); sh.findings.reverse(); const o2 = Z.build(sh); add(o2.featured.join() === o.featured.join() && o2.cards.map((c) => c.id).join() === ids.join(), 'I24 el orden de llegada no cambia el resultado', o);
    add(o.status === (o.cards.length ? 'con_elementos' : (o.withheld.count || i.missing.length || o.mode !== 'completo') ? 'sin_conclusiones' : 'vacio') && (o.status !== 'vacio' || !!o.empty), 'I25 el estado (con elementos, sin conclusiones, vacío) es coherente y el vacío lo dice', o);
    add(o.cards.every((c) => c.tags.some((x) => /^Nuevo:/.test(x)) === (c.validity.status === 'activo' && c.validity.firstSeen === c.validity.lastSeen)), 'I27 la marca «Nuevo» (desde ayer, 3.1 §8.1) aparece si y solo si el elemento está vigente y se vio por primera vez en la última corrida', o);
    add(o.cards.every((c) => Z.checkCardText(c.title, c.description, c).length === 0), 'I26 los textos del catálogo cumplen las reglas T1–T6', o);
  }
  return f;
}
function metamorphicFailures(Z, N = 700) {
  const f = [], r = rng(7719), add = (c, name) => { if (!c && f.length < 8) f.push(name); }, ORD = { Alta: 3, Media: 3, Baja: 1, Insuficiente: 0 };
  for (let k = 0; k < N; k++) {
    const i = randomSet(r), o = Z.build(i), fam = (x) => x.cards.map((c) => c.family).join();
    const withM = { ...i, findings: i.findings.map((g) => { const base = Object.values(SC.K(SC.MARGIN)).find((b) => b.id === g.id.replace('-dup', '')); return base && g.economics ? { ...g, economics: base.economics } : g; }) };
    const noM = { ...i, findings: i.findings.map((g) => { const base = Object.values(SC.K(undefined)).find((b) => b.id === g.id.replace('-dup', '')); return base && g.economics ? { ...g, economics: base.economics } : g; }) };
    const a = Z.build(withM), b = Z.build(noM); add(fam(a) === fam(b) && a.featured.join() === b.featured.join() && a.header === b.header, 'M1 el margen no cambia el orden, los destacados ni el universo: solo añade la capa de contribución');
    const lv = ['Alta', 'Baja', 'Insuficiente'].map((l) => Z.build({ ...i, reliability: { level: l } }).cards.length); add(lv[0] >= lv[1] && lv[1] >= lv[2], 'M2 bajar la confiabilidad nunca muestra más elementos');
    const res = { ...i, findings: [...i.findings, { ...clone(SC.K(undefined).datoAviso), id: 'x:resuelto', rule: { id: 'attention.data', family: 'data_viejo', version: 1 }, validity: { status: 'resuelto', firstSeen: '2026-09-01', lastSeen: '2026-09-05', expiresWhen: 'x' } }] };
    add(fam(Z.build(res)) === fam(o), 'M3 un elemento resuelto no cambia lo que se muestra');
    if (i.reliability.level !== 'Baja' || true) { const blk = { ...i, findings: [...i.findings.filter((x) => x.id !== 'x:meta'), clone(SC.K(undefined).datoCritico)] }; const ob = Z.build(blk); add(ob.cards[0].isData && ob.cards[0].severity.id === 'critica' && ob.featured[0] === ob.cards[0].id && ob.featured.includes(ob.cards.find((c) => c.family === 'data:meta').id) === (ob.cards.findIndex((c) => c.family === 'data:meta') < 3), 'M4 un faltante de datos crítico pasa a ser el primer destacado con cualquier confiabilidad'); }
    if (i.findings.length) { const g = clone(i.findings[0]); g.id += '-otro'; g.lineage = [{ engine: 'narrativeEngine', id: 'cita', role: 'origin', family: 'narrativa' }]; add(Z.build({ ...i, findings: [...i.findings, g] }).cards.length === o.cards.length, 'M5 el mismo hallazgo dicho por otro motor no añade una tarjeta'); }
    if (o.cards.length > 1) { const last = o.cards[o.cards.length - 1], src = i.findings.find((x) => CC.familyOf(x.rule.family) === last.family && x.scope.channel === last.scope.channel); if (src && last.certainty.support !== 'bajo') { const up = { ...i, findings: i.findings.map((x) => (x === src ? { ...clone(x), severity: 'critica' } : x)) }; const pos = Z.build(up).cards.findIndex((c) => c.family === last.family && c.scope.channel === last.scope.channel); add(pos >= 0 && pos <= o.cards.length - 1, 'M6 subir la severidad de un elemento nunca lo baja de posición'); } }
    for (const lim of [1, 2, 5]) add(Z.build({ ...i, limit: lim }).featured.length === Math.min(lim, o.cards.length), 'M7 el límite de destacados se respeta para cualquier valor');
  }
  return f;
}

function unitFailures(Z) {
  const f = [], K = SC.K(undefined), nuevo = Z.build({ findings: [{ ...K.gap, validity: { status: 'activo', firstSeen: '2026-09-22', lastSeen: '2026-09-22', expiresWhen: 'x' } }, K.riesgo], reliability: { level: 'Alta' } });
  if (nuevo.cards.filter((c) => c.tags.some((x) => /^Nuevo:/.test(x))).length !== 1) f.push('la marca «Nuevo» no aparece solo en lo visto por primera vez en la última corrida');
  return f;
}
/* ---------- ejecución real ---------- */
const Z = require(SPEC);
const fa = scenarioFailures(Z);
t('A · los 14 escenarios producen exactamente el comportamiento esperado (D-02, D-03, aclaración B y contratos de Fase 2)', fa.length === 0, fa.slice(0, 5));
SC.SCENARIOS.forEach((s) => { const o = Z.build(s.input); t(`   ${s.n} ${s.titulo}: ${o.header || 'sin elementos'} · ${o.featured.map((id) => o.cards.find((c) => c.id === id)).map((c) => c.symbol + ' ' + c.title.slice(0, 34)).join(' | ')}`, true); });
const fb = invariantFailures(Z); t('B · 27 invariantes de contradicción se cumplen en 2 500 conjuntos aleatorios de hallazgos', fb.length === 0, fb.slice(0, 3));
const fm = metamorphicFailures(Z); t('B2 · 7 propiedades metamórficas se cumplen en 700 conjuntos aleatorios', fm.length === 0, fm.slice(0, 3));
{
  const cat = SC.K(SC.MARGIN), all = Object.entries(cat).map(([k, f]) => [k, CC.validateFinding(f)]);
  t('el catálogo de elementos de los escenarios cumple el contrato cc.finding de Fase 2 (validateFinding) y sus impactos el contrato cc.economic_impact', all.every(([, r]) => r.ok) && Object.values(cat).every((f) => !f.economics || ECON.validateImpact(f.economics).ok), all.filter(([, r]) => !r.ok).map(([k, r]) => [k, r.errors[0]]));
  const o1 = Z.build(SC.SCENARIOS[0].input), o11 = Z.build(SC.SCENARIOS[10].input);
  t('D-02 · las tres clases aparecen con texto y forma propios (◆ ▲ ●) y significado distinto', ['◆', '▲', '●'].every((s) => o1.cards.some((c) => c.symbol === s)) && new Set(Object.values(Z.CLASSES).map((c) => c.meaning)).size === 3);
  t('D-03 · «3 de 7», acceso al universo completo con filtros por clase y explicación del orden', o1.header === '3 de 7' && o1.seeAll.visible && o1.seeAll.filters.length === 4 && o1.order.criteria.length >= 3);
  t('economía · las dos alternativas de recuperación son un rango ($723 mil a $760 mil), no una suma de $1.5 M', (() => { const l = o1.totals.oportunidad.lines.find((x) => x.category === 'alcanzable'); return l.isRange && Math.abs(l.low - 722816.17) < 1e-6 && l.high === 760000; })());
  t('economía · el potencial teórico y lo recuperable no se suman entre sí ni con el riesgo (líneas separadas por categoría)', o1.totals.oportunidad.lines.length === 2 && o1.totals.riesgo.lines.length === 1 && o1.totals.riesgo.lines[0].category === 'en_riesgo');
  t('economía · la brecha total y la del canal describen el mismo dinero: no se totalizan (hallazgo sobre el contrato de Fase 2 documentado)', o1.totals.hallazgo.lines[0].overlap && o1.totals.hallazgo.lines[0].display === null);
  t('economía · sin margen la tarjeta dice «Margen no configurado · Configurar»; con margen, «Contribución bruta estimada» con su nota', o1.cards[0].impact.contribution.label === 'Margen no configurado · Configurar' && o11.cards[0].impact.contribution.label === 'Contribución bruta estimada' && /no es utilidad/.test(o11.cards[0].impact.contribution.note));
  t('economía · un impacto observado y uno proyectado van rotulados y nunca en la misma línea', o1.cards.find((c) => c.family === 'pacing_gap').impact.sales.provenanceLabel === 'observado' && o1.cards.find((c) => c.family === 'forecast_close').impact.sales.provenanceLabel === 'proyectado');
  t('la hipótesis del driver va aparte, con cómo validarla, y no en la evidencia que sostiene el titular', (() => { const c = o1.cards.find((x) => x.family === 'driver:cr'); return c.hypotheses.length === 1 && c.hypotheses[0].validation && c.evidence.every((e) => e.class !== 'hipotesis') && c.certainty.label === 'Contribución matemática'; })());
  const nuevo = Z.build({ findings: [{ ...SC.K(undefined).gap, validity: { status: 'activo', firstSeen: '2026-09-22', lastSeen: '2026-09-22', expiresWhen: 'x' } }, SC.K(undefined).riesgo], reliability: { level: 'Alta' } });
  t('«Desde ayer» → marca «Nuevo» en Z3 solo para lo visto por primera vez en la última corrida (D-04: ninguna información útil se pierde)', nuevo.cards.filter((c) => c.tags.some((x) => /^Nuevo:/.test(x))).length === 1 && nuevo.cards.find((c) => c.family === 'pacing_gap').tags.some((x) => /^Nuevo:/.test(x)));
  const rej = Z.build(SC.SCENARIOS[9].input).rejected.map((x) => x.errors[0]);
  t('contrato · sin fuente, oportunidad como hecho, término financiero prohibido, importe observado en una oportunidad y venta recuperable en un riesgo se rechazan con su motivo', rej.length === 5 && rej.some((x) => /fuente/.test(x)) && rej.some((x) => /estimación/.test(x)) && rej.some((x) => /financiero/.test(x)) && rej.some((x) => /no corresponde a la clase/.test(x)), rej);
}
/* ---------- C) textos incorrectos ---------- */
{
  const o = Z.build(SC.SCENARIOS[0].input), byFam = (fam) => o.cards.find((c) => c.family === fam);
  const miss = WRONG.map((e) => ({ e, v: Z.checkCardText(e.titulo, e.descripcion, byFam(e.familia)) })).filter(({ e, v }) => [...e.reglas].sort().join() !== [...v].sort().join());
  t(`C · los ${WRONG.length} ejemplos de texto INCORRECTO infringen exactamente las reglas que el documento les atribuye`, miss.length === 0, miss.map(({ e, v }) => `${e.id}: esperaba ${e.reglas} y obtuvo ${v}`));
  t('C · cada regla T1–T6 tiene al menos un ejemplo que la ejercita', Object.keys(Z.RULES).every((r) => WRONG.some((e) => e.reglas.includes(r))));
}
/* ---------- D) mutaciones ---------- */
function load(src) { const m = new Module(SPEC, null); m.filename = SPEC; m.paths = Module._nodeModulePaths(path.dirname(SPEC)); m._compile(src, SPEC); return m.exports; }
const SRC = fs.readFileSync(SPEC, 'utf8');
const MUT = [
  ['D-02: un riesgo se presenta como hallazgo', "risk: 'riesgo',", "risk: 'hallazgo',"],
  ['D-02: una oportunidad puede presentarse como hecho', "if (cls === 'oportunidad' && S[lvl] > S.estimacion) e.push(", "if (false) e.push("],
  ['D-02: no se comprueba que el impacto corresponda a la clase', "&& !ALLOWED[cls].includes(f.economics.category)) e.push(", "&& false) e.push("],
  ['D-03: se destacan cuatro en lugar de tres', "const LIMIT = 3;", "const LIMIT = 4;"],
  ['D-03: el orden ignora la severidad', "SEVERITY_RANK[c.severity.id], c.certainty.support === 'bajo' ? 0 : 1,", "0, c.certainty.support === 'bajo' ? 0 : 1,"],
  ['D-03: un elemento con respaldo bajo desplaza a uno mejor sustentado', "SEVERITY_RANK[c.severity.id], c.certainty.support === 'bajo' ? 0 : 1,", "SEVERITY_RANK[c.severity.id], 1,"],
  ['D-03: lo que bloquea el análisis deja de ir primero', "return [c.isData && c.severity.id === 'critica' ? 1 : 0,", "return [0,"],
  ['D-03: la portada puede llenarse con una sola clase', "const alt = sorted.slice(limit).find((c) => c.clase !== last.clase && sameUrg(c));", "const alt = null;"],
  ['D-03: «Ver todos» no aparece aunque haya más elementos', "seeAll: { visible: visible.length > featured.length,", "seeAll: { visible: false,"],
  ['la marca «Nuevo» (desde ayer) se pierde', "if (f.validity.status === 'activo' && f.validity.firstSeen === f.validity.lastSeen) tags.push(", "if (false) tags.push("],
  ['aclaración B: con confiabilidad Baja se muestran riesgos y oportunidades', "level === 'Baja' ? (c.clase === 'hallazgo' || c.isData) : c.isData;", "level === 'Baja' ? true : c.isData;"],
  ['aclaración B: con confiabilidad Insuficiente se muestran hallazgos del negocio', "level === 'Baja' ? (c.clase === 'hallazgo' || c.isData) : c.isData;", "level === 'Baja' ? (c.clase === 'hallazgo' || c.isData) : c.clase === 'hallazgo';"],
  ['aclaración B: con confiabilidad Baja se muestran totales', "totals: totalsOf(mode === 'completo' ? visible : [], byId),", "totals: totalsOf(visible, byId),"],
  ['contrato: lo que no cumple el contrato se muestra', "if (errs.length) rejected.push(", "if (false) rejected.push("],
  ['contrato: no se deduplica (el mismo hallazgo aparece dos veces)', "const merged = CC.mergeFindings(valid),", "const merged = valid.map((x) => ({ ...x, dedupKey: CC.dedupKey(x) })),"],
  ['lo resuelto vuelve a la portada', "const active = all.filter((c) => c.validity.status === 'activo' || c.validity.status === 'vigilancia'),", "const active = all.slice(),"],
  ['economía: sin margen la contribución muestra $0', "else contribution = { status: c.status, display: null,", "else contribution = { status: c.status, display: money(0),"],
  ['economía: los totales mezclan clases', "const items = cards.filter((c) => c.clase === cls && c.impact.status !== 'no_aplica')", "const items = cards.filter((c) => c.impact.status !== 'no_aplica')"],
  ['economía: se totaliza aunque varios elementos describan el mismo dinero', "overlap = Object.values(og[key] || {}).some((n) => n > 1);", "overlap = false;"],
  ['las hipótesis se mezclan con la evidencia que sostiene el titular', "head = f.evidence.filter((x) => x.headline && x.class !== 'accion');", "head = f.evidence.filter((x) => x.class !== 'accion');"],
  ['el respaldo bajo deja de rotularse', "if (f.certainty.support === 'bajo') tags.push(", "if (false) tags.push("],
  ['se permiten términos financieros prohibidos', "if (BANNED.test(`${f.title} ${f.description}`)) e.push(", "if (false) e.push("],
  ['la cabecera cuenta el universo sin filtrar por confiabilidad', "const header = visible.length ? `${featured.length} de ${visible.length}` : null;", "const header = all.length ? `${featured.length} de ${all.length}` : null;"]
];
MUT.forEach(([name, from, to]) => {
  if (!SRC.includes(from)) { t(`D · mutación «${name}»: el patrón existe en la especificación`, false, from.slice(0, 70)); return; }
  let killed = false, how = '';
  try { const M = load(SRC.replace(from, to)); const u = unitFailures(M), a = u.length ? u : scenarioFailures(M), b = a.length ? [] : invariantFailures(M, 500), m = a.length || b.length ? [] : metamorphicFailures(M, 200); killed = a.length + b.length + m.length > 0; how = a.length ? 'escenarios' : b.length ? 'invariantes' : m.length ? 'metamórficas' : ''; }
  catch (e) { killed = true; how = 'excepción'; }
  t(`D · mutación «${name}» detectada (${how || 'SOBREVIVE'})`, killed);
});
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
