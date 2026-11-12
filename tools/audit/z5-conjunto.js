/* Command Center · Fase 3 (ronda de cierre) — Z5 «Oportunidades y visión de conjunto» como ESPECIFICACIÓN EJECUTABLE (aclaración funcional H-02, derivada de D-07, 12-nov-2026).
 * No es código de la aplicación. No calcula nada: organiza lo que ya dicen Z1, Z3 y Z4 en TRES NIVELES y comprueba la propiedad y las referencias entre zonas (H-01).
 *   Nivel principal 1 · Oportunidades        → las oportunidades identificadas y su relevancia (referencias a su elemento de Z3; sin importes propios).
 *   Nivel principal 2 · Visión de conjunto   → cómo se relacionan las oportunidades con el desempeño (Z1), las prioridades (Z4) y el contexto (Z2).
 *   Nivel secundario · Evidencia y detalle   → desplegable: evidencia, fuentes, periodos, cálculos y referencias, limitaciones, información faltante, confiabilidad.
 * Reglas H-01: una zona propietaria y una fuente de verdad por elemento; las demás zonas referencian, resumen o proponen acciones; las referencias no crean elementos; ningún importe se duplica ni se suma dos veces.
 * Reglas H-02: no hay sexta zona; la evidencia no se elimina ni se traslada a Z2; las advertencias críticas NO se esconden en el desplegable; ningún cálculo ni importe se repite. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.CCZ5 = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  const ZONES = { Z1: 'Qué está pasando', Z2: 'Contexto y desempeño', Z3: 'Qué merece atención', Z4: 'Qué puedo hacer', Z5: 'Oportunidades y visión de conjunto' };
  const OWNER = { cifras: 'Z1', brecha: 'Z1', veredicto: 'Z1', contexto: 'Z2', driver: 'Z2', hallazgo: 'Z3', riesgo: 'Z3', oportunidad: 'Z3', accion: 'Z4' };
  const LEVEL = { z5: ['Oportunidades', 'Visión de conjunto', 'Evidencia y detalle'] };
  const AMOUNT = /[$€]\s?\d|\d[\d.,]*\s?(?:mil|M|millones)\b|\d\s?%/;   // un importe o porcentaje de cálculo escrito en Z5 sería un segundo valor del mismo elemento

  function build({ o1, o3, o4 }) {
    const level = o1.reliability.level, opps = o3.cards.filter((c) => c.clase === 'oportunidad' && !c.isData);
    const actionsOf = (id) => (o4.cards || []).filter((a) => (a.cites || []).some((x) => x.id === id)).map((a) => a.id);
    const items = opps.map((c) => ({ id: `z5:${c.id}`, ref: { zone: 'Z3', id: c.id }, owner: OWNER.oportunidad, title: c.title, relevance: c.severity.label || c.severity.id, certainty: c.certainty.label || c.certainty.level,
      alternatives: c.impact && c.impact.sales && c.impact.sales.exclusiveGroup ? c.impact.sales.exclusiveGroup : null, actions: actionsOf(c.id).map((id) => ({ zone: 'Z4', id })), amount: null }));
    const status = items.length ? 'con_oportunidades' : (o3.withheld.byClass.oportunidad > 0 || o3.mode !== 'completo') ? 'no_disponibles' : 'sin_oportunidades';
    const oppNote = status === 'con_oportunidades' ? 'Cada oportunidad se muestra como referencia a su elemento de Z3 (que conserva el importe, la certeza y los límites).'
      : status === 'no_disponibles' ? 'Con la confiabilidad actual no se presentan oportunidades: no se pueden sostener conclusiones.' : 'No hay oportunidades identificadas en este periodo.';
    /* visión de conjunto: relaciones, sin importes */
    const groups = {}; items.filter((x) => x.alternatives).forEach((x) => { (groups[x.alternatives] = groups[x.alternatives] || []).push(x.ref.id); });
    const lines = [];
    if (items.length) {
      lines.push({ kind: 'desempeno', text: `Se leen frente a la situación de Z1 (${o1.state && o1.state.shown && o1.state.label ? o1.state.label : 'sin etiqueta de estado'}); la cifra y la brecha viven en Z1.`, refs: [{ zone: 'Z1' }] });
      Object.entries(groups).forEach(([g, ids]) => { if (ids.length > 1) lines.push({ kind: 'alternativas', text: `${ids.length} oportunidades son alternativas para cerrar la misma brecha: se presentan como alternativas, no se suman.`, refs: ids.map((id) => ({ zone: 'Z3', id })) }); });
      const withAct = items.filter((x) => x.actions.length).length;
      lines.push({ kind: 'prioridades', text: withAct ? `${withAct} de ${items.length} tienen una acción relacionada en Z4; el orden definitivo de prioridad corresponde a 4.4.` : 'Ninguna tiene todavía una acción ejecutable en Z4.', refs: [{ zone: 'Z4' }] });
    } else lines.push({ kind: 'sin_oportunidades', text: status === 'no_disponibles' ? 'No hay visión de conjunto de oportunidades con la confiabilidad actual.' : 'No hay oportunidades que relacionar con el desempeño.', refs: [] });
    const drv = o3.cards.find((c) => c.explains);
    if (drv && items.length) lines.push({ kind: 'contexto', text: 'El contexto y el desempeño están en Z2 (contribución matemática, no causa demostrada).', refs: [{ zone: 'Z2' }, { zone: 'Z3', id: drv.id }] });
    /* advertencias críticas: SIEMPRE visibles fuera del desplegable (H-02 regla 4) */
    const critical = [];
    if (level !== 'Alta') critical.push({ kind: 'confiabilidad', text: `Confiabilidad ${level}: ${o1.reliability.reasons.length ? o1.reliability.reasons.join(' ') : 'respaldo limitado.'}` });
    if (o1.completeness && o1.completeness.status !== 'verificada' && level !== 'Insuficiente') critical.push({ kind: 'completitud', text: o1.completeness.note });
    if (o3.withheld && o3.withheld.note) critical.push({ kind: 'retenidos', text: o3.withheld.note });
    if (o3.dataPanel && o3.dataPanel.items.length) critical.push({ kind: 'faltante', text: `Falta para concluir: ${o3.dataPanel.items.map((m) => m.label).join('; ')}.` });
    if (items.some((x) => o3.cards.find((c) => c.id === x.ref.id).hypotheses.length)) critical.push({ kind: 'hipotesis', text: 'Hay hipótesis asociadas (aparte, sin confirmar): no sostienen ninguna conclusión.' });
    /* evidencia y detalle: desplegable; fuentes, periodos, cálculos y referencias, limitaciones, faltantes, confiabilidad (sin repetir cifras ni importes) */
    const sources = [...new Set(opps.flatMap((c) => c.evidence.concat(c.support).map((e) => e.source)))];
    const periods = [...new Set(opps.map((c) => c.period && c.period.key).filter(Boolean))];
    const calcs = [...new Set(opps.filter((c) => c.impact && c.impact.sales).map((c) => `${c.impact.sales.engine}: ${c.impact.sales.method}`))];
    const limits = [...new Set(opps.flatMap((c) => c.limitations))];
    const evidence = { collapsed: true, title: LEVEL.z5[2], items: [
      { kind: 'cifras', text: 'Las cifras del periodo (venta, meta, brecha, cumplimiento, cierre) se leen en Z1, que es su propietaria; aquí solo se referencian.', ref: { zone: 'Z1' } },
      { kind: 'fuentes', text: sources.length ? sources.join(' · ') : 'Sin fuentes de oportunidades en este periodo.' }, { kind: 'periodos', text: periods.length ? periods.join(', ') : 'Periodo de Z1.' },
      { kind: 'calculos', text: calcs.length ? calcs.join(' · ') : 'Sin cálculos de oportunidades.' }, { kind: 'limitaciones', text: limits.length ? limits.join(' ') : 'Sin limitaciones declaradas para las oportunidades.' },
      { kind: 'faltante', text: (o3.dataPanel.items.length ? o3.dataPanel.items.map((m) => m.label).join('; ') : 'Sin requisitos de datos pendientes registrados.') + (o1.completeness && o1.completeness.missing.length ? ` · Z1 indica que falta: ${o1.completeness.missing.join(', ')}.` : '') },
      { kind: 'confiabilidad', text: `Nivel ${level}${o1.completeness ? `; completitud ${o1.completeness.status}` : ''}.` }] };
    /* trazabilidad oportunidad → evidencia → acción */
    const trace = items.map((x) => { const c = o3.cards.find((y) => y.id === x.ref.id); return { opportunity: x.ref, evidence: c.evidence.concat(c.support).map((e) => e.source), actions: x.actions }; });
    return { zone: 'Z5', name: ZONES.Z5, levels: LEVEL.z5, level, opportunities: { status, note: oppNote, items }, overview: { lines, groups }, critical, evidence, trace };
  }

  /* Reglas ejecutables H-01 y H-02 sobre una salida de Z5 y las de Z1, Z3, Z4. Devuelve la lista de violaciones. */
  function check(z5, { o1, o3, o4 }) {
    const v = [], add = (c, m) => { if (!c) v.push(m); };
    const ids3 = new Map(o3.cards.map((c) => [c.id, c])), ids4 = new Set((o4.cards || []).map((a) => a.id));
    add(z5.name === 'Oportunidades y visión de conjunto' && z5.zone === 'Z5', 'P0 Z5 debe llamarse «Oportunidades y visión de conjunto» y seguir siendo la quinta zona');
    add(JSON.stringify(z5.levels) === JSON.stringify(LEVEL.z5), 'P0 Z5 debe organizarse en Oportunidades, Visión de conjunto y Evidencia y detalle (en ese orden)');
    add(new Set(z5.opportunities.items.map((x) => x.ref.id)).size === z5.opportunities.items.length, 'P1 una oportunidad aparece dos veces en Z5 (elemento duplicado)');
    z5.opportunities.items.forEach((x) => { const c = ids3.get(x.ref.id); add(!!c && c.clase === 'oportunidad', `P2 la referencia ${x.ref.id} no existe en Z3 como oportunidad (Z5 creó un elemento independiente)`); add(x.owner === 'Z3' && x.ref.zone === 'Z3', `P3 la zona propietaria de ${x.ref.id} debe ser Z3`); add(x.amount === null, `P4 Z5 repite un importe para ${x.ref.id}`);
      x.actions.forEach((a) => add(ids4.has(a.id) && (o4.cards.find((y) => y.id === a.id).cites || []).some((q) => q.id === x.ref.id), `P5 la acción ${a.id} no cita la oportunidad ${x.ref.id} (trazabilidad rota)`)); });
    // ninguna oportunidad visible de Z3 queda fuera de Z5 cuando la confiabilidad la permite
    const opp3 = o3.cards.filter((c) => c.clase === 'oportunidad' && !c.isData);
    add(opp3.every((c) => z5.opportunities.items.some((x) => x.ref.id === c.id)), 'P6 una oportunidad visible en Z3 no está integrada en Z5');
    // ningún importe ni cálculo escrito en Z5
    const text = JSON.stringify({ o: z5.opportunities, ov: z5.overview, e: z5.evidence.items.filter((x) => ['cifras', 'calculos', 'fuentes', 'periodos'].includes(x.kind)) });   // las advertencias de confiabilidad citan hechos de Z1 (p. ej. cobertura) tal cual
    add(!AMOUNT.test(text.replace(/\bN?\d+ (?:de|oportunidades|alternativas)\b/g, '').replace(/Z[1-5]|4\.4|\d{4}-\d{2}/g, '')), 'P7 Z5 contiene un importe o porcentaje: debe referenciar el elemento propietario');
    // propiedad única de lo que Z5 menciona
    const owners = {}; z5.opportunities.items.forEach((x) => { (owners[x.ref.id] = owners[x.ref.id] || new Set()).add(x.ref.zone); });
    add(Object.values(owners).every((s) => s.size === 1), 'P8 un elemento tiene más de una zona propietaria');
    // la evidencia existe, está plegada y las advertencias críticas están FUERA del desplegable
    add(z5.evidence && z5.evidence.collapsed === true && z5.evidence.items.length >= 6, 'P9 la evidencia y el detalle deben existir como apartado secundario desplegable');
    const need = [];
    if (o1.reliability.level !== 'Alta') need.push('confiabilidad'); if (o1.completeness && o1.completeness.status !== 'verificada' && o1.reliability.level !== 'Insuficiente') need.push('completitud'); if (o3.withheld && o3.withheld.note) need.push('retenidos'); if (o3.dataPanel && o3.dataPanel.items.length) need.push('faltante');
    add(need.every((k) => z5.critical.some((c) => c.kind === k)), `P10 una advertencia crítica (${need.join(', ')}) no está visible fuera del desplegable`);
    // la visión de conjunto no consolida impactos superpuestos
    add(!/\bsum(?:a|an|ar|ada|adas|ado|ados|ando)\b/i.test(z5.overview.lines.map((l) => l.text).join(' ').replace(/no se suman/g, '')), 'P11 la visión de conjunto no debe sumar alternativas ni impactos superpuestos');
    // trazabilidad completa
    add(z5.trace.every((t) => t.evidence.length > 0), 'P12 una oportunidad no tiene evidencia trazable');
    return v;
  }
  return { ZONES, OWNER, LEVEL, build, check };
});
