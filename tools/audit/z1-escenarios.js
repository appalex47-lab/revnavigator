/**
 * z1-escenarios.js — Los 14 escenarios obligatorios de Z1 (Subfase 3.2) y 4 adicionales: ENTRADAS y COMPORTAMIENTO ESPERADO.
 * El comportamiento esperado (`expect`) se razonó a partir de los contratos aceptados de Fase 2 (umbrales de classifyBusinessState: cumplimiento ≥ 1.01 «arriba»,
 * ≥ 0.99 «en plan»; crecimiento ≥ +3 % «crece», ≤ −3 % «cae», |x| < 1 % «plano»; cierre < 99 % «riesgo»; taxonomía de attributeSegment) y de las decisiones
 * D-01 a D-06 de la Subfase 3.2. NO se copió de la salida de la especificación: así la prueba compara la especificación contra la intención.
 *
 * Origen de los datos (se distingue en el documento y en el wireframe):
 *   «motor»        cumplimiento, brecha y cierre que entregó el motor real con los datos de demostración desviados (solo el escenario 2);
 *   «ilustrativo»  valores inventados para ejercitar una regla; NO son resultados de ningún motor;
 * Los resultados de pruebas y la salida de la especificación se calculan al generar los artefactos (z1-generar-artefactos.js).
 */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.CCZ1Scenarios = factory(); })(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const period = (o = {}) => ({ label: 'Septiembre 2026', cutoff: '22 sep 2026', daysCounted: 22, daysTotal: 30, ...o });
  const COMP = (status, growthPct, deltaRevenue, baseRevenue) => ({ status, label: 'agosto 2026 (mismos días)', growthPct, deltaRevenue, baseRevenue });
  const REL = (o = {}) => ({ support: 'alto', coverage: 1, warnings: [], blocking: [], dataErrors: false, ...o });
  const ACT = (sessions, orders, revenue) => ({ sessions, orders, revenue });
  const MARGIN = { marginEnabled: true, grossMarginPct: 25, updatedAt: '2026-11-01T00:00:00Z', source: 'manual' };
  const rev = (plan, actual) => ({ planToDate: plan, actualToDate: actual, gap: actual - plan, compliance: plan ? actual / plan : null, gapPct: plan ? actual / plan - 1 : null });
  const fc = (target, close) => ({ target, close, gapPct: target ? close / target - 1 : null });
  const base = (o) => ({ period: period(), plan: { available: true }, findings: [], concentration: false, margin: undefined, ...o });
  const S = (n, id, titulo, origen, input, expect, extra = {}) => ({ n, id, titulo, origen, input, expect, ...extra });

  const SCENARIOS = [
    S(1, 'positivo-alta', 'Desempeño positivo con confiabilidad alta', 'ilustrativo',
      base({ revenue: rev(10000000, 10600000), activity: ACT(480000, 9600, 10600000), forecast: fc(15000000, 15900000), comparable: COMP('ok', 0.08, 785000, 9812500), reliability: REL(), margin: MARGIN }),
      { level: 'Alta', mode: 'definitiva', state: 'creciendo', stateShown: true, comparability: 'valida', verdictKind: 'creciendo', protagonist: 'brecha', direction: 'por_encima', observed: true, gapVisible: true, contribution: 'disponible', contributionAmount: 150000, contributionDetailOnly: true, diagnosis: 'disponible', hide: ['condicion', 'alcance'], show: ['evolucion', 'cierre', 'contribucion', 'economico'] }),
    S(2, 'negativo-alta', 'Desempeño negativo con confiabilidad alta', 'motor (cumplimiento, brecha y cierre con los datos de demostración desviados); evolución y confiabilidad ilustrativas',
      base({ revenue: { planToDate: 15956810, actualToDate: 15233993.8272, gap: -722816.1728, compliance: 0.9547017121341922, gapPct: -0.045298287865807814 }, activity: ACT(1120000, 21400, 15233993.8272), forecast: { target: 21774710, close: 21051893.8272, gapPct: -0.03319521466876026 },
        comparable: COMP('ok', -0.004, -61000, 15295000), reliability: REL(), concentration: true }),
      { level: 'Alta', mode: 'definitiva', state: 'riesgo_cumplimiento', stateShown: true, qualifiers: ['cierre_en_riesgo', 'concentracion_en_un_canal'], comparability: 'valida', verdictKind: 'riesgo_cumplimiento', protagonist: 'brecha', direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'no_configurado', diagnosis: 'disponible', hide: ['condicion', 'alcance'], show: ['evolucion', 'cierre', 'contribucion'] }),
    S(3, 'estable-alta', 'Desempeño estable con confiabilidad alta', 'ilustrativo',
      base({ revenue: rev(8000000, 8024000), activity: ACT(390000, 7700, 8024000), forecast: fc(12000000, 12048000), comparable: COMP('ok', 0.002, 16000, 8008000), reliability: REL() }),
      { level: 'Alta', mode: 'definitiva', state: 'saludable', stateShown: true, comparability: 'valida', verdictKind: 'saludable', protagonist: 'brecha', direction: 'en_linea', observed: true, gapVisible: true, contribution: 'no_configurado', diagnosis: 'disponible', hide: ['condicion', 'alcance'], show: ['evolucion', 'cierre'] }),
    S(4, 'positivo-media', 'Desempeño positivo con confiabilidad media', 'ilustrativo',
      base({ revenue: rev(12000000, 12480000), activity: ACT(560000, 11000, 12480000), forecast: fc(18000000, 18600000), comparable: COMP('ok', 0.06, 705000, 11775000), reliability: REL({ support: 'medio', coverage: 0.75, warnings: ['Los datos traen avisos de calidad (12 registros).'] }), margin: MARGIN }),
      { level: 'Media', mode: 'con_avisos', state: 'creciendo', stateShown: true, qualifiers: ['datos_con_avisos'], comparability: 'valida', verdictKind: 'creciendo', protagonist: 'brecha', direction: 'por_encima', observed: true, gapVisible: true, contribution: 'disponible', contributionAmount: 120000, contributionDetailOnly: true, visibleReasons: true, diagnosis: 'con_reservas', show: ['condicion', 'alcance', 'evolucion', 'cierre', 'contribucion'] }),
    S(5, 'negativo-baja', 'Desempeño negativo con confiabilidad baja', 'ilustrativo',
      base({ revenue: rev(9000000, 8370000), activity: ACT(420000, 8100, 8370000), forecast: fc(13500000, 12600000), comparable: COMP('ok', -0.02, -170000, 8540000), reliability: REL({ support: 'bajo', coverage: 0.8, dataErrors: true }), margin: MARGIN }),
      { level: 'Baja', mode: 'preliminar', state: 'riesgo_cumplimiento', stateShown: false, comparability: 'valida', verdictKind: 'preliminar', protagonist: 'brecha', protagonistPreliminary: true, direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'disponible', contributionAmount: -157500, contributionDetailOnly: true, contributionPreliminary: true, visibleReasons: true, diagnosis: 'no_concluyente', hide: ['cierre', 'evolucion'], show: ['condicion', 'alcance', 'contribucion', 'economico'] }),
    S(6, 'datos-insuficientes', 'Datos insuficientes', 'ilustrativo',
      base({ period: period({ daysCounted: 3 }), revenue: rev(2000000, 400000), activity: ACT(26000, 480, 400000), forecast: fc(20000000, 4000000), comparable: COMP('ok', -0.1, -45000, 445000), reliability: REL({ support: 'bajo', coverage: 0.3 }), margin: MARGIN }),
      { level: 'Insuficiente', mode: 'sin_lectura', state: 'sin_base', stateShown: true, comparability: 'valida', verdictKind: 'sin_lectura', cause: 'cobertura', protagonist: 'venta_observada', observed: true, gapVisible: false, contribution: 'oculta', visibleReasons: true, diagnosis: 'no_disponible', hide: ['cierre', 'evolucion', 'contribucion'], show: ['condicion', 'alcance', 'economico'] }),
    S(7, 'sin-actividad', 'Sin actividad', 'ilustrativo',
      base({ revenue: rev(1000000, 0), activity: ACT(0, 0, 0), forecast: fc(1500000, 0), comparable: COMP('sin_actividad', null, 0, 0), reliability: REL() }),
      { level: 'Insuficiente', mode: 'sin_lectura', state: 'sin_base', stateShown: true, comparability: 'sin_actividad', verdictKind: 'sin_lectura', cause: 'sin_actividad', protagonist: null, observed: false, gapVisible: false, contribution: 'oculta', visibleReasons: true, diagnosis: 'no_disponible', noGrowthWords: true, hide: ['economico', 'cierre', 'evolucion', 'contribucion'], show: ['condicion', 'alcance'] }),
    S(8, 'sin-base-comparable', 'Sin base comparable', 'ilustrativo',
      base({ revenue: rev(10000000, 10050000), activity: ACT(470000, 9300, 10050000), forecast: fc(15000000, 15030000), comparable: undefined, reliability: REL() }),
      { level: 'Alta', mode: 'definitiva', state: 'saludable', stateShown: true, comparability: 'sin_base_comparable', verdictKind: 'saludable', protagonist: 'brecha', direction: 'en_linea', observed: true, gapVisible: true, contribution: 'no_configurado', diagnosis: 'disponible', noGrowthWords: true, noGrowthNumber: true, hide: ['condicion', 'alcance'], show: ['evolucion', 'cierre'] }),
    S(9, 'recuperacion-desde-cero', 'Recuperación desde cero', 'ilustrativo',
      base({ revenue: rev(10000000, 10200000), activity: ACT(480000, 9500, 10200000), forecast: fc(15000000, 15300000), comparable: COMP('recuperacion_desde_cero', null, 10200000, 0), reliability: REL() }),
      { level: 'Alta', mode: 'definitiva', state: 'saludable', stateShown: true, comparability: 'recuperacion_desde_cero', verdictKind: 'saludable', protagonist: 'brecha', direction: 'por_encima', observed: true, gapVisible: true, contribution: 'no_configurado', diagnosis: 'disponible', noGrowthWords: true, noGrowthNumber: true, hide: ['condicion', 'alcance'], show: ['evolucion', 'cierre'] }),
    S(10, 'conversion-cero', 'Conversión igual a cero', 'ilustrativo',
      base({ revenue: rev(5000000, 0), activity: ACT(41000, 0, 0), forecast: fc(7500000, 0), comparable: COMP('conversion_cero_actual', -1, -900000, 900000), reliability: REL() }),
      { level: 'Media', mode: 'con_avisos', state: 'deterioro', stateShown: true, comparability: 'valida', verdictKind: 'conversion_cero', protagonist: 'brecha', direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'no_configurado', visibleReasons: true, capped: true, diagnosis: 'con_reservas', noCause: true, show: ['condicion', 'alcance', 'evolucion'] }),
    S(11, 'cambio-composicion', 'Cambio de composición', 'ilustrativo',
      base({ revenue: rev(10000000, 9700000), activity: ACT(450000, 8800, 9700000), forecast: fc(15000000, 14580000), comparable: COMP('cambio_de_composicion', 0.15, 1500000, 10000000), reliability: REL() }),
      { level: 'Media', mode: 'con_avisos', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'cambio_de_composicion', verdictKind: 'composicion', protagonist: 'brecha', direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'no_configurado', visibleReasons: true, capped: true, diagnosis: 'con_reservas', noGrowthWords: true, noGrowthNumber: true, show: ['condicion', 'alcance', 'evolucion'] }),
    S(12, 'no-calculable', 'Resultado no calculable', 'ilustrativo',
      base({ revenue: { planToDate: 1000000, actualToDate: -5000, gap: -1005000, compliance: -0.005, gapPct: -1.005 }, activity: ACT(300, 4, -5000), forecast: fc(1500000, -7500), comparable: COMP('no_calculable', null, null, null), reliability: REL() }),
      { level: 'Insuficiente', mode: 'sin_lectura', state: 'sin_base', stateShown: true, comparability: 'no_calculable', verdictKind: 'sin_lectura', cause: 'no_calculable', protagonist: null, observed: false, gapVisible: false, contribution: 'oculta', visibleReasons: true, diagnosis: 'no_disponible', hide: ['economico', 'cierre', 'evolucion', 'contribucion'], show: ['condicion', 'alcance'] }),
    S(13, 'positivo-sin-margen', 'Venta positiva, pero sin margen configurado', 'ilustrativo',
      base({ revenue: rev(10000000, 10400000), activity: ACT(490000, 9900, 10400000), forecast: fc(15000000, 15600000), comparable: COMP('ok', 0.05, 520000, 9880000), reliability: REL(), margin: undefined }),
      { level: 'Alta', mode: 'definitiva', state: 'creciendo', stateShown: true, comparability: 'valida', verdictKind: 'creciendo', protagonist: 'brecha', direction: 'por_encima', observed: true, gapVisible: true, contribution: 'no_configurado', contributionAmount: null, diagnosis: 'disponible', show: ['contribucion', 'evolucion', 'cierre'], hide: ['condicion', 'alcance'] }),
    S(14, 'negativo-con-contribucion', 'Venta negativa, con contribución bruta estimada disponible', 'ilustrativo',
      base({ revenue: rev(10000000, 9300000), activity: ACT(445000, 8700, 9300000), forecast: fc(15000000, 14100000), comparable: COMP('ok', -0.015, -140000, 9440000), reliability: REL(), margin: MARGIN }),
      { level: 'Alta', mode: 'definitiva', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'valida', verdictKind: 'riesgo_cumplimiento', protagonist: 'brecha', direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'disponible', contributionAmount: -175000, contributionDetailOnly: true, diagnosis: 'disponible', hide: ['condicion', 'alcance'], show: ['evolucion', 'cierre', 'contribucion'] })
  ];

  /* Escenarios ADICIONALES: solo donde las decisiones D-01 a D-05 abren una brecha funcional que los 14 no cubren. */
  const ADICIONALES = [
    S('A1', 'conversion-cero-sin-comparacion', 'Conversión cero sin comparación válida', 'ilustrativo (brecha que cubre: D-04, no afirmar deterioro sin base comparable)',
      base({ revenue: rev(5000000, 0), activity: ACT(41000, 0, 0), forecast: fc(7500000, 0), comparable: undefined, reliability: REL() }),
      { level: 'Media', mode: 'con_avisos', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'sin_base_comparable', verdictKind: 'conversion_cero', protagonist: 'brecha', direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'no_configurado', visibleReasons: true, capped: true, diagnosis: 'con_reservas', noGrowthWords: true, noGrowthNumber: true, noCause: true, show: ['condicion', 'alcance'] }),
    S('A2', 'sin-plan-con-venta', 'Sin plan, con venta observada válida', 'ilustrativo (brecha que cubre: D-01, la venta observada no se oculta por falta de comparación)',
      base({ plan: { available: false }, revenue: { planToDate: null, actualToDate: 3200000, gap: null, compliance: null, gapPct: null }, activity: ACT(160000, 3100, 3200000), forecast: {}, comparable: COMP('ok', 0.04, 123000, 3077000), reliability: REL(), margin: MARGIN }),
      { level: 'Insuficiente', mode: 'sin_lectura', state: 'sin_base', stateShown: true, comparability: 'valida', verdictKind: 'sin_lectura', cause: 'sin_plan', protagonist: 'venta_observada', observed: true, gapVisible: false, contribution: 'oculta', visibleReasons: true, diagnosis: 'no_disponible', noDirectionVsPlan: true, hide: ['cierre', 'evolucion', 'contribucion'], show: ['condicion', 'alcance', 'economico'] }),
    S('A3', 'bloqueo-duro-con-limitacion-secundaria', 'Bloqueo duro con una limitación secundaria', 'ilustrativo (brecha que cubre: D-05, Baja e Insuficiente son excluyentes)',
      base({ revenue: rev(9000000, 8100000), activity: ACT(400000, 7800, 8100000), forecast: fc(13500000, 12150000), comparable: COMP('ok', -0.02, -165000, 8265000), reliability: REL({ support: 'bajo', coverage: 0.4, dataErrors: true, warnings: ['Los datos traen avisos de calidad (30 registros).'] }), margin: MARGIN }),
      { level: 'Insuficiente', mode: 'sin_lectura', state: 'sin_base', stateShown: true, comparability: 'valida', verdictKind: 'sin_lectura', cause: 'cobertura', protagonist: 'venta_observada', observed: true, gapVisible: false, contribution: 'oculta', visibleReasons: true, diagnosis: 'no_disponible', onlyHardReasons: true, hide: ['cierre', 'evolucion', 'contribucion'], show: ['condicion', 'alcance', 'economico'] }),
    S('A4', 'baja-sin-margen', 'Confiabilidad baja sin margen configurado', 'ilustrativo (brecha que cubre: D-02, «Margen no configurado · Configurar» con confiabilidad baja)',
      base({ revenue: rev(9000000, 8370000), activity: ACT(420000, 8100, 8370000), forecast: fc(13500000, 12600000), comparable: COMP('ok', -0.02, -170000, 8540000), reliability: REL({ support: 'bajo', coverage: 0.8, dataErrors: true }), margin: undefined }),
      { level: 'Baja', mode: 'preliminar', state: 'riesgo_cumplimiento', stateShown: false, comparability: 'valida', verdictKind: 'preliminar', protagonist: 'brecha', protagonistPreliminary: true, direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'no_configurado', contributionAmount: null, contributionDetailOnly: true, visibleReasons: true, diagnosis: 'no_concluyente', hide: ['cierre', 'evolucion'], show: ['condicion', 'alcance', 'contribucion', 'economico'] }),
    S('A5', 'venta-cero-sin-plan', 'Venta real igual a cero con actividad y sin plan', 'ilustrativo (auditoría final, punto 1: un cero MEDIDO se muestra y no se confunde con falta de dato)',
      base({ plan: { available: false }, revenue: { planToDate: null, actualToDate: 0, gap: null, compliance: null, gapPct: null }, activity: ACT(41000, 0, 0), forecast: {}, comparable: undefined, reliability: REL() }),
      { level: 'Insuficiente', mode: 'sin_lectura', state: 'sin_base', stateShown: true, comparability: 'sin_base_comparable', verdictKind: 'sin_lectura', cause: 'sin_plan', protagonist: 'venta_observada', observed: true, observedAmount: 0, gapVisible: false, contribution: 'oculta', visibleReasons: true, diagnosis: 'no_disponible', verdictIncludes: ['ningún pedido ni venta'], verdictExcludes: ['Hay venta registrada'], noDirectionVsPlan: true }),
    S('A6', 'actividad-no-verificable', 'Información incompleta: actividad no verificable', 'ilustrativo (auditoría final, punto 1: falta de dato ≠ ausencia de actividad ≠ venta cero)',
      base({ revenue: rev(10000000, 0), activity: ACT(null, null, null), forecast: fc(15000000, 0), comparable: COMP('ok', null, null, 9000000), reliability: REL() }),
      { level: 'Insuficiente', mode: 'sin_lectura', state: 'sin_base', stateShown: true, comparability: 'valida', verdictKind: 'sin_lectura', cause: 'sin_dato_actividad', protagonist: null, observed: false, gapVisible: false, contribution: 'oculta', visibleReasons: true, diagnosis: 'no_disponible', verdictIncludes: ['No se puede verificar la actividad'], verdictExcludes: ['No hay actividad', 'Hay venta registrada', 'no se registró'], noGrowthWords: true, hide: ['economico', 'cierre', 'evolucion', 'contribucion'] }),
    S('A7', 'actividad-parcial', 'Información parcial con venta positiva: pedidos no disponibles', 'ilustrativo (C3: una medida ausente no baja por sí sola la confiabilidad; solo deja sin verificar la conclusión que la necesita)',
      base({ revenue: rev(10000000, 9500000), activity: ACT(300000, null, 9500000), forecast: fc(15000000, 14250000), comparable: COMP('ok', 0.02, 190000, 9310000), reliability: REL() }),
      { level: 'Alta', mode: 'definitiva', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'valida', verdictKind: 'riesgo_cumplimiento', protagonist: 'brecha', direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'no_configurado', diagnosis: 'disponible', dataClass: 'valido', conclusionConversion: 'no_verificable', conclusionCumplimiento: 'concluyente', verdictExcludes: ['no se registró ningún pedido', 'Lectura preliminar'], show: ['alcance', 'cierre', 'evolucion'], hide: ['condicion'] }),
    S('A8', 'pedidos-con-venta-cero', 'Dato inconsistente: pedidos registrados con venta cero', 'ilustrativo (C1: la combinación no invalida el dato; queda pendiente de interpretación y la cifra observada sigue visible)',
      base({ revenue: rev(10000000, 0), activity: ACT(300000, 50, 0), forecast: fc(15000000, 0), comparable: COMP('ok', null, null, 9000000), reliability: REL() }),
      { level: 'Media', mode: 'con_avisos', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'valida', verdictKind: 'riesgo_cumplimiento', protagonist: 'brecha', direction: 'por_debajo', observed: true, observedAmount: 0, gapVisible: true, contribution: 'no_configurado', visibleReasons: true, capped: true, diagnosis: 'con_reservas', dataClass: 'inconsistente', conclusionConversion: 'pendiente_de_interpretacion', reasonIncludes: ['pedidos y la venta del periodo es cero', 'pendiente de interpretación'], verdictExcludes: ['no se registró ningún pedido', 'no es calculable'], noCause: true }),
    S('A9', 'conversion-cero-con-errores-de-datos', 'Conversión cero con errores de medición en los datos', 'ilustrativo (auditoría final, punto 2: el hecho observado se conserva y no se infiere causa)',
      base({ revenue: rev(5000000, 0), activity: ACT(41000, 0, 0), forecast: fc(7500000, 0), comparable: COMP('conversion_cero_actual', -1, -900000, 900000), reliability: REL({ support: 'bajo', coverage: 0.8, dataErrors: true }) }),
      { level: 'Baja', mode: 'preliminar', state: 'deterioro', stateShown: false, comparability: 'valida', verdictKind: 'preliminar', protagonist: 'brecha', protagonistPreliminary: true, direction: 'por_debajo', observed: true, observedAmount: 0, gapVisible: true, contribution: 'no_configurado', visibleReasons: true, diagnosis: 'no_concluyente', noCause: true, verdictIncludes: ['no se registró ningún pedido'], verdictExcludes: ['parece estar'], reasonIncludes: ['ningún pedido registrado'] }),
    S('A10', 'conversion-cero-con-cambio-de-composicion', 'Conversión cero con cambio de composición', 'ilustrativo (auditoría final, punto 2: dos topes simultáneos, sin lenguaje de mejora ni de causa)',
      base({ revenue: rev(5000000, 0), activity: ACT(41000, 0, 0), forecast: fc(7500000, 0), comparable: COMP('cambio_de_composicion', null, null, 900000), reliability: REL() }),
      { level: 'Media', mode: 'con_avisos', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'cambio_de_composicion', verdictKind: 'conversion_cero', protagonist: 'brecha', direction: 'por_debajo', observed: true, observedAmount: 0, gapVisible: true, contribution: 'no_configurado', visibleReasons: true, capped: true, capsCount: 2, diagnosis: 'con_reservas', noCause: true, noGrowthWords: true, noGrowthNumber: true, reasonIncludes: ['ningún pedido registrado', 'no es el mismo'] }),
    S('A11', 'margen-no-valido', 'Margen guardado no válido', 'ilustrativo (auditoría final, punto 3: margen inválido ≠ no configurado; nunca produce importe)',
      base({ revenue: rev(10000000, 9300000), activity: ACT(445000, 8700, 9300000), forecast: fc(15000000, 14100000), comparable: COMP('ok', -0.015, -140000, 9440000), reliability: REL(), margin: { marginEnabled: true, grossMarginPct: 100, updatedAt: '2026-11-01T00:00:00Z', source: 'manual' } }),
      { level: 'Alta', mode: 'definitiva', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'valida', verdictKind: 'riesgo_cumplimiento', protagonist: 'brecha', direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'invalido', contributionAmount: null, diagnosis: 'disponible', show: ['contribucion'] }),
    S('A12', 'margen-cero-configurado', 'Margen configurado en 0 %', 'ilustrativo (auditoría final, punto 3: un 0 % configurado es un dato válido del motor; produce $0 estimado, no «sin margen»)',
      base({ revenue: rev(10000000, 9300000), activity: ACT(445000, 8700, 9300000), forecast: fc(15000000, 14100000), comparable: COMP('ok', -0.015, -140000, 9440000), reliability: REL(), margin: { marginEnabled: true, grossMarginPct: 0, updatedAt: '2026-11-01T00:00:00Z', source: 'manual' } }),
      { level: 'Alta', mode: 'definitiva', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'valida', verdictKind: 'riesgo_cumplimiento', protagonist: 'brecha', direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'disponible', contributionAmount: 0, contributionDetailOnly: true, contributionLimitationsInclude: ['explícitamente en 0 %', 'no indica que el canal'], diagnosis: 'disponible' }),
    S('A13', 'venta-con-cero-pedidos', 'Dato inconsistente: venta positiva con cero pedidos', 'ilustrativo (C1: no es conversión cero ni dato inválido; pendiente de interpretación)',
      base({ revenue: rev(10000000, 9500000), activity: ACT(300000, 0, 9500000), forecast: fc(15000000, 14250000), comparable: COMP('ok', 0.02, 190000, 9310000), reliability: REL() }),
      { level: 'Media', mode: 'con_avisos', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'valida', verdictKind: 'riesgo_cumplimiento', protagonist: 'brecha', direction: 'por_debajo', observed: true, observedAmount: 9500000, gapVisible: true, contribution: 'no_configurado', visibleReasons: true, capped: true, diagnosis: 'con_reservas', dataClass: 'inconsistente', conclusionConversion: 'pendiente_de_interpretacion', reasonIncludes: ['cero pedidos registrados'], verdictExcludes: ['no se registró ningún pedido'], noCause: true }),
    S('A14', 'conciliacion-pendiente', 'Venta de la actividad distinta de la venta del periodo', 'ilustrativo (C2: sin tolerancia documentada no se declara conciliada ni inválida; diferencia de 0.4 %, inferior al 1 % rechazado)',
      base({ revenue: rev(10000000, 9500000), activity: ACT(300000, 5000, 9460000), forecast: fc(15000000, 14250000), comparable: COMP('ok', 0.02, 190000, 9310000), reliability: REL() }),
      { level: 'Media', mode: 'con_avisos', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'valida', verdictKind: 'riesgo_cumplimiento', protagonist: 'brecha', primaryAmount: -500000, direction: 'por_debajo', observed: true, observedAmount: 9500000, gapVisible: true, contribution: 'no_configurado', visibleReasons: true, capped: true, diagnosis: 'con_reservas', dataClass: 'inconsistente', reconciliation: 'pendiente', conclusionConversion: 'observable', reasonIncludes: ['conciliación pendiente'] }),
    S('A15', 'venta-cero-con-pedidos-sin-medir', 'Información parcial con venta cero: pedidos sin medir', 'ilustrativo (C3: falta información secundaria relevante para evaluar el cero; Baja, y nunca «conversión cero»)',
      base({ revenue: rev(5000000, 0), activity: ACT(41000, null, 0), forecast: fc(7500000, 0), comparable: undefined, reliability: REL() }),
      { level: 'Baja', mode: 'preliminar', state: 'riesgo_cumplimiento', stateShown: false, comparability: 'sin_base_comparable', verdictKind: 'preliminar', protagonist: 'brecha', protagonistPreliminary: true, direction: 'por_debajo', observed: true, observedAmount: 0, gapVisible: true, contribution: 'no_configurado', visibleReasons: true, diagnosis: 'no_concluyente', dataClass: 'valido', conclusionConversion: 'no_verificable', conclusionCumplimiento: 'preliminar', reasonIncludes: ['falta la medida de sesiones o de pedidos'], verdictExcludes: ['no se registró ningún pedido'] }),
    S('A16', 'margen-cero-sin-evidencia', 'Margen de 0 % sin evidencia de configuración', 'ilustrativo (C5: un 0 sin fecha de configuración no demuestra una configuración real; no se estima nada)',
      base({ revenue: rev(10000000, 9300000), activity: ACT(445000, 8700, 9300000), forecast: fc(15000000, 14100000), comparable: COMP('ok', -0.015, -140000, 9440000), reliability: REL(), margin: { marginEnabled: true, grossMarginPct: 0, updatedAt: null, source: null } }),
      { level: 'Alta', mode: 'definitiva', state: 'riesgo_cumplimiento', stateShown: true, comparability: 'valida', verdictKind: 'riesgo_cumplimiento', protagonist: 'brecha', direction: 'por_debajo', observed: true, gapVisible: true, contribution: 'no_confirmado', contributionAmount: null, diagnosis: 'disponible', show: ['contribucion'] })
  ];

  const CAUSE_HINT = /\b(porque|se debe a|debido a|a causa de|causa|provoc\w*|falla\w*|fallo\w*|checkout|tráfico de baja calidad|calidad del tráfico|experiencia de usuario|UX|precio|inventario|desabasto|campañas?|marketing)\b/i;
  const GROWTH = /\b(crece|crecimiento|creciendo|cae|caes|deterioro|sube|baja)\b/i;
  /** Compara la salida de la especificación con el comportamiento esperado. Devuelve la lista de diferencias (vacía = coincide). */
  function check(Z, s) {
    const o = Z.build(s.input), e = s.expect, f = [], w = (m) => f.push(`${s.n} ${s.id}: ${m}`);
    if (o.reliability.level !== e.level) w(`confiabilidad ${o.reliability.level} ≠ ${e.level}`);
    if (o.reliability.mode !== e.mode) w(`modo ${o.reliability.mode} ≠ ${e.mode}`);
    if (o.state.id !== e.state) w(`estado ${o.state.id} ≠ ${e.state}`);
    if (o.state.shown !== e.stateShown) w(`estado mostrado ${o.state.shown} ≠ ${e.stateShown}`);
    if (o.comparability.code !== e.comparability) w(`comparabilidad ${o.comparability.code} ≠ ${e.comparability}`);
    if (o.verdict.kind !== e.verdictKind) w(`tipo de veredicto ${o.verdict.kind} ≠ ${e.verdictKind}`);
    if (e.cause !== undefined && o.reliability.cause !== e.cause) w(`causa ${o.reliability.cause} ≠ ${e.cause}`);
    if ((o.economic.primary ? o.economic.primary.kind : null) !== e.protagonist) w(`cifra protagonista ${o.economic.primary && o.economic.primary.kind} ≠ ${e.protagonist}`);
    if (e.direction && (!o.economic.primary || o.economic.primary.direction !== e.direction)) w(`dirección ${o.economic.primary && o.economic.primary.direction} ≠ ${e.direction}`);
    if (e.protagonistPreliminary && !(o.economic.primary && o.economic.primary.preliminary)) w('la brecha debe rotularse preliminar');
    if (o.economic.observed.visible !== e.observed) w(`venta observada visible ${o.economic.observed.visible} ≠ ${e.observed}`);
    if (!!(o.economic.primary && o.economic.primary.kind === 'brecha') !== e.gapVisible) w('visibilidad de la brecha');
    if (o.economic.contribution.status !== e.contribution) w(`contribución ${o.economic.contribution.status} ≠ ${e.contribution}`);
    if ('contributionAmount' in e && o.economic.contribution.amount !== e.contributionAmount) w(`importe de contribución ${o.economic.contribution.amount} ≠ ${e.contributionAmount}`);
    if (e.contributionDetailOnly && !o.economic.contribution.detailOnly) w('la contribución solo puede mostrarse en detalle, nunca como cifra protagonista');
    if (e.contributionPreliminary && !o.economic.contribution.preliminary) w('la contribución con confiabilidad baja debe rotularse preliminar');
    if (e.diagnosis && o.scope.diagnosis !== e.diagnosis) w(`diagnóstico ${o.scope.diagnosis} ≠ ${e.diagnosis}`);
    if (e.qualifiers && !e.qualifiers.every((q) => o.state.qualifiers.includes(q))) w(`calificadores ${o.state.qualifiers} ⊉ ${e.qualifiers}`);
    if (e.visibleReasons && !(o.reliability.visibleReasons && o.reliability.reasons.length && o.show.includes('condicion'))) w('los motivos deben ser visibles');
    (e.show || []).forEach((x) => { if (!o.show.includes(x)) w(`debe mostrar «${x}»`); });
    (e.hide || []).forEach((x) => { if (!o.hide.includes(x) || o.show.includes(x)) w(`debe ocultar «${x}»`); });
    if (e.capped && !o.reliability.caps.length) w('debe aplicarse un tope de confiabilidad');
    if (e.noGrowthWords && (GROWTH.test(o.verdict.text) || GROWTH.test(o.narrative.short))) w('el texto usa palabras de crecimiento sin comparación válida');
    if (e.noGrowthNumber && o.comparability.growth) w('muestra un % de evolución sin comparación válida');
    if (e.noCause && CAUSE_HINT.test([o.verdict.text, o.narrative.short, ...o.reliability.reasons].join(' ').replace(/sin (atribuirle una )?causa( atribuida)?|no permite determinar la causa/gi, ''))) w('inventa una causa');
    if (e.dataClass && o.data.class !== e.dataClass) w(`clase del dato ${o.data.class} ≠ ${e.dataClass}`);
    if (e.reconciliation && o.data.reconciliation.status !== e.reconciliation) w(`conciliación ${o.data.reconciliation.status} ≠ ${e.reconciliation}`);
    if (e.conclusionConversion && o.conclusions.conversion !== e.conclusionConversion) w(`conclusión de conversión ${o.conclusions.conversion} ≠ ${e.conclusionConversion}`);
    if (e.conclusionCumplimiento && o.conclusions.cumplimiento !== e.conclusionCumplimiento) w(`conclusión de cumplimiento ${o.conclusions.cumplimiento} ≠ ${e.conclusionCumplimiento}`);
    if ('primaryAmount' in e && (!o.economic.primary || o.economic.primary.amount !== e.primaryAmount)) w(`importe protagonista ${o.economic.primary && o.economic.primary.amount} ≠ ${e.primaryAmount}`);
    if ('observedAmount' in e && o.economic.observed.amount !== e.observedAmount) w(`importe de venta observada ${o.economic.observed.amount} ≠ ${e.observedAmount}`);
    (e.verdictIncludes || []).forEach((x) => { if (!o.verdict.text.includes(x)) w(`el veredicto debe decir «${x}»`); });
    (e.verdictExcludes || []).forEach((x) => { if (o.verdict.text.includes(x)) w(`el veredicto no debe decir «${x}»`); });
    (e.reasonIncludes || []).forEach((x) => { if (!o.reliability.reasons.some((r) => r.includes(x))) w(`los motivos deben incluir «${x}»`); });
    if (e.capsCount !== undefined && o.reliability.caps.length !== e.capsCount) w(`topes ${o.reliability.caps.length} ≠ ${e.capsCount}`);
    (e.contributionLimitationsInclude || []).forEach((x) => { if (!(o.economic.contribution.limitations || []).some((r) => r.includes(x))) w(`la contribución debe declarar «${x}»`); });
    if (e.noDirectionVsPlan && /(por debajo|por encima|en línea|supera|alcanzaría)/i.test(o.verdict.text)) w('afirma una dirección contra el plan sin brecha válida');
    if (e.onlyHardReasons && o.reliability.reasons.some((r) => /errores/.test(r))) w('una limitación secundaria no debe figurar entre los motivos de un bloqueo duro');
    const steps = o.evaluation.steps.map((x) => x.n).join();
    if (steps !== '1,2,3,4,5,6,7,8') w(`el orden de evaluación no es 1..8 (${steps})`);
    return f;
  }
  return { SCENARIOS, ADICIONALES, MARGIN, check, helpers: { period, COMP, REL, ACT, rev, fc, base } };
});
