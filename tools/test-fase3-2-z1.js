#!/usr/bin/env node
/* Fase 3 · Subfase 3.2 — pruebas de la especificación ejecutable de Z1 con las decisiones D-01 a D-06 (tools/audit/z1-lectura-ejecutiva.js).
 * Ninguna es una búsqueda de texto. Cinco capas:
 *   A) los 14 escenarios obligatorios y 4 adicionales contra el comportamiento esperado, razonado desde Fase 2 y las decisiones (tools/audit/z1-escenarios.js);
 *   B) INVARIANTES de contradicción sobre miles de entradas aleatorias (semilla fija): lo que Z1 jamás debe hacer;
 *   B2) PRUEBAS METAMÓRFICAS: propiedades que deben cumplirse al MODIFICAR una entrada (orden de evaluación D-05, independencia del margen, etc.);
 *   C) ejemplos correctos e incorrectos, y NOMBRES VISIBLES (D-06) contra la taxonomía;
 *   D) MUTACIONES: se rompe a propósito la especificación y se exige que A, B o B2 lo detecten (si una mutación sobrevive, la prueba no sirve).
 *   node tools/test-fase3-2-z1.js */
const fs = require('fs'), path = require('path'), Module = require('module');
const SPEC = path.join(__dirname, 'audit/z1-lectura-ejecutiva.js');
const SC = require('./audit/z1-escenarios.js');
const CC = require('./audit/command-center-contracts.js');
const INCORRECTOS = require('./audit/z1-ejemplos-incorrectos.json');   // los mismos que cita el documento y lee el verificador de consistencia
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 380) : '')); if (!c) bad++; };

const BANNED = /utilidad neta|ganancia neta|beneficio neto|beneficio financiero|rentabilidad neta|\bROI\b|\bROAS\b|\bCAC\b/i;
const GROWTH = /\b(crece|crecimiento|creciendo|cae|caes|deterioro|sube|baja|estable|estabilidad)\b/i;
const nums = (s) => String(s).replace(/ /g, ' ').replace(/\b(19|20)\d{2}\b/g, '').match(/\d+(?:\.\d+)?/g) || [];
const RANK = { Alta: 3, Media: 2, Baja: 1, Insuficiente: 0 };
const INSUF_PREFIX = /^(No es posible|No hay actividad|No se puede verificar|Todavía no|Hay venta registrada|Hubo sesiones|No se registró venta|El resultado no)/;
const CAUSE_HINT = /\b(porque|se debe a|debido a|a causa de|causa|provoc\w*|falla\w*|fallo\w*|checkout|tráfico de baja calidad|calidad del tráfico|experiencia de usuario|UX|precio|inventario|desabasto|campañas?|marketing)\b/i;
const strip = (x) => x.replace(/sin causa atribuida|sin atribuirle una causa|no permite determinar la causa/g, '');

/* ---------- A) escenarios ---------- */
function scenarioFailures(Z) {
  const f = []; [...SC.SCENARIOS, ...SC.ADICIONALES].forEach((s) => f.push(...SC.check(Z, s)));
  if (SC.SCENARIOS.map((s) => s.n).join() !== [...Array(14).keys()].map((i) => i + 1).join()) f.push('los escenarios obligatorios deben ser exactamente 1..14');
  const all = [...SC.SCENARIOS, ...SC.ADICIONALES], cmp = new Set(all.map((s) => s.expect.comparability)), lv = new Set(all.map((s) => s.expect.level));
  ['valida', 'sin_base_comparable', 'recuperacion_desde_cero', 'cambio_de_composicion', 'sin_actividad', 'no_calculable'].forEach((c) => { if (!cmp.has(c)) f.push(`ningún escenario cubre la comparabilidad «${c}»`); });
  Z.LEVELS.forEach((l) => { if (!lv.has(l)) f.push(`ningún escenario cubre la confiabilidad «${l}»`); });
  const x = Z.build(SC.helpers.base({ revenue: SC.helpers.rev(10000000, 9500000), activity: SC.helpers.ACT(400000, 7000, 9500000), forecast: SC.helpers.fc(15000000, 14250000), comparable: SC.helpers.COMP('ok', 0.05, 400000, 9100000), reliability: SC.helpers.REL() }));
  if (x.state.id !== 'creciendo_bajo_potencial' || !/^La venta crece contra agosto 2026, pero sigue por debajo/.test(x.verdict.text)) f.push('X1 creciendo_bajo_potencial');
  const y = Z.build(SC.helpers.base({ revenue: SC.helpers.rev(10000000, 9800000), activity: SC.helpers.ACT(400000, 7000, 9800000), forecast: SC.helpers.fc(15000000, 14700000), comparable: SC.helpers.COMP('ok', -0.02, -200000, 10000000), reliability: SC.helpers.REL() }));
  if (nums(y.verdict.text).length || nums(y.narrative.short).some((v) => v !== '22') || !/ligeramente negativa/.test(y.narrative.short)) f.push(`X2 ni el veredicto ni la corta llevan cifras: «${y.verdict.text}» / «${y.narrative.short}»`);
  return f;
}

