#!/usr/bin/env node
/* Command Center · Fase 2 — pruebas de los contratos (tools/audit/command-center-contracts.js): hallazgo, deduplicación, ciclo de vida, estado del negocio,
   severidad de desviaciones e impacto económico. Son la especificación ejecutable de docs/command-center/MODELO_*.md.   node tools/test-fase2-contratos.js */
const C = require('./audit/command-center-contracts.js');
let bad = 0; const t = (n, c, d) => { console.log((c ? '✔ ' : '✘ ') + n + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 400) : '')); if (!c) bad++; };

/* ---------- fábrica de hallazgos ---------- */
const ev = (o) => ({ class: 'calculo', text: 'Venta real $15,943,684 contra plan $15,956,810.', numbers: [15943684, 15956810], source: { module: 'pacing', field: 'toDate.revenue' }, headline: true, ...o });
const econ = (o) => ({ schema: 'cc.economic_impact', version: 1, category: 'brecha', status: 'ok', provenance: 'observed', amount: { point: -13126 }, basis: { period: '2026-09', scope: 'total', indicator: 'revenue' },
  method: { id: 'gap', formula: 'real − plan (mismos días contados)', engine: 'gap.calculateGap' }, assumptions: [], ...o });
const F = (o = {}) => ({ schema: 'cc.finding', version: 1, id: 'f:test', type: 'deviation', title: 'La venta va por debajo del plan', description: 'La venta acumulada está $13,126 por debajo del plan a la fecha.',
  scope: { level: 'total', channel: 'total' }, period: { type: 'month', key: '2026-09', comparison: 'plan' }, indicator: 'revenue', observed: { value: 15943684, unit: 'MXN' }, reference: { value: 15956810, basis: 'plan de los mismos días' },
  evidence: [ev()], rule: { id: 'pacing.gap', family: 'gap', version: 1 }, certainty: { level: 'calculo', support: 'alto', basis: 'Alto: ≥ 90 % de días comparados y datos sin avisos.' },
  severity: 'seguimiento', limitations: [], validity: { status: 'activo', firstSeen: '2026-09-22', lastSeen: '2026-09-22', expiresWhen: 'cierra el periodo o la brecha se resuelve' },
  lineage: [{ engine: 'attentionEngine', id: 'gap', role: 'origin', family: 'atencion' }], economics: econ(), ...o });
const ok = (f) => C.validateFinding(f);

/* ---------- contrato de hallazgo ---------- */
t('un hallazgo completo y trazable es válido', ok(F()).ok, ok(F()).errors);
t('rechaza un tipo desconocido', !ok(F({ type: 'alarma' })).ok);
t('lo normal no es un hallazgo (severidad «normal» rechazada)', !ok(F({ severity: 'normal' })).ok);
t('exige fuente (módulo y campo) en cada evidencia: sin trazabilidad no hay insight', !ok(F({ evidence: [ev({ source: null })] })).ok);
t('exige la regla que originó el hallazgo', !ok(F({ rule: null })).ok);
t('exige primera/última vez visto y condición de vencimiento', !ok(F({ validity: { status: 'activo' } })).ok);
t('exige el linaje (qué motor lo originó)', !ok(F({ lineage: [] })).ok);
t('la certeza no puede superar a la evidencia más débil que sostiene el titular (hipótesis presentada como cálculo)', !ok(F({ evidence: [ev({ class: 'hipotesis', text: 'Podría ser el checkout.' })], certainty: { level: 'calculo', support: 'medio', basis: 'x' } })).ok);
t('una hipótesis bien declarada (nivel hipótesis, con cómo validarla) es válida', ok(F({ type: 'risk', title: 'La conversión podría estar cayendo por el checkout', description: 'Podría ser un cambio en el checkout; hay que validarlo con el embudo.',
  evidence: [ev({ class: 'hipotesis', text: 'Posible cambio en el checkout.', headline: true, validation: 'Comparar el embudo por semana.' })], certainty: { level: 'hipotesis', support: 'medio', basis: 'Contribución cuantitativa; no demuestra causa.' }, economicsReason: 'sin cuantificar', economics: null })).ok, ok(F({ type: 'risk' })).errors);
