/**
 * z1.js — Evaluador de Z1 «Lectura ejecutiva» (Fase 4.2). Navegador (`FP.z1`) y Node (`module.exports`).
 *
 * ARCHIVO GENERADO — NO EDITAR A MANO. Se produce con `node tools/build-z1-port.js` desde la especificación ACEPTADA tools/audit/z1-lectura-ejecutiva.js (3.2, D-01 a D-07), que es la
 * FUENTE DE REFERENCIA de Z1. Un único código ejecutable en la aplicación: este. La especificación solo se ejecuta en las pruebas de Fase 3 y como referencia; `--check` y
 * tools/test-cierre-4-1-4-2.js verifican que este archivo es exactamente el que produce la especificación vigente (no pueden divergir).
 * Recibe lo que ya calcularon los motores y decide QUÉ se muestra, QUÉ se calla y QUÉ se puede afirmar; NO calcula indicadores. Los estados frente al plan salen de FP.businessState
 * (que delega en FP.gap.pacingStatus). Dependencias: FP.businessState y FP.economics (contributionOf, validateMarginInput).
 * Alimenta a FP.reliability (cc.reliability/1): el nivel de confiabilidad es el de `evaluate(i).level`. ESTADO: disponible; sin consumidores en vistas ni carga en index.html hasta que exista el primer consumidor.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  const FP = (root.FP = root.FP || {}); FP.z1 = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const need = (k) => { const FP = root.FP; if (!FP || !FP[k]) throw new Error(`z1.js requiere FP.${k} cargado antes.`); return FP[k]; };
  const CC = { classifyBusinessState: (...a) => need('businessState').classifyBusinessState(...a) };
  const ECON = { contributionOf: (...a) => need('economics').contributionOf(...a), validateMarginInput: (...a) => need('economics').validateMarginInput(...a) };
  'use strict';
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);

  /* ===== Vocabularios y nombres visibles (D-06) ===== */
  const LEVELS = ['Alta', 'Media', 'Baja', 'Insuficiente'];                       // 3.1 §6
  const MODE = { Alta: 'definitiva', Media: 'con_avisos', Baja: 'preliminar', Insuficiente: 'sin_lectura' };
  const COMPARABILITY = {
    valida: 'Comparación válida', sin_base_comparable: 'Sin base comparable', recuperacion_desde_cero: 'Recuperación desde cero',
    cambio_de_composicion: 'Cambio de composición', datos_insuficientes: 'Datos insuficientes', sin_actividad: 'Sin actividad', no_calculable: 'Resultado no calculable'
  };
  const FROM_ATTRIBUTION = { ok: 'valida', sin_trafico_actual: 'valida', conversion_cero_actual: 'valida', sin_base_comparable: 'sin_base_comparable', recuperacion_desde_cero: 'recuperacion_desde_cero',
    cambio_de_composicion: 'cambio_de_composicion', datos_insuficientes: 'datos_insuficientes', sin_actividad: 'sin_actividad', no_calculable: 'no_calculable' };
  // Nombres que ve el usuario (ejecutivos, sin códigos internos). Los identificadores internos NO cambian: son los del contrato de Fase 2.
  const STATE_LABEL = { saludable: 'Cumpliendo el plan', creciendo: 'En crecimiento', creciendo_bajo_potencial: 'Crece, pero sin alcanzar el plan', riesgo_cumplimiento: 'En riesgo de incumplir el plan', deterioro: 'En deterioro', sin_base: 'Sin lectura concluyente' };
  const STATES = Object.keys(STATE_LABEL);
  const DIAGNOSIS_LABEL = { disponible: 'Diagnóstico disponible', con_reservas: 'Diagnóstico con reservas', no_concluyente: 'Diagnóstico no concluyente', no_disponible: 'Diagnóstico no disponible' };
  const NAMES = {
    estados: {
      saludable: ['Cumpliendo el plan', 'La venta acumulada está en línea o por encima del plan y no hay alertas importantes.'],
      creciendo: ['En crecimiento', 'La venta crece contra el periodo comparable y va en línea o por encima del plan.'],
      creciendo_bajo_potencial: ['Crece, pero sin alcanzar el plan', 'La venta crece contra el comparable, pero queda por debajo del plan o el cierre proyectado está en riesgo.'],
      riesgo_cumplimiento: ['En riesgo de incumplir el plan', 'La venta o el cierre proyectado quedan por debajo del plan, o hay una alerta crítica activa.'],
      deterioro: ['En deterioro', 'La venta cae contra el periodo comparable y además queda por debajo del plan o el cierre está en riesgo.'],
      sin_base: ['Sin lectura concluyente', 'Falta información válida y suficiente para emitir un estado del negocio.']
    },
    confiabilidad: {
      Alta: ['Confiabilidad alta', 'Datos completos y comparables: la lectura puede sostenerse.'],
      Media: ['Confiabilidad media', 'Hay avisos o cobertura parcial: la lectura se emite con reservas visibles.'],
      Baja: ['Confiabilidad baja', 'Hay datos observables, pero con errores que impiden una conclusión sólida: solo hay lectura preliminar.'],
      Insuficiente: ['Confiabilidad insuficiente', 'Falta información válida o suficiente: no se emite lectura.']
    },
    comparabilidad: {
      valida: ['Comparación válida', 'Existe un periodo comparable con actividad y pedidos: la evolución puede valorarse.'],
      sin_base_comparable: ['Sin base comparable', 'No hay periodo comparable con el que valorar la evolución.'],
      recuperacion_desde_cero: ['Recuperación desde cero', 'El periodo comparable no registró pedidos: no hay porcentaje de evolución que mostrar.'],
      cambio_de_composicion: ['Cambio de composición', 'Los canales o segmentos no son los mismos que en el comparable: la evolución no es directa.'],
      datos_insuficientes: ['Datos insuficientes', 'Faltan datos del comparable para valorar la evolución.'],
      sin_actividad: ['Sin actividad', 'No hay actividad registrada que comparar.'],
      no_calculable: ['Resultado no calculable', 'Hay valores negativos o inconsistentes: no se calcula.']
    },
    contribucion: {
      disponible: ['Contribución bruta estimada', 'Estimación con el margen bruto promedio general; no es utilidad ni beneficio real.'],
      no_configurado: ['Margen no configurado · Configurar', 'Sin margen no se estima contribución.'],
      desactivado: ['Margen desactivado · Configurar', 'El margen está guardado pero desactivado.'],
      invalido: ['Margen no válido · Revisar', 'La validación del motor rechazó el margen guardado: no se estima contribución.'],
      no_confirmado: ['Margen sin confirmar · Revisar', 'Hay un margen de 0 % sin evidencia de haber sido configurado: no se estima contribución.']
    },
    diagnostico: { disponible: ['Diagnóstico disponible', 'La explicación del resultado puede sostenerse.'], con_reservas: ['Diagnóstico con reservas', 'La explicación se emite con los avisos indicados.'], no_concluyente: ['Diagnóstico no concluyente', 'Solo se muestra lo observado; no se explica el porqué.'], no_disponible: ['Diagnóstico no disponible', 'No hay información suficiente para diagnosticar.'] }
  };
  const ELEMENTS = ['estado', 'confiabilidad', 'periodo', 'veredicto', 'narr-corta', 'economico', 'condicion', 'alcance', 'cierre', 'evolucion', 'contribucion', 'narr-larga'];
  const CAUSE_ORDER = ['no_calculable', 'sin_actividad', 'sin_dato_actividad', 'sin_venta', 'sin_plan', 'bloqueo', 'cobertura'];

  /* ===== Formato (solo presentación; el sistema real usa FP.format) ===== */
  function money(v) {
    const a = Math.abs(v), s = v < 0 ? '−' : '';
    if (a >= 1e9) return `${s}$${(a / 1e9).toFixed(1)} mil M`;
    if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(1)} M`;
    if (a >= 1e3) return `${s}$${Math.round(a / 1e3)} mil`;
    return `${s}$${Math.round(a)}`;
  }
  const pct = (v, d = 1) => `${(Math.abs(v) * 100).toFixed(d)} %`;
  const spct = (v, d = 1) => `${v < 0 ? '−' : '+'}${(Math.abs(v) * 100).toFixed(d)} %`;
  const words = (t) => String(t).split(/\s+/).filter(Boolean).length;
  const sentences = (t) => String(t).split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

  function comparability(c) { if (!c || !c.status) return 'sin_base_comparable'; return FROM_ATTRIBUTION[c.status] || 'no_calculable'; }
  /* Actividad del periodo (D-04, auditoría final): se distinguen CUATRO situaciones que nunca deben confundirse:
   *   observable      al menos una de sesiones, pedidos o venta es > 0 (hay evidencia positiva de actividad);
   *   zeroConfirmed   las tres están medidas y valen 0 (ausencia de actividad VERIFICADA: «sin actividad»);
   *   unknown         no hay evidencia positiva y falta alguna medida (ausencia de INFORMACIÓN: nunca se interpreta como cero);
   *   partial         hay evidencia positiva pero falta alguna medida (información incompleta). */
  function activityOf(i) {
    const a = i.activity, rv = (i.revenue || {}).actualToDate;
    if (!a) { const obs = fin(rv) && rv > 0; return { known: false, observable: obs, unknown: !obs, partial: false, zeroConfirmed: false, sessions: null, orders: null, revenue: rv }; }
    const f = [a.sessions, a.orders, a.revenue].filter(fin), obs = f.some((x) => x > 0);
    return { known: true, observable: obs, unknown: !obs && f.length < 3, partial: obs && f.length < 3, zeroConfirmed: f.length === 3 && !obs, sessions: a.sessions, orders: a.orders, revenue: a.revenue };
  }

  /* ===== D-05 (12-nov-2026): la completitud de los datos solo se afirma si se puede comprobar. Estados: verificada · incompleta (se dice qué falta) · no_verificable.
     No cambia la confiabilidad ni invalida ninguna métrica calculable: solo gobierna lo que el texto afirma sobre la integridad del conjunto. ===== */
  function completenessOf(i, act) {
    const r = i.reliability || {}, missing = [];
    if (act.known) { if (!fin(act.sessions)) missing.push('sesiones'); if (!fin(act.orders)) missing.push('pedidos'); if (!fin(act.revenue)) missing.push('venta del agregado de actividad'); }
    if (fin(r.coverage) && r.coverage < 1) missing.push('días sin comparar');
    if (r.dataErrors || r.support === 'bajo' || (r.warnings || []).length || (r.blocking || []).length) missing.push('datos con avisos de calidad');
    const status = missing.length ? 'incompleta' : (!act.known || !fin(r.coverage)) ? 'no_verificable' : 'verificada';
    const note = status === 'incompleta' ? `Falta información: ${missing.map((m) => (m === 'días sin comparar' ? `${m} (${Math.round((1 - r.coverage) * 100)} %)` : m)).join(', ')}. Las métricas calculables se muestran; no se interpreta el motivo.`
      : status === 'no_verificable' ? 'No es posible confirmar que la información del periodo esté completa.' : 'Se verificaron los días comparados y las tres medidas de actividad.';
    return { status, missing, note, evidence: status === 'verificada' ? ['cobertura de días = 100 %', 'sesiones, pedidos y venta de actividad presentes', 'sin avisos ni errores de calidad'] : [] };
  }
  /* ===== Pasos 1 a 6 (D-05) ===== */
  function evaluate(i) {
    const r = i.reliability || {}, rv = i.revenue || {}, cmp = comparability(i.comparable), act = activityOf(i), steps = [], hard = [], soft = [], caps = [], causes = [];
    const hasPlan = !!(i.plan && i.plan.available), cstat = i.comparable && i.comparable.status;
    const noActual = !(i.period && i.period.daysCounted > 0) || !fin(rv.actualToDate);
    const addHard = (cause, msg) => { if (!hard.includes(msg)) hard.push(msg); if (!causes.includes(cause)) causes.push(cause); };
    // 1 · integridad y suficiencia de los datos
    const s1 = [];
    if (noActual) { addHard('sin_venta', 'No hay venta real contada en el periodo.'); s1.push('sin venta contada'); }
    (r.blocking || []).forEach((b) => { addHard('bloqueo', b); s1.push('bloqueo'); });
    if (!fin(r.coverage)) { addHard('cobertura', 'No hay días comparables entre el plan y la venta real.'); s1.push('sin días comparables'); }
    else if (r.coverage < 0.6) { addHard('cobertura', `Solo se compararon ${Math.round(r.coverage * 100)} % de los días.`); s1.push('cobertura < 60 %'); }
    const dataErr = !!(r.dataErrors || r.support === 'bajo');
    if (dataErr) soft.push('Hay filas rechazadas o con errores en los datos cargados.');
    steps.push({ n: 1, name: 'Integridad y suficiencia de los datos', outcome: s1.length ? 'bloqueo' : dataErr ? 'limitación' : 'ok', hard: s1.length > 0 });
    // 2 · actividad observable
    const zeroAct = cstat === 'sin_actividad' || (!act.observable && act.zeroConfirmed), unkAct = !zeroAct && !act.observable;
    const noAct = zeroAct || unkAct;
    if (zeroAct) addHard('sin_actividad', 'No hay actividad observable (sesiones, pedidos ni venta) en el periodo: confirma que los datos estén cargados.');
    else if (unkAct) addHard('sin_dato_actividad', 'No se puede verificar la actividad del periodo: faltan datos de sesiones, pedidos o venta.');
    // C3 (confiabilidad contextual): una medida ausente NO baja por sí sola la confiabilidad. Sesiones y pedidos son esenciales para concluir sobre la CONVERSIÓN,
    // no para el cumplimiento contra el plan (que necesita venta, plan y cobertura). Solo cuando la venta observada es cero falta información secundaria relevante
    // para completar la evaluación de ese cero (no se puede saber si es una conversión cero): entonces la lectura es Baja.
    const sale = fin(rv.actualToDate) ? rv.actualToDate : (act.known && fin(act.revenue) ? act.revenue : null);
    const partialZero = !noAct && act.partial && fin(sale) && sale === 0;
    if (partialZero) soft.push('La venta del periodo es cero y falta la medida de sesiones o de pedidos: no se puede completar la evaluación de ese resultado.');
    steps.push({ n: 2, name: 'Actividad observable', outcome: noAct ? 'bloqueo' : partialZero ? 'limitación (falta información secundaria relevante)' : act.partial ? 'ok (conversión no verificable)' : 'ok', hard: noAct });
    // 3 · existencia y comparabilidad de la base
    const s3 = [];
    if (!hasPlan) { addHard('sin_plan', 'No hay plan del periodo.'); s3.push('sin plan'); }
    if (cmp === 'no_calculable') { addHard('no_calculable', 'Hay valores negativos o inconsistentes: el resultado no es calculable.'); s3.push('no calculable'); }
    steps.push({ n: 3, name: 'Existencia y comparabilidad de la base de referencia', outcome: s3.length ? 'bloqueo' : (cmp === 'valida' ? 'ok' : 'comparación no válida (solo afecta a la evolución)'), hard: s3.length > 0 });
    // 4 · indicadores y denominadores
    // NO CALCULABLE (bloqueo duro): solo lo que el contrato de datos del motor excluye de las sumas (js/quality/rules.js: los negativos van a cuarentena y «no se suman»).
    const neg = (x) => fin(x) && x < 0;
    const inconsistent = neg(rv.actualToDate) || (act.known && (neg(act.revenue) || neg(act.sessions) || neg(act.orders)));
    if (inconsistent) addHard('no_calculable', 'Hay valores negativos o inconsistentes: el resultado no es calculable.');
    // INCONSISTENTE (C1): combinaciones que el motor solo MARCA («MATHEMATICAL_INCONSISTENCY», acción «flag»: no se excluye nada). No son imposibles por definición
    // (el volumen de WhatsApp y Llamadas son contactos, no sesiones; puede haber pedidos sin importe o ajustes), así que NO invalidan el dato ni ocultan cifras:
    // quedan pendientes de interpretación, se avisan y la lectura no puede ser Alta. Z1 no las interpreta comercialmente.
    const issues = [];
    if (act.known && !inconsistent) {
      const S = act.sessions, O = act.orders;
      if (fin(O) && O > 0 && fin(S) && S === 0) issues.push({ code: 'pedidos_sin_sesiones', text: 'Se registraron pedidos con cero sesiones: combinación pendiente de interpretación.' });
      else if (fin(O) && fin(S) && O > S) issues.push({ code: 'pedidos_mayores_que_sesiones', text: 'Se registraron más pedidos que sesiones: combinación pendiente de interpretación.' });
      if (fin(O) && O > 0 && fin(sale) && sale === 0) issues.push({ code: 'pedidos_con_venta_cero', text: 'Se registraron pedidos y la venta del periodo es cero: combinación pendiente de interpretación.' });
      if (fin(O) && O === 0 && fin(sale) && sale > 0) issues.push({ code: 'venta_con_cero_pedidos', text: 'Hay venta en el periodo con cero pedidos registrados: combinación pendiente de interpretación.' });
    }
    if (!inconsistent && cstat === 'conversion_cero_actual' && fin(sale) && sale > 0) issues.push({ code: 'conversion_cero_con_venta', text: 'La comparación reporta cero pedidos pero hay venta en el periodo: combinación pendiente de interpretación.' });
    // CONCILIACIÓN (C2): no existe una tolerancia documentada entre la venta del agregado de actividad y la venta del periodo (el agregado ni siquiera tiene productor).
    // No se inventa un umbral: cualquier diferencia mayor que la unidad mínima de la moneda (un centavo, precisión de representación, no una tolerancia de negocio)
    // queda «pendiente»; y la igualdad solo se informa como «sin diferencia observada», nunca como conciliación validada.
    const recBoth = act.known && fin(act.revenue) && fin(rv.actualToDate) && !inconsistent, recDiff = recBoth ? act.revenue - rv.actualToDate : null;
    const reconciliation = { status: !recBoth ? 'no_evaluable' : Math.abs(recDiff) >= 0.005 ? 'pendiente' : 'sin_diferencia_observada', difference: recBoth ? recDiff : null, tolerance: null,
      note: 'No existe una tolerancia de conciliación documentada: queda pendiente de definición y de validación con datos reales.' };
    if (reconciliation.status === 'pendiente') issues.push({ code: 'conciliacion_pendiente', text: 'La venta del agregado de actividad y la venta del periodo no coinciden: conciliación pendiente de definición.' });
    issues.forEach((x) => caps.push(x.text));
    // Conversión cero (definición del motor, attribution.js: «hay sesiones pero 0 pedidos y 0 venta»): nunca con venta positiva.
    const conv0 = ((act.known && fin(act.sessions) && act.sessions > 0 && fin(act.orders) && act.orders === 0) || cstat === 'conversion_cero_actual') && !(fin(sale) && sale > 0);
    if (conv0 && !inconsistent) caps.push('Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa.');
    const conversion = !act.known || !fin(act.sessions) || !fin(act.orders) ? (cstat === 'conversion_cero_actual' && conv0 ? 'cero_observado' : 'no_verificable') : conv0 ? 'cero_observado' : issues.some((x) => x.code !== 'conciliacion_pendiente') ? 'pendiente_de_interpretacion' : 'observable';
    steps.push({ n: 4, name: 'Indicadores y denominadores', outcome: inconsistent ? 'bloqueo' : issues.length ? 'inconsistencia pendiente de interpretación' : conv0 ? 'conversión cero (resultado observable)' : 'ok', hard: !!inconsistent });
    // 5 · composición y límites de atribución
    const comp = cmp === 'cambio_de_composicion';
    if (comp) caps.push('El conjunto de canales o segmentos no es el mismo que en el comparable.');
    steps.push({ n: 5, name: 'Cambios de composición y límites de atribución', outcome: comp ? 'cambio de composición' : 'ok', hard: false });
    // 6 · nivel final: un bloqueo duro manda; ninguna limitación posterior lo degrada a «Baja»
    let level, reasons;
    if (hard.length) { level = 'Insuficiente'; reasons = hard.slice(); }
    else if (soft.length) { level = 'Baja'; reasons = [...soft, ...caps]; }
    else {
      level = r.support === 'alto' && !(r.warnings || []).length ? 'Alta' : 'Media'; const out = [];
      if (level === 'Media') { (r.warnings || []).forEach((w) => out.push(w)); if (fin(r.coverage) && r.coverage < 0.9) out.push(`Se compararon ${Math.round(r.coverage * 100)} % de los días.`); if (!out.length && !caps.length) out.push('Respaldo medio de los datos.'); }
      if (caps.length) { if (level === 'Alta') level = 'Media'; out.push(...caps); }
      reasons = level === 'Alta' ? [] : out;
    }
    steps.push({ n: 6, name: 'Nivel de confiabilidad final', outcome: level, hard: level === 'Insuficiente' });
    const cause = CAUSE_ORDER.find((c) => causes.includes(c)) || null;
    // Clasificación del dato (C1): cuatro categorías que no se confunden.
    const dataClass = inconsistent || cmp === 'no_calculable' ? 'no_calculable' : (unkAct || noActual) ? 'no_verificable' : issues.length ? 'inconsistente' : 'valido';
    return { level, reasons, caps, causes, cause, cmp, act, conv0: conv0 && !inconsistent, comp, steps, noAct, inconsistent: !!inconsistent, hasPlan, issues, dataClass, reconciliation, conversion, partialZero };
  }

  /* ===== Construcción de Z1 (pasos 7 y 8) ===== */
  function build(i) {
    const rv = i.revenue || {}, fc = i.forecast || {}, ev = evaluate(i), level = ev.level, mode = MODE[level], cmp = ev.cmp;
    const cpl = completenessOf(i, ev.act), closing = cpl.status === 'verificada' ? ' Lectura sustentada en datos completos.' : cpl.status === 'incompleta' ? ' Lectura calculable; la información disponible está incompleta.' : ' No es posible confirmar que la información esté completa.';
    const growthOk = cmp === 'valida' && i.comparable && fin(i.comparable.growthPct);
    const coverage = fin(i.reliability && i.reliability.coverage) ? i.reliability.coverage : null;
    const ax = CC.classifyBusinessState({ compliance: fin(rv.compliance) ? rv.compliance : null, forecastGapPct: fin(fc.gapPct) ? fc.gapPct : null, growthVsComparable: growthOk ? i.comparable.growthPct : null,
      coverage, findings: i.findings || [], dataWarnings: level === 'Media', concentration: !!i.concentration, blockingData: level === 'Insuficiente' });
    const stateId = level === 'Insuficiente' ? 'sin_base' : ax.state;
    const state = { id: stateId, label: STATE_LABEL[stateId], qualifiers: ax.qualifiers || [], shown: level === 'Alta' || level === 'Media', definitive: level === 'Alta' };
    if (level === 'Baja') { state.shown = false; state.label = null; }
    if (level === 'Insuficiente') state.shown = true;

    /* --- D-01: venta observada, venta comparable, cumplimiento, brecha y diagnóstico se tratan por separado --- */
    const observedValid = fin(rv.actualToDate) && rv.actualToDate >= 0 && ev.act.observable && !ev.inconsistent && cmp !== 'no_calculable' && i.period.daysCounted > 0 && !ev.noAct;
    const gapVisible = ev.hasPlan && fin(rv.gap) && observedValid && level !== 'Insuficiente';
    const C = ax.axes ? ax.axes.C : null, F = ax.axes ? ax.axes.F : null;
    const observed = observedValid ? { visible: true, amount: rv.actualToDate, display: money(rv.actualToDate) } : { visible: false, amount: null, display: null, reason: ev.causes.includes('sin_actividad') ? 'Sin actividad registrada' : ev.causes.includes('sin_dato_actividad') ? 'Actividad no verificable' : ev.inconsistent || cmp === 'no_calculable' ? 'Resultado no calculable' : 'Sin venta real contada' };
    const plan = gapVisible ? { visible: true, amount: rv.planToDate, display: money(rv.planToDate) } : { visible: false, amount: null, display: null };
    const compliance = gapVisible && fin(rv.compliance) ? { visible: true, value: rv.compliance, display: pct(rv.compliance), preliminary: level === 'Baja' } : { visible: false, value: null, display: null };
    const dirOf = () => (C === 'arriba' ? 'por_encima' : C === 'en_plan' ? 'en_linea' : 'por_debajo');
    const primary = gapVisible
      ? { kind: 'brecha', amount: rv.gap, display: money(rv.gap), direction: dirOf(), label: 'Brecha vs plan a la fecha', base: `plan de los mismos ${i.period.daysCounted} días`, preliminary: level === 'Baja' }
      : observedValid ? { kind: 'venta_observada', amount: rv.actualToDate, display: money(rv.actualToDate), direction: null, label: 'Venta observada', base: `periodo al ${i.period.cutoff}; sin comparación válida contra el plan`, preliminary: false } : null;
    const eco = { primary, observed, plan, compliance, contribution: null };
    // D-02: la contribución nunca es la cifra protagonista; se muestra en detalle, estimada y solo si hay una brecha válida y el margen está configurado
    if (!gapVisible) eco.contribution = { status: 'oculta', amount: null, detailOnly: false, note: 'Sin una brecha válida contra el plan no se estima contribución.' };
    else {
      const mg = i.margin, raw = mg && mg.grossMarginPct, hasRaw = !(raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')), v = hasRaw ? ECON.validateMarginInput(raw) : null;
      if (mg && mg.marginEnabled === true && hasRaw && !v.ok) {
        // C4: Z1 NO define un rango propio. «No válido» es exactamente lo que rechaza la validación del motor (margen bruto sobre venta = (venta − costo) ÷ venta, contrato de Fase 2);
        // se distingue de «no configurado» (vacío o nulo) porque hay un valor que revisar, y nunca produce un importe.
        eco.contribution = { status: 'invalido', amount: null, display: null, marginPct: null, marginDisplay: null, detailOnly: true, preliminary: level === 'Baja', validation: { code: v.code, message: v.message, source: 'FP.economics.validateMarginInput' }, limitations: [`El motor rechazó el margen guardado: ${v.message}`], note: 'Margen no válido' };
      } else {
        const c = ECON.contributionOf({ status: 'ok', amount: { point: rv.gap } }, i.margin), amt = c.amount ? (c.amount.point === 0 ? 0 : c.amount.point) : null;
        // C5: un 0 % solo es una configuración válida si es EXPLÍCITO. La evidencia de configuración que deja el motor (buildSetting) es marginEnabled = true y la fecha
        // `updatedAt`; sin ella, un 0 puede ser un valor predeterminado que no demuestra una configuración real, y no se estima nada.
        const explicit = !!(mg && mg.marginEnabled === true && typeof mg.updatedAt === 'string' && mg.updatedAt);
        if (c.status === 'disponible' && c.marginPct === 0 && !explicit) {
          eco.contribution = { status: 'no_confirmado', amount: null, display: null, marginPct: null, marginDisplay: null, detailOnly: true, preliminary: level === 'Baja', limitations: ['Hay un margen de 0 % sin evidencia de haber sido configurado (sin fecha de actualización): no se estima contribución.'], note: 'Margen sin confirmar' };
        } else {
          const lim = c.status === 'disponible' ? ['Estimación sobre la brecha contra el plan con el margen bruto promedio general: no es el margen real del canal, producto o pedido ni una contribución observada.'].concat(
            c.marginPct === 0 ? ['Margen configurado explícitamente en 0 %: la contribución estimada es $0; no indica que el canal o el producto tengan un margen real de 0 %.'] : [], explicit ? [] : ['Sin fecha de actualización del margen.']) : [];
          eco.contribution = { status: c.status, amount: amt, display: amt !== null ? money(amt) : null, marginPct: c.marginPct, marginDisplay: fin(c.marginPct) ? `${Number(c.marginPct.toFixed(1))} %` : null, detailOnly: true, preliminary: level === 'Baja', explicit: c.status === 'disponible' ? explicit : null, limitations: lim,
            note: c.status === 'no_configurado' ? 'Margen no configurado' : c.status === 'desactivado' ? 'Margen desactivado' : 'Estimada con el margen bruto promedio general; no es utilidad ni margen real por canal o producto.' };
        }
      }
    }
    const evoVisible = growthOk && (level === 'Alta' || level === 'Media');
    const comparable = { sale: evoVisible && fin(i.comparable.baseRevenue) ? { visible: true, amount: i.comparable.baseRevenue, display: money(i.comparable.baseRevenue) } : { visible: false, amount: null, display: null }, label: i.comparable && i.comparable.label };
    const compS = i.comparable && i.comparable.label ? (i.comparable.short || String(i.comparable.label).replace(/\s*\([^)]*\)/g, '').trim()) : null;
    const dev = fin(rv.compliance) ? pct(rv.compliance - 1) : null;
    const dirPhrase = C === 'arriba' ? 'por encima de' : C === 'en_plan' ? 'en línea con' : 'por debajo de';
    const closeW = fin(fc.gapPct) ? (F === 'riesgo' ? 'el cierre proyectado no la alcanzaría' : fc.gapPct >= 0.01 ? 'el cierre proyectado la superaría' : 'el cierre proyectado quedaría en línea con ella') : '';
    const acumulada = C === 'arriba' ? 'supera la meta acumulada' : C === 'en_plan' ? 'está en línea con la meta acumulada' : 'está por debajo de la meta acumulada';

    /* --- D-03: el veredicto interpreta; sin importes, sin cifras de las tarjetas, sin frases genéricas --- */
    let verdict, kind;
    const cause = ev.cause;
    const zeroSale = observed.visible && observed.amount === 0, lead = zeroSale ? (ev.conv0 ? 'Hubo sesiones, pero no se registró ningún pedido ni venta' : 'No se registró venta en el periodo, aunque sí hubo actividad') : 'Hay venta registrada';
    if (mode === 'sin_lectura') {
      kind = 'sin_lectura';
      verdict = cause === 'no_calculable' ? 'El resultado no es calculable con los datos actuales: no es posible emitir una lectura del negocio.'
        : cause === 'sin_actividad' ? 'No hay actividad observable en el periodo: no es posible emitir una lectura del negocio.'
        : cause === 'sin_dato_actividad' ? 'No se puede verificar la actividad del periodo: no es posible emitir una lectura del negocio.'
        : cause === 'sin_venta' ? 'Todavía no hay venta real contada en el periodo: no es posible emitir una lectura del negocio.'
        : cause === 'sin_plan' && observed.visible ? `${lead}${zeroSale ? '; sin plan' : ', pero sin plan'} del periodo no es posible valorar el cumplimiento.`
        : observed.visible ? `${lead}${zeroSale ? '; los' : ', pero los'} datos no alcanzan para valorar el cumplimiento ni emitir una lectura del negocio.`
        : 'No es posible emitir una lectura del negocio con la información disponible.';
    } else if (mode === 'preliminar') {
      kind = 'preliminar'; verdict = ev.conv0 ? 'Lectura preliminar: hay sesiones, pero no se registró ningún pedido; los datos tienen limitaciones y no permiten una conclusión definitiva.' : `Lectura preliminar: la venta acumulada parece estar ${dirPhrase} la meta, pero los datos tienen limitaciones y no permiten una conclusión definitiva.`;
    } else {
      const sid = stateId; let s; const closeClause = closeW ? `; ${closeW}` : '';
      if (ev.conv0) { kind = 'conversion_cero'; s = 'Hay sesiones en el periodo, pero no se registró ningún pedido; es un resultado observado, sin causa atribuida.'; }
      else if (ev.comp) { kind = 'composicion'; s = `La venta acumulada ${acumulada}; la composición cambió frente al comparable, por lo que no se interpreta la evolución.`; }
      else {
        kind = sid;
        if (sid === 'creciendo') s = `La venta crece contra ${compS} y ${C === 'arriba' ? 'supera la meta acumulada' : 'está en línea con la meta acumulada'}${closeClause}.`;
        else if (sid === 'creciendo_bajo_potencial') s = C === 'debajo' ? `La venta crece contra ${compS}, pero sigue por debajo de la meta acumulada${closeClause}.` : `La venta crece contra ${compS}, pero ${closeW || 'el cierre proyectado está en riesgo'}.`;
        else if (sid === 'deterioro') s = `La venta cae contra ${compS} y ${C === 'debajo' ? 'está por debajo de la meta acumulada' : C === 'arriba' ? 'aún supera la meta acumulada' : 'está en línea con la meta acumulada'}${closeClause}.`;
        else if (sid === 'riesgo_cumplimiento') s = C === 'debajo' ? `La venta acumulada está por debajo de la meta${closeClause}.` : `La venta acumulada ${C === 'arriba' ? 'supera la meta' : 'está en línea con la meta'}, pero ${closeW || 'el cierre proyectado está en riesgo'}.`;
        else s = `La venta acumulada ${acumulada}${closeClause}.`;
      }
      verdict = mode === 'con_avisos' ? `Con avisos: ${lowerFirst(s)} Conclusión con reservas.` : `${s}${closing}`;
      if (mode === 'con_avisos' && (kind === 'conversion_cero')) verdict = `Con avisos: ${lowerFirst(s)}`;
      if (mode === 'definitiva') verdict = `${s}${closing}`;
    }
    /* --- narrativa corta: sin cifras (las cifras viven en las tarjetas) --- */
    const qual = (g) => (g >= 0.03 ? 'es positiva' : g <= -0.03 ? 'es negativa' : Math.abs(g) < 0.01 ? 'se mantiene estable' : g > 0 ? 'es ligeramente positiva' : 'es ligeramente negativa');
    const parts = [];
    if (mode === 'sin_lectura') parts.push(cause === 'sin_actividad' ? 'Confirma que los datos del periodo estén cargados antes de interpretar el resultado.' : cause === 'sin_dato_actividad' ? 'Completa los datos de actividad del periodo antes de interpretar el resultado.' : 'Completa la información que falta para ver el estado del negocio.');
    else if (mode === 'preliminar') parts.push('Corrige los datos antes de decidir con esta lectura.');
    else {
      if (kind === 'conversion_cero') parts.push('El resultado se informa tal como se observó, sin atribuirle una causa.');
      else if (kind === 'composicion') parts.push('La separación entre efecto de composición y desempeño de los componentes se detalla en «Qué ocurrió y por qué».');
      else if (growthOk && !['creciendo', 'creciendo_bajo_potencial', 'deterioro'].includes(stateId)) parts.push(`La evolución contra ${compS} ${qual(i.comparable.growthPct)}.`);
      else if (!growthOk) parts.push(cmp === 'recuperacion_desde_cero' ? 'El periodo comparable no registró pedidos: no hay porcentaje de evolución que mostrar.' : cmp === 'datos_insuficientes' ? 'Faltan datos del comparable para valorar la evolución.' : 'Sin base comparable no se puede valorar la evolución.');
      if (mode === 'con_avisos') parts.push('La lectura va con avisos; sus motivos están a la vista.');
      else if (parts.length < 2) parts.push(`Se apoya en ${i.period.daysCounted} días contados y en datos sin avisos.`);
    }
    const corta = parts.slice(0, 2).join(' ') || (mode === 'definitiva' ? 'La lectura se apoya en datos sin avisos.' : 'La lectura va con avisos; sus motivos están a la vista.');
    /* --- narrativa ampliada: cuatro capas separadas --- */
    const hecho = observed.visible ? `Al ${i.period.cutoff}, la venta observada de ${i.period.label} es ${observed.display}${plan.visible ? ` contra una meta acumulada de ${plan.display}` : ''}.` : (cause === 'sin_actividad' ? 'No hay actividad observable (sesiones, pedidos ni venta) en el periodo.' : cause === 'sin_dato_actividad' ? 'No hay datos suficientes para verificar la actividad del periodo.' : 'No hay una venta observada válida en el periodo.');
    const interp = mode === 'sin_lectura' ? 'Con esta información no puede emitirse una interpretación del estado del negocio.'
      : mode === 'preliminar' ? 'La diferencia observada es una interpretación preliminar: los datos no respaldan una lectura definitiva.'
      : `Con ${fin(rv.compliance) ? pct(rv.compliance) : '—'} de cumplimiento acumulado, el estado es «${STATE_LABEL[stateId]}»${growthOk ? `, con una evolución de ${spct(i.comparable.growthPct)} contra ${i.comparable.label}` : `; la evolución no se valora (${COMPARABILITY[cmp].toLowerCase()})`}.`;
    const limit = [...ev.reasons]; if (level === 'Alta' && cpl.status !== 'verificada') limit.push(cpl.note); if (eco.contribution.status === 'no_configurado') limit.push('No se estima contribución: el margen no está configurado.'); if (eco.contribution.status === 'invalido') limit.push('No se estima contribución: el margen guardado no es válido.'); if (eco.contribution.status === 'no_confirmado') limit.push('No se estima contribución: el margen de 0 % no está confirmado.');
    const close = fin(fc.close) ? money(fc.close) : null, fgp = fin(fc.gapPct) ? pct(fc.gapPct) : null;
    const larga = { hecho, interpretacion: interp, limitaciones: limit.length ? limit.join(' ') : 'Sin limitaciones relevantes en los datos de este periodo.',
      implicacion: mode === 'sin_lectura' ? 'Hasta completar esa información no conviene decidir con esta lectura.' : mode === 'preliminar' ? 'Conviene corregir los datos antes de actuar sobre esta diferencia.'
        : (close && fgp ? `Si el ritmo actual se mantiene, el periodo cierra en ${close}, ${F === 'riesgo' ? `${fgp} por debajo de la meta` : (fc.gapPct >= 0.01 ? `${fgp} por encima de la meta` : 'en línea con la meta')}.` : 'No hay pronóstico de cierre disponible para valorar la implicación.') };
    /* --- paso 7: visibilidad --- */
    const diagnosis = level === 'Alta' ? 'disponible' : level === 'Media' ? 'con_reservas' : level === 'Baja' ? 'no_concluyente' : 'no_disponible';
    const known = [], notConcluded = [];
    if (observed.visible) known.push('Venta observada del periodo'); if (gapVisible) known.push(level === 'Baja' ? 'Cumplimiento y brecha contra el plan (preliminares)' : 'Cumplimiento y brecha contra el plan');
    if (!gapVisible) notConcluded.push('Cumplimiento y brecha contra el plan'); if (!evoVisible) notConcluded.push('Evolución contra el comparable'); if (diagnosis === 'no_concluyente' || diagnosis === 'no_disponible') notConcluded.push('Diagnóstico del comportamiento comercial');
    const convGap = !ev.noAct && ev.conversion === 'no_verificable' && ev.act.known; if (convGap) notConcluded.push('Conversión del periodo (falta la medida de sesiones o de pedidos)');
    if (ev.issues.length) notConcluded.push('Interpretación de las combinaciones pendientes entre sesiones, pedidos y venta');
    const show = ['estado', 'confiabilidad', 'periodo', 'veredicto', 'narr-corta', 'narr-larga'], hide = [];
    (primary ? show : hide).push('economico');
    (level !== 'Alta' ? show : hide).push('condicion'); (level !== 'Alta' || convGap ? show : hide).push('alcance');
    ((level === 'Alta' || level === 'Media') && gapVisible && fin(fc.close) ? show : hide).push('cierre');
    ((level === 'Alta' || level === 'Media') ? show : hide).push('evolucion');
    (['disponible', 'no_configurado', 'desactivado', 'invalido', 'no_confirmado'].includes(eco.contribution.status) ? show : hide).push('contribucion');
    const derive = { Z2: [], Z3: [], Z4: [], Z5: [] };
    if (mode === 'sin_lectura') { derive.Z2.push('No se muestra'); derive.Z3.push('Hallazgos de datos'); derive.Z4.push('Acción de datos: ' + (ev.reasons[0] || 'completar información')); derive.Z5.push('Qué falta para concluir', 'Confiabilidad y cobertura'); }
    else {
      derive.Z2.push(mode === 'preliminar' ? 'Diagnóstico no concluyente (solo lo observado)' : kind === 'conversion_cero' ? 'Límites del diagnóstico (sin atribuir causa)' : kind === 'composicion' ? 'Efecto de composición separado del desempeño de los componentes' : cmp === 'valida' ? 'Puente de drivers con estado de atribución' : `Estado de atribución: ${COMPARABILITY[cmp]} (sin puente)`);
      derive.Z3.push(level === 'Media' || level === 'Baja' ? 'Hallazgos de calidad de datos' : 'Hallazgos, riesgos y oportunidades');
      derive.Z4.push(level === 'Baja' ? 'Acción de datos antes que cualquier recomendación' : 'Acciones destacadas');
      derive.Z5.push('Tablas de cifras y canales', 'Confiabilidad y cobertura');
    }
    return {
      evaluation: { steps: [...ev.steps, { n: 7, name: 'Elementos de Z1 que pueden mostrarse', outcome: `${show.length} visibles, ${hide.length} ocultos`, hard: false }, { n: 8, name: 'Veredicto y narrativa permitidos', outcome: kind, hard: false }], cause },
      reliability: { level, mode, reasons: ev.reasons, caps: ev.caps, visibleReasons: level !== 'Alta', cause, causes: ev.causes },
      state, comparability: { code: cmp, label: COMPARABILITY[cmp], growth: growthOk ? { pct: i.comparable.growthPct, display: spct(i.comparable.growthPct), base: i.comparable.label } : null },
      economic: eco, comparable, forecast: fin(fc.close) ? { close: fc.close, display: money(fc.close), gapPct: fin(fc.gapPct) ? fc.gapPct : null } : null,
      scope: { known, notConcluded, diagnosis, diagnosisLabel: DIAGNOSIS_LABEL[diagnosis] },
      // C1/C2: clasificación del dato y conciliación. C3: cada conclusión tiene su propio estado según los datos que ELLA necesita.
      data: { class: ev.dataClass, issues: ev.issues, reconciliation: ev.reconciliation },
      completeness: cpl,
      conclusions: {
        ventaObservada: observed.visible ? 'valida' : ev.causes.includes('sin_actividad') ? 'sin_actividad' : ev.causes.includes('sin_dato_actividad') || ev.causes.includes('sin_venta') ? 'no_verificable' : ev.dataClass === 'no_calculable' ? 'no_calculable' : 'no_verificable',
        cumplimiento: gapVisible ? (level === 'Baja' ? 'preliminar' : level === 'Media' ? 'con_reservas' : 'concluyente') : 'no_concluyente',
        evolucion: evoVisible ? 'valorable' : 'no_valorable', conversion: ev.noAct ? 'no_verificable' : ev.conversion, contribucion: eco.contribution.status },
      verdict: { kind, emit: mode !== 'sin_lectura', text: verdict, words: words(verdict) },
      narrative: { short: corta, long: larga }, show, hide, derive
    };
  }

  /* ===== Validador de texto: las reglas de contenido del veredicto, ejecutables sobre CUALQUIER texto ===== */
  const RULES = {
    R1: 'Con confiabilidad Baja o Insuficiente no hay verbos de certeza ni afirmaciones asertivas (la preliminar solo puede hablar con «parece»).',
    R2: 'Sin comparación válida no se habla de crecimiento, caída ni deterioro.',
    R3: 'La dirección del texto coincide con el signo real de la brecha.',
    R4: 'El veredicto no lleva importes en pesos.',
    R5: 'Sin utilidad, ganancia o beneficio neto, ROI, ROAS ni CAC.',
    R6: 'Máximo 34 palabras y 240 caracteres.',
    R7: 'Sin causas inventadas ni sugeridas (falla, checkout, calidad del tráfico, precio, campañas…): los motores no respaldan «porque» ni «se debe a».',
    R8: 'Sin confiabilidad suficiente no se afirma una etiqueta de estado.',
    R9: 'Sin margen configurado no se habla de contribución como cifra (ni como 0).',
    R10: 'A lo sumo un número, y ninguno que repita una cifra de las tarjetas.',
    R11: 'Sin frases genéricas («buen desempeño», «mal resultado», «va bien»).',
    R12: 'Sin actividad no se infiere crecimiento, deterioro ni estabilidad, ni se concluye sobre conversión.',
    R13: 'No se presenta una brecha o un cumplimiento, favorable o desfavorable, si no hay una brecha válida contra el plan.',
    R14: 'Con cambio de composición no se habla de mejora ni de deterioro de eficiencia.'
  };
  const STATE_WORDS = /\b(riesgo de incumplir|en deterioro|en crecimiento|cumpliendo el plan|crece, pero)\b/i;
  const GROW_WORDS = /\b(crece|crecimiento|creciendo|cae|caes|deterioro|sube|baja|estable|estabilidad)\b/i;
  const ASSERT = /\b(supera|crece|cae|no la alcanzaría|la superaría|quedaría en línea|está en línea|está por debajo)\b/i;
  const DIRECTION = /(por debajo de la meta|por encima de la meta|en línea con la meta|supera la meta|está en línea|está por debajo|no la alcanzaría|la superaría|\bcumple\b|\bcumpliendo\b|\bincumpl\w*)/i;
  function cardNumbers(o) {
    const n = (s) => String(s || '').replace(/ /g, ' ').match(/\d+(?:\.\d+)?/g) || [];
    return new Set([...n(o.economic.compliance && o.economic.compliance.display), ...n(o.forecast && o.forecast.gapPct !== null && o.forecast ? pct(o.forecast.gapPct) : ''), ...n(o.comparability.growth && o.comparability.growth.display), ...n(o.economic.primary && o.economic.primary.display), ...n(o.economic.observed.display), ...n(o.economic.plan.display)]);
  }
  function checkVerdictText(raw, o) {
    const text = String(raw).replace(/ /g, ' '), v = [], low = o.reliability.level === 'Baja' || o.reliability.level === 'Insuficiente';
    const nums = (text.replace(/\b(19|20)\d{2}\b/g, '').match(/\d+(?:\.\d+)?/g)) || [];
    if (o.reliability.level === 'Baja' && (!/^Lectura preliminar:/.test(text) || /\b(supera|crece|cae|no la alcanzaría|la superaría)\b/i.test(text) || (/(por debajo de|por encima de|en línea con) la meta/i.test(text) && !/parece/i.test(text)))) v.push('R1');
    if (o.reliability.level === 'Insuficiente' && (ASSERT.test(text) || /^La venta\b/.test(text))) v.push('R1');
    if (o.comparability.code !== 'valida' && GROW_WORDS.test(text) && !['sin_actividad', 'sin_dato_actividad'].includes(o.reliability.cause)) v.push('R2');
    const p = o.economic.primary;
    if (p && p.kind === 'brecha') {
      if (/(está|va|queda) por debajo de la meta/.test(text) && p.amount >= 0) v.push('R3');
      if (/(por encima de la meta|\bsupera la meta)/.test(text) && p.amount <= 0) v.push('R3');
    }
    if (/\$\s?\d/.test(text)) v.push('R4');
    if (/utilidad neta|ganancia neta|beneficio neto|beneficio financiero|rentabilidad neta|\bROI\b|\bROAS\b|\bCAC\b/i.test(text)) v.push('R5');
    if (words(text) > 34 || text.length > 240) v.push('R6');
    if (/\b(porque|se debe a|debido a|a causa de|provocó|provocado por|falla\w*|fallo\w*|checkout|tráfico de baja calidad|calidad del tráfico|experiencia de usuario|UX|precio|inventario|desabasto|campañas?|marketing)\b/i.test(text)) v.push('R7');
    if ((!o.state.shown && o.state.id !== 'sin_base' && STATE_WORDS.test(text)) || (low && o.state.id === 'sin_base' && STATE_WORDS.test(text))) v.push('R8');
    const c = o.economic.contribution;
    if ((c.status === 'no_configurado' || c.status === 'desactivado' || c.status === 'oculta') && /contribuci[oó]n[^.]*\$\s?\d/i.test(text)) v.push('R9');
    const cn = cardNumbers(o);
    if (nums.length > 1 || nums.some((x) => cn.has(x))) v.push('R10');
    if (/\b(buen|mal|excelente|pésimo|bueno|malo)\s+(desempeño|resultado|rendimiento)\b|\bva\s+(muy\s+)?(bien|mal)\b/i.test(text)) v.push('R11');
    if (['sin_actividad', 'sin_dato_actividad'].includes(o.reliability.cause) && (GROW_WORDS.test(text) || /\b(conversión|pedidos)\b/i.test(text))) v.push('R12');
    if (!(p && p.kind === 'brecha') && DIRECTION.test(text)) v.push('R13');
    if (o.comparability.code === 'cambio_de_composicion' && /\b(mejora|mejoró|empeora|empeoró|eficiencia|eficiente|más productivo)\b/i.test(text)) v.push('R14');
    return [...new Set(v)];
  }

  return { LEVELS, MODE, COMPARABILITY, FROM_ATTRIBUTION, STATE_LABEL, STATES, DIAGNOSIS_LABEL, NAMES, ELEMENTS, GROW_WORDS, RULES, CAUSE_ORDER, evaluate, build, checkVerdictText, comparability, money, pct, spct, words, sentences };
});
