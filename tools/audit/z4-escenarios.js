/**
 * z4-escenarios.js — Escenarios de Z4 «Qué hago» (Subfase 3.4): ENTRADAS y COMPORTAMIENTO ESPERADO.
 * Las acciones candidatas imitan lo que hoy emiten los motores (attentionEngine.next, guide.nextStep, recoveryEngine) y se apoyan en el catálogo de
 * elementos de Z3 (tools/audit/z3-escenarios.js). El comportamiento esperado se razonó desde 3.1 §7.4, D-03 y la aclaración B ANTES de ejecutar la
 * especificación. Todo es ILUSTRATIVO (datos simulados); ninguna acción ni importe proviene de datos reales de FESA.
 */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./command-center-contracts.js'), require('./z3-atencion.js'), require('./z3-escenarios.js')); else root.CCZ4Scenarios = factory(root.CCContracts, root.CCZ3, root.CCZ3Scenarios); })(typeof window !== 'undefined' ? window : globalThis, function (CC, Z3, S3) {
  'use strict';
  const k0 = S3.K(undefined), key = (f) => CC.dedupKey(f);
  const A = (o) => ({ id: 'a:x', kind: 'revisar', label: 'Ver el diagnóstico de la brecha', destination: { view: 'diagnostico', label: 'Diagnóstico de brecha' }, source: { engine: 'attentionEngine', field: 'next' }, basis: 'La venta acumulada queda por debajo del plan de los mismos días.', motivatedBy: [key(k0.gap)], requires: [], ...o });
  const C = {
    gap: A({ id: 'a:gap' }),
    gapDup: A({ id: 'a:gap-guia', source: { engine: 'guide', field: 'nextStep' } }),
    gapCanales: A({ id: 'a:gap-canales', label: 'Abrir el cumplimiento por canal', destination: { view: 'canales', label: 'Canales' } }),
    canal: A({ id: 'a:canal', label: 'Abrir el detalle de Ecommerce', destination: { view: 'segmentos', label: 'Segmentos' }, basis: 'Ecommerce queda por debajo de su plan de los mismos días.', motivatedBy: [key(k0.canal)] }),
    cierre: A({ id: 'a:cierre', label: 'Revisar el pronóstico de cierre', destination: { view: 'pronostico', label: 'Pronóstico' }, basis: 'El cierre proyectado queda por debajo de la meta.', motivatedBy: [key(k0.riesgo)] }),
    driver: A({ id: 'a:driver', kind: 'investigar', label: 'Comparar el embudo de conversión por semana', destination: { view: 'embudo', label: 'Embudo' }, basis: 'La conversión tiene la mayor contribución matemática a la brecha.', motivatedBy: [key(k0.driver)] }),
    rec: A({ id: 'a:rec', kind: 'decidir', label: 'Evaluar las alternativas de recuperación', destination: { view: 'recuperacion', label: 'Recuperación' }, source: { engine: 'recoveryEngine', field: 'recoveryOptions' }, basis: 'Hay dos alternativas estimadas que cierran la misma brecha.', motivatedBy: [key(k0.rec1), key(k0.rec2)] }),
    hip: A({ id: 'a:hip', kind: 'investigar', label: 'Comprobar la conversión de App con dos semanas más', destination: { view: 'segmentos', label: 'Segmentos' }, source: { engine: 'analistaDetectors', field: 'validation' }, basis: 'Hay una señal por confirmar en App.', motivatedBy: [key(k0.hipotesis)] }),
    hipDecidir: A({ id: 'a:hip-decidir', kind: 'decidir', label: 'Evaluar el presupuesto de App', destination: { view: 'escenarios', label: 'Escenarios' }, basis: 'Hay una señal por confirmar en App.', motivatedBy: [key(k0.hipotesis)] }),
    meta: A({ id: 'a:meta', kind: 'datos', label: 'Definir la meta anual', destination: { view: 'metas', label: 'Metas' }, basis: 'Sin la meta anual no se puede valorar el cumplimiento del año.', motivatedBy: [key(k0.datoCritico)], requires: [] }),
    calidad: A({ id: 'a:calidad', kind: 'datos', label: 'Revisar los avisos de calidad de la carga', destination: { view: 'calidad', label: 'Calidad' }, basis: 'Hay registros con avisos que no se excluyeron.', motivatedBy: [key(k0.datoAviso)] }),
    filas: A({ id: 'a:filas', kind: 'datos', label: 'Corregir las filas rechazadas de la carga', destination: { view: 'calidad', label: 'Calidad' }, basis: 'Las filas rechazadas impiden una lectura concluyente.', motivatedBy: [], requires: ['Corregir las filas rechazadas de la carga'] }),
    generica: A({ id: 'a:generica', label: 'Mejorar las ventas' }),
    sinMotivo: A({ id: 'a:sin-motivo', motivatedBy: [] }),
    conImporteEnTexto: A({ id: 'a:importe', label: 'Recuperar $722 mil con la conversión' }),
    conImportePropio: A({ id: 'a:amount', amount: 722816 }),
    conTarea: A({ id: 'a:tarea', owner: 'Equipo digital', dueDate: '2026-10-01', status: 'en curso' }),
    huerfana: A({ id: 'a:huerfana', motivatedBy: ['total|total|-|revenue|2026-09|plan|no_existe'] }),
    causal: A({ id: 'a:causal', label: 'Corregir el checkout porque provocó la caída' }),
    asignada: A({ id: 'a:asignada', label: 'Asignar al responsable de Ecommerce la revisión' })
  };
  const MISS = { filas: { label: 'Corregir las filas rechazadas de la carga', view: 'calidad' }, meta: { label: 'Definir la meta anual', view: 'metas' } };
  const input = (findings, level, actions, missing) => { const z3in = { findings, reliability: { level }, missing: missing || [] }; return { z3in, actions }; };
  const S = (n, id, titulo, inp, expect) => ({ n, id, titulo, origen: 'ilustrativo (acciones y elementos simulados con el formato de los motores)', input: inp, expect });
  const base7 = S3.base7(undefined);

  const SCENARIOS = [
    S(1, 'completo-alta', 'Acciones para las tres clases con confiabilidad alta', input(base7, 'Alta', [C.gap, C.canal, C.cierre, C.driver, C.rec]),
      { mode: 'completo', status: 'con_acciones', header: '3 de 5', featured: ['a:cierre', 'a:rec', 'a:gap'], order: ['a:cierre', 'a:rec', 'a:gap', 'a:canal', 'a:driver'], seeAll: true, held: 0, rejected: 0, citesOf: { 'a:rec': 2 } }),
    S(2, 'completo-media', 'Las mismas acciones con confiabilidad media', input(base7, 'Media', [C.gap, C.canal, C.cierre, C.driver, C.rec]),
      { mode: 'completo', status: 'con_acciones', header: '3 de 5', featured: ['a:cierre', 'a:rec', 'a:gap'], seeAll: true, held: 0, rejected: 0 }),
    S(3, 'baja-datos-primero', 'Confiabilidad baja: primero los datos', input(base7, 'Baja', [C.gap, C.canal, C.cierre, C.driver, C.rec, C.filas], [MISS.filas]),
      { mode: 'datos_primero', status: 'con_acciones', header: '3 de 3', order: ['a:filas', 'a:gap', 'a:canal'], kinds: ['datos', 'revisar', 'revisar'], seeAll: false, held: 3, notice: true, rejected: 0 }),
    S(4, 'insuficiente-solo-datos', 'Confiabilidad insuficiente: solo acciones de datos', input([...base7, k0.datoCritico, k0.datoAviso], 'Insuficiente', [C.gap, C.cierre, C.meta, C.calidad], [MISS.meta]),
      { mode: 'solo_datos', status: 'con_acciones', header: '2 de 2', order: ['a:meta', 'a:calidad'], kinds: ['datos', 'datos'], seeAll: false, held: 2, notice: true, rejected: 0 }),
    S(5, 'vacio', 'Sin elementos y sin acciones', input([], 'Alta', []),
      { mode: 'completo', status: 'vacio', header: null, fallback: 'vacio', seeAll: false, held: 0, rejected: 0 }),
    S(6, 'sin-acciones-falta-dato', 'Sin acciones: se dice qué dato falta', input([k0.gap], 'Insuficiente', [], [MISS.meta]),
      { mode: 'solo_datos', status: 'que_falta', header: null, fallback: 'que_falta', fallbackItems: 1, seeAll: false, held: 0, rejected: 0 }),
    S(7, 'baja-sin-base', 'Lectura preliminar sin acciones ni requisitos', input([k0.riesgo], 'Baja', [C.cierre]),
      { mode: 'datos_primero', status: 'sin_base', header: null, fallback: 'sin_base', seeAll: false, held: 1, rejected: 0 }),
    S(8, 'rechazadas', 'Recomendaciones genéricas, sin motivo, con importe, causales o de asignación no se muestran', input([...base7, k0.hipotesis], 'Alta', [C.gap, C.generica, C.sinMotivo, C.conImporteEnTexto, C.conImportePropio, C.hipDecidir, C.causal, C.asignada]),
      { mode: 'completo', status: 'con_acciones', header: '1 de 1', order: ['a:gap'], seeAll: false, held: 0, rejected: 7 }),
    S(9, 'sin-gestion-de-tareas', 'Los campos de responsable, fecha y estatus se ignoran', input(base7, 'Alta', [C.conTarea]),
      { mode: 'completo', status: 'con_acciones', header: '1 de 1', order: ['a:tarea'], stripped: 1, seeAll: false, held: 0, rejected: 0 }),
    S(10, 'accion-sin-elemento', 'Una acción cuyo motivo no está a la vista no se muestra', input(base7, 'Alta', [C.gap, C.huerfana]),
      { mode: 'completo', status: 'con_acciones', header: '1 de 1', order: ['a:gap'], unlinked: 1, seeAll: false, held: 0, rejected: 0 }),
    S(11, 'duplicadas', 'La misma acción propuesta por dos motores es una sola', input(base7, 'Alta', [C.gap, C.gapDup]),
      { mode: 'completo', status: 'con_acciones', header: '1 de 1', order: ['a:gap'], alsoFrom: { 'a:gap': 1 }, seeAll: false, held: 0, rejected: 0 }),
    S(12, 'hipotesis-es-comprobacion', 'Una acción apoyada en una hipótesis es una comprobación', input([k0.gap, { ...k0.hipotesis, severity: 'importante' }], 'Alta', [C.gap, C.hip]),
      { mode: 'completo', status: 'con_acciones', header: '2 de 2', order: ['a:gap', 'a:hip'], taggedHypothesis: ['a:hip'], basisOf: { 'a:hip': 'hipotesis', 'a:gap': 'calculo' }, seeAll: false, held: 0, rejected: 0 }),
    S(13, 'datos-primero-en-media', 'La acción sobre los datos va antes que las demás', input([k0.riesgo, k0.gap, k0.datoCritico], 'Media', [C.cierre, C.gap, C.meta]),
      { mode: 'completo', status: 'con_acciones', header: '3 de 3', order: ['a:meta', 'a:cierre', 'a:gap'], seeAll: false, held: 0, rejected: 0 }),
    S(14, 'impacto-citado-no-se-suma', 'Dos acciones sobre el mismo elemento citan el mismo importe y no lo suman', input([k0.gap], 'Alta', [C.gap, C.gapCanales]),
      { mode: 'completo', status: 'con_acciones', header: '2 de 2', sameImpactRef: ['a:gap', 'a:gap-canales'], seeAll: false, held: 0, rejected: 0 })
  ];
  /** Construye Z3 y Z4 para un escenario. */
  function run(Z4, s, Z3x) { const att = (Z3x || Z3).build(s.input.z3in); return { att, o: Z4.build({ attention: att, actions: s.input.actions }) }; }
  function check(Z4, s) {
    const { att, o } = run(Z4, s), e = s.expect, f = [], w = (m) => f.push(`${s.n} ${s.id}: ${m}`), ids = o.cards.map((c) => c.id), by = (id) => o.cards.find((c) => c.id === id);
    if (o.mode !== e.mode) w(`modo ${o.mode} ≠ ${e.mode}`);
    if (o.status !== e.status) w(`estado ${o.status} ≠ ${e.status}`);
    if (o.header !== e.header) w(`cabecera ${o.header} ≠ ${e.header}`);
    if (e.featured && o.featured.join() !== e.featured.join()) w(`destacadas ${o.featured} ≠ ${e.featured}`);
    if (e.order && ids.join() !== e.order.join()) w(`orden ${ids} ≠ ${e.order}`);
    if (e.kinds && o.cards.map((c) => c.kind).join() !== e.kinds.join()) w(`tipos ${o.cards.map((c) => c.kind)} ≠ ${e.kinds}`);
    if (o.seeAll.visible !== e.seeAll) w(`«Ver todas» visible ${o.seeAll.visible} ≠ ${e.seeAll}`);
    if (o.held.count !== e.held) w(`retenidas ${o.held.count} ≠ ${e.held}`);
    if (o.rejected.length !== e.rejected) w(`rechazadas ${o.rejected.length} ≠ ${e.rejected}: ${o.rejected.map((x) => x.id)}`);
    if (e.notice && !o.notice) w('debe avisar que la confiabilidad limita las recomendaciones');
    if (e.fallback && (!o.fallback || o.fallback.type !== e.fallback)) w(`sin acciones debe mostrar «${e.fallback}» y no una recomendación`);
    if (!e.fallback && o.fallback) w('con acciones no debe haber bloque de reemplazo');
    if (e.fallbackItems !== undefined && o.fallback.items.length !== e.fallbackItems) w('el bloque «qué dato falta» debe listar los requisitos');
    if (e.stripped !== undefined && (o.stripped.length !== e.stripped || o.cards.some((c) => 'owner' in c || 'dueDate' in c || 'status' in c))) w('los campos de gestión de tareas deben ignorarse');
    if (e.unlinked !== undefined && o.unlinked.length !== e.unlinked) w(`sin elemento ${o.unlinked.length} ≠ ${e.unlinked}`);
    if (e.alsoFrom) Object.entries(e.alsoFrom).forEach(([id, nn]) => { if (!by(id) || by(id).alsoFrom.length !== nn) w(`la acción ${id} debe registrar ${nn} motor adicional`); });
    if (e.citesOf) Object.entries(e.citesOf).forEach(([id, nn]) => { if (!by(id) || by(id).cites.length !== nn) w(`la acción ${id} debe citar ${nn} elementos`); });
    if (e.taggedHypothesis) e.taggedHypothesis.forEach((id) => { if (!by(id) || !by(id).tags.some((x) => /comprobación/.test(x))) w(`la acción ${id} debe rotularse como comprobación`); });
    if (e.basisOf) Object.entries(e.basisOf).forEach(([id, lv]) => { if (!by(id) || by(id).basisCertainty.level !== lv) w(`la base de ${id} es ${by(id) && by(id).basisCertainty.level} ≠ ${lv}`); });
    if (e.sameImpactRef) { const r = e.sameImpactRef.map((id) => by(id) && by(id).cites[0].impactRef && by(id).cites[0].impactRef.display); if (!r[0] || r[0] !== r[1] || o.cards.some((c) => 'amount' in c || 'total' in c) || 'totals' in o) w('las acciones citan el importe del elemento, no lo suman ni tienen importe propio'); }
    o.cards.forEach((c) => c.cites.forEach((x) => { if (!att.cards.some((y) => y.id === x.id)) w(`la acción ${c.id} cita un elemento que no está a la vista`); }));
    return f;
  }
  return { SCENARIOS, C, A, MISS, input, run, check, key };
});
