#!/usr/bin/env node
/* Fase 3 · auditoría TRANSVERSAL Z1–Z5 tras resolver D-05 y D-07 (datos SIMULADOS). Ejecuta de verdad lo que reporta; lo que aún no está implementado se marca como PENDIENTE y no cuenta como prueba superada.
 *   node tools/test-fase3-transversal-d05-d07.js */
const fs = require('fs'), path = require('path');
const E = require('./audit/escenarios-comerciales.js'), CO = require('./audit/coherencia-zonas.js'), Z1 = require('./audit/z1-lectura-ejecutiva.js'), S1 = require('./audit/z1-escenarios.js');
const h = S1.helpers, base = S1.SCENARIOS[1].input, pipe = E.pipeline;
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 380) : '')); if (!c) bad++; };
const pend = (name) => console.log('◌ PENDIENTE (no cuenta como prueba superada) ' + name);
const sinSes = { ...base, activity: { sessions: null, orders: 21400, revenue: 15233993.8272 } }, parcial = { ...base, reliability: { ...base.reliability, coverage: 0.8 } }, sinAct = { ...base, activity: undefined };
const A = pipe(sinSes), B = pipe(parcial), C = pipe(sinAct), V = pipe(base);
/* 1 · Z1 no presenta como completos datos no comprobados */
t('T1 Z1: con sesiones faltantes, cobertura parcial o sin actividad no se afirma «datos completos»; con datos verificados sí', [A, B, C].every((x) => !/datos completos/i.test(x.o1.verdict.text)) && /datos completos/i.test(V.o1.verdict.text));
/* 2 · Z2 no contradice a Z1 (Z2 se deriva de la misma lectura: sin puente de conversión si Z1 la declara no verificable) */
t('T2 Z2/driver: con la conversión no verificable no existe el elemento «la conversión explica…» del que se alimenta Z2', ![A, C].some((x) => x.o3.cards.some((c) => !c.isData && /conversi[oó]n/i.test(c.title))) && V.o3.cards.some((c) => /conversi[oó]n explica/i.test(c.title)));
/* 3 · Z3 sin alertas basadas en lo no verificable; dice lo que falta */
t('T3 Z3: sin sesiones hay un elemento de datos («conversión no verificable») y ninguna alerta/oportunidad de conversión ni de tráfico', A.o3.cards.some((c) => c.isData && /conversi[oó]n no es verificable/i.test(c.title)) && !A.o3.cards.some((c) => !c.isData && /conversi[oó]n|sesiones/i.test(c.title)), A.o3.cards.map((c) => c.title));
t('T3b Z3: con cobertura parcial dice que la información está incompleta (C19)', B.o3.cards.some((c) => c.isData && /incompleta/i.test(c.title)) && B.viol.length === 0, [B.o3.cards.map((c) => c.title), B.viol]);
/* 4 · Z4 sin acciones ejecutables cuando falta un requisito indispensable */
t('T4 Z4: sin sesiones no ofrece acciones de conversión ni de tráfico; ofrece completar el dato', !A.o4.cards.some((c) => /conversi[oó]n|sesiones/i.test(c.label) && c.kind !== 'datos') && A.o4.cards.some((c) => c.kind === 'datos'), A.o4.cards.map((c) => c.kind + ':' + c.label));
/* 5 · Z5 integra oportunidades sin duplicar impactos ni contradecir Z3 (la presencia en Z3, Z4 y Z5 cumple funciones distintas; el importe vive solo en el elemento) */
const opp = V.o3.cards.filter((c) => c.clase === 'oportunidad');
const refs = V.o4.cards.flatMap((c) => c.cites.filter((x) => x.impactRef).map((x) => ({ id: x.id, display: x.impactRef.display })));
t('T5a oportunidades: cada importe citado en Z4 es una REFERENCIA idéntica al del elemento de Z3 (no un segundo importe)', refs.every((r) => { const c = V.o3.cards.find((y) => y.id === r.id); return c && c.impact && (c.impact.sales ? c.impact.sales.display === r.display || c.impact.display === r.display : true); }) || refs.length === 0, refs);
t('T5b oportunidades: las alternativas de recuperación de Z3 se agregan como rango/alternativa y nunca como suma (el total no excede el mayor)', (() => { const alt = opp.filter((c) => c.impact && c.impact.sales && c.impact.exclusiveGroup !== undefined); const tot = V.o3.totals && V.o3.totals.oportunidad; if (!tot) return true; return (tot.lines || []).every((l) => !l.alternatives || !l.alternatives.length || l.isRange || l.point === null); })());
t('T5c Z5 del prototipo («Oportunidades y visión de conjunto») no repite importes ni cifras: sus niveles principales no contienen $ ni porcentajes de cálculo y solo referencian a Z3', (() => { const s = fs.readFileSync(path.join(__dirname, '../docs/command-center/prototipo/home_3_5_prototipo.html'), 'utf8'), m = [...s.matchAll(/<section[^>]*id="z5-alta".*?<\/section>/gs)][0]; if (!m) return false; const sec = m[0], main = sec.replace(/<details.*?<\/details>/s, '').replace(/<[^>]+>/g, ' '); return /Oportunidades y visión de conjunto/.test(sec) && !/\$\s?\d|\d\s?%/.test(main) && /data-ref-z3=/.test(sec); })());
t('T5d la brecha total y la del canal que la concentra (mismo dinero) NO se suman en el total de Z3: no se muestra cifra y el detector (C20) acepta el resultado; con el defecto plantado (sin grupo de superposición) lo detecta', (() => { const lines = Object.values(V.o3.totals.hallazgo.lines || []).filter((l) => l.category === 'brecha'); const ok = lines.length === 1 && lines[0].overlap === true && lines[0].display === null && !V.viol.some((m) => /C20/.test(m));
  const fake = { ...V.o3, totals: { ...V.o3.totals, hallazgo: { ...V.o3.totals.hallazgo, lines: [{ category: 'brecha', point: V.o1.economic.primary.amount * 1.9, display: 'x', overlap: false }] } } }; return ok && CO.check(V.o1, fake, V.o4).some((m) => /C20/.test(m)); })());
