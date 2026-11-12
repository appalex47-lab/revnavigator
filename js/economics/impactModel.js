/**
 * impactModel.js — Modelo dual de impacto económico (Fase 2 · punto B). Contrato `cc.economic_impact` v2.
 *
 *   MODALIDAD 1 · Impacto comercial en VENTAS (MXN). Siempre disponible. No depende de ningún margen.
 *   MODALIDAD 2 · Contribución bruta ESTIMADA = impacto en ventas × margen bruto promedio general. Solo si el usuario lo configuró.
 *
 * Reglas de arquitectura:
 *  1. Los motores oficiales (gap, pacing, forecast, scenario, recovery, attribution) calculan ventas y variaciones. Este módulo NO las recalcula:
 *     recibe sus resultados (adaptadores `from*`) y solo los etiqueta, combina sin doble conteo y, si hay margen, agrega una capa de lectura.
 *  2. Sin margen (o desactivado) el resultado de ventas sale idéntico y la contribución queda en `no_configurado` / `desactivado` (nunca 0).
 *  3. La contribución es una ESTIMACIÓN con un margen promedio general. No descuenta gastos que no estén en los datos y no se llama utilidad.
 *  4. Margen = margen BRUTO SOBRE VENTA = (venta − costo) ÷ venta. No es markup sobre costo (markup = (venta − costo) ÷ costo).
 *  5. Evolución: el margen se resuelve con `resolveMargin(setting, scope)`; hoy solo existe el nivel «general». Más adelante puede añadirse un nivel
 *     (categoría, familia, producto, SKU) en `setting.overrides` sin cambiar el contrato de salida (`contribution.marginBasis`).
 *
 * Documentación: docs/command-center/MODELO_CUANTIFICACION_ECONOMICA.md
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  const FP = (root.FP = root.FP || {}); FP.economics = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);

  /* ================= Configuración del margen (opcional) ================= */
  const MARGIN_MIN = 0, MARGIN_MAX_EXCLUSIVE = 100;   // % de margen bruto sobre venta: 0 ≤ m < 100 (100 % implicaría costo cero; se rechaza como captura probable de error)
  const DEFAULT_SETTING = Object.freeze({ marginEnabled: false, grossMarginPct: null, updatedAt: null, source: null });

  /** Valida lo que el usuario capturó. Acepta número o texto («25», «25.5», «25,5»). Rechaza vacío, «%», NaN, fuera de rango. */
  function validateMarginInput(raw) {
    if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')) return { ok: false, code: 'vacio', message: 'Escribe el margen bruto sobre venta, en porcentaje (por ejemplo 25).' };
    let v = raw;
    if (typeof raw === 'string') {
      const t = raw.trim().replace(',', '.');
      if (!/^-?\d+(\.\d+)?$/.test(t)) return { ok: false, code: 'formato', message: 'Escribe solo el número, sin símbolos (por ejemplo 25 para 25 %).' };
      v = Number(t);
    }
    if (typeof v !== 'number' || !Number.isFinite(v)) return { ok: false, code: 'formato', message: 'El margen debe ser un número.' };
    if (v < MARGIN_MIN) return { ok: false, code: 'rango', message: 'El margen no puede ser negativo.' };
    if (v >= MARGIN_MAX_EXCLUSIVE) return { ok: false, code: 'rango', message: 'El margen bruto sobre venta debe ser menor a 100 %. Si calculaste (venta − costo) ÷ costo, eso es markup: conviértelo.' };
    return { ok: true, value: v };
  }

  /** Normaliza lo guardado (tolerante: cualquier cosa rara = «sin margen»). Nunca lanza. */
  function normalizeSetting(saved) {
    const s = saved && typeof saved === 'object' ? saved : {};
    const v = validateMarginInput(s.grossMarginPct);
    return { marginEnabled: s.marginEnabled === true && v.ok, grossMarginPct: v.ok ? v.value : null,
      updatedAt: typeof s.updatedAt === 'string' ? s.updatedAt : null, source: typeof s.source === 'string' ? s.source : null,
      ...(s.overrides && typeof s.overrides === 'object' ? { overrides: s.overrides } : {}) };
  }

  /** Arma el objeto a guardar (el mecanismo de persistencia es el existente: state.settings.economics). */
  function buildSetting(prev, { enabled, marginPct, source = 'manual', now = new Date().toISOString() } = {}) {
    const p = normalizeSetting(prev);
    if (enabled === false) return { ...p, marginEnabled: false };   // desactivar conserva el valor capturado y su fecha: reactivar no obliga a volver a escribirlo
    const v = validateMarginInput(marginPct === undefined ? p.grossMarginPct : marginPct);
    if (!v.ok) return { ok: false, error: v };
    return { ok: true, setting: { ...p, marginEnabled: true, grossMarginPct: v.value, updatedAt: now, source } };
  }

  /** Estado de disponibilidad de la segunda capa (no confundir «sin margen» con margen = 0). */
  function availability(setting) {
    const s = normalizeSetting(setting);
    if (s.grossMarginPct === null) return { status: 'no_configurado', marginPct: null, message: 'No se ha configurado el margen: se muestra solo el impacto en ventas.' };
    if (!s.marginEnabled) return { status: 'desactivado', marginPct: s.grossMarginPct, message: 'El margen está guardado pero desactivado: se muestra solo el impacto en ventas.' };
    return { status: 'disponible', marginPct: s.grossMarginPct, updatedAt: s.updatedAt, source: s.source, message: 'Contribución bruta estimada con un margen promedio general.' };
  }

  /** Punto único donde se decide qué margen aplica. Hoy solo «general»; los niveles finos se añadirán aquí sin tocar a los consumidores. */
  function resolveMargin(setting, scope = { level: 'general' }) {
    const a = availability(setting);
    if (a.status !== 'disponible') return { available: false, status: a.status, pct: null, basis: null };
    return { available: true, status: 'disponible', pct: a.marginPct, basis: { level: 'general', key: null, note: 'margen bruto promedio general del negocio', requestedScope: scope && scope.level ? scope.level : 'general' } };
  }

  /** Ayuda de captura: conversión entre markup sobre costo y margen bruto sobre venta. Ej.: markup 33.33 % ⇒ margen 25 %. */
  const markupToMargin = (markupPct) => (fin(markupPct) && markupPct > -100 ? (markupPct / (100 + markupPct)) * 100 : null);
  const marginToMarkup = (marginPct) => (fin(marginPct) && marginPct < 100 ? (marginPct / (100 - marginPct)) * 100 : null);
  const MARGIN_HELP = 'Margen bruto sobre venta = (venta − costo) ÷ venta. Ejemplo: vendes $100 y te cuesta $75 → margen 25 %. No es markup sobre costo (en el mismo ejemplo el markup sería 33.33 %). Captura el margen, no el markup.';
  const CONTRIBUTION_LABEL = 'Contribución bruta estimada';
  const CONTRIBUTION_CAVEATS = Object.freeze([
    'Estimación con un margen bruto promedio general; no es el margen real de cada producto.',
    'Es una contribución bruta sobre venta: no descuenta gastos ni costos que no estén en los datos disponibles.'
  ]);

  /* ================= Impacto comercial (ventas) ================= */
  const CATEGORIES = ['observado', 'brecha', 'potencial_teorico', 'alcanzable', 'esperado', 'en_riesgo'];
  const OBSERVED = ['observado', 'brecha'];
  /** Vocabulario comercial de Fase 2 → categoría del contrato. */
  const SALES_KIND = Object.freeze({ observado: 'observada', brecha: 'brecha', potencial_teorico: 'potencial', alcanzable: 'recuperable', esperado: 'estimada', en_riesgo: 'estimada' });

  function validateImpact(x) {
    const e = [], need = (c, m) => { if (!c) e.push(m); };
    need(x && typeof x === 'object', 'El impacto debe ser un objeto.'); if (!x || typeof x !== 'object') return { ok: false, errors: e };
    need(x.schema === 'cc.economic_impact' && (x.version === 1 || x.version === 2), 'schema debe ser «cc.economic_impact» versión 1 o 2.');
    need(CATEGORIES.includes(x.category), `category debe ser una de ${CATEGORIES.join(', ')}.`);
    need(['ok', 'insufficient_data'].includes(x.status), 'status debe ser ok o insufficient_data.');
    need(['observed', 'projected'].includes(x.provenance), 'provenance debe ser observed o projected.');
    need(x.method && x.method.id && x.method.formula && x.method.engine, 'method requiere id, fórmula y el motor existente que la calcula (no se recalcula aparte).');
    need(Array.isArray(x.assumptions), 'assumptions debe ser una lista.');
    need(x.basis && x.basis.period && x.basis.scope && x.basis.indicator === 'revenue', 'basis requiere periodo, alcance e indicador (venta MXN; la contribución es una capa aparte).');
    if (x.version === 2) {
      need(x.salesKind === SALES_KIND[x.category], `salesKind debe ser «${SALES_KIND[x.category]}» para la categoría ${x.category}.`);
      need(x.currency === 'MXN', 'currency debe ser MXN.');
      need(x.contribution && typeof x.contribution === 'object', 'v2 requiere el bloque contribution (puede estar no_configurado).');
      if (x.contribution) { const r = validateContribution(x.contribution, x); r.errors.forEach((m) => e.push(`contribution: ${m}`)); }
    }
    if (x.status === 'insufficient_data') { need(x.amount === null && x.reason, 'Sin datos suficientes: amount debe ser null y traer la razón.'); return { ok: e.length === 0, errors: e }; }
    need(x.amount && fin(x.amount.point), 'amount.point debe ser un número.');
    if (x.amount && fin(x.amount.point)) { const lo = x.amount.low, hi = x.amount.high; if (lo !== undefined || hi !== undefined) need(fin(lo) && fin(hi) && lo <= x.amount.point && x.amount.point <= hi, 'El rango debe cumplir low ≤ point ≤ high.'); }
    if (OBSERVED.includes(x.category)) { need(x.provenance === 'observed', `${x.category} debe ser observed (solo datos reales; ninguna proyección).`); need(x.assumptions.length === 0 || x.category === 'brecha', 'Un impacto observado no lleva supuestos de proyección.'); }
    else { need(x.provenance === 'projected', `${x.category} es una proyección: provenance debe ser projected.`); need(x.assumptions.length >= 1, `${x.category} requiere al menos un supuesto explícito.`); need(x.horizon, 'Una proyección requiere horizonte.'); }
    if (x.category === 'alcanzable') need(x.constraintsBasis, 'La oportunidad alcanzable debe declarar su base: restricciones declaradas o desempeño histórico propio (constraintsBasis).');
    if (x.category === 'esperado') need(x.calibration && x.calibration.source, 'El impacto esperado exige calibración con respaldo (p. ej. error histórico del forecast); sin ella no se emite.');
    return { ok: e.length === 0, errors: e };
  }

  /* ================= Contribución bruta estimada (segunda capa) ================= */
  const CONTRIB_STATUS = ['disponible', 'no_configurado', 'desactivado', 'sin_importe'];
  function validateContribution(c, impact) {
    const e = [], need = (k, m) => { if (!k) e.push(m); };
    need(CONTRIB_STATUS.includes(c.status), `status debe ser ${CONTRIB_STATUS.join(', ')}.`);
    need(c.label === CONTRIBUTION_LABEL, `label debe ser «${CONTRIBUTION_LABEL}».`);
    need(c.precision === 'estimacion_margen_promedio_general', 'precision debe declarar «estimacion_margen_promedio_general».');
    need(Array.isArray(c.limitations) && c.limitations.length >= 1, 'limitations debe declarar las limitaciones de la estimación.');
    if (c.status === 'disponible') {
      need(fin(c.marginPct) && c.marginPct >= MARGIN_MIN && c.marginPct < MARGIN_MAX_EXCLUSIVE, 'marginPct fuera de rango.');
      need(c.amount && fin(c.amount.point), 'Disponible requiere amount.point numérico.');
      need(c.marginBasis && c.marginBasis.level, 'Disponible requiere marginBasis (nivel de margen usado).');
      need(c.formula && /×/.test(c.formula), 'Disponible requiere la fórmula.');
      if (impact && impact.amount && fin(impact.amount.point) && c.amount && fin(c.amount.point) && fin(c.marginPct)) need(Math.abs(c.amount.point - impact.amount.point * c.marginPct / 100) <= Math.max(1e-6, Math.abs(c.amount.point) * 1e-9), 'amount de contribución ≠ ventas × margen.');
    } else {
      need(c.amount === null, 'Sin margen disponible, amount debe ser null (nunca 0: ausencia ≠ cero).');
      need(c.marginPct === null || c.status === 'desactivado' || c.status === 'sin_importe', 'No configurado: marginPct debe ser null.');
    }
    return { ok: e.length === 0, errors: e };
  }

  /** Aplica el margen a UN impacto de ventas. Lineal: contribución(low/point/high) = ventas × m. No modifica el impacto de ventas. */
  function contributionOf(impact, setting, scope) {
    const base = { label: CONTRIBUTION_LABEL, precision: 'estimacion_margen_promedio_general', limitations: CONTRIBUTION_CAVEATS.slice() };
    const mg = resolveMargin(setting, scope);
    if (impact.status !== 'ok' || !impact.amount || !fin(impact.amount.point)) return { ...base, status: 'sin_importe', amount: null, marginPct: mg.available ? mg.pct : null, reason: 'El impacto en ventas no tiene importe (datos insuficientes): no se estima contribución.' };
    if (!mg.available) return { ...base, status: mg.status, amount: null, marginPct: mg.status === 'desactivado' ? normalizeSetting(setting).grossMarginPct : null, reason: availability(setting).message };
    const m = mg.pct, f = (v) => v * m / 100, a = impact.amount;
    return { ...base, status: 'disponible', marginPct: m, marginBasis: mg.basis, formula: 'contribución bruta estimada = impacto en ventas × margen bruto promedio',
      amount: { point: f(a.point), ...(fin(a.low) && fin(a.high) ? { low: f(a.low), high: f(a.high) } : {}) } };
  }

  /** Construye un impacto v2 (ventas + capa de contribución) a partir de lo que entregó un motor. `spec` lleva lo que el motor ya calculó. */
  function makeImpact(spec, setting) {
    const kind = SALES_KIND[spec.category];
    const x = { schema: 'cc.economic_impact', version: 2, currency: 'MXN', salesKind: kind, status: 'ok', assumptions: [], ...spec };
    x.contribution = contributionOf(x, setting, spec.marginScope);
    delete x.marginScope;
    return x;
  }

  /* ================= Combinación sin doble conteo ================= */
  /**
   * Reglas (idénticas a las de Fase 2, ahora con la capa de contribución):
   *  1. Solo se suman impactos de la misma categoría y procedencia.   2. Mismo overlapGroup = mismo dinero → se toma el mayor.
   *  3. Mismo exclusiveGroup = alternativas → rango [mín, máx], nunca la suma.   4. insufficient_data se lista aparte; el total queda incompleto.
   *  5. El rango del total = suma de extremos de los grupos independientes.
   * Con margen disponible, la contribución del total = total de ventas × margen (la misma cuenta lineal; no se suma contribución de alternativas).
   */
  function combineImpacts(items, setting) {
    const res = { byCategory: {}, excluded: [], warnings: [] };
    const usable = items.filter((i) => { if (i.status === 'insufficient_data') { res.excluded.push({ id: i.id, reason: i.reason }); return false; } return true; });
    const keyOf = (i) => `${i.category}|${i.provenance}`;
    const cats = new Map(); usable.forEach((i) => (cats.get(keyOf(i)) || cats.set(keyOf(i), []).get(keyOf(i))).push(i));
    cats.forEach((list, key) => {
      const exclusive = new Map(), overlap = new Map(), singles = [];
      list.forEach((i) => { if (i.exclusiveGroup) (exclusive.get(i.exclusiveGroup) || exclusive.set(i.exclusiveGroup, []).get(i.exclusiveGroup)).push(i); else if (i.overlapGroup) (overlap.get(i.overlapGroup) || overlap.set(i.overlapGroup, []).get(i.overlapGroup)).push(i); else singles.push(i); });
      const parts = [];
      const rng = (i) => ({ low: fin(i.amount.low) ? i.amount.low : i.amount.point, point: i.amount.point, high: fin(i.amount.high) ? i.amount.high : i.amount.point, ids: [i.id] });
      singles.forEach((i) => parts.push(rng(i)));
      overlap.forEach((g, name) => { const best = g.map(rng).sort((a, b) => b.point - a.point)[0]; if (g.length > 1) res.warnings.push(`Superposición en «${name}»: ${g.map((x) => x.id).join(', ')} describen el mismo dinero; se toma el mayor (${best.ids[0]}).`); parts.push({ ...best, ids: g.map((x) => x.id) }); });
      exclusive.forEach((g, name) => { const r = g.map(rng); parts.push({ low: Math.min(...r.map((x) => x.low)), point: Math.min(...r.map((x) => x.point)), high: Math.max(...r.map((x) => x.high)), ids: g.map((x) => x.id), alternatives: name }); if (g.length > 1) res.warnings.push(`Alternativas excluyentes en «${name}»: se reporta el rango, no la suma.`); });
      const total = { low: parts.reduce((a, p) => a + p.low, 0), point: parts.reduce((a, p) => a + p.point, 0), high: parts.reduce((a, p) => a + p.high, 0), parts, incomplete: res.excluded.length > 0 };
      const sales = { status: 'ok', amount: { low: total.low, point: total.point, high: total.high } };
      total.contribution = setting === undefined ? undefined : contributionOf(sales, setting);
      res.byCategory[key] = total;
    });
    return res;
  }
  /** Invariantes entre categorías de un mismo escenario: alcanzable ≤ potencial teórico; esperado ≤ alcanzable. */
  function checkOrdering(byName) {
    const e = [], g = (k) => byName[k] && byName[k].amount && fin(byName[k].amount.point) ? byName[k].amount.point : null;
    if (g('alcanzable') !== null && g('potencial_teorico') !== null && g('alcanzable') > g('potencial_teorico') + 1e-9) e.push('alcanzable no puede exceder el potencial teórico.');
    if (g('esperado') !== null && g('alcanzable') !== null && g('esperado') > g('alcanzable') + 1e-9) e.push('esperado no puede exceder lo alcanzable.');
    return { ok: !e.length, errors: e };
  }
  /** Efecto conjunto de cambios relativos en volumen (a), conversión (b) y ticket (c) sobre una venta base R. Sirve para VERIFICAR a scenarioEngine. */
  const jointRelative = (R, a, b, c) => R * ((1 + a) * (1 + b) * (1 + c) - 1);

  /* ================= Adaptadores: traducen salidas de los motores oficiales (no recalculan) ================= */
  const periodOf = (sim, fallback) => fallback || (sim && sim.period && (sim.period.key || sim.period)) || 'periodo';
  /** gap.js / pacing: venta observada y brecha a la fecha. `toDate` = { revenue: { actual, plan, gap } }. */
  function fromGap(toDate, { period, scope = 'total' } = {}, setting) {
    const rv = toDate && toDate.revenue;
    const basis = { period: period || 'periodo', scope, indicator: 'revenue' }, method = (id, formula) => ({ id, formula, engine: 'gap.calculateGap' });
    const mkObs = (id, category, value, formula, reasonMissing) => (fin(value)
      ? makeImpact({ id, category, provenance: 'observed', amount: { point: value }, method: method(id, formula), basis }, setting)
      : makeImpact({ id, category, status: 'insufficient_data', amount: null, reason: reasonMissing, provenance: 'observed', method: method(id, formula), basis }, setting));
    return [mkObs('observed_sales', 'observado', rv && rv.actual, 'venta real a la fecha', 'Sin venta real en el periodo.'),
      mkObs('gap_to_date', 'brecha', rv && rv.gap, 'real − plan (mismos días contados)', 'Sin plan o sin venta real comparable.')];
  }
  /** scenarioEngine.simulate: venta potencial (el cambio completo, teórico) con sus supuestos. */
  function fromSimulation(sim, { period, scope = 'total', horizon = 'periodo' } = {}, setting) {
    const basis = { period: periodOf(sim, period), scope, indicator: 'revenue' }, method = { id: 'scenario_incremental', formula: 'venta del escenario − venta base (mismos días editables)', engine: 'scenarioEngine.simulate' };
    if (!sim || !sim.valid || !sim.incremental || !fin(sim.incremental.revenue)) return makeImpact({ id: 'potential_sales', category: 'potencial_teorico', status: 'insufficient_data', amount: null, reason: (sim && sim.errors && sim.errors[0]) || 'El escenario no es válido o no tiene datos.', provenance: 'projected', method, basis, assumptions: [], horizon }, setting);
    const as = (sim.assumptions || []).map((a) => (typeof a === 'string' ? a : (a && (a.text || a.label)) || JSON.stringify(a)));
    return makeImpact({ id: 'potential_sales', category: 'potencial_teorico', provenance: 'projected', amount: { point: sim.incremental.revenue }, method, basis, horizon, assumptions: as.length ? as : ['Los cambios de sesiones, conversión y ticket del escenario ocurren completos en los días editables.'] }, setting);
  }
  /** recoveryEngine.recoveryOptions: cada alternativa es VENTA RECUPERABLE y todas cierran la MISMA brecha (grupo excluyente). */
  function fromRecovery(ro, { period, scope = 'total', horizon = 'resto del periodo', constraintsBasis = 'restricciones declaradas en el escenario de recuperación' } = {}, setting) {
    const basis = { period: period || 'periodo', scope, indicator: 'revenue' }, method = { id: 'recovery_option', formula: 'venta incremental de la alternativa que cierra la brecha', engine: 'recoveryEngine.recoveryOptions' };
    if (!ro || !ro.ok) return [makeImpact({ id: 'recoverable_sales', category: 'alcanzable', status: 'insufficient_data', amount: null, reason: (ro && ro.reason) || 'No hay brecha que recuperar o faltan datos.', provenance: 'projected', method, basis, horizon, assumptions: [], constraintsBasis }, setting)];
    return (ro.alternatives || []).map((a, i) => {
      const inc = a.simulated ? a.simulated.incremental : null, v = fin(inc) ? inc : (inc && fin(inc.revenue) ? inc.revenue : null);   // recoveryEngine entrega la venta incremental como número
      const warn = (a.exceedsConstraints || []).length ? [`Excede restricciones declaradas: ${a.exceedsConstraints[0]}`] : [];
      const id = `recoverable_${a.id || a.label || i}`;
      return fin(v) ? makeImpact({ id, category: 'alcanzable', provenance: 'projected', amount: { point: v }, method, basis, horizon, constraintsBasis, exclusiveGroup: 'recovery_same_gap', assumptions: [`Alternativa «${a.label || a.id || i}»: cierra la misma brecha que las demás; no se acumulan.`, ...warn] }, setting)
        : makeImpact({ id, category: 'alcanzable', status: 'insufficient_data', amount: null, reason: (a.errors && a.errors[0]) || 'La alternativa no devolvió venta incremental.', provenance: 'projected', method, basis, horizon, assumptions: [], constraintsBasis, exclusiveGroup: 'recovery_same_gap' }, setting);
    });
  }

  return { MARGIN_MIN, MARGIN_MAX_EXCLUSIVE, DEFAULT_SETTING, CATEGORIES, SALES_KIND, CONTRIB_STATUS, CONTRIBUTION_LABEL, CONTRIBUTION_CAVEATS, MARGIN_HELP,
    validateMarginInput, normalizeSetting, buildSetting, availability, resolveMargin, markupToMargin, marginToMarkup,
    validateImpact, validateContribution, contributionOf, makeImpact, combineImpacts, checkOrdering, jointRelative, fromGap, fromSimulation, fromRecovery };
});