t('lenguaje causal en una hipótesis se rechaza («la causa es»)', !ok(F({ type: 'risk', title: 'La causa es el checkout', description: 'La causa es el checkout.', evidence: [ev({ class: 'hipotesis', headline: true, validation: 'x' })], certainty: { level: 'hipotesis', support: 'medio', basis: 'x' }, economicsReason: 'n', economics: null })).ok);
t('una señal o hipótesis sin cómo validarla se rechaza', !ok(F({ evidence: [ev({ class: 'senal', headline: true })], certainty: { level: 'senal', support: 'medio', basis: 'x' } })).ok);
t('sin impacto económico exige explicar por qué (economicsReason)', !ok(F({ economics: null })).ok && ok(F({ economics: null, economicsReason: 'Faltan datos de ticket por producto.' })).ok);
t('si trae impacto económico, lo valida con el contrato 2.5', !ok(F({ economics: econ({ method: null }) })).ok);
t('las clases de certeza cubren las tres escaleras existentes (narrativa, análisis, diagnóstico) sin huecos', ['hecho', 'calculo', 'driver', 'senal', 'hipotesis', 'accion'].every((x) => C.FROM_NARRATIVE[x]) && ['fact', 'driver', 'signal', 'hypothesis', 'projection'].every((x) => C.FROM_ARCHITECTURE[x]));

/* ---------- deduplicación y agrupación ---------- */
const drv = (engine, family, id, extra = {}) => F({ id, type: 'deviation', indicator: 'conversionRate', rule: { id: `${engine}.driver`, family: 'driver_cr', version: 1 }, lineage: [{ engine, id, role: 'origin', family }], ...extra });
const m = C.mergeFindings([drv('attentionEngine', 'atencion', 'driver_cr'), drv('analistaDetectors', 'agentes', 'drivers'), drv('narrativeEngine', 'narrativa', 'claim-driver-cr'), F(), F({ id: 'f:gap2', lineage: [{ engine: 'analistaDetectors', id: 'cae', role: 'origin', family: 'agentes' }] })]);
t('el mismo driver reportado por 3 motores con nombres distintos colapsa en UN hallazgo', m.filter((x) => x.dedupKey.endsWith('driver:cr')).length === 1);
t('el hallazgo canónico conserva el origen y marca a los demás como duplicados (trazabilidad)', (() => { const c = m.find((x) => x.dedupKey.endsWith('driver:cr')); return c.lineage.length === 3 && c.lineage.filter((l) => l.role === 'duplicate').length === 2 && c.lineage[0].engine === 'attentionEngine'; })());
t('la brecha reportada por dos motores colapsa en uno', m.filter((x) => x.dedupKey.endsWith('pacing_gap')).length === 1);
t('el driver queda agrupado bajo la brecha del mismo canal y periodo (explica, no suma)', (() => { const c = m.find((x) => x.dedupKey.endsWith('driver:cr')), g = m.find((x) => x.dedupKey.endsWith('pacing_gap')); return c.explains === g.id; })());
t('hallazgos de canales distintos NO se fusionan', C.mergeFindings([drv('a', 'atencion', 'x'), drv('a', 'atencion', 'y', { scope: { level: 'channel', channel: 'app' } })]).length === 2);
t('periodos distintos NO se fusionan', C.mergeFindings([drv('a', 'atencion', 'x'), drv('a', 'atencion', 'y', { period: { type: 'month', key: '2026-10', comparison: 'plan' } })]).length === 2);
t('familias: driver_traffic/driver_trafficVolume y driver_aov se distinguen', C.familyOf('driver_traffic') === 'driver:traffic' && C.familyOf('driver_trafficVolume') === 'driver:traffic' && C.familyOf('driver_aov') === 'driver:aov' && C.familyOf('channel_app') === 'channel_lag:app');