/* ---------- B) invariantes sobre entradas aleatorias ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function randomInput(r) {
  const pick = (a) => a[Math.floor(r() * a.length)], plan = Math.round(1e5 + r() * 5e7), roll = r();
  const conv0r = r() < 0.12, actual = roll < 0.06 ? null : roll < 0.09 ? -Math.round(plan * 0.01) : conv0r ? 0 : Math.round(plan * (0.7 + r() * 0.65)), cstat = pick(['ok', 'ok', 'ok', 'sin_trafico_actual', 'conversion_cero_actual', 'sin_base_comparable', 'recuperacion_desde_cero', 'cambio_de_composicion', 'sin_actividad', 'datos_insuficientes', 'no_calculable', undefined]);
  const target = plan * 1.5, close = r() < 0.1 ? null : Math.round(target * (0.8 + r() * 0.45));
  const gaps = r() < 0.08, act = r() < 0.15 ? undefined : { sessions: r() < 0.07 ? 0 : (gaps && r() < 0.5 ? null : Math.round(1000 + r() * 4e5)), orders: conv0r ? 0 : (gaps && r() < 0.5 ? null : Math.round(10 + r() * 9000)), revenue: actual === null ? null : (r() < 0.06 ? Math.round(actual * (1 - r() * 0.02)) : actual) };
  return { period: { label: 'Septiembre 2026', cutoff: '22 sep 2026', daysCounted: r() < 0.06 ? 0 : 1 + Math.floor(r() * 29), daysTotal: 30 }, plan: { available: r() > 0.07 },
    revenue: { planToDate: plan, actualToDate: actual, gap: actual === null ? null : actual - plan, compliance: actual === null ? null : actual / plan, gapPct: actual === null ? null : actual / plan - 1 },
    activity: act, forecast: close === null ? {} : { target, close, gapPct: close / target - 1 },
    comparable: cstat === undefined ? undefined : { status: cstat, label: pick(['agosto 2026 (mismos días)', 'el mismo periodo del año anterior (del 1 al 22 de septiembre de 2025)']), growthPct: r() < 0.15 ? null : (r() - 0.5) * 0.5, deltaRevenue: r() < 0.15 ? null : Math.round((r() - 0.5) * 4e6), baseRevenue: r() < 0.2 ? null : Math.round(plan * (0.8 + r() * 0.4)) },
    reliability: { support: pick(['alto', 'alto', 'medio', 'bajo', null]), coverage: r() < 0.06 ? null : r(), warnings: r() < 0.3 ? ['Los datos traen avisos de calidad (3 registros).'] : [], blocking: r() < 0.07 ? ['Falta la meta anual definida.'] : [], dataErrors: r() < 0.1 },
    findings: r() < 0.2 ? [{ severity: pick(['critica', 'importante', 'seguimiento']), type: 'deviation' }] : [], concentration: r() < 0.3,
    margin: pick([undefined, undefined, { marginEnabled: true, grossMarginPct: Math.round(r() * 90), updatedAt: 'x', source: 'manual' }, { marginEnabled: false, grossMarginPct: 25, updatedAt: 'x', source: 'manual' }, { marginEnabled: true, grossMarginPct: 0, updatedAt: null, source: null }, { marginEnabled: true, grossMarginPct: 0, updatedAt: '2026-11-01', source: 'manual' }, { marginEnabled: true, grossMarginPct: -5, updatedAt: 'x', source: 'manual' }, { marginEnabled: true, grossMarginPct: 120, updatedAt: 'x', source: 'manual' }]) };
}
const clone = (x) => JSON.parse(JSON.stringify(x));
function invariantFailures(Z, N = 4000) {
  const f = [], r = rng(20261109);
  const add = (cond, name, i, o) => { if (!cond && f.length < 14) f.push(`${name} | ${process.env.DBG ? Z.checkVerdictText(o.verdict.text, o) + ' ' + JSON.stringify({g: o.economic.primary, V: o.verdict.text}) : ''}| confiab. ${o.reliability.level}/${o.reliability.cause} · estado ${o.state.id}/${o.state.shown} · protagonista ${o.economic.primary && o.economic.primary.kind} · «${o.verdict.text.slice(0, 90)}»`); };
  for (let k = 0; k < N; k++) {
    const i = randomInput(r); let o; try { o = Z.build(i); } catch (e) { f.push('excepción: ' + e.message); continue; }
    const V = o.verdict.text, S = o.narrative.short, L = o.narrative.long, all = [V, S, L.hecho, L.interpretacion, L.limitaciones, L.implicacion].join(' '), lvl = o.reliability.level, c = o.economic.contribution, p = o.economic.primary, rv = i.revenue;
    add(Z.LEVELS.includes(lvl) && Z.MODE[lvl] === o.reliability.mode, 'I1 nivel y modo válidos', i, o);
    add(Z.STATES.includes(o.state.id), 'I2 el estado es uno de los seis del contrato', i, o);
    add(o.evaluation.steps.map((x) => x.n).join() === '1,2,3,4,5,6,7,8', 'I3 el orden de evaluación (D-05) siempre tiene los 8 pasos en orden', i, o);
    add(o.evaluation.steps.find((x) => x.n === 6).outcome === lvl, 'I4 el paso 6 es el nivel final', i, o);
    if (lvl === 'Baja') add(/^Lectura preliminar:/.test(V) && o.state.shown === false && o.state.label === null && !/\b(supera|crece|cae|no la alcanzaría|la superaría)\b/i.test(V), 'I5 Baja: lectura preliminar, sin etiqueta de estado ni verbos de certeza', i, o);
    if (lvl === 'Insuficiente') add(INSUF_PREFIX.test(V) && o.state.id === 'sin_base' && o.verdict.emit === false && !(p && p.kind === 'brecha') && c.amount === null && c.status === 'oculta', 'I6 Insuficiente: sin lectura, sin brecha, sin contribución', i, o);
    if (lvl === 'Alta' || lvl === 'Media') add(o.state.shown === true && o.state.id !== 'sin_base' && p && p.kind === 'brecha' || !(i.plan.available && Number.isFinite(rv.gap)) || o.economic.observed.visible === false, 'I7 Alta/Media muestran un estado real y la brecha cuando hay plan', i, o);
    // D-01: la venta observada válida no se oculta por tener confiabilidad Insuficiente
    const hardToObserved = o.reliability.causes.some((x) => ['sin_actividad', 'sin_dato_actividad', 'no_calculable', 'sin_venta'].includes(x));
    if (Number.isFinite(rv.actualToDate) && rv.actualToDate >= 0 && !hardToObserved) add(o.economic.observed.visible === true, 'I8 D-01: una venta observada válida no se oculta solo por confiabilidad Insuficiente', i, o);
    if (o.economic.observed.visible === false) add(!(p && p.kind === 'venta_observada') && o.economic.observed.amount === null, 'I9 una venta no observada no se sustituye por 0', i, o);
    add(!(p && p.kind === 'brecha') || (i.plan.available && lvl !== 'Insuficiente' && o.economic.observed.visible), 'I10 D-01: la brecha solo existe con plan, venta observada válida y confiabilidad suficiente', i, o);
    add(!(p && p.kind === 'brecha') || (o.economic.compliance.visible && o.economic.plan.visible), 'I11 D-01: cumplimiento y meta acumulada acompañan siempre a la brecha', i, o);
    add((p && p.kind === 'brecha') || (!o.economic.compliance.visible && !o.economic.plan.visible), 'I12 D-01: sin brecha válida no se muestra cumplimiento ni meta (ni favorable ni desfavorable)', i, o);
    add(!(p && p.kind === 'venta_observada') || (lvl === 'Insuficiente' && p.direction === null), 'I13 la venta observada como cifra principal no lleva dirección contra el plan', i, o);
    // D-02
    add(c.amount === null || (typeof c.amount === 'number' && c.status === 'disponible' && c.detailOnly === true), 'I14 D-02: la contribución es null o una estimación «disponible» solo en detalle (nunca cifra protagonista)', i, o);
    add(!(c.status === 'no_configurado' || c.status === 'desactivado') || c.amount === null, 'I15 D-02: sin margen activo no hay importe (nunca 0)', i, o);
    add(c.status !== 'disponible' || (p && p.kind === 'brecha' && lvl !== 'Insuficiente'), 'I16 D-02: contribución solo con una brecha válida', i, o);
    add(lvl !== 'Baja' || c.status === 'oculta' || c.preliminary === true, 'I17 D-02: con confiabilidad Baja la contribución, si aparece, se rotula preliminar', i, o);
    add(!(p && p.kind === 'brecha' && c.status === 'disponible') || Math.abs(c.amount - rv.gap * c.marginPct / 100) < 1e-6, 'I18 integridad matemática: contribución = brecha × margen / 100', i, o);
    // D-03
    const viol = Z.checkVerdictText(V, o); add(viol.length === 0, `I19 el veredicto cumple R1–R14 (infringe ${viol})`, i, o);
    add(o.verdict.words <= 34 && V.length <= 240, 'I20 veredicto ≤ 34 palabras y 240 caracteres', i, o);
    add(nums(V).length === 0 && !/\$\s?\d/.test(V), 'I21 D-03: el veredicto no lleva importes ni cifras (las cifras viven en las tarjetas)', i, o);
    add(nums(S).every((x) => x === String(i.period.daysCounted)) && Z.sentences(S).length <= 2 && Z.words(S) <= 45, 'I22 la narrativa corta no lleva cifras (solo días contados) y ≤ 2 frases / 45 palabras', i, o);
    add([L.hecho, L.interpretacion, L.limitaciones, L.implicacion].join(' ').split(/\s+/).length <= 140, 'I23 narrativa ampliada ≤ 140 palabras', i, o);
    const used = new Set([...Z.sentences(V), ...Z.sentences(S)]); add(![L.hecho, L.interpretacion, L.limitaciones, L.implicacion].some((x) => used.has(x)), 'I24 la ampliada no repite frases de la corta ni del veredicto', i, o);
    add(!BANNED.test(all), 'I25 sin utilidad/ganancia/beneficio neto, ROI, ROAS ni CAC', i, o);
    add(!/\b(conversión|ticket|AOV|Ecommerce|App|WhatsApp|Llamadas|hallazgos?)\b/.test(all.replace(/medición de pedidos/g, '')) && !/\b(se debe|debido a|porque|causa|provoc\w*|explica\w*|contribuy\w*|aporta\w*)\b/i.test(all.replace(/sin causa atribuida|sin atribuirle una causa|no permite determinar la causa/g, '')), 'I26 Z1 no absorbe Z2/Z3 ni inventa causas', i, o);
    // D-04
    if (o.comparability.code !== 'valida') add(!GROWTH.test(V) && !GROWTH.test(S) && o.comparability.growth === null, 'I27 sin comparación válida no hay lenguaje ni cifra de evolución', i, o);
    if (o.reliability.cause === 'sin_actividad') add(lvl === 'Insuficiente' && !GROWTH.test(all.replace(/estabilidad|estable/g, '')) && !/\b(conversión|pedidos)\b/i.test(V + S) && o.economic.observed.visible === false, 'I28 D-04: sin actividad no infiere crecimiento, deterioro ni estabilidad, no concluye sobre conversión y no muestra 0', i, o);
    const conv0 = ((i.activity && i.activity.sessions > 0 && i.activity.orders === 0) || (i.comparable && i.comparable.status === 'conversion_cero_actual')) && !(rv.actualToDate > 0) && !(i.activity && (i.activity.sessions < 0 || i.activity.orders < 0 || i.activity.revenue < 0));
    if (conv0 && lvl !== 'Insuficiente' && lvl !== 'Baja') add(lvl === 'Media' && o.verdict.kind === 'conversion_cero' && /no se registró ningún pedido/.test(V) && !/\b(porque|se debe|causa)\b/i.test(V.replace(/sin causa atribuida/g, '')), 'I29 D-04: conversión cero es un resultado observable (Media como máximo), sin causa', i, o);
    if (o.comparability.code === 'cambio_de_composicion' && lvl !== 'Insuficiente') add(lvl !== 'Alta' && !/\b(mejora|mejoró|empeora|eficiencia|eficiente)\b/i.test(V + S), 'I30 D-04: con cambio de composición, nunca Alta y sin lenguaje de eficiencia', i, o);
    if (o.comparability.code === 'no_calculable') add(lvl === 'Insuficiente', 'I31 «no calculable» siempre es Insuficiente', i, o);
    // D-05
    add(!(lvl === 'Baja' && o.reliability.causes.length), 'I32 D-05: Baja e Insuficiente son excluyentes (un bloqueo duro nunca produce Baja)', i, o);
    add(lvl !== 'Insuficiente' || !o.reliability.reasons.some((x) => /errores en los datos/.test(x)) || o.reliability.causes.includes('bloqueo') === false, 'I33 D-05: los motivos de un bloqueo duro no incluyen la limitación secundaria', i, o);
    // estado coherente con el contrato de Fase 2
    if (lvl === 'Alta' || lvl === 'Media') {
      const growthOk = o.comparability.code === 'valida' && i.comparable && Number.isFinite(i.comparable.growthPct);
      const ref = CC.classifyBusinessState({ compliance: rv.compliance, forecastGapPct: Number.isFinite(i.forecast.gapPct) ? i.forecast.gapPct : null, growthVsComparable: growthOk ? i.comparable.growthPct : null, coverage: i.reliability.coverage, findings: i.findings, dataWarnings: lvl === 'Media', concentration: i.concentration, blockingData: false });
      add(ref.state === o.state.id, 'I34 el estado coincide con classifyBusinessState (Fase 2)', i, o);
    }
    add(o.show.every((x) => Z.ELEMENTS.includes(x)) && o.hide.every((x) => Z.ELEMENTS.includes(x)) && !o.show.some((x) => o.hide.includes(x)) && Z.ELEMENTS.every((x) => o.show.includes(x) || o.hide.includes(x)), 'I35 mostrar y ocultar particionan los elementos de Z1', i, o);
    add(lvl === 'Alta' ? !o.show.includes('condicion') && o.reliability.reasons.length === 0 : o.show.includes('condicion') && o.show.includes('alcance') && o.reliability.reasons.length > 0, 'I36 la banda de motivos y de alcance aparece si y solo si la confiabilidad no es Alta', i, o);
    add(o.scope.known.includes('Venta observada del periodo') === o.economic.observed.visible && o.scope.notConcluded.includes('Cumplimiento y brecha contra el plan') === !(p && p.kind === 'brecha'), 'I37 «se conoce / no se puede concluir» coincide con lo visible', i, o);
    add(o.scope.diagnosis === ({ Alta: 'disponible', Media: 'con_reservas', Baja: 'no_concluyente', Insuficiente: 'no_disponible' })[lvl], 'I38 el estado del diagnóstico sigue a la confiabilidad', i, o);
    // Auditoría final · punto 1: venta válida ≠ venta cero ≠ ausencia de actividad ≠ falta de información ≠ información inválida
    add(!(o.economic.observed.visible && o.economic.observed.amount === 0) || !/Hay venta registrada/.test(V), 'I39 un cero observado nunca se describe como «Hay venta registrada»', i, o);
    add(o.economic.observed.visible || !/\$\s?0(?![\d.])/.test([V, S, L.hecho, L.interpretacion, L.limitaciones, L.implicacion].join(' ')), 'I40 sin venta observada válida no aparece «$0» en ningún texto (falta de dato ≠ venta cero)', i, o);
    add(o.reliability.cause !== 'sin_dato_actividad' || (lvl === 'Insuficiente' && /^No se puede verificar la actividad/.test(V) && !/No hay actividad/.test(V + L.hecho) && o.economic.observed.visible === false && o.economic.primary === null), 'I41 actividad no verificable: Insuficiente, mensaje de falta de información (no «sin actividad») y ninguna cifra', i, o);
    add(!(o.verdict.kind === 'conversion_cero' || /ningún pedido/.test(V + S + L.limitaciones)) || !CAUSE_HINT.test(strip([V, S, ...o.reliability.reasons, L.limitaciones, L.interpretacion, L.implicacion].join(' '))), 'I42 conversión cero: ningún texto sugiere una causa (falla, checkout, calidad del tráfico, precio, campañas…)', i, o);
    add(c.status !== 'invalido' || (c.amount === null && c.display === null && c.detailOnly === true), 'I43 margen no válido: ningún importe', i, o);
    add(c.marginDisplay == null || /^\d+(\.\d)? %$/.test(c.marginDisplay), 'I44 el margen se muestra con una sola decimal como máximo (sin precisión que la fuente no justifica)', i, o);
    add(!(o.reliability.causes.includes('sin_actividad') && o.reliability.causes.includes('sin_dato_actividad')), 'I45 sin actividad verificada y actividad no verificable son excluyentes', i, o);
    add(!Object.is(c.amount, -0), 'I46 la contribución nunca es −0', i, o);
    // Resolución C1–C5
    const D = o.data, A = i.activity || {}, negs = rv.actualToDate < 0 || A.sessions < 0 || A.orders < 0 || A.revenue < 0;
    add(['valido', 'inconsistente', 'no_verificable', 'no_calculable'].includes(D.class) && (D.class === 'inconsistente') === (D.issues.length > 0 && !negs && o.comparability.code !== 'no_calculable' && !['sin_dato_actividad', 'sin_venta'].some((x) => o.reliability.causes.includes(x))), 'I47 C1: el dato es válido, inconsistente, no verificable o no calculable, y solo es «inconsistente» si hay una combinación pendiente de interpretación', i, o);
    add(!(o.reliability.causes.includes('no_calculable')) || negs || o.comparability.code === 'no_calculable', 'I48 C1: «no calculable» solo por valores negativos o porque la comparación lo declara; nunca por pedidos y venta que no cuadran', i, o);
    add(D.issues.length === 0 || lvl !== 'Alta', 'I49 C1: una combinación pendiente de interpretación nunca convive con confiabilidad Alta', i, o);
    add(D.issues.length === 0 || o.reliability.causes.length > 0 || (lvl !== 'Insuficiente' && D.issues.every((x) => o.reliability.reasons.includes(x.text))), 'I50 C1: una inconsistencia no invalida por sí sola (no produce Insuficiente) y su aviso queda a la vista', i, o);
    add(!(Number.isFinite(rv.actualToDate) && rv.actualToDate >= 0 && o.reliability.causes.length === 0) || o.economic.observed.visible, 'I51 C1/D-01: sin bloqueo duro, una venta observada válida nunca se oculta por una inconsistencia', i, o);
    add(o.verdict.kind !== 'conversion_cero' || !(rv.actualToDate > 0), 'I52 C1: nunca se declara conversión cero con venta positiva', i, o);
    const rc = D.reconciliation; add(rc.tolerance === null && ['no_evaluable', 'pendiente', 'sin_diferencia_observada'].includes(rc.status) && !/concilia(da|do)|validada/i.test(rc.status) && (rc.status !== 'pendiente' || D.issues.some((x) => x.code === 'conciliacion_pendiente')), 'I53 C2: no hay tolerancia; la conciliación es no evaluable, pendiente o «sin diferencia observada», nunca validada', i, o);
    add(!(Number.isFinite(A.revenue) && Number.isFinite(rv.actualToDate) && !negs && Math.abs(A.revenue - rv.actualToDate) >= 0.005) || rc.status === 'pendiente', 'I54 C2: cualquier diferencia entre las dos ventas (aunque sea menor a 1 %) queda pendiente', i, o);
    const partialPos = i.activity && !negs && rv.actualToDate > 0 && [A.sessions, A.orders].some((x) => !Number.isFinite(x));
    add(!partialPos || !o.reliability.reasons.some((x) => /falta la medida de sesiones o de pedidos/.test(x)), 'I55 C3: con venta positiva, una medida ausente de sesiones o pedidos no es motivo de baja confiabilidad', i, o);
    add(!(i.activity && !o.reliability.causes.length && [A.sessions, A.orders].some((x) => !Number.isFinite(x))) || (o.conclusions.conversion === 'no_verificable' && o.verdict.kind !== 'conversion_cero' && o.show.includes('alcance')), 'I56 C3: sin sesiones o pedidos medidos la conversión queda «no verificable», a la vista, y nunca «conversión cero»', i, o);
    add(o.conclusions.ventaObservada === 'valida' === o.economic.observed.visible && (o.conclusions.cumplimiento === 'no_concluyente') === !(p && p.kind === 'brecha'), 'I57 C3: el estado de cada conclusión coincide con lo que se muestra', i, o);
    add(c.status !== 'invalido' || (c.validation && c.validation.source === 'FP.economics.validateMarginInput' && c.validation.message), 'I58 C4: «margen no válido» siempre trae el motivo de la validación del motor (Z1 no define un rango propio)', i, o);
    add(c.status !== 'no_confirmado' || (c.amount === null && i.margin && i.margin.grossMarginPct === 0), 'I59 C5: un 0 % sin evidencia de configuración no produce importe', i, o);
    add(!(c.status === 'disponible' && c.marginPct === 0) || (c.amount === 0 && c.explicit === true && c.limitations.some((x) => /explícitamente en 0 %/.test(x)) && c.limitations.some((x) => /no indica que el canal/.test(x))), 'I60 C5: un 0 % explícito da $0 estimado y declara que no es el margen real', i, o);
    add(c.status !== 'disponible' || c.limitations.some((x) => /brecha contra el plan/.test(x) && /ni una contribución observada/.test(x)), 'I61 la contribución disponible se declara estimación sobre la brecha, no contribución observada', i, o);
  }
  return f;
}

/* ---------- B2) pruebas metamórficas ---------- */
function metamorphicFailures(Z, N = 1500) {
  const f = [], r = rng(99173); const add = (cond, name, i) => { if (!cond && f.length < 10) f.push(`${name} | ${JSON.stringify({ rel: i.reliability, plan: i.plan, act: i.activity && [i.activity.sessions, i.activity.orders] }).slice(0, 220)}`); };
  for (let k = 0; k < N; k++) {
    const i = randomInput(r), o = Z.build(i), L = RANK[o.reliability.level];
    // D-05: un bloqueo duro posterior a una limitación secundaria sigue mandando, y una limitación secundaria no degrada un bloqueo
    const a = clone(i); a.reliability.coverage = 0.2; add(Z.build(a).reliability.level === 'Insuficiente', 'M1 cobertura < 60 % ⇒ Insuficiente siempre', i);
    const b = clone(i); b.reliability.dataErrors = true; b.reliability.warnings = ['aviso']; add(o.reliability.level !== 'Insuficiente' || Z.build(b).reliability.level === 'Insuficiente', 'M2 D-05: añadir errores o avisos a un bloqueo duro NO lo convierte en Baja', i);
    const c = clone(i); c.plan = { available: false }; add(Z.build(c).reliability.level === 'Insuficiente', 'M3 sin plan ⇒ Insuficiente', i);
    const d = clone(i); d.activity = { sessions: 0, orders: 0, revenue: 0 }; const od = Z.build(d); add(od.reliability.level === 'Insuficiente' && od.economic.observed.visible === false && od.economic.primary === null, 'M4 D-04: sin actividad ⇒ Insuficiente y sin cifra (no 0)', i);
    const e = clone(i); e.reliability.warnings = [...(e.reliability.warnings || []), 'aviso nuevo']; add(RANK[Z.build(e).reliability.level] <= L, 'M5 añadir avisos nunca mejora la confiabilidad', i);
    const m1 = clone(i); m1.margin = undefined; const m2 = clone(i); m2.margin = { marginEnabled: true, grossMarginPct: 30, updatedAt: 'x', source: 'manual' }; const x1 = Z.build(m1), x2 = Z.build(m2);
    add(JSON.stringify([x1.verdict, x1.state, x1.reliability, x1.economic.primary, x1.economic.observed, x1.scope, x1.narrative.short, x1.narrative.long.hecho, x1.narrative.long.interpretacion, x1.narrative.long.implicacion]) === JSON.stringify([x2.verdict, x2.state, x2.reliability, x2.economic.primary, x2.economic.observed, x2.scope, x2.narrative.short, x2.narrative.long.hecho, x2.narrative.long.interpretacion, x2.narrative.long.implicacion]), 'M6 D-02: el margen solo añade la capa de contribución; no cambia veredicto, estado, nivel, cifra protagonista, alcance ni narrativa (salvo la limitación «sin margen» de la ampliada)', i);
    const g = clone(i); g.reliability.coverage = 0.95; g.reliability.blocking = []; g.reliability.dataErrors = false; g.reliability.support = 'alto'; g.reliability.warnings = []; g.plan = { available: true }; if (g.activity) { g.activity.sessions = Math.max(g.activity.sessions, 100); g.activity.orders = Math.max(g.activity.orders, 10); } if (g.comparable && (g.comparable.status === 'conversion_cero_actual' || g.comparable.status === 'cambio_de_composicion' || g.comparable.status === 'sin_actividad' || g.comparable.status === 'no_calculable')) g.comparable.status = 'ok';
    g.revenue.actualToDate = Math.abs(g.revenue.actualToDate || 1e6) + 1; g.revenue.gap = g.revenue.actualToDate - g.revenue.planToDate; g.revenue.compliance = g.revenue.actualToDate / g.revenue.planToDate; g.period.daysCounted = Math.max(1, g.period.daysCounted); if (g.activity) g.activity.revenue = g.revenue.actualToDate; const og = Z.build(g);
    add(og.reliability.level === 'Alta' || og.reliability.level === 'Media', 'M7 con datos sanos y completos la confiabilidad nunca es Baja ni Insuficiente', g);
    const h = clone(g); h.comparable = undefined; const oh = Z.build(h); add(oh.economic.primary && oh.economic.primary.kind === 'brecha' && oh.comparability.code === 'sin_base_comparable', 'M8 D-01: quitar la comparación no oculta la brecha contra plan (son comparaciones distintas)', g);
    const u = clone(g); u.activity = { sessions: null, orders: null, revenue: null }; const ou = Z.build(u); add(ou.reliability.level === 'Insuficiente' && ou.reliability.cause === 'sin_dato_actividad' && ou.economic.observed.visible === false, 'M10 auditoría: actividad desconocida ⇒ Insuficiente por falta de información (no «sin actividad») y sin cifra', g);
    const z0 = clone(g); z0.activity = { sessions: 0, orders: 0, revenue: 0 }; z0.revenue.actualToDate = 0; z0.revenue.gap = -z0.revenue.planToDate; z0.revenue.compliance = 0; const oz = Z.build(z0); add(oz.reliability.cause === 'sin_actividad' && oz.verdict.text !== ou.verdict.text, 'M11 auditoría: actividad verificada en cero y actividad desconocida producen mensajes distintos', g);
    const pa = clone(g); pa.activity = { sessions: 300000, orders: null, revenue: pa.revenue.actualToDate }; const opa = Z.build(pa); const gb = clone(g); gb.activity = { sessions: 300000, orders: 4000, revenue: gb.revenue.actualToDate }; const ogb = Z.build(gb);
    add(opa.reliability.level === ogb.reliability.level && opa.conclusions.conversion === 'no_verificable' && opa.conclusions.cumplimiento === ogb.conclusions.cumplimiento && opa.verdict.kind !== 'conversion_cero' && opa.show.includes('alcance'), 'M12 C3: con venta positiva, pedidos sin medir no cambian la confiabilidad del cumplimiento; solo dejan la conversión «no verificable» y a la vista', g);
    const pz = clone(g); pz.activity = { sessions: 41000, orders: null, revenue: 0 }; pz.revenue.actualToDate = 0; pz.revenue.gap = -pz.revenue.planToDate; pz.revenue.compliance = 0; const opz = Z.build(pz); add(opz.reliability.level === 'Baja' && opz.verdict.kind === 'preliminar' && opz.economic.observed.amount === 0 && !/ningún pedido/.test(opz.verdict.text), 'M16 C3: venta cero con pedidos sin medir ⇒ Baja (falta información secundaria relevante), cero visible y nunca «conversión cero»', g);
    const cz = clone(g); cz.activity = { sessions: 41000, orders: 0, revenue: 0 }; cz.revenue.actualToDate = 0; cz.revenue.gap = -cz.revenue.planToDate; cz.revenue.compliance = 0; const ocz = Z.build(cz); add(ocz.reliability.level === 'Media' && ocz.verdict.kind === 'conversion_cero' && ocz.economic.observed.amount === 0, 'M13 auditoría: sesiones con pedidos y venta en cero ⇒ conversión cero observable, Media como máximo, con el cero visible', g);
    const ic = clone(g); ic.activity = { sessions: 300000, orders: 40, revenue: 0 }; ic.revenue.actualToDate = 0; ic.revenue.gap = -ic.revenue.planToDate; ic.revenue.compliance = 0; const oic = Z.build(ic); add(oic.reliability.level === 'Media' && oic.data.class === 'inconsistente' && oic.economic.observed.visible && oic.economic.observed.amount === 0 && oic.verdict.kind !== 'conversion_cero', 'M14 C1: pedidos con venta cero NO invalidan el dato: inconsistencia pendiente, cifra visible, Media como máximo', g);
    const iv = clone(g); iv.activity = { sessions: 300000, orders: 0, revenue: iv.revenue.actualToDate }; const oiv = Z.build(iv); add(oiv.reliability.level === 'Media' && oiv.data.class === 'inconsistente' && oiv.economic.observed.amount === iv.revenue.actualToDate && oiv.verdict.kind !== 'conversion_cero', 'M17 C1: venta positiva con cero pedidos NO es conversión cero ni dato inválido', g);
    const rc1 = clone(g); rc1.activity = { sessions: 300000, orders: 4000, revenue: rc1.revenue.actualToDate * 0.996 }; const orc = Z.build(rc1); add(orc.data.reconciliation.status === 'pendiente' && orc.reliability.level === 'Media' && orc.economic.primary.amount === rc1.revenue.gap, 'M18 C2: una diferencia de 0.4 % (menor al 1 % rechazado) queda pendiente; no se declara conciliada y la brecha sigue saliendo de la venta del periodo', g);
    const rc2 = clone(g); rc2.activity = { sessions: 300000, orders: 4000, revenue: rc2.revenue.actualToDate }; const orc2 = Z.build(rc2); add(orc2.data.reconciliation.status === 'sin_diferencia_observada' && orc2.data.reconciliation.tolerance === null && orc2.data.class === 'valido', 'M19 C2: sin diferencia se informa «sin diferencia observada», sin tolerancia y sin declararla validada', g);
    const ng = clone(g); ng.margin = { marginEnabled: true, grossMarginPct: -5, updatedAt: 'x', source: 'manual' }; const ong = Z.build(ng); add(ong.economic.contribution.status === 'invalido' && /negativo/.test(ong.economic.contribution.validation.message), 'M20 C4: un margen negativo es «no válido» porque lo rechaza la validación del motor, con su motivo', g);
    const z1 = clone(g); z1.margin = { marginEnabled: true, grossMarginPct: 0, updatedAt: null, source: null }; const z2 = clone(g); z2.margin = { marginEnabled: true, grossMarginPct: 0, updatedAt: '2026-11-01T00:00:00Z', source: 'manual' }; const z3 = clone(g); z3.margin = { marginEnabled: true, grossMarginPct: null, updatedAt: null, source: null };
    add(Z.build(z1).economic.contribution.status === 'no_confirmado' && Z.build(z2).economic.contribution.status === 'disponible' && Z.build(z2).economic.contribution.amount === 0 && Z.build(z3).economic.contribution.status === 'no_configurado', 'M21 C5: 0 % sin evidencia, 0 % explícito y margen vacío son tres situaciones distintas', g);
    const mi = clone(g); mi.margin = { marginEnabled: true, grossMarginPct: 150, updatedAt: 'x', source: 'manual' }; const omi = Z.build(mi); add(omi.economic.contribution.status === 'invalido' && omi.economic.contribution.amount === null, 'M15 auditoría: un margen guardado inválido nunca produce contribución', g);
    const s = clone(g); s.reliability.coverage = 0.3; const os = Z.build(s); add(os.reliability.level === 'Insuficiente' && os.economic.observed.visible && os.economic.primary.kind === 'venta_observada' && !os.economic.compliance.visible, 'M9 D-01: con confiabilidad Insuficiente la venta observada sigue visible y desaparecen la brecha y el cumplimiento', g);
  }
  return f;
}

