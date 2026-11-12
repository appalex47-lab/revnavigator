#!/usr/bin/env node
/* Fase 2 · punto A — atribución por escenario. FUENTE ÚNICA: FP.attribution.attributeSegment. Se verifica que
 *  (1) cada escenario recibe el estado correcto y las cifras de un oráculo independiente (fórmulas cerradas);
 *  (2) los consumidores (trafficConversionEngine.effects, driverEngine.level1, funnelEngine.decompose) dan EXACTAMENTE el mismo resultado;
 *  (3) lo que no tiene base comparable no se reparte entre factores y nunca produce porcentajes forzados;
 *  (4) traffic + cr + aov + unattributed = delta siempre.   node tools/test-atribucion-escenarios.js */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { console }; vm.createContext(ctx); ctx.window = ctx;
['js/config/config.js', 'js/calculations/metrics.js', 'js/diagnostics/attribution.js', 'js/analytics/trafficConversionEngine.js', 'js/analytics/funnelEngine.js', 'js/diagnostics/driverEngine.js']
  .forEach((f) => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f }));
const FP = ctx.FP, AT = FP.attribution, TE = FP.trafficConversionEngine, FE = FP.funnelEngine, DE = FP.driverEngine;
let bad = 0, n = 0; const t = (name, c, d) => { n++; console.log((c ? '✔ ' : '✘ ') + name + (!c && d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 500) : '')); if (!c) bad++; };
const near = (a, b, e = 1e-6) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= Math.max(e, Math.abs(b) * 1e-9);
const q = (t_, o, r) => ({ t: t_, o, r });

/* ---------- consumidores sobre un mismo par ---------- */
function viaAll(base, cur) {
  const seg = AT.attributeSegment(base, cur, { method: 'sequential' });
  const eff = TE.effects(base, cur);
  const blk = (x) => (x ? { revenue: x.r, orders: x.o, trafficVolume: x.t } : null);
  const l1 = DE.level1([{ current: blk(cur || { t: 0, o: 0, r: 0 }), baseline: blk(base || { t: 0, o: 0, r: 0 }) }], { metric: 'revenue', method: 'sequential' });
  const dec = base && cur ? FE.decompose({ views: cur.t, purchase: cur.o, revenue: cur.r }, { views: base.t, purchase: base.o, revenue: base.r }) : null;
  return { seg, eff, l1, dec };
}
function checkConsumers(label, base, cur) {
  const { seg, eff, l1, dec } = viaAll(base, cur);
  t(`${label}: effects() = attributeSegment (mismo estado, atribuido y efectos)`, eff.status === seg.status && eff.attributed === seg.attributed && near(eff.traffic, seg.traffic) && near(eff.cr, seg.cr) && near(eff.aov, seg.aov) && near(eff.unattributed, seg.unattributed === null ? eff.delta : seg.unattributed), { eff, seg });
  if (seg.delta !== null) t(`${label}: traffic + cr + aov + sin atribuir = Δ`, near(seg.traffic + seg.cr + seg.aov + seg.unattributed, seg.delta), seg);
  if (dec) t(`${label}: funnelEngine.decompose coincide (efectos, estado, cuadre)`, dec.status === seg.status && dec.attributed === seg.attributed && near(dec.traffic, seg.traffic) && near(dec.cr, seg.cr) && near(dec.aov, seg.aov) && dec.ok === true, { dec, seg });
  if (base && cur) {
    const a = l1.attribution;
    if (seg.attributed && seg.status !== 'sin_actividad') t(`${label}: driverEngine.level1 coincide y cierra`, a.status === 'ok' && near(a.contributions.trafficVolume, seg.traffic) && near(a.contributions.conversionRate, seg.cr) && near(a.contributions.aov, seg.aov), { a, seg });
    else if (!seg.attributed) t(`${label}: driverEngine.level1 NO reparte (insuficiente) y explica el escenario`, a.status === 'insufficient_data' && a.contributions === null && (a.scenario ? a.scenario.status === seg.status : true) && l1.mainDriver === null, { a: a.status, sc: a.scenario, seg: seg.status, main: l1.mainDriver });
  }
  return seg;
}