/* ---------- ciclo de vida ---------- */
const act = (k) => ({ ...F(), dedupKey: k, validity: { status: 'activo', firstSeen: '2026-09-01', lastSeen: '2026-09-10', expiresWhen: 'x' } });
const r1 = C.reconcileValidity([act('A'), act('B')], [{ ...F(), dedupKey: 'A' }, { ...F(), dedupKey: 'C' }], { today: '2026-09-11', dataDay: '2026-09-10' });
t('lo que sigue conserva su primera vez visto; lo nuevo empieza hoy', r1.find((x) => x.dedupKey === 'A').validity.firstSeen === '2026-09-01' && r1.find((x) => x.dedupKey === 'C').validity.firstSeen === '2026-09-11');
t('lo que dejó de aparecer pasa a vigilancia y solo se resuelve tras 2 evaluaciones consecutivas sin aparecer', r1.find((x) => x.dedupKey === 'B').validity.status === 'vigilancia' && (() => { const r2 = C.reconcileValidity(r1, [], { today: '2026-09-12', dataDay: '2026-09-11' }); return r2.find((x) => x.dedupKey === 'B').validity.status === 'resuelto' && r2.find((x) => x.dedupKey === 'A').validity.status === 'vigilancia'; })());
t('con datos más viejos o ausentes NO se resuelve nada', C.reconcileValidity([{ ...act('B'), validity: { ...act('B').validity, lastDataDay: '2026-09-10' } }], [], { today: '2026-09-12', dataDay: '2026-09-09' })[0].validity.status === 'activo' && C.reconcileValidity([act('B')], [], { today: '2026-09-12', dataDay: null })[0].validity.status === 'activo');

/* ---------- estado general del negocio (2.1) ---------- */
const S = (o) => C.classifyBusinessState({ compliance: 1.0, growthVsComparable: 0, forecastGapPct: 0, coverage: 1, findings: [], ...o }).state;
t('saludable: en plan, cierre ok, evolución plana, sin hallazgos importantes', S({}) === 'saludable');
t('creciendo: en plan o arriba, cierre ok y crece ≥ 3 % contra el comparable', S({ compliance: 1.02, growthVsComparable: 0.08 }) === 'creciendo');
t('creciendo por debajo de su potencial: crece pero va debajo del plan', S({ compliance: 0.95, growthVsComparable: 0.06, forecastGapPct: -0.03 }) === 'creciendo_bajo_potencial');
t('creciendo por debajo del potencial también cuando va en plan hoy pero el cierre queda corto', S({ compliance: 1.0, growthVsComparable: 0.05, forecastGapPct: -0.06 }) === 'creciendo_bajo_potencial');
t('deterioro: cae ≥ 3 % contra el comparable y va debajo del plan', S({ compliance: 0.9, growthVsComparable: -0.06, forecastGapPct: -0.08 }) === 'deterioro');
t('deterioro prevalece sobre riesgo de cumplimiento (prioridad)', S({ compliance: 0.9, growthVsComparable: -0.1, forecastGapPct: -0.1 }) === 'deterioro');
t('riesgo de cumplimiento: va debajo del plan sin caer contra el comparable', S({ compliance: 0.93, growthVsComparable: 0.0, forecastGapPct: -0.07 }) === 'riesgo_cumplimiento');
t('riesgo de cumplimiento: va en plan hoy pero el forecast de cierre queda por debajo', S({ compliance: 1.0, growthVsComparable: 0.0, forecastGapPct: -0.05 }) === 'riesgo_cumplimiento');
t('un hallazgo crítico activo impide «saludable» y «creciendo»', S({ compliance: 1.02, growthVsComparable: 0.1, findings: [{ severity: 'critica', type: 'risk' }] }) === 'riesgo_cumplimiento');
t('un hallazgo importante activo impide «creciendo» y «saludable»', S({ compliance: 1.02, growthVsComparable: 0.1, findings: [{ severity: 'importante', type: 'risk' }] }) === 'riesgo_cumplimiento');
t('excepción: cobertura insuficiente → sin base (no se emite estado)', S({ coverage: 0.4, compliance: 0.8 }) === 'sin_base');
t('excepción: datos bloqueantes → sin base', S({ blockingData: true }) === 'sin_base');
t('excepción: sin cumplimiento calculable → sin base', S({ compliance: null }) === 'sin_base');
t('oportunidad de aceleración: calificador (no estado) cuando hay una oportunidad alcanzable y material', (() => { const r = C.classifyBusinessState({ compliance: 1.02, growthVsComparable: 0.01, forecastGapPct: 0, coverage: 1, findings: [{ severity: 'seguimiento', type: 'opportunity', material: true, economics: { category: 'alcanzable', status: 'ok' } }] }); return r.state === 'saludable' && r.qualifiers.includes('oportunidad_aceleracion'); })());
t('una oportunidad «teórica» o no material NO activa el calificador de aceleración', !C.classifyBusinessState({ compliance: 1.02, growthVsComparable: 0, forecastGapPct: 0, coverage: 1, findings: [{ severity: 'seguimiento', type: 'opportunity', material: true, economics: { category: 'potencial_teorico', status: 'ok' } }] }).qualifiers.includes('oportunidad_aceleracion'));
t('las bandas usan la configuración vigente (se pueden sustituir por las de thresholdAdvisor)', C.classifyBusinessState({ compliance: 0.97, growthVsComparable: 0, forecastGapPct: 0, coverage: 1, findings: [] }, { onPlanFrom: 0.95 }).state === 'saludable' && S({ compliance: 0.97 }) === 'riesgo_cumplimiento');