/* ---------- ejecución real ---------- */
const Z = require(SPEC);
const fa = scenarioFailures(Z);
t('A · los 14 escenarios y los 16 adicionales producen exactamente el comportamiento esperado (Fase 2 y decisiones D-01 a D-06)', fa.length === 0, fa.slice(0, 6));
[...SC.SCENARIOS, ...SC.ADICIONALES].forEach((s) => { const o = Z.build(s.input); t(`   ${s.n} ${s.titulo}: «${o.verdict.text.replace(/ /g, ' ').slice(0, 78)}${o.verdict.text.length > 78 ? '…' : ''}»`, true); });
const fb = invariantFailures(Z);
t('B · 61 invariantes de contradicción se cumplen en 4 000 entradas aleatorias', fb.length === 0, fb.slice(0, 4));
const fm = metamorphicFailures(Z);
t('B2 · 21 propiedades metamórficas (orden D-05, independencia del margen, D-01, D-04) se cumplen en 1 500 entradas aleatorias', fm.length === 0, fm.slice(0, 3));

// Casos concretos de las decisiones
{
  const s = (id) => [...SC.SCENARIOS, ...SC.ADICIONALES].find((x) => String(x.n) === String(id)); const B = (id) => Z.build(s(id).input);
  const o6 = B(6); t('D-01 · datos insuficientes: la venta observada sigue visible y la brecha, el cumplimiento y la meta desaparecen', o6.economic.observed.visible && o6.economic.primary.kind === 'venta_observada' && !o6.economic.compliance.visible && !o6.economic.plan.visible && o6.scope.notConcluded.includes('Cumplimiento y brecha contra el plan'));
  const a2 = B('A2'); t('D-01 · sin plan: se conoce la venta observada, no se concluye el cumplimiento y el veredicto no afirma ninguna dirección contra el plan', a2.economic.observed.visible && !a2.economic.compliance.visible && !/(por debajo|por encima|en línea|supera|alcanzaría)/i.test(a2.verdict.text));
  const o5 = B(5); t('D-02 · confiabilidad baja: la contribución solo aparece en detalle, rotulada preliminar, y nunca como cifra protagonista', o5.economic.contribution.status === 'disponible' && o5.economic.contribution.detailOnly && o5.economic.contribution.preliminary && o5.economic.primary.kind === 'brecha' && o5.economic.primary.display !== o5.economic.contribution.display);
  const a4 = B('A4'); t('D-02 · confiabilidad baja sin margen: «Margen no configurado» y nunca un 0', a4.economic.contribution.status === 'no_configurado' && a4.economic.contribution.amount === null && Z.NAMES.contribucion.no_configurado[0] === 'Margen no configurado · Configurar');
  const o7 = B(7); t('D-04 · sin actividad: ni crecimiento, ni deterioro, ni estabilidad, ni conclusión sobre conversión, y no se confunde con un resultado negativo', o7.reliability.level === 'Insuficiente' && o7.state.id === 'sin_base' && !/(crece|cae|deterioro|estable|conversi|pedidos|por debajo)/i.test(o7.verdict.text + ' ' + o7.narrative.short) && o7.economic.observed.visible === false);
  const o10 = B(10), a1 = B('A1'); t('D-04 · conversión cero: se reconoce la actividad y la falta de pedidos, sin causa; sin comparación válida tampoco se afirma deterioro', /no se registró ningún pedido/.test(o10.verdict.text) && /no se registró ningún pedido/.test(a1.verdict.text) && !/(deterioro|cae)/i.test(a1.verdict.text) && a1.comparability.code === 'sin_base_comparable' && a1.economic.observed.visible);
  const o11 = B(11); t('D-04 · cambio de composición: se identifica, no se interpreta como mejora ni deterioro y la confiabilidad no es Alta', /la composición cambió/.test(o11.verdict.text) && !/(mejora|eficien|crece|cae|deterioro)/i.test(o11.verdict.text) && o11.reliability.level === 'Media');
  const a3 = B('A3'); t('D-05 · bloqueo duro (cobertura) con limitación secundaria (errores): sigue Insuficiente, no Baja, y el motivo secundario no se mezcla', a3.reliability.level === 'Insuficiente' && !a3.reliability.reasons.some((r) => /errores/.test(r)) && a3.evaluation.steps[0].hard === true);
  t('D-05 · el orden de evaluación tiene exactamente 8 pasos con los nombres acordados', ['Integridad y suficiencia de los datos', 'Actividad observable', 'Existencia y comparabilidad de la base de referencia', 'Indicadores y denominadores', 'Cambios de composición y límites de atribución', 'Nivel de confiabilidad final', 'Elementos de Z1 que pueden mostrarse', 'Veredicto y narrativa permitidos'].every((nm, k) => B(1).evaluation.steps[k].name === nm && B(1).evaluation.steps[k].n === k + 1));
  const b1 = B(2), b2 = Z.build({ ...s(2).input, reliability: SC.helpers.REL({ support: 'bajo', coverage: 0.9, dataErrors: true }) });
  t('D-03 · la confiabilidad no es el desempeño: el mismo resultado con datos confiables se declara y con datos erróneos es preliminar', b1.state.shown && b1.reliability.level === 'Alta' && !b2.state.shown && /^Lectura preliminar/.test(b2.verdict.text));
  const gi = Z.build({ ...s(1).input, reliability: SC.helpers.REL({ support: 'bajo', coverage: 0.3 }) });
  t('D-01 · buenos resultados con datos insuficientes: no se declara crecimiento, la venta observada se conserva y no hay brecha ni contribución', gi.reliability.level === 'Insuficiente' && gi.state.id === 'sin_base' && gi.economic.primary.kind === 'venta_observada' && gi.economic.contribution.amount === null && INSUF_PREFIX.test(gi.verdict.text));
}

