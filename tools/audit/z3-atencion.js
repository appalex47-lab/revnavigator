/**
 * z3-atencion.js — ESPECIFICACIÓN EJECUTABLE de Z3 «Qué merece atención» (Fase 3 · Subfase 3.3: hallazgos, riesgos y oportunidades).
 *
 * NO es código de la aplicación (no se carga desde index.html) y NO calcula ningún indicador ni ningún importe: recibe hallazgos con el contrato
 * `cc.finding` de la Fase 2 (ya calculados por los motores) y decide CÓMO SE PRESENTAN: su clase (◆ hallazgo, ▲ riesgo, ● oportunidad), su certeza,
 * su impacto económico (ventas + contribución condicionada al margen), cuáles tres se destacan y qué se calla cuando la confiabilidad no alcanza.
 * Reutiliza sin copiar: validateFinding, mergeFindings, combineImpacts, STRENGTH (tools/audit/command-center-contracts.js y js/economics/impactModel.js).
 *
 * Decisiones aprobadas que implementa (3.1): D-02 una experiencia con tres clases que conservan clasificación, significado y tratamiento;
 * D-03 hasta tres destacados sin limitar el universo («3 de N», «Ver todos») y selección por urgencia, impacto y confiabilidad;
 * aclaración B, la confiabilidad condiciona lo que Z3 puede mostrar (3.1 §6).
 * La implementación real corresponde a la Fase 4 (M11, M27, M28, M30: contrato único con clasificación y criterio de selección definitivo en 4.4).
 *
 * Documentación: docs/command-center/FASE_3_3_HALLAZGOS_RIESGOS_OPORTUNIDADES.md · Pruebas: tools/test-fase3-3-z3.js
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./command-center-contracts.js'), require('../../js/economics/impactModel.js'), require('./z1-lectura-ejecutiva.js'));
  else root.CCZ3 = factory(root.CCContracts, root.FP && root.FP.economics, root.CCZ1);
})(typeof window !== 'undefined' ? window : globalThis, function (CC, ECON, Z1) {
  'use strict';
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const money = Z1.money;

  /* ===== Taxonomía visible (nombres para el usuario; los identificadores son los del contrato de Fase 2) ===== */
  const CLASS_OF = { finding: 'hallazgo', deviation: 'hallazgo', risk: 'riesgo', opportunity: 'oportunidad' };
  const CLASSES = {
    hallazgo: { symbol: '◆', label: 'Hallazgo', plural: 'Hallazgos', meaning: 'Lo que se observó o se calculó, sin juicio de valor.' },
    riesgo: { symbol: '▲', label: 'Riesgo', plural: 'Riesgos', meaning: 'Un resultado actual o esperado por debajo del plan o de un umbral, con su consecuencia.' },
    oportunidad: { symbol: '●', label: 'Oportunidad', plural: 'Oportunidades', meaning: 'Venta potencial o recuperable con palancas controlables; siempre es una estimación con supuestos.' }
  };
  const SEVERITY_LABEL = { critica: 'Crítica', importante: 'Importante', seguimiento: 'Seguimiento' };
  const SEVERITY_RANK = { critica: 3, importante: 2, seguimiento: 1 };
  const CERTAINTY_LABEL = { hecho: 'Hecho', calculo: 'Cálculo', driver: 'Contribución matemática', senal: 'Señal', estimacion: 'Estimación', hipotesis: 'Hipótesis', accion: 'Recomendación' };
  const SUPPORT_LABEL = { alto: 'Respaldo alto', medio: 'Respaldo medio', bajo: 'Respaldo bajo' };
  const VALIDITY_LABEL = { activo: 'Vigente', vigilancia: 'En vigilancia', resuelto: 'Resuelto', vencido: 'Vencido', reemplazado: 'Reemplazado' };
  // Etiqueta del impacto según la categoría del contrato económico (cc.economic_impact). Nunca «utilidad», «ganancia» ni «beneficio».
  const IMPACT_LABEL = { observado: 'Venta observada', brecha: 'Brecha observada', en_riesgo: 'Venta en riesgo', potencial_teorico: 'Venta potencial (teórica)', alcanzable: 'Venta recuperable', esperado: 'Venta esperada' };
  const PROVENANCE_LABEL = { observed: 'observado', projected: 'proyectado' };
  // Qué categorías de impacto admite cada clase: una oportunidad nunca lleva un importe observado como si fuera un hecho; un hallazgo nunca lleva una proyección.
  const ALLOWED = { hallazgo: ['observado', 'brecha'], riesgo: ['brecha', 'en_riesgo', 'esperado'], oportunidad: ['potencial_teorico', 'alcanzable', 'esperado'] };
  const FILTERS = [{ id: 'todos', label: 'Todos' }, { id: 'hallazgo', label: 'Hallazgos' }, { id: 'riesgo', label: 'Riesgos' }, { id: 'oportunidad', label: 'Oportunidades' }];
  const LIMIT = 3;
  const BANNED = /utilidad|ganancia|beneficio neto|beneficio financiero|rentabilidad|\bROI\b|\bROAS\b|\bCAC\b/i;
  const isData = (f) => /^data[:_]/.test(CC.familyOf(f.rule.family));   // hallazgos de datos (calidad, cobertura, faltantes): condicionan todo lo demás

  /* ===== Reglas propias de Z3 que el contrato de Fase 2 no cubre (se aplican además de validateFinding) ===== */
  function extraErrors(f) {
    const e = [], cls = CLASS_OF[f.type], lvl = f.certainty.level, S = CC.STRENGTH;
    if (cls === 'oportunidad' && S[lvl] > S.estimacion) e.push('Una oportunidad es una estimación: no puede presentarse como hecho, cálculo, contribución ni señal.');
    if (cls === 'hallazgo' && S[lvl] < S.senal) e.push('Un hallazgo describe lo observado o calculado: una estimación o una hipótesis debe clasificarse como riesgo u oportunidad, o quedar como hipótesis dentro de otro elemento.');
    if (f.economics && f.economics.status === 'ok' && !ALLOWED[cls].includes(f.economics.category)) e.push(`El impacto «${f.economics.category}» no corresponde a la clase ${cls} (admite: ${ALLOWED[cls].join(', ')}).`);
    if (cls === 'oportunidad' && f.economics && f.economics.status === 'ok' && !(f.economics.assumptions || []).length) e.push('Una oportunidad con importe debe declarar sus supuestos.');
    if (BANNED.test(`${f.title} ${f.description}`)) e.push('El texto usa un término financiero no permitido (utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS o CAC).');
    if ((f.evidence || []).some((x) => x.class === 'hipotesis' && x.text && f.title.trim() === x.text.trim())) e.push('Una hipótesis no puede titular el elemento.');
    return e;
  }

  /* ===== Línea de impacto: ventas siempre que haya importe; contribución solo si el contrato la trae disponible. No recalcula nada. ===== */
  function impactLine(f) {
    const x = f.economics;
    if (!x) return { status: 'no_aplica', reason: f.economicsReason, sales: null, contribution: null };
    if (x.status !== 'ok') return { status: 'datos_insuficientes', reason: x.reason, sales: null, contribution: null };
    const a = x.amount, hasRange = fin(a.low) && fin(a.high) && a.low !== a.high, c = x.contribution;
    const sales = { label: IMPACT_LABEL[x.category], category: x.category, provenance: x.provenance, provenanceLabel: PROVENANCE_LABEL[x.provenance], point: a.point, low: hasRange ? a.low : null, high: hasRange ? a.high : null,
      display: hasRange ? `${money(a.low)} a ${money(a.high)}` : money(a.point), isRange: hasRange, estimate: x.provenance === 'projected', assumptions: (x.assumptions || []).slice(), horizon: x.horizon || null,
      exclusiveGroup: x.exclusiveGroup || null, overlapGroup: x.overlapGroup || null, method: x.method.formula, engine: x.method.engine };
    let contribution;
    if (!c) contribution = { status: 'no_informada', display: null, label: null };   // contrato v1: sin capa de contribución; no se inventa
    else if (c.status === 'disponible') { const ca = c.amount, cr = fin(ca.low) && fin(ca.high) && ca.low !== ca.high;
      contribution = { status: 'disponible', label: 'Contribución bruta estimada', display: cr ? `${money(ca.low)} a ${money(ca.high)}` : money(ca.point === 0 ? 0 : ca.point), point: ca.point, marginDisplay: `${Number(c.marginPct.toFixed(1))} %`,
        note: 'Estimación con el margen bruto promedio general; no es utilidad ni el margen real del canal, producto o pedido.' }; }
    else contribution = { status: c.status, display: null, label: c.status === 'no_configurado' ? 'Margen no configurado · Configurar' : c.status === 'desactivado' ? 'Margen desactivado · Configurar' : null };
    return { status: 'disponible', reason: null, sales, contribution };
  }

  function card(f) {
    const cls = CLASS_OF[f.type], C = CLASSES[cls], imp = impactLine(f), head = f.evidence.filter((x) => x.headline && x.class !== 'accion');
    const tags = [];
    if (f.certainty.support === 'bajo') tags.push('Respaldo bajo: conclusión no sustentada');
    if (f.validity.status === 'vigilancia') tags.push('En vigilancia: no reapareció en la última corrida');
    if (f.validity.status === 'activo' && f.validity.firstSeen === f.validity.lastSeen) tags.push('Nuevo: apareció por primera vez en la última corrida');   // «Desde ayer» → marca «nuevo» en Z3 (3.1 §8.1, D-04)
    return { id: f.id, clase: cls, symbol: C.symbol, claseLabel: C.label, type: f.type, title: f.title, description: f.description,
      severity: { id: f.severity, label: SEVERITY_LABEL[f.severity] }, certainty: { level: f.certainty.level, label: CERTAINTY_LABEL[f.certainty.level], support: f.certainty.support, supportLabel: SUPPORT_LABEL[f.certainty.support], basis: f.certainty.basis },
      scope: f.scope, period: f.period, indicator: f.indicator, observed: f.observed, reference: f.reference, impact: imp,
      evidence: head.map((x) => ({ class: x.class, classLabel: CERTAINTY_LABEL[x.class], text: x.text, source: `${x.source.module} · ${x.source.field}` })),
      support: f.evidence.filter((x) => !x.headline && x.class !== 'hipotesis' && x.class !== 'accion').map((x) => ({ class: x.class, classLabel: CERTAINTY_LABEL[x.class], text: x.text, source: `${x.source.module} · ${x.source.field}` })),
      hypotheses: f.evidence.filter((x) => x.class === 'hipotesis' && !x.headline).map((x) => ({ text: x.text, validation: x.validation || null })),   // aparte y plegadas: nunca sostienen el titular
      limitations: f.limitations.slice(), validity: { status: f.validity.status, label: VALIDITY_LABEL[f.validity.status], firstSeen: f.validity.firstSeen, lastSeen: f.validity.lastSeen },
      lineage: f.lineage.map((l) => `${l.engine}:${l.id} (${l.role})`), explains: f.explains || null, isData: isData(f), tags, family: CC.familyOf(f.rule.family), dedupKey: f.dedupKey };
  }

  /* ===== Orden (D-03, 3.1 §7.3): urgencia → impacto → confiabilidad. Sin puntajes ni umbrales numéricos (el criterio definitivo es de 4.4). =====
   * Urgencia: lo que bloquea el análisis (hallazgo de datos crítico) va primero; después la severidad.
   * Guarda cualitativa de confiabilidad: dentro de la misma urgencia, un elemento con respaldo bajo no desplaza a uno mejor sustentado.
   * Impacto: magnitud del importe en ventas cuando existe (se comparan magnitudes para ordenar; jamás se suman clases distintas).
   * Confiabilidad: certeza y respaldo. Desempate final por id (orden estable y reproducible). */
  const SUP_RANK = { alto: 2, medio: 1, bajo: 0 };
  function orderKey(c) {
    return [c.isData && c.severity.id === 'critica' ? 1 : 0, SEVERITY_RANK[c.severity.id], c.certainty.support === 'bajo' ? 0 : 1,
      c.impact.status === 'disponible' ? 1 : 0, c.impact.status === 'disponible' ? Math.abs(c.impact.sales.point) : 0, CC.STRENGTH[c.certainty.level], SUP_RANK[c.certainty.support]];
  }
  function compare(a, b) { const ka = orderKey(a), kb = orderKey(b); for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i]; return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; }
  /* Destacados: los primeros del orden; propuesta de 3.1 §7.3: la portada no se llena con una sola clase cuando otra tiene un elemento de la MISMA urgencia
   * (misma severidad y misma condición de bloqueo) que el último destacado. */
  function pickFeatured(sorted, limit) {
    const top = sorted.slice(0, limit); if (top.length < limit || new Set(top.map((c) => c.clase)).size > 1) return { ids: top.map((c) => c.id), diversified: null };
    const last = top[top.length - 1], sameUrg = (c) => c.severity.id === last.severity.id && (c.isData && c.severity.id === 'critica') === (last.isData && last.severity.id === 'critica') && (c.certainty.support === 'bajo') === (last.certainty.support === 'bajo');
    const alt = sorted.slice(limit).find((c) => c.clase !== last.clase && sameUrg(c));
    if (!alt) return { ids: top.map((c) => c.id), diversified: null };
    return { ids: [...top.slice(0, limit - 1).map((c) => c.id), alt.id], diversified: { in: alt.id, out: last.id, why: 'Misma urgencia que el tercer destacado y clase distinta: la portada no se llena con una sola clase.' } };
  }

  /* ===== Totales por clase: solo con las reglas del contrato (combineImpacts): nunca entre clases, alternativas como rango, superposiciones sin duplicar ===== */
  function totalsOf(cards, byId) {
    const out = {};
    Object.keys(CLASSES).forEach((cls) => {
      const items = cards.filter((c) => c.clase === cls && c.impact.status !== 'no_aplica').map((c) => ({ ...byId.get(c.id).economics, id: c.id }));
      if (!items.length) { out[cls] = { lines: [], excluded: [], warnings: [] }; return; }
      const r = ECON.combineImpacts(items);
      // Superposición (mismo dinero dicho por varios elementos, p. ej. la brecha total y la del canal que la concentra): el contrato de Fase 2 «toma el mayor»
      // por valor, que con importes negativos es el de MENOR magnitud. Para no presentar un total que subestime una brecha, Z3 no muestra cifra en esa línea:
      // dice que los elementos describen el mismo dinero y remite a cada tarjeta. (Hallazgo documentado para 4.5; el motor no se modifica aquí.)
      const og = {}; items.forEach((x) => { if (x.status === 'ok' && x.overlapGroup) { const k = `${x.category}|${x.provenance}`; (og[k] = og[k] || {})[x.overlapGroup] = ((og[k] || {})[x.overlapGroup] || 0) + 1; } });
      out[cls] = { excluded: r.excluded, warnings: r.warnings, lines: Object.entries(r.byCategory).map(([key, t]) => { const [category, provenance] = key.split('|'); const range = t.low !== t.high, overlap = Object.values(og[key] || {}).some((n) => n > 1);
        return { category, provenance, label: IMPACT_LABEL[category], provenanceLabel: PROVENANCE_LABEL[provenance], low: overlap ? null : t.low, point: overlap ? null : t.point, high: overlap ? null : t.high, isRange: range, overlap,
          display: overlap ? null : range ? `${money(t.low)} a ${money(t.high)}` : money(t.point), note: overlap ? 'Varios elementos describen el mismo dinero: no se suman ni se totalizan; el importe está en cada tarjeta.' : null, incomplete: t.incomplete,
          alternatives: t.parts.filter((p) => p.alternatives).map((p) => p.ids) }; }) };
    });
    return out;
  }

  /* ===== Construcción de Z3 ===== */
  function build(i) {
    const level = (i.reliability && i.reliability.level) || 'Insuficiente', limit = fin(i.limit) ? i.limit : LIMIT;
    // 1 · contrato: lo que no cumple el contrato de Fase 2 o las reglas de clase NO se muestra (sin trazabilidad no hay hallazgo); queda listado para Z5.
    const rejected = [], valid = [];
    (i.findings || []).forEach((f) => { const r = CC.validateFinding(f); const errs = r.ok ? extraErrors(f) : r.errors; if (errs.length) rejected.push({ id: (f && f.id) || '(sin id)', errors: errs }); else valid.push(f); });
    // 2 · deduplicación del contrato (mismo hallazgo dicho por varios motores = uno, con linaje)
    const merged = CC.mergeFindings(valid), byId = new Map(merged.map((f) => [f.id, f]));
    const all = merged.map(card);
    // Relación de inclusión (D-06, H-01): los elementos con el mismo grupo de superposición describen el MISMO dinero (p. ej. la brecha total y la del canal que la concentra).
    // Se conservan los dos (el canal sigue identificándose) pero se declara la relación para que ninguno sugiera un impacto adicional ni se sume al otro.
    const grp = {}; all.forEach((c) => { const g = c.impact.status === 'disponible' && c.impact.sales && c.impact.sales.overlapGroup; if (g) (grp[`${c.impact.sales.category}|${g}`] = grp[`${c.impact.sales.category}|${g}`] || []).push(c); });
    Object.values(grp).forEach((list) => { if (list.length < 2) return; const owner = list.find((c) => c.scope.level === 'total') || list[0];
      list.forEach((c) => { c.relation = { kind: c === owner ? 'incluye' : 'incluido_en', owner: owner.id, members: list.map((x) => x.id) };
        c.tags.push(c === owner ? 'Importe total: incluye la parte de otros elementos; no se suman' : 'Parte del importe de otro elemento: ya está incluida; no se suma'); }); });
    const active = all.filter((c) => c.validity.status === 'activo' || c.validity.status === 'vigilancia'), closed = all.filter((c) => !active.includes(c));
    // 3 · la confiabilidad de la lectura (Z1) condiciona lo que Z3 puede mostrar (3.1 §6)
    //     Alta/Media: todo.  Baja: solo lo observado o calculado (hallazgos) y lo que falta; ninguna conclusión (riesgos y oportunidades se retienen).
    //     Insuficiente: solo hallazgos de datos y lo que falta.
    const allow = (c) => (level === 'Alta' || level === 'Media') ? true : level === 'Baja' ? (c.clase === 'hallazgo' || c.isData) : c.isData;
    const visible = active.filter(allow).sort(compare), withheld = active.filter((c) => !allow(c)).sort(compare);
    const feat = pickFeatured(visible, limit), featured = feat.ids;
    const counts = { total: visible.length }; Object.keys(CLASSES).forEach((k) => { counts[k] = visible.filter((c) => c.clase === k).length; });
    const mode = level === 'Insuficiente' ? 'solo_datos' : level === 'Baja' ? 'solo_observado' : 'completo';
    const missing = (i.missing || []).map((m) => ({ label: m.label, view: m.view || null }));
    const status = visible.length ? 'con_elementos' : (withheld.length || missing.length || mode !== 'completo') ? 'sin_conclusiones' : 'vacio';
    const header = visible.length ? `${featured.length} de ${visible.length}` : null;
    const notice = mode === 'solo_datos' ? 'Con la información disponible no se emiten hallazgos, riesgos ni oportunidades del negocio: solo lo que falta en los datos.'
      : mode === 'solo_observado' ? 'Lectura preliminar: se muestran solo los hechos y cálculos observados. Los riesgos y las oportunidades no se presentan hasta corregir los datos.' : null;
    const empty = status === 'vacio' ? 'No hay hallazgos, riesgos ni oportunidades que destacar en este periodo.' : status === 'sin_conclusiones' && !visible.length ? 'No hay elementos que mostrar con la confiabilidad actual.' : null;
    return {
      level, mode, status, header, notice, empty,
      cards: visible, featured, diversified: feat.diversified, counts,
      seeAll: { visible: visible.length > featured.length, label: `Ver todos (${visible.length})`, filters: FILTERS.map((f) => ({ ...f, count: f.id === 'todos' ? visible.length : counts[f.id] })) },
      withheld: { count: withheld.length, byClass: Object.keys(CLASSES).reduce((o, k) => { o[k] = withheld.filter((c) => c.clase === k).length; return o; }, {}), ids: withheld.map((c) => c.id),
        note: withheld.length ? `${withheld.length} ${withheld.length === 1 ? 'elemento no se presenta' : 'elementos no se presentan'} porque la confiabilidad de la lectura no permite sostener conclusiones.` : null },
      closed: { count: closed.length, ids: closed.map((c) => c.id) },
      dataPanel: { visible: missing.length > 0 || mode !== 'completo', title: 'Qué falta para concluir', items: missing, empty: missing.length ? null : 'No hay requisitos de datos pendientes registrados.' },
      totals: totalsOf(mode === 'completo' ? visible : [], byId),   // sin conclusiones no hay totales
      rejected, order: { criteria: ['Urgencia: lo que bloquea el análisis y después la severidad', 'Confiabilidad: un elemento con respaldo bajo no desplaza a uno mejor sustentado de la misma urgencia', 'Impacto: importe en ventas cuando existe', 'Certeza y respaldo'],
        note: 'Los importes de clases distintas no se suman. El criterio definitivo de priorización corresponde a la subfase 4.4.' },
      derive: { Z2: all.filter((c) => c.explains).map((c) => ({ id: c.id, explains: c.explains })), Z4: 'Cada acción de Z4 cita el elemento de Z3 que la motiva', Z5: ['Universo completo', 'Elementos resueltos o vencidos', 'Elementos descartados por contrato'] }
    };
  }

  /* ===== Validador de textos de tarjeta, ejecutable sobre CUALQUIER texto (para una redacción futura con IA, Fase 5) ===== */
  const RULES = {
    T1: 'Sin utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS ni CAC.',
    T2: 'Sin lenguaje causal si la certeza es menor que «contribución matemática» (señal, estimación o hipótesis).',
    T3: 'Una oportunidad se redacta como estimación o posibilidad, nunca como resultado obtenido.',
    T4: 'Un riesgo proyectado no se redacta como hecho consumado.',
    T5: 'El título no repite el importe del impacto (el importe vive en la línea de impacto).',
    T6: 'Máximo 16 palabras en el título y 45 en la descripción.'
  };
  const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
  function checkCardText(title, description, c) {
    const v = [], t = `${title} ${description}`;
    if (BANNED.test(t)) v.push('T1');
    if (CC.STRENGTH[c.certainty.level] < CC.STRENGTH.driver && (CC.CAUSAL.test(t) || /\b(porque|a causa de|por culpa de)\b/i.test(t))) v.push('T2');
    if (c.clase === 'oportunidad' && /(^|[^\wáéíóúñ])(se recuperó|se recuperaron|ya se obtuvo|se ganó|se logró|se consiguió|generó)(?![\wáéíóúñ])/i.test(t)) v.push('T3');
    if (c.clase === 'riesgo' && c.impact.status === 'disponible' && c.impact.sales.provenance === 'projected' && /(^|[^\wáéíóúñ])(se perdió|se perdieron|ya no se alcanzó|no se alcanzó|se incumplió)(?![\wáéíóúñ])/i.test(t)) v.push('T4');
    if (c.impact.status === 'disponible' && /\$\s?\d/.test(title)) v.push('T5');
    if (words(title) > 16 || words(description) > 45) v.push('T6');
    return v;
  }

  return { CLASS_OF, CLASSES, SEVERITY_LABEL, CERTAINTY_LABEL, SUPPORT_LABEL, VALIDITY_LABEL, IMPACT_LABEL, PROVENANCE_LABEL, ALLOWED, FILTERS, LIMIT, RULES, build, card, impactLine, compare, orderKey, pickFeatured, extraErrors, checkCardText, isData, money };
});
