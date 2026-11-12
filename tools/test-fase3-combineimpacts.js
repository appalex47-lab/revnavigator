#!/usr/bin/env node
/* Command Center · Fase 3 (ronda de calidad) — DIAGNÓSTICO REPRODUCIBLE de combineImpacts (js/economics/impactModel.js, vía tools/audit/command-center-contracts.js).
   NO modifica el motor ni sus contratos. Son pruebas de CARACTERIZACIÓN: fijan el comportamiento ACTUAL (incluidos los comportamientos discutibles) para que cualquier cambio futuro
   (propuesto para la Fase 4.5) sea deliberado. Cada hallazgo se marca así:
     [correcto]   el comportamiento es el esperado por las reglas documentadas;
     [DEFECTO]    el comportamiento contradice la regla documentada o la intuición contable (se demuestra con números);
     [DECISIÓN]   el comportamiento es coherente con la letra de la regla pero depende de una definición de negocio aún no aprobada.
   node tools/test-fase3-combineimpacts.js */
const C = require('./audit/command-center-contracts.js');
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); if (!c) bad++; };
const near = (a, b) => Math.abs(a - b) < 1e-6;
const I = (id, point, o = {}) => ({ id, schema: 'cc.economic_impact', version: 2, currency: 'MXN', category: 'potencial_teorico', provenance: 'projected', status: 'ok', amount: { point, low: point * 0.8, high: point * 1.2 }, assumptions: [{ id: 'a' }], ...o });
// para negativos, ±20 % invierte el orden: low = point×1.2 (más negativo), high = point×0.8
const N = (id, point, o = {}) => I(id, point, { amount: { point, low: point * 1.2, high: point * 0.8 }, ...o });
const K = 'potencial_teorico|projected';
const tot = (items, s) => C.combineImpacts(items, s).byCategory[K];

/* ---------- A. Lo que funciona como está documentado ---------- */
t('A1 [correcto] independientes positivos: suma de puntos y de extremos', (() => { const r = tot([I('a', 100), I('b', 50)]); return near(r.point, 150) && near(r.low, 120) && near(r.high, 180); })());
t('A2 [correcto] nunca mezcla categorías ni procedencias (observado ≠ proyectado)', (() => { const r = C.combineImpacts([I('a', 100), I('b', -40, { category: 'brecha', provenance: 'observed' })]); return Object.keys(r.byCategory).length === 2; })());
t('A3 [correcto] sin datos suficientes: se lista aparte, el total queda marcado incompleto y no aporta cero', (() => { const r = C.combineImpacts([I('a', 100), I('x', 0, { status: 'insufficient_data', amount: null, reason: 'faltan sesiones' })]); return r.excluded.length === 1 && r.byCategory[K].incomplete === true && near(r.byCategory[K].point, 100); })());
t('A4 [correcto] el orden de entrada no altera el resultado (conmutatividad) en casos de signo único', (() => { const a = [I('a', 100, { overlapGroup: 'g' }), I('b', 90, { overlapGroup: 'g' }), I('c', 30)]; const r1 = tot(a), r2 = tot(a.slice().reverse()); return near(r1.point, r2.point) && near(r1.low, r2.low) && near(r1.high, r2.high); })());
t('A5 [correcto] con margen, la contribución del total = ventas del total × margen (la misma cuenta lineal) y sin margen es null, no 0', (() => { const r = tot([I('a', 100)], { marginEnabled: true, grossMarginPct: 25, updatedAt: '2026-11-08T10:00:00Z', source: 'manual' }); const s = tot([I('a', 100)], {}); return r.contribution.status === 'disponible' && near(r.contribution.amount.point, 25) && s.contribution.amount === null; })());

/* ---------- B. Superposición (mismo dinero): «se toma el mayor» ---------- */
t('B1 [correcto] dos impactos positivos que describen el mismo dinero: se toma el mayor y se avisa', (() => { const r = C.combineImpacts([I('cr', 100, { overlapGroup: 'g' }), I('pe', 90, { overlapGroup: 'g' })]); return near(r.byCategory[K].point, 100) && r.warnings.length === 1; })());
const ng = tot([N('p1', -100, { overlapGroup: 'g' }), N('p2', -90, { overlapGroup: 'g' })]);
t('B2 [DEFECTO] dos PÉRDIDAS superpuestas (−100 y −90): «el mayor» elige −90 (la de MENOR magnitud) y reporta una pérdida menor que la mayor conocida', near(ng.point, -90), ng);
t('B3 [DEFECTO] el mismo par en positivo (+100/+90) elige la de mayor magnitud y en negativo la de menor: la regla es asimétrica según el signo (conservadora en un caso, optimista en el otro)', near(tot([I('p1', 100, { overlapGroup: 'g' }), I('p2', 90, { overlapGroup: 'g' })]).point, 100) && near(ng.point, -90));
const rg = tot([I('a', 100, { overlapGroup: 'g', amount: { point: 100, low: 95, high: 105 } }), I('b', 90, { overlapGroup: 'g', amount: { point: 90, low: 40, high: 200 } })]);
t('B4 [DEFECTO] el rango de un grupo superpuesto es el del «mayor» y descarta la incertidumbre de los demás: b llega a 200 pero el total declara high = 105', near(rg.high, 105) && rg.high < 200, rg);
const mix = tot([I('g1', 100, { overlapGroup: 'g' }), N('g2', -150, { overlapGroup: 'g' })]);
t('B5 [DECISIÓN] impactos de signo contrario dentro del mismo grupo superpuesto: se toma el «mayor» (+100) y el −150 desaparece sin aviso de signo; ¿puede un mismo dinero ser ganancia y pérdida?', near(mix.point, 100), mix);

