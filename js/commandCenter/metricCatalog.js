/**
 * metricCatalog.js — Catálogo canónico de métricas (Fase 4.1). DATOS + comprobaciones; no calcula ninguna métrica.
 *
 * Cada entrada declara UNA definición oficial y apunta a la función que ya la implementa (`formulaRef`). Los demás módulos deben CONSUMIR esa función, no reescribir la
 * fórmula. `duplicates` lista las reimplementaciones encontradas en la auditoría ((reapertura 4.1/4.2: TODAS migradas; `migrated` lista los archivos que ahora consumen la función canónica, con paridad de motores en tools/test-reapertura-formulas.js)). Funciona en navegador y en Node.
 * `reconcile` aplica la decisión D-02 (diferencia superior a $0.01 = pendiente de conciliación; la ausencia de diferencia observada NO es conciliación formal).
 *
 * ESTADO: no cableado a ninguna vista; no se carga desde index.html (Fase 4.1).
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const REL = 'cc.reliability/1';
  const M = (o) => Object.freeze(Object.assign({ reliabilityContract: REL, missingData: 'null (nunca 0): falta de dato ≠ cero; se reporta como no disponible', dedup: 'una fila por fecha × canal en el modelo canónico; reimportar reemplaza el lote, no duplica' }, o));

  const CATALOG = [
    M({ id: 'revenue', name: 'Venta', kind: 'original', definition: 'Venta bruta en MXN del periodo, por canal y día.', formula: 'dato observado (suma de líneas de venta)', formulaRef: null,
      source: { primary: 'dataset «Venta real / Actual» (colección actual del modelo canónico)', secondary: ['archivo de productos (solo desgloses por producto)'], fallback: 'ninguno: sin dato = no disponible' },
      unit: 'MXN', temporal: 'día', channel: 'por canal y total', aggregation: 'suma de días y canales', consumers: ['gap', 'forecastEngine', 'homeSummaryEngine', 'attentionEngine', 'diagnosticEngine', 'report'], tests: ['selftest-node', 'batch_fase1_consistencia_calculos'] }),
    M({ id: 'orders', name: 'Pedidos', kind: 'original', definition: 'Número de pedidos del periodo.', formula: 'dato observado', formulaRef: null,
      source: { primary: 'dataset real', secondary: [], fallback: 'ninguno' }, unit: 'pedidos', temporal: 'día', channel: 'por canal y total', aggregation: 'suma', consumers: ['derivations', 'attribution', 'trafficConversionEngine'], tests: ['test-atribucion-escenarios'] }),
    M({ id: 'sessions', name: 'Sesiones (tráfico)', kind: 'original', definition: 'Sesiones (o contactos en WhatsApp y Llamadas) del periodo.', formula: 'dato observado', formulaRef: null,
      source: { primary: 'dataset real: traffic_volume por canal y día', secondary: ['archivo de segmentos GA4: SOLO desgloses por dimensión (dispositivo, fuente, campaña…) del mismo universo'], fallback: 'si falta la fuente primaria no se sustituye por la de segmentos: se informa «sesiones no disponibles»' },
      unit: 'sesiones', temporal: 'día', channel: 'por canal (ecommerce y app); contactos en WhatsApp/Llamadas', aggregation: 'suma; las dos fuentes NUNCA se suman entre sí (mismo universo)',
      dedup: 'una fuente por cifra; los segmentos de una dimensión suman el universo de esa dimensión, no se añaden al total', consumers: ['derivations', 'attribution', 'trafficConversionEngine', 'segments-view'], tests: ['test-traffic-all', 'test-fase4-1-metricas-y-fuentes'] }),
    M({ id: 'conversion_rate', name: 'Conversión (CR)', kind: 'derivado', definition: 'Pedidos entre sesiones, siempre desde sumas (nunca promedio de tasas).', formula: 'orders / sessions', formulaRef: 'FP.metrics.calcConversionRate (vía FP.derivations)',
      source: { primary: 'derivada de orders y sessions', secondary: [], fallback: 'si hay un CR cargado por el usuario se conserva y se reporta la diferencia; nunca se sobrescribe' },
      unit: 'fracción 0–1', temporal: 'agregable a cualquier periodo desde sumas', channel: 'por canal y total', aggregation: 'recalcular desde sumas', consumers: ['attribution', 'forecastMethods', 'scenarioEngine', 'segments-view'],
      duplicates: [], migrated: ['js/ui/segments-view.js', 'js/analytics/trafficConversionEngine.js', 'js/projection/projection.js', 'js/forecast/reforecastEngine.js', 'js/ui/segmentInsights.js', 'js/diagnostics/attribution.js', 'js/report/reportBuilder.js'], tests: ['selftest-node'] }),
    M({ id: 'aov', name: 'Ticket promedio (AOV)', kind: 'derivado', definition: 'Venta entre pedidos, desde sumas.', formula: 'revenue / orders', formulaRef: 'FP.metrics.calcAov (vía FP.derivations)',
      source: { primary: 'derivada de revenue y orders', secondary: [], fallback: 'ídem CR' }, unit: 'MXN', temporal: 'desde sumas', channel: 'por canal y total', aggregation: 'recalcular desde sumas', consumers: ['attribution', 'forecastMethods', 'scenarioEngine'],
      duplicates: [], migrated: ['js/ui/segments-view.js', 'js/analytics/trafficConversionEngine.js', 'js/projection/projection.js', 'js/forecast/reforecastEngine.js', 'js/promotions/opportunityEngine.js', 'js/ui/segmentInsights.js', 'js/diagnostics/attribution.js', 'js/report/reportBuilder.js'], tests: ['selftest-node'] }),
    M({ id: 'revenue_identity', name: 'Identidad de la venta', kind: 'derivado', definition: 'Venta = Sesiones × CR × Ticket; la variación se atribuye a los tres factores con suma exacta (no es causal).', formula: 'R = T × CR × AOV', formulaRef: 'FP.attribution (secuencial/Shapley)',
      source: { primary: 'attribution.js (fuente única)', secondary: [], fallback: 'sin base comparable no se atribuye' }, unit: 'MXN', temporal: 'par de periodos comparables', channel: 'por canal y total', aggregation: 'Σ contribuciones = Δ venta',
      consumers: ['driverEngine', 'trafficConversionEngine', 'homeSummaryEngine'], tests: ['test-atribucion-escenarios (64)'] }),
    M({ id: 'plan_revenue', name: 'Plan de venta', kind: 'original', definition: 'Meta de venta por día y canal.', formula: 'dato cargado o plan generado', formulaRef: 'FP.planning (plan generado)',
      source: { primary: 'plan distribuido ORIGINAL (generado desde metas anuales y congelado; forecastEngine.js, cabecera)', secondary: ['plan importado: dataset «Plan / Meta» (planData)'], fallback: 'orden verificado en forecastEngine: plan original congelado → plan importado → «Sin plan» (nunca 0)' },
      unit: 'MXN', temporal: 'día', channel: 'por canal y total', aggregation: 'suma', consumers: ['forecastEngine', 'gap', 'pacing'], duplicates: ['la página Plan no reconoce el plan cargado (dos orígenes sin vínculo visible)'], tests: ['selftest-node'] }),
    M({ id: 'gap', name: 'Brecha contra el plan', kind: 'derivado', definition: 'Real menos plan de los mismos días contados.', formula: 'actual − plan', formulaRef: 'FP.gap.calculateGap (FP.metrics.calcGap)',
      source: { primary: 'gap.js', secondary: [], fallback: 'sin plan o sin real: null' }, unit: 'MXN', temporal: 'a la fecha', channel: 'por canal y total', aggregation: 'suma de canales = total (mismo universo)',
      consumers: ['pacing', 'forecastEngine', 'attentionEngine', 'homeSummaryEngine'], duplicates: [], migrated: ['js/report/reportBuilder.js', 'js/analytics/planBridgeEngine.js', 'js/analytics/changeEngine.js', 'js/forecast/reforecastEngine.js', 'js/diagnostics/driverEngine.js', 'js/projection/projection.js'], tests: ['selftest-node', 'test-fase4-1-metricas-y-fuentes'] }),
    M({ id: 'compliance', name: 'Cumplimiento', kind: 'derivado', definition: 'Real entre plan a la fecha.', formula: 'actual / plan', formulaRef: 'FP.gap.calculateGap', source: { primary: 'gap.js', secondary: [], fallback: 'plan 0 o ausente: null' },
      unit: 'fracción', temporal: 'a la fecha', channel: 'por canal y total', aggregation: 'recalcular desde sumas', consumers: ['planStatus', 'attentionEngine', 'pacing-view'], tests: ['test-fase4-1-estado-comercial'] }),
    M({ id: 'plan_status', name: 'Estado frente al plan', kind: 'derivado', definition: 'Clasificación determinista del cumplimiento acumulado.', formula: 'cumplimiento contra FP.config.forecast.pacingThresholds', formulaRef: 'FP.planStatus.classify (equivale a FP.gap.pacingStatus)',
      source: { primary: 'planStatus.js', secondary: [], fallback: 'sin plan / sin dato: estados distintos, nunca «en plan»' }, unit: 'estado', temporal: 'a la fecha', channel: 'por canal y total', aggregation: 'se clasifica cada nivel con su propio cumplimiento; no se promedian estados',
      consumers: ['pacing-view (vía FP.gap.pacingStatus)', 'attentionEngine', 'home-view'], duplicates: ['js/ui/chg-resumen.js (variación de ayer/semana vs plan del día: −5 %/−1 %/+2 %; concepto distinto, se conserva)', 'js/agents/analistaStory.js (cierre proyectado vs meta ±0.5 %; concepto distinto, se conserva)', 'js/report/reportCopy.js (±2 %, −10 %; escala del reporte, se conserva)', 'js/report/reportBuilder.js (readout.state ±0.5 %; escala del reporte, se conserva)', 'config.report.*: belowPlanPct 0.5 %, okPct 1 % (umbrales por audiencia, se conservan)'], tests: ['test-fase4-1-estado-comercial'] }),
    M({ id: 'forecast_close', name: 'Forecast de cierre', kind: 'derivado', definition: 'Venta proyectada al cierre del periodo.', formula: 'método elegido del forecastEngine', formulaRef: 'FP.forecastEngine',
      source: { primary: 'forecastEngine', secondary: ['reforecastEngine (otro concepto: pendiente por repartir)'], fallback: 'sin base suficiente: no se proyecta' }, unit: 'MXN', temporal: 'periodo', channel: 'por canal y total', aggregation: 'suma', consumers: ['homeSummaryEngine', 'attentionEngine', 'forecast-view'], tests: ['selftest-node'] }),
    M({ id: 'customers_ledger', name: 'Libro de clientes', kind: 'transformado', definition: 'Una entrada por pedido con id de cliente anonimizado.', formula: 'ledger de productos con id_pedido e id_cliente', formulaRef: 'FP.customerStore / FP.customerEngine',
      source: { primary: 'archivo de productos·venta con id_pedido e id_cliente (IndexedDB)', secondary: [], fallback: 'sin ambos ids no hay libro' }, unit: 'pedidos/clientes', temporal: 'pedido', channel: 'por canal del pedido', aggregation: 'por cliente', consumers: ['customers-view', 'crosssell-view'], tests: ['test-customer-engine'] }),
    M({ id: 'economic_impact', name: 'Impacto económico', kind: 'derivado', definition: 'Impacto en ventas (MXN) con contribución bruta opcional; contrato cc.economic_impact v2.', formula: 'ver impactModel.js', formulaRef: 'FP.economics',
      source: { primary: 'impactModel.js', secondary: [], fallback: 'sin metodología verificable no se estima; margen desconocido = no configurado (nunca 0 %)' }, unit: 'MXN', temporal: 'periodo', channel: 'por elemento', aggregation: 'SIN consolidar superposiciones (D-06; combineImpacts pendiente de 4.5)',
      consumers: ['(ninguno en producción; solo configuración de margen)'], tests: ['test-economia-dual (64)'] })
  ];

  const REQUIRED = ['id', 'name', 'kind', 'definition', 'formula', 'source', 'unit', 'temporal', 'channel', 'aggregation', 'dedup', 'missingData', 'reliabilityContract', 'consumers', 'tests'];
  const byId = new Map(CATALOG.map((m) => [m.id, m]));
  const get = (id) => byId.get(id) || null;
  /** Comprueba que cada entrada esté completa y que su fórmula oficial apunte a un módulo existente (si se pasa `FPref`). */
  function check(FPref) {
    const e = [], ids = new Set();
    CATALOG.forEach((m) => {
      if (ids.has(m.id)) e.push(`${m.id}: id repetido`); ids.add(m.id);
      REQUIRED.forEach((k) => { if (m[k] === undefined || m[k] === null || m[k] === '' || (Array.isArray(m[k]) && !m[k].length && k === 'consumers')) e.push(`${m.id}: falta ${k}`); });
      if (!m.source || !m.source.primary || !m.source.fallback) e.push(`${m.id}: source debe indicar fuente primaria y fallback`);
      if (FPref && m.formulaRef) { const name = (m.formulaRef.match(/FP\.([A-Za-z]+)/) || [])[1]; if (name && !FPref[name]) e.push(`${m.id}: ${name} no existe`); }
    });
    return e;
  }

  /**
   * Conciliación (D-02). a y b = { value, universe: { period, channel, scope, source } }.
   * - universos distintos → 'no_comparable' (la tolerancia NO sirve para ocultar diferencias de alcance, filtros, periodo o fuente);
   * - |a − b| > 0.01 → 'pendiente_de_conciliacion';
   * - |a − b| ≤ 0.01 → 'sin_diferencia_observada' (NUNCA «conciliada»: la conciliación formal exige evidencia y reglas de validación que aún no existen).
   */
  function reconcile(a, b, opts) {
    const cfgTol = root.FP && root.FP.config && root.FP.config.diagnostics && root.FP.config.diagnostics.reconciliation && root.FP.config.diagnostics.reconciliation.decisionMXN;
    if (!(opts && fin(opts.tolerance)) && !fin(cfgTol)) throw new Error('reconcile requiere FP.config.diagnostics.reconciliation.decisionMXN (js/config/config.js) o opts.tolerance.');
    const tol = opts && fin(opts.tolerance) ? opts.tolerance : cfgTol, reasons = [];
    if (!a || !b || !fin(a.value) || !fin(b.value)) return { status: 'datos_faltantes', difference: null, tolerance: tol, reasons: ['falta al menos uno de los importes'], formal: false };
    const ua = a.universe || {}, ub = b.universe || {};
    ['period', 'channel', 'scope', 'source'].forEach((k) => { if (ua[k] !== ub[k]) reasons.push(`${k}: «${ua[k]}» ≠ «${ub[k]}»`); });
    const strictUniverse = !(opts && opts.allowSourceDifference);
    const universeDiff = reasons.filter((r) => strictUniverse || !/^source/.test(r));
    const difference = a.value - b.value;
    if (universeDiff.length) return { status: 'no_comparable', difference, tolerance: tol, reasons: universeDiff, formal: false };
    const status = Math.abs(difference) > tol + 1e-9 ? 'pendiente_de_conciliacion' : 'sin_diferencia_observada';
    return { status, difference, tolerance: tol, reasons: status === 'pendiente_de_conciliacion' ? [`diferencia superior a $${tol.toFixed(2)}`] : ['sin diferencia observada: no equivale a conciliación formal'], formal: false };
  }


  /**
   * Política canónica de SESIONES (P-02). Determinada a partir de la arquitectura real (js/model/canonical.js, forecastEngine, derivations, trafficConversionEngine, segments-view):
   *  - PRIMARIA: la serie diaria por canal `traffic_volume` (sessions ↔ trafficVolume). Es la única que alimenta plan, forecast, pacing, CR y atribución, y la única que existe para WhatsApp y Llamadas.
   *  - SECUNDARIA: el almacén de segmentos (export GA4 convertido o archivo de segmentos). Es un DESGLOSE por dimensión del mismo universo del sitio y la app; nunca es fuente del total.
   * No hay en el código ninguna regla de respaldo ni de conciliación entre ambas: por eso aquí se definen como reglas de CONTRATO y la conciliación queda sin tolerancia (no se inventa).
   */
  const SESSIONS_POLICY = Object.freeze({
    contract: 'cc.sessions_policy/1',
    primary: Object.freeze({ id: 'channel_daily_traffic_volume', source: 'dataset real «Venta real / Actual» (modelo canónico, campo sessions ↔ trafficVolume)', universe: 'ecommerce y app: sesiones; WhatsApp y Llamadas: contactos', granularity: 'día × canal', period: 'el de los datos cargados', dedup: 'una fila por fecha × canal' }),
    secondary: Object.freeze({ id: 'segments_store', source: 'export GA4 convertido («ga4_segments», «ga4_traffic») o archivo de segmentos («segments_file»)', universe: 'solo sitio y app (GA4 no mide WhatsApp ni Llamadas)', granularity: 'día × dimensión × segmento; las filas de DISTINTAS dimensiones no se suman (un visitante aparece en varias); users/new_users no son sumables', period: 'el del archivo cargado; puede no coincidir con el de la serie diaria', dedup: 'dentro de una dimensión, los segmentos suman el universo de esa dimensión; entre dimensiones no hay suma' }),
    use: Object.freeze({ total: 'primaria', byDimension: 'secundaria', plan_forecast_pacing_cr_attribution: 'primaria', whatsapp_llamadas: 'solo primaria' }),
    fallback: Object.freeze({ rule: 'sin respaldo: si falta la primaria para el canal y periodo se informa «sesiones no disponibles»; el total de una dimensión de segmentos NO sustituye al total del canal', segmentsAsTotal: false }),
    reconciliation: Object.freeze({ rule: 'comparar solo mismo canal y mismo periodo; nunca sumar; reportar la diferencia', tolerance: null, note: 'no existe una tolerancia documentada entre ambas fuentes; la única tolerancia del código (5 %, trafficConversionEngine.COVER_TOL) compara una dimensión contra la dimensión de referencia, no contra la serie diaria: no se reutiliza', precedent: 0.05 }),
    validation: Object.freeze({ tool: 'tools/audit/validar-sesiones-ga4.js', requires: ['export diario por canal (date, channel, sessions)', 'export GA4 por dimensión del MISMO periodo y canales (date, channel, dimension, segment, sessions)', 'periodo explícito (from/to)'], steps: ['1 ejecutar el informe por canal × dimensión', '2 revisar la diferencia y la cobertura de días de cada par', '3 si la diferencia es estable y explicable, proponer una tolerancia al negocio (no se fija aquí)', '4 registrar la tolerancia aprobada en FP.config y volver a ejecutar'] }),
    unknown: Object.freeze(['si la serie diaria y GA4 miden exactamente las mismas sesiones (misma definición y filtros)', 'qué discrepancia es normal entre ambas', 'requiere datos reales y validación del usuario'])
  });
  /** a = serie diaria (primaria) y b = total de segmentos (secundaria): { value, universe: { period, channel } }. Nunca suma; nunca declara conciliación formal. */
  function reconcileSessions(a, b, opts) {
    const miss = !a || !b || !fin(a.value) || !fin(b.value);
    if (miss) return { status: 'datos_faltantes', difference: null, differencePct: null, formal: false, sum: null, reasons: ['falta la serie diaria o el total de segmentos: no se sustituye una por otra'] };
    const ua = a.universe || {}, ub = b.universe || {}, reasons = ['period', 'channel'].filter((k) => ua[k] !== ub[k]).map((k) => `${k}: «${ua[k]}» ≠ «${ub[k]}»`);
    const difference = a.value - b.value, pct = a.value !== 0 ? difference / a.value : null, tol = opts && fin(opts.tolerancePct) ? opts.tolerancePct : null;
    if (reasons.length) return { status: 'no_comparable', difference, differencePct: pct, formal: false, sum: null, reasons };
    if (difference === 0) return { status: 'sin_diferencia_observada', difference, differencePct: pct, formal: false, sum: null, reasons: ['sin diferencia observada: no equivale a conciliación formal'] };
    if (tol === null) return { status: 'discrepancia_sin_criterio', difference, differencePct: pct, formal: false, sum: null, reasons: ['hay diferencia y no existe una tolerancia aprobada: se reporta, no se oculta'] };
    return { status: pct !== null && Math.abs(pct) <= tol ? 'dentro_de_tolerancia_declarada' : 'fuera_de_tolerancia_declarada', difference, differencePct: pct, formal: false, sum: null, reasons: [`tolerancia declarada por quien llama: ${(tol * 100).toFixed(2)} %`] };
  }

  /**
   * Informe de conciliación de sesiones (mecanismo para validar con DATOS REALES; no decide nada ni fija tolerancias).
   * daily    = [{ date, channel, sessions }]                     serie diaria por canal (fuente primaria)
   * segments = [{ date, channel, dimension, segment, sessions }]  almacén de segmentos GA4 (fuente secundaria)
   * Por cada canal × dimensión del MISMO periodo compara el total diario con el total de ESA dimensión (nunca suma dimensiones entre sí) con `reconcileSessions`, y advierte riesgo de
   * doble conteo si la suma de varias dimensiones se acerca a un múltiplo del total diario (señal de que alguien las sumó o de que la dimensión no es partición del universo).
   * opts: { from, to, tolerancePct } — la tolerancia SOLO se aplica si quien llama la declara.
   */
  function reconcileSessionsReport(daily, segments, opts) {
    const o = opts || {}, inRange = (d) => (!o.from || d >= o.from) && (!o.to || d <= o.to), num = (v) => (fin(v) ? v : null);
    const dRows = (Array.isArray(daily) ? daily : []).filter((r) => r && inRange(r.date)), sRows = (Array.isArray(segments) ? segments : []).filter((r) => r && inRange(r.date));
    const period = { from: o.from || (dRows.concat(sRows).map((r) => r.date).sort()[0] || null), to: o.to || (dRows.concat(sRows).map((r) => r.date).sort().slice(-1)[0] || null) };
    const channels = [...new Set([...dRows.map((r) => r.channel), ...sRows.map((r) => r.channel)])].sort();
    const out = { contract: 'cc.sessions_report/1', period, tolerancePct: fin(o.tolerancePct) ? o.tolerancePct : null, combinedTotal: null, rows: [], warnings: [] };
    channels.forEach((ch) => {
      const dd = dRows.filter((r) => r.channel === ch), valid = dd.filter((r) => num(r.sessions) !== null), dailyTotal = valid.length ? valid.reduce((a, r) => a + r.sessions, 0) : null;
      const dailyDays = new Set(valid.map((r) => r.date)), dims = [...new Set(sRows.filter((r) => r.channel === ch).map((r) => r.dimension))].sort(), dimTotals = {};
      if (!dims.length) { out.rows.push({ channel: ch, dimension: null, ...reconcileSessions({ value: dailyTotal, universe: { period: period.from + '|' + period.to, channel: ch } }, { value: null, universe: { period: period.from + '|' + period.to, channel: ch } }, o), dailyTotal, segmentsTotal: null, daysDaily: dailyDays.size, daysSegments: 0, universeNote: 'sin segmentos para este canal (p. ej. WhatsApp/Llamadas: GA4 no los mide)' }); return; }
      dims.forEach((dim) => {
        const sd = sRows.filter((r) => r.channel === ch && r.dimension === dim && num(r.sessions) !== null), segTotal = sd.length ? sd.reduce((a, r) => a + r.sessions, 0) : null; dimTotals[dim] = segTotal;
        const sDays = new Set(sd.map((r) => r.date)), sameDays = dailyDays.size === sDays.size && [...dailyDays].every((d) => sDays.has(d));
        const uni = (days) => ({ period: period.from + '|' + period.to, channel: ch, days });
        const rec = reconcileSessions({ value: dailyTotal, universe: { period: uni().period, channel: ch } }, { value: segTotal, universe: { period: uni().period, channel: ch } }, o);
        out.rows.push({ channel: ch, dimension: dim, ...rec, dailyTotal, segmentsTotal: segTotal, daysDaily: dailyDays.size, daysSegments: sDays.size, sameDays, ...(sameDays ? {} : { universeNote: 'los días con dato difieren entre la serie diaria y los segmentos: la diferencia puede ser de cobertura, no de medición' }) });
      });
      const vals = dims.map((d) => dimTotals[d]).filter((v) => v !== null);
      if (vals.length > 1 && dailyTotal) { const sum = vals.reduce((a, v) => a + v, 0), k = sum / dailyTotal; if (k > 1.5) out.warnings.push({ channel: ch, code: 'suma_entre_dimensiones_excede_el_total', detail: `la suma de ${vals.length} dimensiones es ${k.toFixed(2)} × el total diario: las dimensiones NO son particiones sumables del universo (un visitante cuenta en cada una); no sumarlas.` }); }
    });
    return out;
  }

  FP.metricCatalog = { CATALOG, REQUIRED, get, check, reconcile, SESSIONS_POLICY, reconcileSessions, reconcileSessionsReport, contract: 'cc.metric_catalog/1' };
  if (typeof module === 'object' && module.exports) module.exports = FP.metricCatalog;
})(typeof window !== 'undefined' ? window : globalThis);