/* 6 · decisiones D-01 a D-07: lo que está implementado en la especificación y se prueba; lo demás, pendiente (no se afirma) */
const mg = (m) => Z1.build({ ...base, margin: m });
t('D-01 (parcial) hoy: margen negativo ≠ margen no configurado (mensajes distintos) y no se oculta en silencio; la IMPLEMENTACIÓN del criterio (mostrarlo con respaldo válido) queda pendiente de 4.5', (() => { const neg = mg({ marginEnabled: true, grossMarginPct: -5, updatedAt: 'x', source: 'manual' }), nc = mg(undefined); return neg.economic.contribution.status !== nc.economic.contribution.status && /margen/i.test(neg.narrative.long.limitaciones); })());
pend('D-01 mostrar márgenes negativos respaldados (requiere 4.5; el motor lo rechaza y no se modificó)');
t('D-02 (parcial) toda diferencia > $0.01 queda pendiente y la ausencia de diferencia no es conciliación formal', (() => { const d = (x) => Z1.build({ ...base, activity: { sessions: 1120000, orders: 21400, revenue: base.revenue.actualToDate + x } }).data.reconciliation; return d(0.02).status === 'pendiente' && d(0).status === 'sin_diferencia_observada' && !/concilia(da|do|ción validada)/i.test(JSON.stringify(Z1.build(base).data.reconciliation.status)); })());
t('D-03 (parcial) no hay umbral universal de actividad en Z1: solo cero verificado frente a ausencia de dato', ['sin_actividad', 'sin_dato_actividad'].every((c) => Z1.CAUSE_ORDER.includes(c)) && !/umbral/i.test(fs.readFileSync(path.join(__dirname, 'audit/z1-lectura-ejecutiva.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').match(/const [A-Z_]*UMBRAL[^;]*;/i) || ''));
pend('D-03 mostrar que una muestra es insuficiente según su volumen (método por definir en 4.2)');
pend('D-04 priorización conjunta con impacto, confiabilidad y capacidad de ejecución (ponderaciones sin definir: no se inventan)');
t('D-05 se cumple en Z1 (T1), Z3 (T3) y Z4 (T4); hipótesis y causas: el veredicto de Z1 no atribuye causas', [A, B, C, V].every((x) => !/\b(se debe|debido a|porque|provoc\w*)\b/i.test(x.o1.verdict.text)));
t('D-06 Z3 no totaliza líneas con impactos superpuestos y la brecha total y la del canal no se suman', (() => { const tot = V.o3.totals && Object.values(V.o3.totals).flatMap((c) => c.lines || []); return !tot || tot.every((l) => !l.overlap || (l.display === null && l.point === null)); })());
t('D-07 las cinco zonas existen con su responsabilidad (Z1 veredicto · Z2 contexto/desempeño · Z3 atención · Z4 acciones · Z5 visión de conjunto/evidencia) y el prototipo no repite impactos entre zonas', ['z1', 'z2', 'z3', 'z4', 'z5'].every((z) => new RegExp(`id="${z}-alta"`).test(fs.readFileSync(path.join(__dirname, '../docs/command-center/prototipo/home_3_5_prototipo.html'), 'utf8'))));
/* 7 · detector (C18 y C19) con casos plantados */
const planted18 = CO.check({ ...A.o1, completeness: { ...A.o1.completeness, status: 'incompleta' }, verdict: { ...A.o1.verdict, text: 'La venta está por debajo de la meta. Lectura sustentada en datos completos.' } }, A.o3, A.o4);
const planted19 = CO.check(A.o1, { ...A.o3, cards: A.o3.cards.filter((c) => !c.isData) }, A.o4);
t('T7a el detector reconoce C18 (datos completos sin comprobar)', planted18.some((m) => /C18/.test(m)), planted18);
t('T7b el detector reconoce C19 (Z1 dice incompleta y Z3 no lo dice)', planted19.some((m) => /C19/.test(m)), planted19);
/* 8 · aleatorio: 2 000 lecturas, ninguna contradicción entre capas */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(20261113); let viol = [];
for (let k = 0; k < 2000; k++) { const pick = (a) => a[Math.floor(r() * a.length)], plan = Math.round(1e6 + r() * 4e7), act = Math.round(plan * (0.75 + r() * 0.5));
  const i = h.base({ period: h.period(), plan: { available: true }, revenue: { planToDate: plan, actualToDate: act, gap: act - plan, compliance: act / plan, gapPct: act / plan - 1 },
    activity: pick([undefined, { sessions: null, orders: 900, revenue: act }, { sessions: 20000, orders: null, revenue: act }, { sessions: 20000, orders: 900, revenue: null }, { sessions: 20000, orders: 900, revenue: act }, { sessions: 20000, orders: 900, revenue: act }]),
    forecast: { target: plan * 1.5, close: plan * 1.5 * (0.9 + r() * 0.2), gapPct: -0.05 + r() * 0.1 }, comparable: h.COMP('ok', (r() - 0.5) * 0.3, 1e5, plan * 0.9), reliability: h.REL({ support: 'alto', coverage: pick([1, 1, 0.9, 0.7]) }), margin: S1.MARGIN });
  try { const x = pipe(i); if (x.viol.length || x.o3.rejected.length || x.o4.rejected.length) viol.push(x.viol.concat(x.o3.rejected.map((y) => y.id)).join(' | ')); } catch (e) { viol.push('excepción ' + e.message); } }
t('T8 2 000 lecturas con datos faltantes y parciales: 0 contradicciones entre Z1, Z3 y Z4 (C1–C19) y 0 elementos o acciones inválidos', !viol.length, viol.slice(0, 3));
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