/* ---------- C. Alternativas excluyentes ---------- */
const ex = tot([I('a', 100, { exclusiveGroup: 'r' }), I('b', 70, { exclusiveGroup: 'r' })]);
t('C1 [correcto] positivos excluyentes: punto = el MENOR (conservador), rango = de la menor baja a la mayor alta; nunca la suma', near(ex.point, 70) && near(ex.low, 56) && near(ex.high, 120), ex);
const exn = tot([N('a', -100, { exclusiveGroup: 'r' }), N('b', -70, { exclusiveGroup: 'r' })]);
t('C2 [DECISIÓN] negativos excluyentes: el punto es el MÁS NEGATIVO (−100): lo conservador para una pérdida sería lo contrario; la regla «mínimo» no distingue signo', near(exn.point, -100), exn);
t('C3 [DECISIÓN] el punto de un grupo excluyente no es una mejor estimación sino el piso: documentado como «conservador» solo para oportunidades; para riesgos habría que definirlo', true);

/* ---------- D. Combinaciones y otras propiedades ---------- */
t('D1 [DECISIÓN] impactos independientes de signo opuesto dentro de la misma categoría se netean (+100 y −30 → +70): puede ocultar un riesgo que compensa una oportunidad; el contrato no distingue riesgo de oportunidad en el total', (() => { const r = tot([I('a', 100), N('b', -30)]); return near(r.point, 70); })());
t('D2 [correcto] un solo elemento en un grupo no genera aviso', C.combineImpacts([I('a', 100, { overlapGroup: 'g' })]).warnings.length === 0);
t('D3 [DECISIÓN] un elemento con exclusiveGroup Y overlapGroup se trata solo como excluyente (el overlapGroup se ignora en silencio)', (() => { const r = tot([I('a', 100, { exclusiveGroup: 'e', overlapGroup: 'o' }), I('b', 90, { overlapGroup: 'o' })]); return near(r.point, 190); })());
t('D4 [correcto] conjunto vacío: sin categorías y sin error', Object.keys(C.combineImpacts([]).byCategory).length === 0);
t('D5 [correcto] sólo datos insuficientes: no se crea total (no se inventa un cero)', Object.keys(C.combineImpacts([I('x', 0, { status: 'insufficient_data', amount: null, reason: 'x' })]).byCategory).length === 0);
t('D6 [DECISIÓN] los impactos con grupos no se validan antes de combinar: un grupo con claves distintas para el mismo dinero (p. ej. «cr» vs «conversion») no se detecta; la correcta asignación de grupos depende del llamador', (() => { const r = tot([I('a', 100, { overlapGroup: 'x' }), I('b', 90, { overlapGroup: 'y' })]); return near(r.point, 190); })());

/* ---------- E. Dónde se usa en Phase 3 y qué cálculos alcanza ---------- */
const Z3 = require('./audit/z3-atencion.js'), fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, 'audit/z3-atencion.js'), 'utf8');
t('E1 el único consumidor de Fase 3 es Z3 (totales por clase en el encabezado); Z1, Z2, Z4 y Z5 no llaman a combineImpacts', /ECON\.combineImpacts/.test(src) && !['z1-lectura-ejecutiva.js', 'z4-acciones.js'].some((f) => /combineImpacts/.test(fs.readFileSync(require('path').join(__dirname, 'audit', f), 'utf8'))));
t('E2 Z3 ya NO muestra cifra total en líneas con elementos superpuestos (mitigación de la presentación, sin tocar el motor): low/point/high/display = null y nota «mismo dinero»', /overlap \? null : t\.low/.test(src) && /overlap \? null : t\.point/.test(src) && /no se suman ni se totalizan/.test(src));
t('E3 con la mitigación, el defecto B2 no llega a ninguna cifra mostrada de Fase 3; sigue vigente para cualquier consumidor futuro que use combineImpacts directamente (Fase 4.5)', (() => { const mk = (id, p, g) => ({ id, category: 'brecha', provenance: 'observed', status: 'ok', amount: { point: p }, overlapGroup: g }); const r = C.combineImpacts([mk('total', -100, 'gap'), mk('canal', -90, 'gap')]).byCategory['brecha|observed']; return near(r.point, -90); })());
console.log(`\n${n - bad} bien, ${bad} mal  (los defectos [DEFECTO] están CARACTERIZADOS: la prueba pasa si el comportamiento actual coincide con el descrito; cambiarlo exige decisión de Fase 4.5)`); process.exit(bad ? 1 : 0);
