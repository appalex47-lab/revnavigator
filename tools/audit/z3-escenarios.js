/**
 * z3-escenarios.js — Escenarios de Z3 «Qué merece atención» (Subfase 3.3): ENTRADAS y COMPORTAMIENTO ESPERADO.
 * Los hallazgos se construyen con el contrato real de Fase 2 (`cc.finding`) y los impactos con los constructores reales de `js/economics/impactModel.js`
 * (`makeImpact`): no se escribe ningún importe de contribución a mano. El comportamiento esperado (`expect`) se razonó desde las decisiones D-02 y D-03,
 * la aclaración B de 3.1 (§6, §7) y los contratos de Fase 2, ANTES de ejecutar la especificación.
 * Origen de los datos: los importes de brecha y cierre del catálogo base son los del motor con los datos de demostración desviados (−$722,816; los mismos del
 * escenario 2 de Z1); todo lo demás es ILUSTRATIVO. Ninguno es un dato real de FESA.
 */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('../../js/economics/impactModel.js')); else root.CCZ3Scenarios = factory(root.FP && root.FP.economics); })(typeof window !== 'undefined' ? window : globalThis, function (ECON) {
  'use strict';
  const MARGIN = { marginEnabled: true, grossMarginPct: 25, updatedAt: '2026-11-01T00:00:00Z', source: 'manual' };
  const P = '2026-09';
  const ev = (o) => ({ class: 'calculo', text: 'Venta real $15,233,994 contra plan $15,956,810.', numbers: [15233994, 15956810], source: { module: 'pacing', field: 'toDate.revenue' }, headline: true, ...o });
  const basis = (scope = 'total') => ({ period: P, scope, indicator: 'revenue' });
  const imp = (spec, margin) => ECON.makeImpact(spec, margin);
  const F = (o = {}) => ({ schema: 'cc.finding', version: 1, id: 'x:base', type: 'deviation', title: 'La venta acumulada está por debajo del plan', description: 'La venta acumulada queda por debajo del plan de los mismos días.',
    scope: { level: 'total', channel: 'total' }, period: { type: 'month', key: P, comparison: 'plan' }, indicator: 'revenue', observed: { value: 15233994, unit: 'MXN' }, reference: { value: 15956810, basis: 'plan de los mismos días' },
    evidence: [ev()], rule: { id: 'pacing.gap', family: 'gap', version: 1 }, certainty: { level: 'calculo', support: 'alto', basis: 'Alto: ≥ 90 % de días comparados y datos sin avisos.' },
    severity: 'importante', limitations: [], validity: { status: 'activo', firstSeen: '2026-09-20', lastSeen: '2026-09-22', expiresWhen: 'cierra el periodo o la brecha se resuelve' },
    lineage: [{ engine: 'attentionEngine', id: 'gap', role: 'origin', family: 'atencion' }], economics: null, economicsReason: 'sin cuantificar', ...o });

  /* ---------- catálogo de elementos (m = margen o undefined) ---------- */
  const K = (m) => ({
    gap: F({ id: 'x:gap', economics: imp({ id: 'gap_to_date', category: 'brecha', provenance: 'observed', amount: { point: -722816.17 }, method: { id: 'gap', formula: 'real − plan (mismos días contados)', engine: 'gap.calculateGap' }, basis: basis(), overlapGroup: 'brecha_del_periodo' }, m), economicsReason: undefined }),
    canal: F({ id: 'x:canal', title: 'Ecommerce concentra la brecha', description: 'Ecommerce queda por debajo de su plan de los mismos días.', scope: { level: 'channel', channel: 'ecommerce' }, rule: { id: 'attention.channel', family: 'channel_ecommerce', version: 1 },
      evidence: [ev({ text: 'Ecommerce: venta real por debajo de su plan a la fecha.', numbers: [650000], source: { module: 'pacing', field: 'channels.ecommerce.toDate' } })],
      economics: imp({ id: 'gap_ecommerce', category: 'brecha', provenance: 'observed', amount: { point: -650000 }, method: { id: 'gap', formula: 'real − plan (mismos días contados)', engine: 'gap.calculateGap' }, basis: basis('ecommerce'), overlapGroup: 'brecha_del_periodo' }, m), economicsReason: undefined }),
    driver: F({ id: 'x:driver', title: 'La conversión explica la mayor parte de la brecha', description: 'Contribución matemática de la conversión a la brecha; no es una causa demostrada.', indicator: 'conversionRate', severity: 'seguimiento',
      rule: { id: 'attention.driver', family: 'driver_cr', version: 1 }, certainty: { level: 'driver', support: 'alto', basis: 'Atribución secuencial con base comparable.' },
      evidence: [ev({ class: 'driver', text: 'Contribución de la conversión a la brecha.', numbers: [-480000], source: { module: 'attribution', field: 'attributeSegment.cr' } }), { class: 'hipotesis', text: 'Un cambio en el proceso de compra podría estar bajando la conversión.', numbers: [], source: { module: 'attentionEngine', field: 'hypothesis' }, validation: 'Comparar el embudo por semana.' }],
      limitations: ['La contribución es matemática: no demuestra causa.'], economicsReason: 'La contribución de un driver se presenta en «Qué ocurrió y por qué», no como impacto propio (evita doble conteo con la brecha).' }),
    riesgo: F({ id: 'x:riesgo', type: 'risk', title: 'El cierre proyectado queda por debajo de la meta', description: 'Al ritmo actual, el cierre del periodo no alcanzaría la meta.', severity: 'critica', rule: { id: 'attention.forecast', family: 'forecast', version: 1 },
      certainty: { level: 'estimacion', support: 'alto', basis: 'Proyección del pronóstico con el ritmo observado.' }, limitations: ['Es una proyección: depende de que el ritmo se mantenga.'],
      evidence: [ev({ class: 'estimacion', text: 'Cierre proyectado $21,051,894 contra meta $21,774,710.', numbers: [21051894, 21774710], source: { module: 'forecastEngine', field: 'run.total.close' } })],
      economics: imp({ id: 'forecast_gap', category: 'en_riesgo', provenance: 'projected', amount: { point: -722816.17 }, method: { id: 'forecast_gap', formula: 'cierre proyectado − meta', engine: 'forecastEngine.runForecast' }, basis: basis(), horizon: 'cierre del periodo', assumptions: ['El ritmo observado se mantiene hasta el cierre.'] }, m), economicsReason: undefined }),
    rec1: F({ id: 'x:rec1', type: 'opportunity', title: 'Recuperar la brecha elevando la conversión', description: 'Alternativa estimada: elevar la conversión podría cerrar la brecha del periodo.', indicator: 'conversionRate', rule: { id: 'recovery.option', family: 'recovery_cr', version: 1 },
      certainty: { level: 'estimacion', support: 'alto', basis: 'Escenario de recuperación con restricciones declaradas.' }, limitations: ['Depende de palancas que el negocio controla; no es un resultado obtenido.'],
      evidence: [ev({ class: 'estimacion', text: 'Alternativa de recuperación por conversión.', numbers: [722816], source: { module: 'recoveryEngine', field: 'recoveryOptions.cr' } })],
      economics: imp({ id: 'recoverable_cr', category: 'alcanzable', provenance: 'projected', amount: { point: 722816.17 }, method: { id: 'recovery_option', formula: 'venta incremental de la alternativa que cierra la brecha', engine: 'recoveryEngine.recoveryOptions' }, basis: basis(), horizon: 'resto del periodo', constraintsBasis: 'restricciones declaradas en el escenario de recuperación', exclusiveGroup: 'recovery_same_gap', assumptions: ['Alternativa «conversión»: cierra la misma brecha que las demás alternativas (no se suman).'] }, m), economicsReason: undefined }),
    rec2: F({ id: 'x:rec2', type: 'opportunity', title: 'Recuperar la brecha elevando las sesiones', description: 'Alternativa estimada: más sesiones podrían cerrar la brecha del periodo.', indicator: 'sessions', rule: { id: 'recovery.option', family: 'recovery_traffic', version: 1 },
      certainty: { level: 'estimacion', support: 'alto', basis: 'Escenario de recuperación con restricciones declaradas.' }, limitations: ['Depende de palancas que el negocio controla; no es un resultado obtenido.'],
      evidence: [ev({ class: 'estimacion', text: 'Alternativa de recuperación por sesiones.', numbers: [760000], source: { module: 'recoveryEngine', field: 'recoveryOptions.traffic' } })],
      economics: imp({ id: 'recoverable_traffic', category: 'alcanzable', provenance: 'projected', amount: { point: 760000 }, method: { id: 'recovery_option', formula: 'venta incremental de la alternativa que cierra la brecha', engine: 'recoveryEngine.recoveryOptions' }, basis: basis(), horizon: 'resto del periodo', constraintsBasis: 'restricciones declaradas en el escenario de recuperación', exclusiveGroup: 'recovery_same_gap', assumptions: ['Alternativa «sesiones»: cierra la misma brecha que las demás alternativas (no se suman).'] }, m), economicsReason: undefined }),
    potencial: F({ id: 'x:potencial', type: 'opportunity', title: 'Escenario de mayor ticket promedio', description: 'Potencial teórico si el ticket promedio subiera según el escenario guardado.', indicator: 'aov', severity: 'seguimiento', rule: { id: 'scenario.sim', family: 'scenario_aov', version: 1 },
      certainty: { level: 'estimacion', support: 'medio', basis: 'Escenario simulado; no considera restricciones.' }, limitations: ['Potencial teórico: no descuenta restricciones ni capacidad.'],
      evidence: [ev({ class: 'estimacion', text: 'Venta incremental del escenario simulado.', numbers: [1200000], source: { module: 'scenarioEngine', field: 'simulate.incremental.revenue' } })],
      economics: imp({ id: 'potential_sales', category: 'potencial_teorico', provenance: 'projected', amount: { point: 1200000 }, method: { id: 'scenario_incremental', formula: 'venta del escenario − venta base', engine: 'scenarioEngine.simulate' }, basis: basis(), horizon: 'periodo', assumptions: ['El ticket promedio del escenario se cumple.'] }, m), economicsReason: undefined }),
    datoCritico: F({ id: 'x:meta', type: 'finding', title: 'Falta la meta anual definida', description: 'Sin la meta anual no se puede valorar el cumplimiento del año.', indicator: 'target', severity: 'critica', rule: { id: 'attention.data', family: 'data_meta', version: 1 },
      certainty: { level: 'hecho', support: 'alto', basis: 'Verificación directa de la configuración.' }, observed: { value: null, unit: 'MXN' }, reference: { value: null, basis: 'meta anual' },
      evidence: [ev({ class: 'hecho', text: 'No hay meta anual capturada.', numbers: [], source: { module: 'contextEngine', field: 'requirements.annualTarget' } })], economicsReason: 'Un faltante de datos no tiene impacto en ventas propio.' }),
    datoAviso: F({ id: 'x:calidad', type: 'finding', title: 'Los datos traen avisos de calidad', description: 'Hay registros con avisos que no se excluyeron.', indicator: 'dataQuality', severity: 'seguimiento', rule: { id: 'attention.data', family: 'data_calidad', version: 1 },
      certainty: { level: 'hecho', support: 'alto', basis: 'Conteo de avisos de validación.' }, observed: { value: 3, unit: 'registros' }, reference: { value: 0, basis: 'sin avisos' },
      evidence: [ev({ class: 'hecho', text: 'Tres registros con avisos de calidad.', numbers: [3], source: { module: 'quality', field: 'validation.issues' } })], economicsReason: 'Un aviso de datos no tiene impacto en ventas propio.' }),
    hipotesis: F({ id: 'x:hip', type: 'risk', title: 'La conversión de App podría estar deteriorándose', description: 'Señal por confirmar: podría haber un deterioro en App; falta validar con más días.', scope: { level: 'channel', channel: 'app' }, indicator: 'conversionRate', rule: { id: 'analista.detector', family: 'pattern_app_cr', version: 1 },
      certainty: { level: 'hipotesis', support: 'bajo', basis: 'Pocos días comparados; no demuestra tendencia.' }, limitations: ['Pocos días de datos.'],
      evidence: [ev({ class: 'hipotesis', text: 'Posible deterioro de la conversión en App.', numbers: [], source: { module: 'analistaDetectors', field: 'pattern' }, validation: 'Revisar la conversión de App con dos semanas más.' })],
      lineage: [{ engine: 'analistaDetectors', id: 'app_cr', role: 'origin', family: 'agentes' }], economicsReason: 'Sin datos suficientes para cuantificar.' }),
    sinImporte: F({ id: 'x:sinimp', type: 'opportunity', title: 'Recuperación por ticket promedio', description: 'Alternativa estimada por ticket promedio; el escenario no devolvió importe.', indicator: 'aov', rule: { id: 'recovery.option', family: 'recovery_aov', version: 1 },
      certainty: { level: 'estimacion', support: 'medio', basis: 'Escenario de recuperación incompleto.' }, limitations: ['El escenario no devolvió venta incremental.'],
      evidence: [ev({ class: 'estimacion', text: 'Alternativa de recuperación por ticket.', numbers: [], source: { module: 'recoveryEngine', field: 'recoveryOptions.aov' } })],
      economics: imp({ id: 'recoverable_aov', category: 'alcanzable', status: 'insufficient_data', amount: null, reason: 'La alternativa no devolvió venta incremental.', provenance: 'projected', method: { id: 'recovery_option', formula: 'venta incremental de la alternativa que cierra la brecha', engine: 'recoveryEngine.recoveryOptions' }, basis: basis(), horizon: 'resto del periodo', assumptions: [], constraintsBasis: 'restricciones declaradas' }, m), economicsReason: undefined })
  });
  const base7 = (m) => { const k = K(m); return [k.gap, k.canal, k.driver, k.riesgo, k.rec1, k.rec2, k.potencial]; };
  const REL = (level) => ({ level });
  const S = (n, id, titulo, input, expect) => ({ n, id, titulo, origen: 'ilustrativo (importes de brecha y cierre del motor con datos de demostración; el resto, inventado para ejercitar la regla)', input, expect });
  const k0 = K(undefined), kM = K(MARGIN);

  const SCENARIOS = [
    S(1, 'completo-alta', 'Las tres clases con confiabilidad alta', { findings: base7(undefined), reliability: REL('Alta') },
      { mode: 'completo', status: 'con_elementos', header: '3 de 7', featuredFamilies: ['forecast_close', 'recovery_traffic', 'pacing_gap'], featuredClasses: ['riesgo', 'oportunidad', 'hallazgo'], counts: { total: 7, hallazgo: 3, riesgo: 1, oportunidad: 3 }, seeAll: true, withheld: 0,
        totals: { riesgo: [['en_riesgo', -722816.17, -722816.17]], oportunidad: [['alcanzable', 722816.17, 760000], ['potencial_teorico', 1200000, 1200000]], hallazgo: [] }, totalsOverlap: { hallazgo: ['brecha'] }, contribution: 'no_configurado', dataPanel: false }),
    S(2, 'completo-media', 'Las tres clases con confiabilidad media', { findings: base7(undefined), reliability: REL('Media') },
      { mode: 'completo', status: 'con_elementos', header: '3 de 7', featuredClasses: ['riesgo', 'oportunidad', 'hallazgo'], counts: { total: 7, hallazgo: 3, riesgo: 1, oportunidad: 3 }, seeAll: true, withheld: 0, dataPanel: false }),
    S(3, 'baja-solo-observado', 'Confiabilidad baja: solo lo observado', { findings: base7(undefined), reliability: REL('Baja'), missing: [{ label: 'Corregir las filas rechazadas de la carga', view: 'calidad' }] },
      { mode: 'solo_observado', status: 'con_elementos', header: '3 de 3', featuredClasses: ['hallazgo', 'hallazgo', 'hallazgo'], counts: { total: 3, hallazgo: 3, riesgo: 0, oportunidad: 0 }, seeAll: false, withheld: 4, withheldByClass: { riesgo: 1, oportunidad: 3 }, noTotals: true, notice: true, dataPanel: true }),
    S(4, 'insuficiente-solo-datos', 'Confiabilidad insuficiente: solo los datos que faltan', { findings: [...base7(undefined), k0.datoCritico, k0.datoAviso], reliability: REL('Insuficiente'), missing: [{ label: 'Definir la meta anual', view: 'metas' }] },
      { mode: 'solo_datos', status: 'con_elementos', header: '2 de 2', featuredFamilies: ['data:meta', 'data:calidad'], counts: { total: 2, hallazgo: 2, riesgo: 0, oportunidad: 0 }, seeAll: false, withheld: 7, noTotals: true, notice: true, dataPanel: true }),
    S(5, 'vacio', 'Sin elementos que destacar', { findings: [], reliability: REL('Alta') },
      { mode: 'completo', status: 'vacio', header: null, counts: { total: 0, hallazgo: 0, riesgo: 0, oportunidad: 0 }, seeAll: false, withheld: 0, empty: true, dataPanel: false }),
    S(6, 'diversidad-de-clases', 'La portada no se llena con una sola clase', { reliability: REL('Alta'), findings: [k0.gap, k0.canal,
      F({ id: 'x:h3', title: 'App queda por debajo de su plan', description: 'App queda por debajo de su plan de los mismos días.', scope: { level: 'channel', channel: 'app' }, rule: { id: 'attention.channel', family: 'channel_app', version: 1 }, economics: imp({ id: 'gap_app', category: 'brecha', provenance: 'observed', amount: { point: -400000 }, method: { id: 'gap', formula: 'real − plan', engine: 'gap.calculateGap' }, basis: basis('app') }), economicsReason: undefined }),
      F({ id: 'x:h4', title: 'WhatsApp queda por debajo de su plan', description: 'WhatsApp queda por debajo de su plan de los mismos días.', scope: { level: 'channel', channel: 'whatsapp' }, rule: { id: 'attention.channel', family: 'channel_whatsapp', version: 1 }, economics: imp({ id: 'gap_wa', category: 'brecha', provenance: 'observed', amount: { point: -300000 }, method: { id: 'gap', formula: 'real − plan', engine: 'gap.calculateGap' }, basis: basis('whatsapp') }), economicsReason: undefined }),
      { ...k0.riesgo, severity: 'importante', economics: imp({ id: 'forecast_gap', category: 'en_riesgo', provenance: 'projected', amount: { point: -100000 }, method: { id: 'forecast_gap', formula: 'cierre proyectado − meta', engine: 'forecastEngine.runForecast' }, basis: basis(), horizon: 'cierre del periodo', assumptions: ['El ritmo observado se mantiene hasta el cierre.'] }) }] },
      { mode: 'completo', status: 'con_elementos', header: '3 de 5', featuredFamilies: ['pacing_gap', 'channel_lag:ecommerce', 'forecast_close'], featuredClasses: ['hallazgo', 'hallazgo', 'riesgo'], diversified: true, counts: { total: 5, hallazgo: 4, riesgo: 1, oportunidad: 0 }, seeAll: true, withheld: 0 }),
    S(7, 'respaldo-bajo-no-desplaza', 'Un elemento con respaldo bajo no desplaza a uno mejor sustentado', { reliability: REL('Alta'), findings: [k0.gap,
      { ...k0.rec2, certainty: { level: 'estimacion', support: 'bajo', basis: 'Escenario con pocos días de datos.' }, economics: imp({ id: 'recoverable_traffic', category: 'alcanzable', provenance: 'projected', amount: { point: 5000000 }, method: { id: 'recovery_option', formula: 'venta incremental', engine: 'recoveryEngine.recoveryOptions' }, basis: basis(), horizon: 'resto del periodo', constraintsBasis: 'restricciones declaradas', assumptions: ['Supuesto de sesiones.'] }) },
      { ...k0.hipotesis, severity: 'importante' }] },
      { mode: 'completo', status: 'con_elementos', header: '3 de 3', featuredFamilies: ['pacing_gap', 'recovery_traffic', 'pattern:app_cr'], counts: { total: 3, hallazgo: 1, riesgo: 1, oportunidad: 1 }, lowSupportTagged: 2, seeAll: false, withheld: 0 }),
    S(8, 'bloqueo-de-datos-primero', 'Lo que bloquea el análisis va primero', { reliability: REL('Media'), findings: [k0.riesgo, k0.gap, k0.datoCritico, k0.rec1] },
      { mode: 'completo', status: 'con_elementos', header: '3 de 4', featuredFamilies: ['data:meta', 'forecast_close', 'pacing_gap'], counts: { total: 4, hallazgo: 2, riesgo: 1, oportunidad: 1 }, seeAll: true, withheld: 0 }),
    S(9, 'duplicados', 'El mismo hallazgo dicho por dos motores es uno solo', { reliability: REL('Alta'), findings: [k0.gap, { ...k0.gap, id: 'x:gap-agente', rule: { id: 'analista.cae', family: 'pacing_gap', version: 1 }, lineage: [{ engine: 'analistaDetectors', id: 'cae', role: 'origin', family: 'agentes' }] }, k0.riesgo] },
      { mode: 'completo', status: 'con_elementos', header: '2 de 2', counts: { total: 2, hallazgo: 1, riesgo: 1, oportunidad: 0 }, lineageOf: ['pacing_gap', 2], seeAll: false, withheld: 0 }),
    S(10, 'rechazados-por-contrato', 'Lo que no cumple el contrato no se muestra', { reliability: REL('Alta'), findings: [k0.gap,
      { ...k0.canal, id: 'x:sin-fuente', evidence: [ev({ source: null })] },
      { ...k0.rec1, id: 'x:oportunidad-como-hecho', certainty: { level: 'calculo', support: 'alto', basis: 'x' }, evidence: [ev({ class: 'calculo' })] },
      { ...k0.canal, id: 'x:roi', scope: { level: 'channel', channel: 'app' }, title: 'El ROI de App cae', description: 'El ROI de App cae contra el plan.' },
      { ...k0.potencial, id: 'x:observado-en-oportunidad', economics: imp({ id: 'obs', category: 'observado', provenance: 'observed', amount: { point: 900000 }, method: { id: 'obs', formula: 'venta real', engine: 'gap.calculateGap' }, basis: basis() }) },
      { ...k0.riesgo, id: 'x:riesgo-con-venta-recuperable', economics: k0.rec1.economics }] },
      { mode: 'completo', status: 'con_elementos', header: '1 de 1', counts: { total: 1, hallazgo: 1, riesgo: 0, oportunidad: 0 }, rejected: 5, seeAll: false, withheld: 0 }),
    S(11, 'con-margen', 'Impacto con margen configurado', { findings: base7(MARGIN), reliability: REL('Alta') },
      { mode: 'completo', status: 'con_elementos', header: '3 de 7', counts: { total: 7, hallazgo: 3, riesgo: 1, oportunidad: 3 }, contribution: 'disponible', contributionOf: ['forecast_close', -180704.0425], seeAll: true, withheld: 0 }),
    S(12, 'resueltos-y-vigilancia', 'Resueltos fuera de la portada; en vigilancia, rotulados', { reliability: REL('Alta'), findings: [k0.gap, { ...k0.canal, validity: { ...k0.canal.validity, status: 'resuelto' } }, { ...k0.riesgo, validity: { ...k0.riesgo.validity, status: 'vigilancia' } }] },
      { mode: 'completo', status: 'con_elementos', header: '2 de 2', counts: { total: 2, hallazgo: 1, riesgo: 1, oportunidad: 0 }, closed: 1, vigilanciaTagged: 1, seeAll: false, withheld: 0 }),
    S(13, 'impacto-sin-datos', 'Impacto con datos insuficientes: se dice, no se pinta cero', { reliability: REL('Alta'), findings: [k0.rec1, k0.sinImporte, k0.hipotesis] },
      { mode: 'completo', status: 'con_elementos', header: '3 de 3', counts: { total: 3, hallazgo: 0, riesgo: 1, oportunidad: 2 }, impactStatusOf: { 'recovery_aov': 'datos_insuficientes', 'pattern:app_cr': 'no_aplica' }, excludedInTotals: 1, seeAll: false, withheld: 0 }),
    S(14, 'baja-sin-hallazgos', 'Confiabilidad baja y solo hay conclusiones: no se muestra nada', { reliability: REL('Baja'), findings: [k0.riesgo, k0.rec1], missing: [] },
      { mode: 'solo_observado', status: 'sin_conclusiones', header: null, counts: { total: 0, hallazgo: 0, riesgo: 0, oportunidad: 0 }, withheld: 2, noTotals: true, notice: true, dataPanel: true, empty: true, seeAll: false })
  ];

  const famOf = (c) => c.family;
  /** Compara la salida con lo esperado; devuelve la lista de diferencias (vacía = coincide). */
  function check(Z, s) {
    const o = Z.build(s.input), e = s.expect, f = [], w = (m) => f.push(`${s.n} ${s.id}: ${m}`), byFam = (fam) => o.cards.find((c) => c.family === fam);
    if (o.mode !== e.mode) w(`modo ${o.mode} ≠ ${e.mode}`);
    if (o.status !== e.status) w(`estado ${o.status} ≠ ${e.status}`);
    if (o.header !== e.header) w(`cabecera ${o.header} ≠ ${e.header}`);
    Object.entries(e.counts).forEach(([k, v]) => { if (o.counts[k] !== v) w(`conteo ${k} ${o.counts[k]} ≠ ${v}`); });
    const feat = o.featured.map((id) => o.cards.find((c) => c.id === id));
    if (e.featuredFamilies && feat.map(famOf).join() !== e.featuredFamilies.join()) w(`destacados ${feat.map(famOf)} ≠ ${e.featuredFamilies}`);
    if (e.featuredClasses && feat.map((c) => c.clase).join() !== e.featuredClasses.join()) w(`clases destacadas ${feat.map((c) => c.clase)} ≠ ${e.featuredClasses}`);
    if (e.seeAll !== undefined && o.seeAll.visible !== e.seeAll) w(`«Ver todos» visible ${o.seeAll.visible} ≠ ${e.seeAll}`);
    if (o.withheld.count !== e.withheld) w(`retenidos ${o.withheld.count} ≠ ${e.withheld}`);
    if (e.withheldByClass) Object.entries(e.withheldByClass).forEach(([k, v]) => { if (o.withheld.byClass[k] !== v) w(`retenidos de ${k} ${o.withheld.byClass[k]} ≠ ${v}`); });
    if (e.diversified !== undefined && !!o.diversified !== e.diversified) w(`diversificación ${!!o.diversified} ≠ ${e.diversified}`);
    if (e.notice && !o.notice) w('debe avisar que la confiabilidad limita lo que se muestra');
    if (e.empty && !o.empty) w('debe traer el mensaje de vacío');
    if (e.dataPanel !== undefined && o.dataPanel.visible !== e.dataPanel) w(`panel «Qué falta» visible ${o.dataPanel.visible} ≠ ${e.dataPanel}`);
    if (e.noTotals && Object.values(o.totals).some((t) => t.lines.length)) w('sin conclusiones no debe haber totales');
    if (e.totals) Object.entries(e.totals).forEach(([cls, lines]) => lines.forEach(([cat, lo, hi]) => { const l = o.totals[cls].lines.find((x) => x.category === cat); if (!l || Math.abs(l.low - lo) > 1e-6 || Math.abs(l.high - hi) > 1e-6) w(`total ${cls}/${cat} ${l && [l.low, l.high]} ≠ ${[lo, hi]}`); }));
    if (e.totalsOverlap) Object.entries(e.totalsOverlap).forEach(([cls, cats]) => cats.forEach((cat) => { const l = o.totals[cls].lines.find((x) => x.category === cat); if (!l || !l.overlap || l.display !== null || l.point !== null) w(`el total ${cls}/${cat} tiene superposición: no debe mostrar cifra`); }));
    if (e.contribution) { const c = byFam('forecast_close'); if (!c || c.impact.contribution.status !== e.contribution) w(`contribución ${c && c.impact.contribution.status} ≠ ${e.contribution}`); }
    if (e.contributionOf) { const c = byFam(e.contributionOf[0]); if (!c || Math.abs(c.impact.contribution.point - e.contributionOf[1]) > 1e-6) w(`contribución de ${e.contributionOf[0]} ${c && c.impact.contribution.point} ≠ ${e.contributionOf[1]}`); }
    if (e.rejected !== undefined && o.rejected.length !== e.rejected) w(`rechazados ${o.rejected.length} ≠ ${e.rejected}`);
    if (e.closed !== undefined && o.closed.count !== e.closed) w(`cerrados ${o.closed.count} ≠ ${e.closed}`);
    if (e.lineageOf) { const c = byFam(e.lineageOf[0]); if (!c || c.lineage.length !== e.lineageOf[1]) w(`linaje de ${e.lineageOf[0]} ${c && c.lineage.length} ≠ ${e.lineageOf[1]}`); }
    if (e.lowSupportTagged !== undefined && o.cards.filter((c) => c.tags.some((t) => /Respaldo bajo/.test(t))).length !== e.lowSupportTagged) w('los elementos con respaldo bajo deben ir rotulados');
    if (e.vigilanciaTagged !== undefined && o.cards.filter((c) => c.tags.some((t) => /vigilancia/i.test(t))).length !== e.vigilanciaTagged) w('los elementos en vigilancia deben ir rotulados');
    if (e.impactStatusOf) Object.entries(e.impactStatusOf).forEach(([fam, st]) => { const c = byFam(fam); if (!c || c.impact.status !== st) w(`impacto de ${fam} ${c && c.impact.status} ≠ ${st}`); });
    if (e.excludedInTotals !== undefined && o.totals.oportunidad.excluded.length !== e.excludedInTotals) w(`excluidos del total ${o.totals.oportunidad.excluded.length} ≠ ${e.excludedInTotals}`);
    return f;
  }
  return { SCENARIOS, MARGIN, K, F, ev, imp, basis, base7, REL, check };
});