/* ---------- severidad de desviaciones (2.3) ---------- */
const band = { normal: 0.02, unusual: 0.05 };
const D = (o) => C.classifyDeviation({ devPct: -0.01, band, moneyAbs: 1000, planBase: 1e6, persistence: 3, support: 'alto', corroborated: true, ...o }).severity;
t('variación normal: dentro de la banda normal y sin materialidad → normal (no se publica)', D({ devPct: -0.015 }) === 'normal');
t('una variación POSITIVA no es desviación adversa', D({ devPct: 0.2 }) === 'normal');
t('seguimiento: entre la banda normal y la inusual', D({ devPct: -0.03 }) === 'seguimiento');
t('importante: más allá de la inusual', D({ devPct: -0.06, moneyAbs: 60000 }) === 'importante');
t('crítica: más del doble de la banda inusual', D({ devPct: -0.12, moneyAbs: 120000, planBase: 1e6 }) === 'crítica' || D({ devPct: -0.12, moneyAbs: 120000, planBase: 1e6 }) === 'critica');
t('pequeña en % pero material en dinero (≥ 5 % del plan del periodo) sube a seguimiento', D({ devPct: -0.01, moneyAbs: 80000, planBase: 1e6 }) === 'seguimiento');
t('grande en % pero con materialidad baja (< 2 % del plan) no pasa de seguimiento', D({ devPct: -0.07, moneyAbs: 5000, planBase: 1e6 }) === 'seguimiento');
t('la persistencia (≥ 5 periodos adversos) sube un nivel', D({ devPct: -0.03, moneyAbs: 30000, persistence: 6 }) === 'importante');
t('un solo punto sin corroboración se queda en seguimiento (posible atípico)', D({ devPct: -0.07, moneyAbs: 70000, persistence: 1, corroborated: false }) === 'seguimiento');
t('un punto aislado pero materialmente grande sí puede ser importante', D({ devPct: -0.07, moneyAbs: 160000, persistence: 1, corroborated: false }) !== 'seguimiento');
t('respaldo bajo: nunca pasa de seguimiento', D({ devPct: -0.2, moneyAbs: 200000, support: 'bajo' }) === 'seguimiento');
t('sin datos suficientes se descarta como desviación (pasa a brecha de datos)', D({ devPct: null, support: 'bajo' }) === 'descartada');

