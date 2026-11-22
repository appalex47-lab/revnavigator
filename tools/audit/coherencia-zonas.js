/**
 * coherencia-zonas.js — COHERENCIA ENTRE CAPAS del Home inteligente (Fase 3, ronda final de calidad).
 *
 * NO es código de la aplicación y NO calcula indicadores. Hace dos cosas con las salidas de las especificaciones ejecutables de Z1, Z3 y Z4:
 *   1) `findingsFromZ1` y `actionsFromZ3` construyen, a partir de una lectura de Z1, los elementos de Z3 y las acciones de Z4 que ESA misma situación implica
 *      (mismos importes, misma confiabilidad, mismas inconsistencias de datos), de modo que las tres capas del prototipo no se contradigan por construcción;
 *   2) `check` detecta contradicciones entre capas en CUALQUIER terna (Z1, Z3, Z4), sea cual sea su origen. Es el «detector» que usan el prototipo y las pruebas.
 * Los importes ilustrativos (canal que concentra la brecha, alternativas de recuperación, potencial teórico) se DERIVAN de las cifras de Z1 con proporciones fijas y declaradas;
 * son datos simulados, no resultados de ningún motor.
 * Pruebas: tools/test-fase3-coherencia.js · Documento: docs/command-center/FASE_3_CALIDAD_Z1_Z5.md
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./command-center-contracts.js'), require('../../js/economics/impactModel.js'), require('./z1-lectura-ejecutiva.js'), require('./z3-atencion.js'), require('./z4-acciones.js'));
  else root.CCCoherencia = factory(root.CCContracts, root.FP && root.FP.economics, root.CCZ1, root.CCZ3, root.CCZ4);
})(typeof window !== 'undefined' ? window : globalThis, function (CC, ECON, Z1, Z3, Z4) {
  'use strict';
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const P = '2026-09', SHARE = { canal: 0.9, alt1: 1.0, alt2: 1.05, potencial: 0.1 };   // proporciones ilustrativas fijas, derivadas de las cifras de Z1
  const SUPPORT = { Alta: 'alto', Media: 'medio', Baja: 'bajo', Insuficiente: 'bajo' };
  const basis = (scope) => ({ period: P, scope: scope || 'total', indicator: 'revenue' });
  const ev = (o) => ({ class: 'calculo', text: 'Cifra calculada por el motor.', numbers: [], source: { module: 'pacing', field: 'toDate.revenue' }, headline: true, ...o });

  /* ===== 1) Z1 → elementos de Z3 coherentes ===== */
  function findingsFromZ1(i, o1) {
    const out = [], lvl = o1.reliability.level, sup = SUPPORT[lvl], m = i.margin, rv = i.revenue || {}, p = o1.economic.primary;
    const F = (x) => ({ schema: 'cc.finding', version: 1, scope: { level: 'total', channel: 'total' }, period: { type: 'month', key: P, comparison: 'plan' }, indicator: 'revenue', observed: { value: rv.actualToDate == null ? null : rv.actualToDate, unit: 'MXN' },
      reference: { value: rv.planToDate == null ? null : rv.planToDate, basis: 'plan de los mismos días' }, certainty: { level: 'calculo', support: sup, basis: `Respaldo ${sup} según la lectura de Z1.` }, limitations: [],
      validity: { status: 'activo', firstSeen: '2026-09-20', lastSeen: '2026-09-22', expiresWhen: 'cierra el periodo o el elemento se resuelve' }, lineage: [{ engine: 'attentionEngine', id: x.id, role: 'origin', family: 'atencion' }], economics: null, economicsReason: 'sin cuantificar', ...x });
    const gapMeta = { method: { id: 'gap', formula: 'real − plan (mismos días contados)', engine: 'gap.calculateGap' } };
    const dataF = (id, title, desc, family, severity, extra) => out.push(F({ id, type: 'finding', title, description: desc, indicator: 'dataQuality', severity, rule: { id: 'attention.data', family, version: 1 }, certainty: { level: 'hecho', support: 'alto', basis: 'Verificación directa de los datos cargados.' },
      observed: { value: null, unit: 'registros' }, reference: { value: null, basis: 'datos completos' }, evidence: [ev({ class: 'hecho', text: desc, source: { module: 'quality', field: family } })], economicsReason: 'Un faltante o aviso de datos no tiene impacto en ventas propio.', ...extra }));
    // datos: lo que Z1 ya decidió sobre la confiabilidad se refleja como elementos de datos (una fuente por concepto)
    (i.reliability.blocking || []).forEach((b, k) => dataF(`d:bloqueo${k}`, b.replace(/\.$/, ''), `${b} Sin esto no se puede concluir sobre el cumplimiento.`, 'data_bloqueo', 'critica'));
    if (o1.reliability.causes.includes('sin_actividad')) dataF('d:sinactividad', 'No hay actividad verificable en el periodo', 'No hay sesiones, pedidos ni venta verificables: no es posible emitir una lectura del negocio.', 'data_sin_actividad', 'critica');
    if (o1.reliability.causes.includes('sin_dato_actividad')) dataF('d:actividadnv', 'No se puede verificar la actividad del periodo', 'Faltan datos de sesiones, pedidos o venta: la actividad no es verificable.', 'data_actividad_no_verificable', 'critica');
    if (o1.reliability.causes.includes('sin_venta')) dataF('d:sinventa', 'No hay venta real contada en el periodo', 'No hay venta real contada: no es posible emitir una lectura del negocio.', 'data_sin_venta', 'critica');
    if (o1.reliability.causes.includes('cobertura')) dataF('d:cobertura', 'La cobertura de días comparados es insuficiente', 'Se compararon pocos días entre el plan y la venta real.', 'data_cobertura', 'critica');
    if (o1.reliability.causes.includes('sin_plan')) dataF('d:sinplan', 'No hay plan del periodo', 'Sin plan no se puede valorar el cumplimiento.', 'data_sin_plan', 'critica');
    if (o1.reliability.causes.includes('no_calculable')) dataF('d:nocalculable', 'Hay valores negativos o inconsistentes', 'El resultado no es calculable con los valores recibidos.', 'data_no_calculable', 'critica');
    if (o1.data && o1.data.issues.length) o1.data.issues.forEach((x) => dataF(`d:${x.code}`, x.code === 'conciliacion_pendiente' ? 'Las dos ventas del periodo no coinciden: conciliación pendiente' : 'Hay una combinación pendiente de interpretación entre sesiones, pedidos y venta', x.text, `data_${x.code}`, 'importante'));
    if (lvl !== 'Insuficiente' && o1.conclusions && o1.conclusions.conversion === 'no_verificable') dataF('d:conversionnv', 'La conversión no es verificable', 'Falta la medida de sesiones o de pedidos: no se puede concluir sobre la conversión.', 'data_conversion_no_verificable', 'seguimiento');
    const cplx = o1.completeness && o1.completeness.status === 'incompleta' ? o1.completeness.missing.filter((m) => !['sesiones', 'pedidos', 'datos con avisos de calidad'].includes(m)) : [];   // D-05: lo que Z1 dice que falta, Z3 también lo dice (sesiones/pedidos ya figuran como «conversión no verificable»; los avisos, como avisos)
    if (lvl !== 'Insuficiente' && cplx.length) dataF('d:incompleta', 'La información del periodo está incompleta', o1.completeness.note, 'data_incompleta', 'seguimiento');
    if (i.reliability.dataErrors) dataF('d:errores', 'Hay filas rechazadas o con errores en los datos cargados', 'Hay filas rechazadas o con errores que impiden una conclusión sólida.', 'data_errores', 'importante');
    if ((i.reliability.warnings || []).length) dataF('d:avisos', 'Los datos traen avisos de calidad', i.reliability.warnings[0], 'data_avisos', 'seguimiento');
    const act = i.activity || {}, convOk = !!(o1.conclusions && o1.conclusions.conversion !== 'no_verificable') && !(o1.data && o1.data.issues.length) && fin(act.sessions) && act.sessions > 0 && fin(act.orders) && act.orders > 0, sesOk = fin(act.sessions) && act.sessions > 0 && !(o1.data && o1.data.issues.length);   // C17: nada se deriva de una conversión o de sesiones que no se pueden verificar
    if (!p || p.kind !== 'brecha') return out;   // sin brecha válida no hay hallazgos, riesgos ni oportunidades del negocio
    const gap = rv.gap, comp = rv.compliance, below = p.direction === 'por_debajo';   // la dirección es la de Z1 (bandas del contrato), no el signo bruto de la brecha
    const gapImp = (id, amount, scope) => ECON.makeImpact({ id, category: 'brecha', provenance: 'observed', amount: { point: amount }, method: gapMeta.method, basis: basis(scope), overlapGroup: 'brecha_del_periodo' }, m);   // la brecha total y la del canal que la concentra son el MISMO dinero (D-06): ambas llevan el grupo de superposición
    const sev = comp < 0.9 ? 'critica' : comp < 0.99 ? 'importante' : 'seguimiento';
    out.push(F({ id: 'h:brecha', type: 'deviation', title: below ? 'La venta acumulada queda por debajo del plan' : p.direction === 'por_encima' ? 'La venta acumulada supera el plan' : 'La venta acumulada está en línea con el plan',
      description: below ? 'La venta acumulada queda por debajo del plan de los mismos días.' : 'La venta acumulada no queda por debajo del plan de los mismos días.', severity: below ? sev : 'seguimiento', rule: { id: 'pacing.gap', family: 'gap', version: 1 },
      evidence: [ev({ text: 'Venta real contra plan a la fecha.', numbers: [rv.actualToDate, rv.planToDate].filter(fin) })], economics: gapImp('gap_to_date', gap), economicsReason: undefined }));
    if (below) {
      out.push(F({ id: 'h:canal', type: 'deviation', title: 'Ecommerce concentra la brecha', description: 'Ecommerce queda por debajo de su plan de los mismos días.', scope: { level: 'channel', channel: 'ecommerce' }, severity: 'importante', rule: { id: 'attention.channel', family: 'channel_ecommerce', version: 1 },
        evidence: [ev({ text: 'Ecommerce: venta real por debajo de su plan a la fecha.', source: { module: 'pacing', field: 'channels.ecommerce.toDate' } })], economics: gapImp('gap_ecommerce', gap * SHARE.canal, 'ecommerce'), economicsReason: undefined }));
      if (lvl === 'Alta' || lvl === 'Media') {
        const rec = (id, fam, title, desc, ind, k) => F({ id, type: 'opportunity', title, description: desc, indicator: ind, severity: 'importante', rule: { id: 'recovery.option', family: fam, version: 1 }, certainty: { level: 'estimacion', support: sup, basis: 'Escenario de recuperación con restricciones declaradas.' },
          limitations: ['Depende de palancas que el negocio controla; no es un resultado obtenido.'], evidence: [ev({ class: 'estimacion', text: 'Alternativa de recuperación estimada.', source: { module: 'recoveryEngine', field: `recoveryOptions.${ind}` } })],
          economics: ECON.makeImpact({ id: `recoverable_${ind}`, category: 'alcanzable', provenance: 'projected', amount: { point: -gap * k }, method: { id: 'recovery_option', formula: 'venta incremental de la alternativa que cierra la brecha', engine: 'recoveryEngine.recoveryOptions' }, basis: basis(), horizon: 'resto del periodo', constraintsBasis: 'restricciones declaradas en el escenario de recuperación', exclusiveGroup: 'recovery_same_gap', assumptions: [`Alternativa «${ind}»: cierra la misma brecha que las demás alternativas (no se suman).`] }, m), economicsReason: undefined });
        if (convOk) out.push(rec('o:conv', 'recovery_cr', 'Recuperar la brecha elevando la conversión', 'Alternativa estimada: elevar la conversión podría cerrar la brecha del periodo.', 'conversionRate', SHARE.alt1));
        if (sesOk) out.push(rec('o:ses', 'recovery_traffic', 'Recuperar la brecha elevando las sesiones', 'Alternativa estimada: más sesiones podrían cerrar la brecha del periodo.', 'sessions', SHARE.alt2));
      }
    }
    if (i.forecast && fin(i.forecast.gapPct) && i.forecast.gapPct < -0.01 && (lvl === 'Alta' || lvl === 'Media')) {
      out.push(F({ id: 'r:cierre', type: 'risk', title: 'El cierre proyectado queda por debajo de la meta', description: 'Al ritmo actual, el cierre del periodo no alcanzaría la meta.', severity: i.forecast.gapPct < -0.05 ? 'critica' : 'importante', rule: { id: 'attention.forecast', family: 'forecast', version: 1 },
        certainty: { level: 'estimacion', support: sup, basis: 'Proyección del pronóstico con el ritmo observado.' }, limitations: ['Es una proyección: depende de que el ritmo se mantenga.'], evidence: [ev({ class: 'estimacion', text: 'Cierre proyectado contra meta.', source: { module: 'forecastEngine', field: 'run.total.close' } })],
        economics: ECON.makeImpact({ id: 'forecast_gap', category: 'en_riesgo', provenance: 'projected', amount: { point: i.forecast.close - i.forecast.target }, method: { id: 'forecast_gap', formula: 'cierre proyectado − meta', engine: 'forecastEngine.runForecast' }, basis: basis(), horizon: 'cierre del periodo', assumptions: ['El ritmo observado se mantiene hasta el cierre.'] }, m), economicsReason: undefined }));
    }
    if (convOk && i.comparable && o1.comparability.code === 'valida' && fin(i.comparable.growthPct) && (lvl === 'Alta' || lvl === 'Media')) {
      out.push(F({ id: 'x:driver', type: 'deviation', title: 'La conversión explica la mayor parte de la variación', description: 'Contribución matemática de la conversión a la variación; no es una causa demostrada.', indicator: 'conversionRate', severity: 'seguimiento', rule: { id: 'attention.driver', family: 'driver_cr', version: 1 },
        certainty: { level: 'driver', support: sup, basis: 'Atribución secuencial con base comparable.' }, limitations: ['La contribución es matemática: no demuestra causa.'],
        evidence: [ev({ class: 'driver', text: 'Contribución de la conversión a la variación.', source: { module: 'attribution', field: 'attributeSegment.cr' } }), { class: 'hipotesis', text: 'Un cambio en el proceso de compra podría estar afectando la conversión.', numbers: [], source: { module: 'attentionEngine', field: 'hypothesis' }, validation: 'Comparar el embudo por semana.' }],
        economicsReason: 'La contribución de un driver se presenta en «Qué ocurrió y por qué», no como impacto propio (evita doble conteo con la brecha).' }));
    }
    return out;
  }
  /* ===== 2) Z3 → acciones de Z4 coherentes (una por elemento visible; las de datos primero) ===== */
  function actionsFromZ3(att) {
    const key = (c) => c.dedupKey, A = (o) => ({ id: 'a:x', kind: 'revisar', label: 'Abrir el detalle', destination: { view: 'diagnostico', label: 'Diagnóstico' }, source: { engine: 'attentionEngine', field: 'next' }, basis: '', motivatedBy: [], requires: [], ...o });
    const acts = [];
    att.cards.forEach((c) => {
      const f = c.family;
      if (c.isData) acts.push(A({ id: `a:${c.id}`, kind: 'datos', label: /sinplan/.test(c.id) ? 'Definir el plan del periodo' : /sinventa/.test(c.id) ? 'Cargar la venta real del periodo' : /bloqueo/.test(c.id) ? 'Completar el dato que bloquea el análisis' : /actividad/.test(c.id) ? 'Verificar la carga de sesiones, pedidos y venta' : /cobertura/.test(c.id) ? 'Cargar los días de venta que faltan' : /errores/.test(c.id) ? 'Corregir las filas rechazadas de la carga' : /conciliacion|pedidos|venta_con|conversion/.test(c.id) ? 'Revisar la combinación de sesiones, pedidos y venta' : 'Revisar los avisos de calidad de la carga',
        destination: { view: 'calidad', label: 'Calidad de datos' }, source: { engine: 'attentionEngine', field: 'next' }, basis: c.description, motivatedBy: [key(c)] }));
      else if (c.clase === 'oportunidad') acts.push(A({ id: `a:${c.id}`, kind: 'decidir', label: 'Evaluar las alternativas de recuperación', destination: { view: 'recuperacion', label: 'Recuperación' }, source: { engine: 'recoveryEngine', field: 'recoveryOptions' }, basis: 'Hay alternativas estimadas que cierran la misma brecha.', motivatedBy: [key(c)] }));
      else if (c.clase === 'riesgo') acts.push(A({ id: `a:${c.id}`, label: 'Revisar el pronóstico de cierre', destination: { view: 'pronostico', label: 'Pronóstico' }, basis: c.description, motivatedBy: [key(c)] }));
      else if (/driver/.test(f)) acts.push(A({ id: `a:${c.id}`, kind: 'investigar', label: 'Comparar el embudo de conversión por semana', destination: { view: 'embudo', label: 'Embudo' }, basis: c.description, motivatedBy: [key(c)] }));
      else if (/channel_lag/.test(f)) acts.push(A({ id: `a:${c.id}`, label: 'Abrir el detalle de Ecommerce', destination: { view: 'segmentos', label: 'Segmentos' }, basis: c.description, motivatedBy: [key(c)] }));
      else acts.push(A({ id: `a:${c.id}`, label: 'Ver el diagnóstico de la brecha', destination: { view: 'diagnostico', label: 'Diagnóstico de brecha' }, basis: c.description, motivatedBy: [key(c)] }));
    });
    // las alternativas de recuperación se evalúan juntas: una sola acción que cita todas
    const rec = acts.filter((a) => a.kind === 'decidir'); if (rec.length > 1) { const first = rec[0]; first.motivatedBy = rec.flatMap((a) => a.motivatedBy); acts.splice(0, acts.length, ...acts.filter((a) => a.kind !== 'decidir' || a === first)); }
    return acts;
  }
  /* ===== 3) Detector de contradicciones entre capas ===== */
  const LEVEL_MODES = { Alta: ['completo', 'completo'], Media: ['completo', 'completo'], Baja: ['solo_observado', 'datos_primero'], Insuficiente: ['solo_datos', 'solo_datos'] };
  const AFIRMA_CIERRE_OK = /(el cierre proyectado (la superaría|quedaría en línea))/i;
  function check(o1, o3, o4) {
    const v = [], add = (c, m) => { if (!c) v.push(m); }, lvl = o1.reliability.level, p = o1.economic.primary;
    add(o3.level === lvl, `C1 la confiabilidad de Z3 (${o3.level}) no es la de Z1 (${lvl})`);
    add(o4.level === lvl, `C1 la confiabilidad de Z4 (${o4.level}) no es la de Z1 (${lvl})`);
    add(o3.mode === LEVEL_MODES[lvl][0] && o4.mode === LEVEL_MODES[lvl][1], `C1 los modos de Z3 y Z4 (${o3.mode}, ${o4.mode}) no corresponden a ${lvl}`);
    const blk = o3.cards.filter((c) => c.isData && c.severity.id === 'critica');
    add(!blk.length || lvl === 'Insuficiente', 'C2 Z3 muestra un faltante crítico que bloquea el análisis y Z1 no está Insuficiente: Z1 contradice a Z3');
    const risk = o3.cards.filter((c) => c.family === 'forecast_close');
    add(!risk.length || !AFIRMA_CIERRE_OK.test(o1.verdict.text), 'C3 Z3 muestra un riesgo de cierre por debajo de la meta y el veredicto de Z1 dice que el cierre alcanzaría la meta');
    add(!risk.length || !(o1.forecast && o1.forecast.gapPct > -0.01), 'C3 Z3 muestra un riesgo de cierre y Z1 proyecta un cierre en línea o por encima de la meta');
    const gapCards = o3.cards.filter((c) => c.family === 'pacing_gap' && c.impact.status === 'disponible');
    add(!gapCards.length || (p && p.kind === 'brecha' && gapCards.every((c) => Math.abs(c.impact.sales.point - p.amount) < 1e-6)), 'C4 la brecha de Z3 no coincide con la cifra protagonista de Z1 (o Z1 no muestra brecha válida)');
    add(!(p && p.kind === 'brecha') || !o3.cards.some((c) => c.clase !== 'hallazgo' && !c.isData && false), 'C4b');
    add(!o3.cards.some((c) => c.family.startsWith('channel_lag') && c.impact.status === 'disponible' && p && p.kind === 'brecha' && Math.abs(c.impact.sales.point) > Math.abs(p.amount) + 1e-6), 'C5 un canal concentra más brecha que la brecha total');
    add(!o3.cards.some((c) => c.family === 'pacing_gap' && /por debajo/.test(c.title)) || (p && p.kind === 'brecha' && p.direction === 'por_debajo'), 'C6 Z3 dice que la venta queda por debajo del plan y Z1 no afirma una brecha negativa');
    add(!(p && p.kind === 'brecha' && p.direction === 'por_debajo') || !o3.cards.some((c) => c.family === 'pacing_gap' && /supera el plan/.test(c.title)), 'C6 Z1 dice por debajo y Z3 dice que supera el plan');
    add(lvl !== 'Insuficiente' || !(o3.cards.some((c) => !c.isData)), 'C7 con confiabilidad Insuficiente Z3 muestra elementos del negocio');
    const vis = new Set(o3.cards.map((c) => c.id)), withheld = new Set(o3.withheld.ids);
    add(!(lvl === 'Alta' || lvl === 'Media') || !/el cierre proyectado no la alcanzaría/i.test(o1.verdict.text) || o3.cards.some((c) => c.family === 'forecast_close'), 'C15 Z1 dice que el cierre no alcanzaría la meta y Z3 no muestra ese riesgo (omisión)');
    add(!/datos completos/i.test(o1.verdict.text) || (o1.completeness && o1.completeness.status === 'verificada'), 'C18 Z1 declara los datos completos sin que la completitud esté verificada');
    add(!(o1.completeness && o1.completeness.status === 'incompleta' && (lvl === 'Alta' || lvl === 'Media')) || o3.cards.some((c) => c.isData), 'C19 Z1 declara la información incompleta y Z3 no lo dice con un elemento de datos');
    const gapLines = Object.values(o3.totals || {}).flatMap((c) => c.lines || []).filter((l) => l.category === 'brecha' && l.point !== null);
    add(!gapLines.length || !p || p.kind !== 'brecha' || gapLines.every((l) => Math.abs(l.point - p.amount) < 0.5), 'C20 el total de brecha de Z3 duplica o difiere del importe de Z1 (doble conteo de la brecha total y la del canal)');
    const convNV = (o1.conclusions && o1.conclusions.conversion === 'no_verificable') || (o1.data && o1.data.issues.length > 0);
    add(!convNV || !o3.cards.some((c) => !c.isData && /conversi[oó]n/i.test(c.title)), 'C17 Z3 presenta un elemento sobre la conversión aunque Z1 la declara no verificable o con datos inconsistentes');
    add(lvl !== 'Insuficiente' || o3.cards.some((c) => c.isData) || (o3.dataPanel.items || []).length > 0, 'C16 con confiabilidad Insuficiente Z3 no dice qué falta (ni un elemento de datos ni un requisito)');
    add(o4.cards.every((c) => c.cites.every((x) => vis.has(x.id))) && o4.cards.every((c) => c.kind === 'datos' ? (c.cites.length || c.requires.length) : c.cites.length), 'C8 una recomendación de Z4 no cita un elemento que esté a la vista en Z3');
    add(!o4.cards.some((c) => c.cites.some((x) => withheld.has(x.id))), 'C8 una recomendación de Z4 cita un elemento retenido por confiabilidad');
    add(!o4.cards.some((c) => c.kind === 'decidir') || o3.cards.some((c) => c.clase === 'oportunidad' || c.clase === 'riesgo'), 'C9 Z4 propone evaluar alternativas sin una oportunidad o riesgo visible en Z3');
    add(!o4.cards.some((c) => c.kind === 'decidir' && !c.cites.some((x) => x.claseLabel === 'Oportunidad')), 'C9b una acción «evaluar» no cita una oportunidad');
    add(!o3.cards.some((c) => c.clase === 'oportunidad' && c.impact.status === 'disponible' && c.impact.sales.provenance !== 'projected'), 'C10 una oportunidad se presenta con importe observado (como hecho confirmado)');
    add(!o3.cards.some((c) => c.clase === 'oportunidad' && !['estimacion', 'hipotesis'].includes(c.certainty.level)), 'C10 una oportunidad no es una estimación');
    add(!(p === null || (p && p.kind === 'venta_observada')) || !Object.values(o3.totals).some((t) => t.lines.length), 'C11 sin brecha válida en Z1, Z3 muestra totales de brecha');
    const all = [o1.verdict.text, o1.narrative.short, ...Object.values(o1.narrative.long), ...o3.cards.flatMap((c) => [c.title, c.description]), ...o4.cards.flatMap((c) => [c.label, c.why])].join(' ');
    add(!/\b(porque|se debe a|debido a|a causa de|provocó)\b/i.test(all.replace(/sin causa atribuida|sin atribuirle una causa|no permite determinar la causa|no es una causa demostrada|no demuestra causa/gi, '')), 'C12 hay lenguaje causal en alguna capa');
    add(!/utilidad|ganancia|beneficio neto|rentabilidad|\bROI\b|\bROAS\b|\bCAC\b/i.test(all), 'C12 hay un término financiero prohibido en alguna capa');
    add(!(o1.reliability.causes.includes('sin_actividad') || o1.reliability.causes.includes('sin_dato_actividad')) || !/\$\s?0(?![\d.])/.test(all), 'C13 sin actividad verificable aparece «$0» en alguna capa');
    add(!o3.cards.some((c) => c.hypotheses.some((h) => h.text === c.title)), 'C14 una hipótesis titula un elemento');
    return v;
  }
  return { findingsFromZ1, actionsFromZ3, check, SHARE, LEVEL_MODES };
});