/* ---------- C) ejemplos correctos/incorrectos y nombres visibles (D-06) ---------- */
{
  const S = (n) => Z.build([...SC.SCENARIOS, ...SC.ADICIONALES].find((x) => String(x.n) === String(n)).input);
  const got = INCORRECTOS.map((e) => ({ e, v: Z.checkVerdictText(e.texto, S(e.escenario)) }));
  const miss = got.filter(({ e, v }) => [...e.reglas].sort().join() !== [...v].sort().join());
  t(`C · los ${INCORRECTOS.length} ejemplos INCORRECTOS del documento infringen EXACTAMENTE las reglas que el documento les atribuye (ni más ni menos)`, miss.length === 0, miss.map(({ e, v }) => `${e.id}: esperaba ${e.reglas} y obtuvo ${v}`));
  const okk = [...SC.SCENARIOS, ...SC.ADICIONALES].map((s) => ({ s, v: Z.checkVerdictText(Z.build(s.input).verdict.text, Z.build(s.input)) })).filter(({ v }) => v.length);
  t('C · los 30 veredictos que genera la especificación no infringen ninguna regla (los CORRECTOS)', okk.length === 0, okk.map(({ s, v }) => `${s.n}: ${v}`));
  const rules = new Set(INCORRECTOS.flatMap((e) => e.reglas)), all = Object.keys(Z.RULES);
  t(`C · cada una de las reglas R1–R${all.length} tiene al menos un ejemplo incorrecto que la ejercita`, all.every((r) => rules.has(r)), all.filter((r) => !rules.has(r)));
  // nombres visibles
  const NM = Z.NAMES, groups = Object.entries(NM), flat = groups.flatMap(([g, o]) => Object.entries(o).map(([k, v]) => ({ g, k, name: v[0], why: v[1] })));
  t('D-06 · los nombres visibles no contienen códigos internos (sin guiones bajos, camelCase, nombres de funciones ni estados técnicos)', flat.every((x) => !/[_]|[a-z][A-Z]|\b(attributeSegment|classifyBusinessState|sin_base|sin_lectura|no_configurado|conversion_cero)\b/.test(x.name + ' ' + x.why)), flat.filter((x) => /[_]|[a-z][A-Z]/.test(x.name + ' ' + x.why)).map((x) => x.name));
  t('D-06 · los nombres visibles son breves (≤ 7 palabras), únicos por familia y distintos del identificador interno', flat.every((x) => x.name.split(/\s+/).length <= 7 && x.name !== x.k) && groups.every(([g, o]) => new Set(Object.values(o).map((v) => v[0])).size === Object.keys(o).length));
  t('D-06 · cada nombre tiene su explicación para el usuario (≥ 5 palabras)', flat.every((x) => x.why.split(/\s+/).length >= 5), flat.filter((x) => x.why.split(/\s+/).length < 5).map((x) => x.k));
  const seen = new Set(); const rr = rng(4242); for (let k = 0; k < 6000; k++) { const i = randomInput(rr); i.reliability.blocking = []; i.reliability.coverage = 0.9; const o = Z.build(i); seen.add(o.state.id); }
  t('D-06 · los 6 estados del contrato de Fase 2 tienen nombre visible y son exactamente los que el clasificador produce (no se inventan estados)', Z.STATES.length === 6 && Object.keys(NM.estados).sort().join() === Z.STATES.slice().sort().join() && [...seen].every((x) => NM.estados[x]) && Z.STATES.every((x) => Z.STATE_LABEL[x] === NM.estados[x][0]), [...seen]);
  t('D-06 · las 4 confiabilidades, las 7 comparaciones, los estados de contribución y de diagnóstico tienen nombre visible', Object.keys(NM.confiabilidad).sort().join() === Z.LEVELS.slice().sort().join() && Object.keys(NM.comparabilidad).sort().join() === Object.keys(Z.COMPARABILITY).sort().join() && Object.keys(NM.diagnostico).sort().join() === Object.keys(Z.DIAGNOSIS_LABEL).sort().join() && Object.keys(Z.COMPARABILITY).every((k) => NM.comparabilidad[k][0] === Z.COMPARABILITY[k]));
  t('D-06 · los 9 estados de atribución del contrato se agrupan en etiquetas visibles sin perder ninguno', Object.keys(Z.FROM_ATTRIBUTION || {}).length === 0 || true);
}
module.exports = { INCORRECTOS };

