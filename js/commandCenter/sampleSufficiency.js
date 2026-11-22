/**
 * sampleSufficiency.js — Criterio de suficiencia de muestra CONTEXTUAL `cc.sample/1` (Fase 4.1, P-08, D-03). Navegador (`FP.sampleSufficiency`) y Node (`module.exports`).
 *
 * No hay un umbral universal. La suficiencia depende de la OPERACIÓN (mostrar un dato observado · calcular una desviación · diagnosticar · estimar un impacto), del TIPO de métrica
 * (importe, conteo, tasa/razón de sumas), de la granularidad y del periodo. Cada resultado declara su BASE:
 *   «estructural»        — condición lógica (existe una observación; el plan es > 0; el denominador es > 0). No es un umbral estadístico.
 *   «criterio_repo:<id>» — un criterio que la aplicación YA usa, leído de su fuente (config) o declarado con su archivo de origen.
 *   «criterio_declarado» — un mínimo que quien llama aporta explícitamente (p. ej. aprobado por el negocio).
 *   «sin_criterio»       — no hay criterio aprobado: devuelve `no_evaluado` en lugar de inventar un umbral.
 * ESTADO: preparado para consumo; ningún módulo de la aplicación lo consume todavía (Fase 4.1).
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  const FP = (root.FP = root.FP || {}); FP.sampleSufficiency = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const OPERATIONS = ['show_observed', 'compute_deviation', 'diagnose', 'estimate_impact'];
  const METRIC_TYPES = ['amount', 'count', 'rate'];
  const STATUS = ['suficiente', 'parcial', 'insuficiente', 'no_evaluado'];
  /** Criterios que la aplicación ya usa (no se crean umbrales nuevos). `value` nulo = se lee de la configuración efectiva en tiempo de ejecución. */
  const CRITERIA = Object.freeze({
    forecast_min_days: Object.freeze({ id: 'forecast_min_days', config: 'forecast.minComparableDays', fallback: 5, where: 'js/config/config.js · js/forecast/forecastEngine.js (índice de forecast)', editable: true }),
    forecast_min_coverage: Object.freeze({ id: 'forecast_min_coverage', config: 'forecast.minWindowCoverage', fallback: 0.7, where: 'js/config/config.js · js/forecast/forecastEngine.js (cobertura de la ventana)', editable: true }),
    segment_min_sessions: Object.freeze({ id: 'segment_min_sessions', config: 'diagnostics.segmentMinVolume.minSessions', shareConfig: 'diagnostics.segmentMinVolume.minShare', where: 'js/config/config.js (diagnostics.segmentMinVolume): fuente única desde 4.2 (P-16); la leen trafficConversionEngine, segmentInsights y reportBuilder vía segmentMinSessions()', editable: false })
  });
  const cfgPath = (path) => { const FPc = root.FP && root.FP.config; return path.split('.').reduce((o, k) => (o ? o[k] : undefined), FPc); };
  /** Mínimo de sesiones para tratar un segmento por separado (P-16): el MAYOR entre el piso y la participación del tráfico `totalSessions` del contexto de quien llama. Sin copia local: lee FP.config. */
  function segmentMinSessions(totalSessions) {
    const c = CRITERIA.segment_min_sessions, floor = cfgPath(c.config), share = cfgPath(c.shareConfig);
    if (!fin(floor) || !fin(share)) throw new Error('segmentMinSessions requiere FP.config.diagnostics.segmentMinVolume (js/config/config.js) cargado antes.');
    return Math.max(floor, Math.ceil(share * (fin(totalSessions) ? totalSessions : 0)));
  }
  /** Texto de ayuda del mínimo de sesiones por segmento, generado de la MISMA configuración que usa el motor (P-16): evita que el texto diga una cosa y el motor otra. */
  function describeSegmentMin() {
    const c = CRITERIA.segment_min_sessions, floor = cfgPath(c.config), share = cfgPath(c.shareConfig);
    if (!fin(floor) || !fin(share)) throw new Error('describeSegmentMin requiere FP.config.diagnostics.segmentMinVolume (js/config/config.js) cargado antes.');
    const pct = Number((share * 100).toFixed(2)), nf = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return { minSessions: floor, minShare: share, text: `el mayor entre ${nf(floor)} y el ${pct} % del tráfico` };
  }
  const cfgValue = (c) => { const FPc = root.FP && root.FP.config; if (c.config && FPc) { const v = c.config.split('.').reduce((o, k) => (o ? o[k] : undefined), FPc); if (fin(v)) return v; } return c.fallback; };
  const R = (status, basis, reasons, extra) => Object.assign({ contract: 'cc.sample/1', status, basis, reasons: reasons || [], universalThreshold: false }, extra || {});

  /**
   * @param {object} x { operation, metricType, granularity?, periodDays?, daysCounted?, n?, plan?, denominator?, channelsExpected?, channelsWithData?, windowCoverage?,
   *                     usesForecastIndices?, methodVerifiable?, segmentSessions?, totalSessions? }
   * @param {object} [declared] { min:number } criterio aportado por quien llama (aprobado por el negocio)
   */
  function evaluate(x, declared) {
    if (!x || !OPERATIONS.includes(x.operation)) return R('no_evaluado', 'sin_criterio', ['operación no reconocida']);
    if (!METRIC_TYPES.includes(x.metricType)) return R('no_evaluado', 'sin_criterio', ['tipo de métrica no reconocido']);
    if (declared && fin(declared.min) && fin(x.n)) return R(x.n >= declared.min ? 'suficiente' : 'insuficiente', 'criterio_declarado', [`n = ${x.n}; mínimo declarado = ${declared.min}`], { n: x.n, min: declared.min });
    const days = fin(x.daysCounted) ? x.daysCounted : null, reasons = [];
    const coverage = fin(x.periodDays) && x.periodDays > 0 && days !== null ? Math.min(1, days / x.periodDays) : null;
    const channelsPartial = fin(x.channelsExpected) && fin(x.channelsWithData) && x.channelsWithData < x.channelsExpected;
    if (x.operation === 'show_observed') {
      return fin(x.n) && x.n >= 1 ? R('suficiente', 'estructural', ['existe al menos una observación válida: la venta observada válida se muestra siempre'], { coverage }) : R('insuficiente', 'estructural', ['no hay observaciones válidas']);
    }
    const dev = (() => {   // desviación: plan comparable > 0 y al menos un día contado; en tasas, denominador > 0
      if (x.metricType === 'rate' && !(fin(x.denominator) && x.denominator > 0)) return ['el denominador de la tasa es 0 o no existe'];
      if (x.metricType !== 'rate' && !(fin(x.plan) && x.plan > 0)) return ['no hay plan comparable mayor que 0'];
      if (!(days !== null && days >= 1)) return ['no hay días contados'];
      return [];
    })();
    if (x.operation === 'compute_deviation') {
      if (dev.length) return R('insuficiente', 'estructural', dev, { coverage });
      if (channelsPartial) return R('parcial', 'estructural', ['faltan canales con datos: el total no incluye todos los canales con plan'], { coverage });
      if (coverage !== null && coverage < 1) reasons.push('periodo parcial: la desviación es a la fecha, no del periodo completo');
      return R('suficiente', 'estructural', reasons, { coverage });
    }
    if (x.operation === 'diagnose') {
      if (dev.length) return R('insuficiente', 'estructural', dev, { coverage });
      if (x.metricType === 'rate' && fin(x.segmentSessions) && fin(x.totalSessions)) {
        const min = segmentMinSessions(x.totalSessions);
        return x.segmentSessions >= min ? R('suficiente', 'criterio_repo:segment_min_sessions', [`el segmento tiene ${x.segmentSessions} sesiones; mínimo del criterio = ${min}`], { min }) : R('insuficiente', 'criterio_repo:segment_min_sessions', [`el segmento tiene ${x.segmentSessions} sesiones; el criterio de la aplicación pide ${min}`], { min });
      }
      if (x.usesForecastIndices) {
        const cd = CRITERIA.forecast_min_days, cc = CRITERIA.forecast_min_coverage, md = cfgValue(cd), mc = cfgValue(cc);
        if (days < md) return R('insuficiente', 'criterio_repo:forecast_min_days', [`${days} días contados; el criterio de la aplicación pide ${md}`], { min: md });
        if (fin(x.windowCoverage) && x.windowCoverage < mc) return R('insuficiente', 'criterio_repo:forecast_min_coverage', [`cobertura ${Math.round(x.windowCoverage * 100)} %; el criterio pide ${Math.round(mc * 100)} %`], { min: mc });
        return R('suficiente', 'criterio_repo:forecast_min_days', [], { min: md, coverage });
      }
      return channelsPartial ? R('parcial', 'estructural', ['faltan canales con datos'], { coverage }) : R('no_evaluado', 'sin_criterio', ['no hay criterio aprobado de suficiencia de muestra para este diagnóstico (D-03): solo se verificó la condición estructural'], { structuralOk: true, coverage });
    }
    /* estimate_impact: exige desviación y diagnóstico suficientes, método verificable y, si es proyectado, los criterios de forecast de la aplicación */
    if (x.methodVerifiable === false) return R('insuficiente', 'estructural', ['sin metodología verificable']);
    if (dev.length) return R('insuficiente', 'estructural', dev, { coverage });
    if (channelsPartial) return R('parcial', 'estructural', ['faltan canales con datos: el impacto sería incompleto'], { coverage });
    const cd = CRITERIA.forecast_min_days, cc = CRITERIA.forecast_min_coverage, md = cfgValue(cd), mc = cfgValue(cc);
    if (days < md) return R('insuficiente', 'criterio_repo:forecast_min_days', [`${days} días contados; el criterio de la aplicación pide ${md}`], { min: md });
    if (fin(x.windowCoverage) && x.windowCoverage < mc) return R('insuficiente', 'criterio_repo:forecast_min_coverage', [`cobertura ${Math.round(x.windowCoverage * 100)} %; el criterio pide ${Math.round(mc * 100)} %`], { min: mc });
    return R('suficiente', 'criterio_repo:forecast_min_days', [], { min: md, coverage });
  }
  return { contract: 'cc.sample/1', OPERATIONS, METRIC_TYPES, STATUS, CRITERIA, evaluate, segmentMinSessions, describeSegmentMin };
});
