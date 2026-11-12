/**
 * attribution.js — Atribución matemática de una variación multiplicativa (Fase 5).
 *
 *   Revenue = Traffic × CR × AOV      (Orders = Traffic × CR)
 *
 * Métodos:
 *  - 'sequential' (default): se cambia un factor a la vez en el orden configurado
 *      contribución(Traffic) = (T1 − T0) × CR0 × AOV0
 *      contribución(CR)      = T1 × (CR1 − CR0) × AOV0
 *      contribución(AOV)     = T1 × CR1 × (AOV1 − AOV0)
 *    La suma telescópica cierra exacto: Σ = R1 − R0. El resultado depende del orden (se informa).
 *  - 'shapley': promedio de las contribuciones secuenciales sobre TODOS los órdenes posibles
 *    (simétrico: no depende del orden). También cierra exacto.
 * Es una atribución matemática, no causal.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const C = () => FP.config;
  const M = () => FP.metrics;
  const fin = (v) => M().isFiniteNumber(v);

  const product = (vals) => vals.reduce((a, b) => a * b, 1);

  function permutations(arr) {
    if (arr.length <= 1) return [arr.slice()];
    return arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
  }

  /** Contribuciones secuenciales en un orden dado. base/current: { factor: valor }
   *  Dos evaluaciones algebraicamente idénticas (misma fórmula, Σ exacto), conservadas porque los resultados históricos se comparan bit a bit:
   *  - por defecto: diferencia de productos acumulados (la usan Diagnóstico y el reporte);
   *  - `direct`: (actual_f − base_f) con los factores previos en `actual` y los posteriores en `base`, multiplicados de izquierda a derecha
   *    (la evaluación de Tráfico y conversión). La usa `attributeSegment`. */
  function sequentialOrder(base, current, order, { direct = false } = {}) {
    const out = {};
    if (direct) {
      order.forEach((f, i) => { let k = 1; order.forEach((g, j) => { k *= j < i ? current[g] : j === i ? current[g] - base[g] : base[g]; }); out[f] = k; });
      return out;
    }
    const state = { ...base };
    let prev = product(order.map((f) => state[f]));
    order.forEach((f) => {
      state[f] = current[f];
      const next = product(order.map((g) => state[g]));
      out[f] = next - prev;
      prev = next;
    });
    return out;
  }

  /**
   * @param {object} base     { trafficVolume, conversionRate, aov }
   * @param {object} current  igual
   * @param {object} opts     { method, order, factors }  factors: ['trafficVolume','conversionRate','aov'] (venta) o sin 'aov' (pedidos)
   * @returns { method, order, factors, contributions, baseValue, currentValue, total, residual, closes, status }
   */
  function attribute(base, current, { method = C().diagnostics.attributionMethod, order = C().diagnostics.attributionOrder, factors = null, direct = false } = {}) {
    const fs = (factors || order).filter((f) => order.includes(f));
    const ok = fs.every((f) => fin(base && base[f]) && fin(current && current[f]));
    if (!ok) return { method, order: fs, factors: fs, contributions: null, status: 'insufficient_data',
      note: 'Falta volumen, CR o AOV en uno de los lados (p. ej. 0 pedidos o 0 volumen): no se puede atribuir.' };
    // Crecer desde una base cuyo producto es 0 (p. ej. conversión 0 → no hay ticket base) no tiene reparto único entre factores: no se fuerza.
    if (product(fs.map((f) => base[f])) === 0 && product(fs.map((f) => current[f])) !== 0) return { method, order: fs, factors: fs, contributions: null, status: 'insufficient_data',
      note: 'La base comparable vale 0 (sin sesiones, sin conversión o sin ticket base): el cambio no se reparte entre factores.' };
    let contributions;
    if (method === 'shapley') {
      const perms = permutations(fs);
      contributions = Object.fromEntries(fs.map((f) => [f, 0]));
      perms.forEach((p) => { const c = sequentialOrder(base, current, p); fs.forEach((f) => { contributions[f] += c[f] / perms.length; }); });
    } else {
      contributions = sequentialOrder(base, current, fs, { direct });
    }
    const baseValue = product(fs.map((f) => base[f]));
    const currentValue = product(fs.map((f) => current[f]));
    const total = currentValue - baseValue;
    const sum = fs.reduce((a, f) => a + contributions[f], 0);
    return { method, order: fs, factors: fs, contributions, baseValue, currentValue, total, residual: total - sum,
      closes: M().isApproximatelyEqual(sum, total, { relative: 1e-9, absolute: 1e-6 }), status: 'ok' };
  }

  /* ---------------------------------------------------------------------------------------------------------------------------------
   * Atribución por escenario (Fase 2 · punto A) — FUENTE ÚNICA de la regla «qué se puede atribuir y qué no».
   * Entrada en cantidades { t: sesiones, o: pedidos, r: venta } (o null si el lado no existe). Salida:
   *   { status, attributed, delta, traffic, cr, aov, unattributed, reason, method, order }
   * traffic + cr + aov + unattributed = delta SIEMPRE (cuando delta es calculable). Lo que no tiene base comparable NO se reparte entre
   * factores: va a `unattributed` con un estado explícito (nunca se fuerza un % ni se asigna a un factor por conveniencia).
   * Estados:
   *   ok                       base y actual con sesiones y pedidos: atribución secuencial (o Shapley) por factor.
   *   sin_trafico_actual       el periodo actual no tiene sesiones ni venta: toda la caída es de volumen (traffic = −venta base).
   *   conversion_cero_actual   hay sesiones pero 0 pedidos y 0 venta: caen volumen y conversión; el ticket no es observable (aov = 0).
   *   recuperacion_desde_cero  la base tenía sesiones pero 0 pedidos: no existe CR ni ticket base; el cambio NO se reparte (unattributed).
   *   sin_base_comparable      la base no tiene sesiones: no existe tasa base (sin atribución).
   *   cambio_de_composicion    el segmento aparece o desaparece entre periodos (no hay par comparable; el efecto de mezcla se mide aparte).
   *   sin_actividad            ambos lados en cero: no hay variación que explicar.
   *   datos_insuficientes      falta algún dato o no es numérico.
   *   no_calculable            valores negativos o inconsistentes (p. ej. venta sin pedidos): no se calcula.
   * Es contribución matemática, no causalidad.
   * ------------------------------------------------------------------------------------------------------------------------------- */
  const SEGMENT_STATUS = ['ok', 'sin_trafico_actual', 'conversion_cero_actual', 'recuperacion_desde_cero', 'sin_base_comparable', 'cambio_de_composicion', 'sin_actividad', 'datos_insuficientes', 'no_calculable'];
  function attributeSegment(base, cur, { method = 'sequential' } = {}) {
    const mk = (status, o = {}) => ({ status, attributed: false, delta: null, traffic: 0, cr: 0, aov: 0, unattributed: null, reason: null, method, order: ['trafficVolume', 'conversionRate', 'aov'], ...o });
    const num = (b) => b && ['t', 'o', 'r'].every((k) => fin(b[k]));
    if (!base && !cur) return mk('datos_insuficientes', { reason: 'No hay datos en ninguno de los dos periodos.' });
    if ((base && !num(base)) || (cur && !num(cur))) return mk('datos_insuficientes', { reason: 'Falta sesiones, pedidos o venta en alguno de los lados.' });
    const r0 = base ? base.r : 0, r1 = cur ? cur.r : 0, delta = r1 - r0;
    if ([base, cur].some((b) => b && (b.t < 0 || b.o < 0 || b.r < 0))) return mk('no_calculable', { delta, unattributed: delta, reason: 'Hay valores negativos: no se calcula la atribución.' });
    if (!base) return mk('cambio_de_composicion', { delta, unattributed: delta, reason: 'El segmento no existe en el periodo base (nuevo): no hay comparable.' });
    if (!cur) return mk('cambio_de_composicion', { delta, unattributed: delta, reason: 'El segmento ya no aparece en el periodo actual: no hay comparable.' });
    const zero = (b) => b.t === 0 && b.o === 0 && b.r === 0;
    if (zero(base) && zero(cur)) return mk('sin_actividad', { attributed: true, delta: 0, unattributed: 0, reason: 'Sin actividad en ambos periodos.' });
    if (base.t === 0) {
      if (base.o > 0 || base.r > 0) return mk('no_calculable', { delta, unattributed: delta, reason: 'La base trae pedidos o venta sin sesiones (dato inconsistente).' });
      return mk('sin_base_comparable', { delta, unattributed: delta, reason: 'La base no tiene sesiones: no existe conversión ni ticket base.' });
    }
    if (base.o === 0) {
      if (base.r !== 0) return mk('no_calculable', { delta, unattributed: delta, reason: 'La base trae venta sin pedidos (dato inconsistente).' });
      if (cur.r === 0 && cur.o === 0) return mk('sin_actividad', { attributed: true, delta: 0, unattributed: 0, reason: 'Sin venta en ambos periodos.' });
      return mk('recuperacion_desde_cero', { delta, unattributed: delta, reason: 'La base tenía sesiones pero ningún pedido: el cambio no se reparte entre conversión y ticket.' });
    }
    // base con sesiones y pedidos
    const cr0 = base.o / base.t, aov0 = base.r / base.o;
    if (cur.t === 0) {
      if (cur.o > 0 || cur.r !== 0) return mk('no_calculable', { delta, unattributed: delta, reason: 'El actual trae pedidos o venta sin sesiones (dato inconsistente).' });
      return mk('sin_trafico_actual', { attributed: true, delta, traffic: -base.t * cr0 * aov0, unattributed: 0, reason: 'Sin sesiones en el periodo actual: la caída es de volumen.' });
    }
    if (cur.o === 0) {
      if (cur.r !== 0) return mk('no_calculable', { delta, unattributed: delta, reason: 'El actual trae venta sin pedidos (dato inconsistente).' });
      return mk('conversion_cero_actual', { attributed: true, delta, traffic: (cur.t - base.t) * cr0 * aov0, cr: cur.t * (0 - cr0) * aov0, aov: 0, unattributed: 0, reason: 'Sin pedidos en el periodo actual: el ticket no es observable.' });
    }
    const a = attribute({ trafficVolume: base.t, conversionRate: cr0, aov: aov0 }, { trafficVolume: cur.t, conversionRate: cur.o / cur.t, aov: cur.r / cur.o }, { method, direct: true });
    if (a.status !== 'ok') return mk('datos_insuficientes', { delta, unattributed: delta, reason: a.note });
    return mk('ok', { attributed: true, delta, traffic: a.contributions.trafficVolume, cr: a.contributions.conversionRate, aov: a.contributions.aov, unattributed: a.residual, method: a.method, reason: null });
  }

  FP.attribution = { attribute, attributeSegment, SEGMENT_STATUS, sequentialOrder, permutations };
})(typeof window !== 'undefined' ? window : globalThis);