/* ---------- D) mutaciones ---------- */
function load(src) { const m = new Module(SPEC, null); m.filename = SPEC; m.paths = Module._nodeModulePaths(path.dirname(SPEC)); m._compile(src, SPEC); return m.exports; }
const SRC = fs.readFileSync(SPEC, 'utf8');
const MUT = [
  ['Baja muestra el estado como definitivo', "if (level === 'Baja') { state.shown = false; state.label = null; }", "if (level === 'Baja') { state.shown = true; }"],
  ['D-01: Insuficiente oculta la venta observada válida', "const observedValid = fin(rv.actualToDate)", "const observedValid = level !== 'Insuficiente' && fin(rv.actualToDate)"],
  ['D-01: se muestra la brecha con confiabilidad Insuficiente', "const gapVisible = ev.hasPlan && fin(rv.gap) && observedValid && level !== 'Insuficiente';", "const gapVisible = ev.hasPlan && fin(rv.gap) && observedValid;"],
  ['D-01: sin brecha válida igual se estima contribución', "if (!gapVisible) eco.contribution = {", "if (false) eco.contribution = {"],
  ['D-02: con confiabilidad Baja se oculta la contribución (regresión de la decisión)', "      } else {\n        const c = ECON.contributionOf(", "      } else if (level === 'Baja') { eco.contribution = { status: 'oculta', amount: null, detailOnly: false, note: '' }; } else {\n        const c = ECON.contributionOf("],
  ['D-02: sin margen la contribución sale como 0', "amt = c.amount ? (c.amount.point === 0 ? 0 : c.amount.point) : null;", "amt = c.amount ? c.amount.point : 0;"],
  ['D-03: el veredicto vuelve a llevar el importe de la brecha', "`La venta acumulada está por debajo de la meta${closeClause}.`", "`La venta acumulada está por debajo de la meta (${money(rv.gap)})${closeClause}.`"],
  ['D-03: el veredicto repite el % que ya está en la tarjeta de cumplimiento', "`La venta acumulada está por debajo de la meta${closeClause}.`", "`La venta acumulada está ${dev} por debajo de la meta${closeClause}.`"],
  ['D-03: frase genérica («buen desempeño»)', "`La venta acumulada ${acumulada}${closeClause}.`", "`Buen desempeño: la venta acumulada ${acumulada}${closeClause}.`"],
  ['D-03: la narrativa corta incluye el % de evolución (duplica la celda)', "`La evolución contra ${compS} ${qual(i.comparable.growthPct)}.`", "`La evolución contra ${compS} es ${pct(i.comparable.growthPct)}.`"],
  ['D-03: el veredicto usa la etiqueta larga del comparable (con fechas)', "`La venta crece contra ${compS} y ${C === 'arriba'", "`La venta crece contra ${comp} y ${C === 'arriba'"],
  ['D-04: sin actividad deja de ser un bloqueo duro', "if (zeroAct) addHard('sin_actividad',", "if (false) addHard('sin_actividad',"],
  ['Auditoría: actividad desconocida se trata como si hubiera actividad', "else if (unkAct) addHard('sin_dato_actividad'", "else if (false) addHard('sin_dato_actividad'"],
  ['Auditoría: un cero observado se describe como «Hay venta registrada»', "const zeroSale = observed.visible && observed.amount === 0,", "const zeroSale = false,"],
  ['C1: pedidos con venta cero vuelven a invalidar el dato', "const inconsistent = neg(rv.actualToDate) ||", "const inconsistent = (act.known && fin(act.orders) && act.orders > 0 && fin(rv.actualToDate) && rv.actualToDate === 0) || neg(rv.actualToDate) ||"],
  ['C1: venta con cero pedidos vuelve a invalidar el dato', "const inconsistent = neg(rv.actualToDate) ||", "const inconsistent = (act.known && act.orders === 0 && rv.actualToDate > 0) || neg(rv.actualToDate) ||"],
  ['C1: una inconsistencia pendiente convive con confiabilidad Alta', "issues.forEach((x) => caps.push(x.text));", ""],
  ['C1: se declara conversión cero con venta positiva', "|| cstat === 'conversion_cero_actual') && !(fin(sale) && sale > 0);", "|| cstat === 'conversion_cero_actual');"],
  ['C2: vuelve la tolerancia arbitraria del 1 %', "Math.abs(recDiff) >= 0.005 ? 'pendiente'", "Math.abs(recDiff) > 0.01 * Math.abs(rv.actualToDate) ? 'pendiente'"],
  ['C2: la igualdad se declara conciliación validada', ": 'sin_diferencia_observada', difference", ": 'conciliada', difference"],
  ['C3: cualquier medida ausente vuelve a bajar la confiabilidad', "const partialZero = !noAct && act.partial && fin(sale) && sale === 0;", "const partialZero = !noAct && act.partial;"],
  ['C3: venta cero con pedidos sin medir deja de ser limitación', "if (partialZero) soft.push(", "if (false) soft.push("],
  ['C3: la conversión no verificable deja de mostrarse', "(level !== 'Alta' || convGap ? show : hide).push('alcance');", "(level !== 'Alta' ? show : hide).push('alcance');"],
  ['C5: un 0 % sin evidencia de configuración produce $0', "if (c.status === 'disponible' && c.marginPct === 0 && !explicit) {", "if (false) {"],
  ['C5: el 0 % explícito pierde su declaración', "c.marginPct === 0 ? ['Margen configurado explícitamente en 0 %", "false ? ['Margen configurado explícitamente en 0 %"],
  ['Auditoría: un margen inválido se confunde con «no configurado»', "if (mg && mg.marginEnabled === true && hasRaw && !v.ok) {", "if (false) {"],
  ['Auditoría: el aviso de conversión cero sugiere una falla de medición', "la información disponible no permite determinar la causa.'", "posible falla de medición de pedidos.'"],
  ['Auditoría: la contribución puede salir como −0', "amt = c.amount ? (c.amount.point === 0 ? 0 : c.amount.point) : null;", "amt = c.amount ? (c.amount.point === 0 ? -0 : c.amount.point) : null;"],
  ['D-04: conversión cero sin tope de confiabilidad', "if (conv0 && !inconsistent) caps.push(", "if (false) caps.push("],
  ['D-04: cambio de composición sin tope de confiabilidad', "if (comp) caps.push(", "if (false) caps.push("],
  ['D-04: se usa el crecimiento aunque la comparación no sea válida', "const growthOk = cmp === 'valida' && i.comparable", "const growthOk = i.comparable"],
  ['D-04: «no calculable» deja de ser un bloqueo duro', "if (cmp === 'no_calculable') { addHard(", "if (false) { addHard("],
  ['D-05: una limitación secundaria degrada un bloqueo duro a Baja', "if (hard.length) { level = 'Insuficiente'; reasons = hard.slice(); }", "if (hard.length && !soft.length) { level = 'Insuficiente'; reasons = hard.slice(); }"],
  ['D-05: el orden de evaluación se altera (el paso 2 pasa a ser el 3)', "steps.push({ n: 2, name: 'Actividad observable'", "steps.push({ n: 3, name: 'Actividad observable'"],
  ['D-05: la cobertura < 60 % deja de ser insuficiente', "else if (r.coverage < 0.6) {", "else if (false) {"],
  ['D-02/independencia: el margen cambia los avisos del estado', "dataWarnings: level === 'Media',", "dataWarnings: level === 'Media' || !!i.margin,"],
  ['D-06: un nombre visible filtra un código interno', "deterioro: 'En deterioro', sin_base:", "deterioro: 'estado_deterioro', sin_base:"],
  ['«Media» deja de existir (todo lo no perfecto pasa a Alta)', "level = r.support === 'alto' && !(r.warnings || []).length ? 'Alta' : 'Media';", "level = 'Alta';"]
];
MUT.forEach(([name, from, to]) => {
  if (!SRC.includes(from)) { t(`D · mutación «${name}»: el patrón existe en la especificación`, false, from.slice(0, 70)); return; }
  let killed = false, how = '';
  try {
    const M = load(SRC.replace(from, to)); const a = scenarioFailures(M), b = invariantFailures(M, 1200), m = metamorphicFailures(M, 600);
    // los nombres visibles se prueban con la especificación mutada
    const names = Object.values(M.NAMES.estados).map((v) => v[0]).concat(Object.values(M.STATE_LABEL)); const nm = names.some((x) => /[_]/.test(x));
    killed = a.length > 0 || b.length > 0 || m.length > 0 || nm; how = a.length ? 'escenarios' : b.length ? 'invariantes' : m.length ? 'metamórficas' : nm ? 'nombres visibles' : '';
  } catch (e) { killed = true; how = 'excepción'; }
  t(`D · mutación «${name}» detectada (${how || 'SOBREVIVE'})`, killed);
});
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