/* ---------- impacto económico (2.5) ---------- */
const I = (o) => C.validateImpact(econ(o));
t('un impacto observado válido (brecha contra plan, solo datos reales)', I({}).ok, I({}).errors);
t('observado/brecha deben ser «observed»: una proyección no puede llamarse brecha', !I({ provenance: 'projected' }).ok);
t('una proyección exige supuestos explícitos y horizonte', !I({ category: 'potencial_teorico', provenance: 'projected', assumptions: [] }).ok && I({ category: 'potencial_teorico', provenance: 'projected', assumptions: [{ id: 'a1', text: 'Conversión +10 % relativo' }], horizon: 'resto del mes' }).ok);
t('el potencial teórico no puede declararse «observed»', !I({ category: 'potencial_teorico', provenance: 'observed', assumptions: [{ id: 'a' }], horizon: 'x' }).ok);
t('lo alcanzable exige declarar su base (restricciones o desempeño histórico propio)', !I({ category: 'alcanzable', provenance: 'projected', assumptions: [{ id: 'a' }], horizon: 'x' }).ok && I({ category: 'alcanzable', provenance: 'projected', assumptions: [{ id: 'a' }], horizon: 'x', constraintsBasis: 'CR del percentil 90 de las últimas 12 semanas' }).ok);
t('lo esperado exige calibración con respaldo; sin ella no se emite', !I({ category: 'esperado', provenance: 'projected', assumptions: [{ id: 'a' }], horizon: 'x' }).ok && I({ category: 'esperado', provenance: 'projected', assumptions: [{ id: 'a' }], horizon: 'x', calibration: { source: 'backtest del forecast' } }).ok);
t('un rango debe cumplir low ≤ point ≤ high', !I({ amount: { point: 10, low: 20, high: 30 } }).ok && I({ amount: { point: 10, low: 5, high: 30 } }).ok);
t('sin datos suficientes: amount null con la razón (nunca cero)', I({ status: 'insufficient_data', amount: null, reason: 'Falta ticket por producto' }).ok && !I({ status: 'insufficient_data', amount: { point: 0 }, reason: 'x' }).ok);
t('solo se cuantifica venta: no se admite margen, ROI, ROAS ni CAC como indicador', !I({ basis: { period: 'x', scope: 'total', indicator: 'margin' } }).ok);
t('exige el motor existente que calcula (no se recalcula aparte)', !I({ method: { id: 'x', formula: 'y' } }).ok);
t('invariante: alcanzable ≤ potencial teórico y esperado ≤ alcanzable', C.checkOrdering({ potencial_teorico: { amount: { point: 100 } }, alcanzable: { amount: { point: 60 } }, esperado: { amount: { point: 40 } } }).ok && !C.checkOrdering({ potencial_teorico: { amount: { point: 50 } }, alcanzable: { amount: { point: 60 } } }).ok);
const P = (id, point, o = {}) => ({ id, ...econ({ category: 'potencial_teorico', provenance: 'projected', assumptions: [{ id: 'a' }], horizon: 'x', amount: { point, low: point * 0.8, high: point * 1.2 } }), ...o });
const c1 = C.combineImpacts([P('cr', 100), P('sesiones', 50)]);
t('impactos independientes de la misma categoría se suman (punto y extremos)', c1.byCategory['potencial_teorico|projected'].point === 150 && Math.round(c1.byCategory['potencial_teorico|projected'].low) === 120 && Math.round(c1.byCategory['potencial_teorico|projected'].high) === 180);
const c2 = C.combineImpacts([P('cr', 100, { overlapGroup: 'conversion-y-pedidos' }), P('pedidos', 90, { overlapGroup: 'conversion-y-pedidos' }), P('aov', 30)]);
t('impactos superpuestos (mismo dinero) NO se suman: se toma el mayor y se avisa', c2.byCategory['potencial_teorico|projected'].point === 130 && c2.warnings.some((w) => /Superposición/.test(w)), c2);
const c3 = C.combineImpacts([P('plan-A', 100, { exclusiveGroup: 'ruta' }), P('plan-B', 70, { exclusiveGroup: 'ruta' })]);
t('alternativas excluyentes: se reporta un rango, nunca la suma', c3.byCategory['potencial_teorico|projected'].low <= 70 * 0.8 + 1e-9 && c3.byCategory['potencial_teorico|projected'].high >= 100 * 1.2 - 1e-9 && c3.byCategory['potencial_teorico|projected'].point === 70 && c3.warnings.some((w) => /excluyentes/.test(w)));
const c4 = C.combineImpacts([P('cr', 100), { id: 'obs', ...econ({}) }]);
t('observado y proyectado NUNCA se mezclan en un mismo total', Object.keys(c4.byCategory).length === 2 && c4.byCategory['brecha|observed'].point === -13126 && c4.byCategory['potencial_teorico|projected'].point === 100);
const c5 = C.combineImpacts([P('cr', 100), { id: 'sin-datos', ...econ({ status: 'insufficient_data', amount: null, reason: 'faltan sesiones' }) }]);
t('un impacto sin datos no aporta cero: se lista aparte y el total queda marcado incompleto', c5.excluded.length === 1 && c5.byCategory['potencial_teorico|projected'].incomplete === true);
t('la fórmula conjunta relativa R·((1+a)(1+b)(1+c)−1) incluye los términos cruzados (la suma de efectos individuales la subestima)', (() => { const R = 1000, a = 0.05, b = 0.1, c = 0.03, j = C.jointRelative(R, a, b, c), s = R * (a + b + c); return j > s && Math.abs(j - s - R * (a * b + a * c + b * c + a * b * c)) < 1e-9; })());

console.log(bad ? `\n${bad} FALLAS` : '\nTODO OK'); process.exit(bad ? 1 : 0);