/* ---------- 1. base normal ---------- */
{
  const b = q(1000, 20, 18000), c = q(1100, 20 * 1.1 * 0.9, 1100 * 0.02 * 0.9 * 900 * 1.05);
  const s = checkConsumers('base normal', b, c);
  const cr0 = 0.02, a0 = 900, cr1 = c.o / c.t, a1 = c.r / c.o;
  t('base normal: estado ok, atribuido', s.status === 'ok' && s.attributed === true);
  t('base normal: oráculo secuencial (sesiones → CR → AOV)', near(s.traffic, (c.t - b.t) * cr0 * a0) && near(s.cr, c.t * (cr1 - cr0) * a0) && near(s.aov, c.t * cr1 * (a1 - a0)), s);
  t('base normal: Σ = Δ venta exacto', near(s.traffic + s.cr + s.aov, c.r - b.r) && near(s.unattributed, 0, 1e-6), s);
  t('base normal: Shapley también cierra y no depende del orden', (() => { const x = AT.attributeSegment(b, c, { method: 'shapley' }); return x.status === 'ok' && near(x.traffic + x.cr + x.aov, c.r - b.r); })());
}
/* ---------- 2. base sin pedidos (sesiones sí) ---------- */
{
  const s = checkConsumers('base con sesiones, sin pedidos', q(1000, 0, 0), q(1000, 20, 8000));
  t('base sin pedidos: «recuperación desde cero», NO se reparte entre CR y AOV', s.status === 'recuperacion_desde_cero' && !s.attributed && s.cr === 0 && s.aov === 0 && s.traffic === 0 && s.unattributed === 8000, s);
}
/* ---------- 3. base sin sesiones ---------- */
{
  const s = checkConsumers('base sin sesiones', q(0, 0, 0), q(500, 10, 4000));
  t('base sin sesiones: «sin base comparable», todo sin atribuir', s.status === 'sin_base_comparable' && !s.attributed && s.unattributed === 4000 && s.traffic === 0, s);
  const x = AT.attributeSegment(q(0, 0, 0), q(0, 0, 0));
  t('ambos periodos en cero: «sin actividad», Δ = 0', x.status === 'sin_actividad' && x.delta === 0);
  t('base con pedidos pero sin sesiones (inconsistente): «no calculable»', AT.attributeSegment(q(0, 5, 100), q(10, 1, 10)).status === 'no_calculable');
}
/* ---------- 4. periodo actual sin pedidos / sin sesiones ---------- */
{
  const b = q(1000, 20, 18000);
  const s = checkConsumers('actual con sesiones, sin pedidos', b, q(1200, 0, 0));
  const cr0 = 0.02, a0 = 900;
  t('actual sin pedidos: «conversión cero» atribuye volumen y conversión; el ticket no es observable (0)', s.status === 'conversion_cero_actual' && s.attributed && near(s.traffic, 200 * cr0 * a0) && near(s.cr, 1200 * (0 - cr0) * a0) && s.aov === 0 && near(s.traffic + s.cr, -18000), s);
  const z = checkConsumers('actual sin sesiones', b, q(0, 0, 0));
  t('actual sin sesiones: toda la caída es volumen', z.status === 'sin_trafico_actual' && near(z.traffic, -18000) && z.cr === 0 && z.aov === 0, z);
  t('actual con venta pero sin pedidos (inconsistente): «no calculable»', AT.attributeSegment(b, q(100, 0, 500)).status === 'no_calculable');
  t('actual con pedidos pero sin sesiones (inconsistente): «no calculable»', AT.attributeSegment(b, q(0, 3, 500)).status === 'no_calculable');
}
/* ---------- 5. conversión igual a cero en base con sesiones pero sin pedidos y actual sin pedidos ---------- */
{
  const s = checkConsumers('CR cero en ambos', q(1000, 0, 0), q(1200, 0, 0));
  t('CR cero en ambos lados: sin actividad comercial, Δ = 0, sin porcentajes', s.status === 'sin_actividad' && s.delta === 0 && s.unattributed === 0, s);
}
/* ---------- 6. datos incompletos / negativos / composición ---------- */
{
  t('datos incompletos (falta venta) → «datos insuficientes», Δ no se inventa', (() => { const x = AT.attributeSegment(q(1000, 20, null), q(1000, 20, 100)); return x.status === 'datos_insuficientes' && x.delta === null && x.unattributed === null && !x.attributed; })());
  t('datos incompletos (NaN) → «datos insuficientes»', AT.attributeSegment(q(NaN, 1, 1), q(1, 1, 1)).status === 'datos_insuficientes');
  t('ningún lado → «datos insuficientes»', AT.attributeSegment(null, null).status === 'datos_insuficientes');
  const neg = AT.attributeSegment(q(1000, 20, -500), q(1000, 20, 100));
  t('valores negativos → «no calculable», no se reparte', neg.status === 'no_calculable' && !neg.attributed && neg.traffic === 0 && neg.unattributed === 600, neg);
  const nw = checkConsumers('segmento nuevo', null, q(2000, 40, 30000)), gn = checkConsumers('segmento desaparecido', q(1500, 30, 12000), null);
  t('segmento nuevo / desaparecido → «cambio de composición» sin repartir', nw.status === 'cambio_de_composicion' && nw.unattributed === 30000 && gn.status === 'cambio_de_composicion' && gn.unattributed === -12000 && gn.traffic === 0);
}
/* ---------- 7. valores extremos ---------- */
{
  const b = q(1e9, 2e7, 1.8e10), c = q(1.5e9, 2.4e7, 3.0e10);
  const s = checkConsumers('extremos grandes', b, c);
  t('extremos grandes: Σ = Δ con precisión relativa', s.status === 'ok' && near(s.traffic + s.cr + s.aov, c.r - b.r, 1e-3));
  const m = checkConsumers('extremos pequeños', q(1, 1, 0.01), q(2, 1, 0.02));
  t('extremos pequeños (1 sesión): sigue cerrando', m.status === 'ok' && near(m.traffic + m.cr + m.aov, 0.01, 1e-9), m);
  const big = AT.attributeSegment(q(1000, 20, 18000), q(1000, 20, 1e15));
  t('venta enorme: no produce NaN ni Infinity', Number.isFinite(big.traffic + big.cr + big.aov) && big.status === 'ok');
}
/* ---------- 8. efectos combinados (no aditivos) ---------- */
{
  const R = 18000, a = 0.10, bcr = -0.05, cav = 0.04, b = q(1000, 20, R);
  const cur = q(1000 * (1 + a), 20 * (1 + a) * (1 + bcr), R * (1 + a) * (1 + bcr) * (1 + cav));
  const s = AT.attributeSegment(b, cur);
  const solo = (x, y, z) => AT.attributeSegment(b, q(1000 * (1 + x), 20 * (1 + x) * (1 + y), R * (1 + x) * (1 + y) * (1 + z)));
  const sumSolo = solo(a, 0, 0).delta + solo(0, bcr, 0).delta + solo(0, 0, cav).delta;
  t('combinado: Δ = R·((1+a)(1+b)(1+c) − 1)', near(s.delta, R * ((1 + a) * (1 + bcr) * (1 + cav) - 1)), s);
  t('combinado: la suma de efectos individuales NO es el conjunto (interacción = R·términos cruzados)', near(s.delta - sumSolo, R * ((1 + a) * (1 + bcr) * (1 + cav) - 1 - a - bcr - cav)) && Math.abs(s.delta - sumSolo) > 1, [s.delta, sumSolo]);
  t('combinado: la atribución del conjunto sí suma exacto', near(s.traffic + s.cr + s.aov, s.delta));
}
/* ---------- 8b. API por tasas (attribute) coherente con la regla por escenario ---------- */
{
  const f = ['trafficVolume', 'conversionRate', 'aov'], o = { method: 'sequential', order: f };
  const a = AT.attribute({ trafficVolume: 100, conversionRate: 0, aov: 0 }, { trafficVolume: 100, conversionRate: 0.02, aov: 100 }, o);
  t('attribute() con base de conversión 0 → insufficient_data (ya no asigna todo al ticket)', a.status === 'insufficient_data' && a.contributions === null && /vale 0/.test(a.note), a);
  t('attribute() con base y actual en 0 sigue cerrando (contribuciones 0)', (() => { const x = AT.attribute({ trafficVolume: 100, conversionRate: 0, aov: 0 }, { trafficVolume: 120, conversionRate: 0, aov: 0 }, o); return x.status === 'ok' && x.total === 0; })());
  t('attribute() con base normal no cambia (cierra exacto)', (() => { const x = AT.attribute({ trafficVolume: 1000, conversionRate: 0.02, aov: 900 }, { trafficVolume: 1050, conversionRate: 0.0208, aov: 927 }, o); return x.status === 'ok' && x.closes; })());
}
/* ---------- 9. catálogo de estados ---------- */
t('el catálogo de estados está completo y sin duplicados', AT.SEGMENT_STATUS.length === 9 && new Set(AT.SEGMENT_STATUS).size === 9);
t('analyze(): totales cuadran incluyendo lo no atribuido (nuevo + desaparecido + normal)', (() => {
  const has = { traffic: true, orders: true, revenue: true }, m = (t_, o, r) => ({ traffic: t_, orders: o, revenue: r, has });
  const d = TE.analyze({ rows: [{ key: 'A', label: 'A', baseline: m(1000, 20, 10000), current: m(1000, 20, 12000) }, { key: 'N', label: 'N', baseline: null, current: m(2000, 40, 30000) }, { key: 'G', label: 'G', baseline: m(1500, 30, 12000), current: null }] }, { minSessions: 1 });
  return d.status === 'ok' && d.total.reconciles && near(d.total.unattributed, 18000) && near(d.total.traffic + d.total.cr + d.total.aov, 2000, 1e-6);
})());
console.log(`\n${n - bad} bien, ${bad} mal`); process.exit(bad ? 1 : 0);
