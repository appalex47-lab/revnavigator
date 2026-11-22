/**
 * z4-acciones.js — ESPECIFICACIÓN EJECUTABLE de Z4 «Qué hago» (Fase 3 · Subfase 3.4: prioridades y recomendaciones).
 *
 * NO es código de la aplicación (no se carga desde index.html), NO calcula indicadores ni importes y NO genera recomendaciones: recibe las acciones
 * candidatas que ya proponen los motores (attentionEngine.next, guide.nextStep, actionPriorityEngine, recoveryEngine) y la salida de Z3, y decide
 * CUÁLES se muestran, EN QUÉ ORDEN, con qué respaldo y cuáles se callan. Una acción es una RECOMENDACIÓN (nivel «acción» de la escalera de Fase 2):
 * nunca es un hecho ni una conclusión, y nunca es más firme que el elemento que la motiva.
 *
 * Reglas rectoras (3.1 §7.4 y D-03): hasta tres acciones destacadas sin limitar el universo («3 de M», «Ver todas»); cada acción cita el hallazgo,
 * riesgo u oportunidad que la motiva; sin recomendaciones genéricas (si no hay base, se dice qué dato falta); la confiabilidad condiciona lo que se
 * recomienda (con lectura preliminar, primero los datos). Fuera de alcance por decisión del proyecto: responsables, fechas límite, estatus de ejecución
 * y cualquier gestión de tareas (RGT Execution OS).
 * El formato de acción candidata que aquí se usa es una PROPUESTA de diseño (no es un contrato aceptado de Fase 2): su definición definitiva y el
 * criterio de priorización corresponden a 4.4, y las recomendaciones redactadas con IA a 5.4.
 *
 * Documentación: docs/command-center/FASE_3_4_PRIORIDADES_RECOMENDACIONES.md · Pruebas: tools/test-fase3-4-z4.js
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./command-center-contracts.js'), require('./z3-atencion.js'));
  else root.CCZ4 = factory(root.CCContracts, root.CCZ3);
})(typeof window !== 'undefined' ? window : globalThis, function (CC, Z3) {
  'use strict';
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  /* ===== Tipos de acción (nombres visibles) y su correspondencia con los pasos que ya emiten los motores ===== */
  const KINDS = {
    datos: { label: 'Completar o corregir datos', meaning: 'Sin este dato no se puede concluir: va antes que cualquier recomendación.', order: 0 },
    revisar: { label: 'Revisar', meaning: 'Abrir el detalle de algo observado o calculado.', order: 1 },
    investigar: { label: 'Comprobar', meaning: 'Validar una señal o una hipótesis antes de decidir.', order: 2 },
    decidir: { label: 'Evaluar una alternativa', meaning: 'Comparar alternativas estimadas; la decisión es del responsable del negocio.', order: 3 }
  };
  const FROM_STEP = [[/^complete_data$|^fix_quality$/, 'datos'], [/^review_/, 'revisar'], [/^investigate_/, 'investigar'], [/^evaluate_|^recover/, 'decidir']];
  const kindOfStep = (step) => { for (const [re, k] of FROM_STEP) if (re.test(step || '')) return k; return null; };
  const FILTERS = [{ id: 'todas', label: 'Todas' }, ...Object.entries(KINDS).map(([id, k]) => ({ id, label: k.label }))];
  const LIMIT = 3;
  const BANNED = /utilidad|ganancia|beneficio neto|beneficio financiero|rentabilidad|\bROI\b|\bROAS\b|\bCAC\b/i;
  const GENERIC = /^(mejorar|optimizar|incrementar|aumentar|impulsar|potenciar|reforzar) (las |la |el |los )?(ventas?|resultados?|desempeño|negocio|conversión|tráfico|estrategia)\.?$|\b(tomar acciones|tomar medidas|hacer algo|dar seguimiento|estar atentos?|seguir monitoreando|revisar el negocio|trabajar en)\b/i;
  const TASK = /\b(responsable|asignar|asignad[oa]|fecha límite|vence|vencimiento|a más tardar|antes del \d|en curso|completad[oa]|tarea)\b/i;   // gestión de tareas: fuera de alcance (RGT)
  const TASK_FIELDS = ['owner', 'assignee', 'responsible', 'dueDate', 'deadline', 'status', 'progress'];
  const WEAK = new Set(['hipotesis', 'senal']);   // la estimación es una base legítima para evaluar alternativas (con supuestos); una señal o una hipótesis solo para comprobarlas
  const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

  /* ===== Validación de una acción candidata (propuesta de formato) ===== */
  function validateAction(a) {
    const e = [], need = (c, m) => { if (!c) e.push(m); };
    need(a && typeof a === 'object', 'La acción debe ser un objeto.'); if (!a || typeof a !== 'object') return { ok: false, errors: e };
    need(typeof a.id === 'string' && a.id.length > 2, 'Falta id.');
    need(Object.keys(KINDS).includes(a.kind), `kind debe ser uno de ${Object.keys(KINDS).join(', ')}.`);
    need(typeof a.label === 'string' && a.label.trim(), 'Falta el texto de la acción.');
    need(a.destination && typeof a.destination.view === 'string' && a.destination.view && typeof a.destination.label === 'string', 'La acción debe llevar a un lugar concreto de la aplicación (destination.view y label).');
    need(a.source && a.source.engine && a.source.field, 'Falta el motor que propuso la acción (source.engine y field): sin trazabilidad no hay recomendación.');
    need(typeof a.basis === 'string' && a.basis.trim(), 'Falta la base de la recomendación (por qué).');
    need(Array.isArray(a.motivatedBy), 'motivatedBy debe ser una lista de llaves de elementos de Z3.');
    need(Array.isArray(a.requires || []), 'requires debe ser una lista.');
    if (a.kind !== 'datos') need(Array.isArray(a.motivatedBy) && a.motivatedBy.length >= 1, 'Una recomendación debe citar al menos un hallazgo, riesgo u oportunidad que la motive.');
    else need((Array.isArray(a.motivatedBy) && a.motivatedBy.length >= 1) || (a.requires || []).length >= 1, 'Una acción de datos debe citar el hallazgo de datos o el requisito que la motiva.');
    if (typeof a.label === 'string') {
      need(!GENERIC.test(a.label.trim()), 'Recomendación genérica: no dice qué hacer ni dónde.');
      need(!BANNED.test(`${a.label} ${a.basis || ''}`), 'Usa un término financiero no permitido.');
      need(!CC.CAUSAL.test(`${a.label} ${a.basis || ''}`) && !/\b(porque|a causa de)\b/i.test(a.label), 'Una recomendación no afirma causas.');
      need(!TASK.test(`${a.label} ${a.basis || ''}`), 'La acción no puede asignar responsables, fechas ni estatus (gestión de tareas fuera de alcance).');
      need(!/\$\s?\d/.test(a.label), 'El texto de la acción no lleva importes (el impacto es el del elemento que la motiva).');
      need(words(a.label) <= 14, 'El texto de la acción no puede superar 14 palabras.');
    }
    need(!TASK_FIELDS.some((k) => k in a), 'La acción no puede traer responsable, fecha ni estatus (gestión de tareas fuera de alcance).');
    need(a.amount === undefined && a.economics === undefined && a.impact === undefined, 'Una acción no tiene importe propio: el impacto es el del elemento que la motiva (evita doble conteo).');
    return { ok: e.length === 0, errors: e };
  }

  /* ===== Construcción de Z4 ===== */
  function build(i) {
    const att = i.attention, level = (i.reliability && i.reliability.level) || (att && att.level) || 'Insuficiente', limit = fin(i.limit) ? i.limit : LIMIT;
    const visibleByKey = new Map(att.cards.map((c, idx) => [c.dedupKey, { c, idx }])), withheldKeys = new Set(att.withheld.ids.map((id) => String(id).replace(/^f:/, ''))), missing = att.dataPanel.items || [];
    const rejected = [], stripped = [], unlinked = [], held = [], pool = [];
    (i.actions || []).forEach((raw) => {
      const hadTask = raw && typeof raw === 'object' ? TASK_FIELDS.filter((k) => k in raw) : [];
      const a = raw && typeof raw === 'object' ? Object.keys(raw).reduce((o, k) => { if (!TASK_FIELDS.includes(k)) o[k] = raw[k]; return o; }, {}) : raw;
      if (hadTask.length) stripped.push({ id: raw.id, fields: hadTask });   // se ignoran: Z4 no gestiona tareas
      const r = validateAction(a); if (!r.ok) { rejected.push({ id: (a && a.id) || '(sin id)', errors: r.errors }); return; }
      const cites = a.motivatedBy.map((k) => visibleByKey.get(k)).filter(Boolean), allKeysKnown = a.motivatedBy.every((k) => visibleByKey.has(k));
      const reqOk = (a.requires || []).length > 0 && (a.requires || []).every((q) => missing.some((m) => m.label === q));
      // Una acción cuyo motivo no está a la vista en Z3 no se muestra: o está retenida por confiabilidad, o no tiene base.
      if (a.kind === 'datos' ? !(cites.length || reqOk) : !(cites.length && allKeysKnown)) {
        const byReliability = a.motivatedBy.some((k) => withheldKeys.has(k));
        (byReliability ? held : unlinked).push({ id: a.id, reason: byReliability ? 'El elemento que la motiva no se presenta con la confiabilidad actual.' : a.kind === 'datos' ? 'El requisito de datos no figura entre lo que falta.' : 'El elemento que la motiva no está a la vista en «Qué merece atención».' });
        return;
      }
      // Una recomendación que necesita datos que todavía faltan no puede ejecutarse: se retiene y se remite a la acción de datos.
      const blockedBy = a.kind === 'datos' ? [] : (a.requires || []).filter((q) => missing.some((m) => m.label === q));
      if (blockedBy.length) { held.push({ id: a.id, reason: `No puede ejecutarse todavía: requiere datos que faltan (${blockedBy.join('; ')}).` }); return; }
      pool.push({ a, cites });
    });
    // La confiabilidad condiciona lo que se recomienda: Alta/Media, todo. Baja: datos y revisión de lo observado. Insuficiente: solo datos.
    const allowKind = (k) => (level === 'Alta' || level === 'Media') ? true : level === 'Baja' ? (k === 'datos' || k === 'revisar') : k === 'datos';
    const S = CC.STRENGTH, SUP = { alto: 2, medio: 1, bajo: 0 };
    const cards = [];
    pool.forEach(({ a, cites }) => {
      if (!allowKind(a.kind)) { held.push({ id: a.id, reason: 'La confiabilidad de la lectura no permite esta recomendación: primero los datos.' }); return; }
      const cs = cites.map((x) => x.c), weakest = cs.length ? cs.reduce((m, c) => (S[c.certainty.level] < S[m.certainty.level] || (S[c.certainty.level] === S[m.certainty.level] && SUP[c.certainty.support] < SUP[m.certainty.support]) ? c : m)) : null;
      // Una acción que se apoya en una señal o hipótesis solo puede ser una comprobación; nunca una decisión.
      if (weakest && WEAK.has(weakest.certainty.level) && a.kind === 'decidir') { rejected.push({ id: a.id, errors: ['Se apoya en una señal o hipótesis: solo puede recomendarse comprobarla, no decidir sobre ella.'] }); return; }
      if (weakest && WEAK.has(weakest.certainty.level) && checkActionText(a.label, { basisCertainty: { level: weakest.certainty.level } }).includes('A7')) { rejected.push({ id: a.id, errors: ['Se apoya en una señal o hipótesis: debe redactarse como comprobación (comprobar, validar, verificar, confirmar, comparar).'] }); return; }
      const tags = [];
      if (weakest && WEAK.has(weakest.certainty.level)) tags.push('Se apoya en una señal o hipótesis: es una comprobación, no una decisión');
      if (weakest && weakest.certainty.support === 'bajo') tags.push('Se apoya en un elemento con respaldo bajo');
      if (cs.some((c) => c.impact.status === 'disponible' && c.impact.sales.estimate)) tags.push('El importe citado es una estimación');
      cards.push({ id: a.id, kind: a.kind, kindLabel: KINDS[a.kind].label, level: 'accion', levelLabel: 'Recomendación', label: a.label.trim(), why: a.basis.trim(),
        cites: cs.map((c) => ({ id: c.id, dedupKey: c.dedupKey, symbol: c.symbol, claseLabel: c.claseLabel, title: c.title, certaintyLabel: c.certainty.label, supportLabel: c.certainty.supportLabel,
          impactRef: c.impact.status === 'disponible' ? { label: c.impact.sales.label, display: c.impact.sales.display, provenanceLabel: c.impact.sales.provenanceLabel, note: 'Importe del elemento citado; no es un importe de la acción y no se suma.' } : null })),
        requires: (a.requires || []).slice(), destination: { view: a.destination.view, label: a.destination.label }, source: `${a.source.engine} · ${a.source.field}`,
        basisCertainty: weakest ? { level: weakest.certainty.level, label: weakest.certainty.label, support: weakest.certainty.support } : { level: 'hecho', label: 'Hecho', support: 'alto' },
        tags, rank: cites.length ? Math.min(...cites.map((x) => x.idx)) : -1 });   // una acción de datos sin elemento citado va primero: condiciona todo
    });
    // Deduplicación: misma acción (mismo destino, mismo tipo y mismos motivos) propuesta por dos motores = una.
    const seen = new Map(), uniq = [];
    cards.forEach((c) => { const k = `${c.kind}|${c.destination.view}|${c.cites.map((x) => x.dedupKey).sort().join(',')}|${c.requires.slice().sort().join(',')}`; if (seen.has(k)) seen.get(k).alsoFrom.push(c.source); else { c.alsoFrom = []; seen.set(k, c); uniq.push(c); } });
    // Orden: el del elemento que motiva la acción en Z3 (urgencia → confiabilidad → impacto, ya resuelto allí); las acciones de datos van antes dentro del mismo elemento.
    uniq.sort((x, y) => (x.kind === 'datos' ? 0 : 1) - (y.kind === 'datos' ? 0 : 1) || x.rank - y.rank || KINDS[x.kind].order - KINDS[y.kind].order || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
    const featured = uniq.slice(0, limit).map((c) => c.id), counts = { total: uniq.length }; Object.keys(KINDS).forEach((k) => { counts[k] = uniq.filter((c) => c.kind === k).length; });
    const mode = level === 'Insuficiente' ? 'solo_datos' : level === 'Baja' ? 'datos_primero' : 'completo';
    // Sin acciones no se inventa una recomendación: se dice qué dato falta (si falta) o que no hay nada que destacar.
    const fallback = uniq.length ? null : missing.length ? { type: 'que_falta', title: 'Qué dato falta', items: missing.slice() }
      : mode !== 'completo' ? { type: 'sin_base', title: 'No hay acciones que recomendar con la confiabilidad actual', items: [] } : { type: 'vacio', title: 'No hay acciones que destacar en este periodo', items: [] };
    return { level, mode, status: uniq.length ? 'con_acciones' : fallback.type, header: uniq.length ? `${featured.length} de ${uniq.length}` : null,
      notice: mode === 'solo_datos' ? 'Con la información disponible solo se recomiendan acciones sobre los datos.' : mode === 'datos_primero' ? 'Lectura preliminar: primero los datos; las recomendaciones del negocio se retienen hasta corregirlos.' : null,
      cards: uniq, featured, counts, fallback,
      seeAll: { visible: uniq.length > featured.length, label: `Ver todas (${uniq.length})`, filters: FILTERS.map((f) => ({ ...f, count: f.id === 'todas' ? uniq.length : counts[f.id] })) },
      held: { count: held.length, items: held, note: held.length ? `${held.length} ${held.length === 1 ? 'recomendación no se presenta' : 'recomendaciones no se presentan'} porque la confiabilidad de la lectura no las sustenta.` : null },
      unlinked, rejected, stripped,
      order: { criteria: ['Las acciones sobre los datos van primero', 'Después, el orden del elemento de «Qué merece atención» que motiva la acción', 'Dentro del mismo elemento: revisar, comprobar y evaluar alternativas'],
        note: 'El criterio definitivo de priorización corresponde a la subfase 4.4; las recomendaciones redactadas con IA, a la 5.4.' } };
  }

  /* ===== Validador de textos de acción, ejecutable sobre CUALQUIER texto (para una redacción futura con IA, Fase 5.4) ===== */
  const RULES = {
    A1: 'Sin utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS ni CAC.',
    A2: 'Sin recomendaciones genéricas («mejorar las ventas», «tomar acciones», «dar seguimiento»).',
    A3: 'Una recomendación no afirma causas.',
    A4: 'Sin responsables, fechas límite ni estatus de ejecución (gestión de tareas fuera de alcance).',
    A5: 'El texto de la acción no lleva importes.',
    A6: 'Máximo 14 palabras.',
    A7: 'Una acción apoyada en una señal o hipótesis se redacta como comprobación, no como decisión ni como hecho.'
  };
  function checkActionText(label, card) {
    const v = [], t = String(label);
    if (BANNED.test(t)) v.push('A1');
    if (GENERIC.test(t.trim())) v.push('A2');
    if (CC.CAUSAL.test(t) || /\b(porque|a causa de)\b/i.test(t)) v.push('A3');
    if (TASK.test(t)) v.push('A4');
    if (/\$\s?\d/.test(t)) v.push('A5');
    if (words(t) > 14) v.push('A6');
    if (card && WEAK.has(card.basisCertainty.level) && !/^(comprobar|validar|verificar|confirmar|revisar si|comparar)\b/i.test(t.trim())) v.push('A7');
    return v;
  }
  return { KINDS, FILTERS, LIMIT, RULES, TASK_FIELDS, kindOfStep, validateAction, build, checkActionText };
});
