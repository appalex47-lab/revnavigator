/**
 * findings.js — Contrato de hallazgos `cc.finding` v1 + extensión aditiva v1.1 (Fase 4.1, P-05). Funciona en navegador (`FP.findings`) y en Node (`module.exports`).
 *
 * ORIGEN ÚNICO: es el PORT del contrato aceptado en Fase 2 (tools/audit/command-center-contracts.js: validateFinding, dedupKey, mergeFindings, reconcileValidity) y de su extensión
 * de 4.1 (tools/audit/hallazgos-extension.js). El cuerpo de cada función es el mismo; tools/test-fase4-1-contratos-js.js compara el texto de las funciones y su comportamiento con las
 * especificaciones, de modo que no pueden divergir sin que la prueba avise. NO redefine el estado del negocio (eso es FP.planStatus), ni la economía (FP.economics), ni la confiabilidad.
 * Dependencia: FP.economics.validateImpact (js/economics/impactModel.js), que debe cargarse ANTES.
 * ESTADO: preparado para consumo; ningún módulo de la aplicación lo consume todavía (Fase 4.1).
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  const FP = (root.FP = root.FP || {}); FP.findings = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const validateImpact = (x) => { const E = root.FP && root.FP.economics; if (!E || typeof E.validateImpact !== 'function') throw new Error('findings.js requiere FP.economics (js/economics/impactModel.js) cargado antes.'); return E.validateImpact(x); };
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);

  /* ================= Certeza (2.4) =================
   * Escalera única. Extiende narrativeEngine.LEVELS (hecho, calculo, driver, senal, hipotesis, accion) con «estimacion» (proyección o escenario con supuestos)
   * y se corresponde con analysisArchitecture (fact, driver, signal, hypothesis, projection) y diagnosticArchitecture (HECHO, DRIVER, SEÑAL, HIPÓTESIS). */
  const LEVELS = ['hecho', 'calculo', 'driver', 'senal', 'estimacion', 'hipotesis', 'accion'];
  const STRENGTH = { hecho: 6, calculo: 5, driver: 4, senal: 3, estimacion: 2, hipotesis: 1, accion: 0 };   // 'accion' no es una afirmación: no sostiene un titular
  const FROM_NARRATIVE = { hecho: 'hecho', calculo: 'calculo', driver: 'driver', senal: 'senal', hipotesis: 'hipotesis', accion: 'accion' };
  const FROM_ARCHITECTURE = { fact: 'hecho', driver: 'driver', signal: 'senal', hypothesis: 'hipotesis', projection: 'estimacion', lifecycle: 'hecho' };
  const TYPES = ['risk', 'opportunity', 'deviation', 'finding'];
  const SEVERITY = ['normal', 'seguimiento', 'importante', 'critica'];       // 2.3 (la «normal» no se publica como hallazgo)
  const SUPPORT = ['alto', 'medio', 'bajo'];                                 // respaldo de la evidencia (attentionEngine.support)
  const VALIDITY = ['activo', 'vigilancia', 'resuelto', 'vencido', 'reemplazado'];
  const CAUSAL = /\b(la causa es|se debe a|esto demuestra|debido a que|provoc[óo]|caus[óo] que|es la raz[óo]n)\b/i;   // mismas frases que cohereNarrative

  /* ================= Contrato de hallazgo (2.4) ================= */
  function validateFinding(f) {
    const e = [], need = (c, m) => { if (!c) e.push(m); };
    need(f && typeof f === 'object', 'El hallazgo debe ser un objeto.'); if (!f || typeof f !== 'object') return { ok: false, errors: e };
    need(f.schema === 'cc.finding' && f.version === 1, 'schema debe ser «cc.finding» versión 1.');
    need(typeof f.id === 'string' && f.id.length > 3, 'Falta id estable.');
    need(TYPES.includes(f.type), `type debe ser uno de ${TYPES.join(', ')}.`);
    need(typeof f.title === 'string' && f.title.trim(), 'Falta título.');
    need(typeof f.description === 'string' && f.description.trim(), 'Falta descripción.');
    need(f.scope && ['total', 'channel', 'dimension', 'entity'].includes(f.scope.level) && typeof f.scope.channel === 'string', 'scope debe indicar nivel y canal.');
    need(f.period && f.period.type && f.period.key && ['plan', 'previous', 'yoy', 'trend', 'expected', 'none'].includes(f.period.comparison), 'period debe indicar tipo, clave y comparación.');
    need(typeof f.indicator === 'string' && f.indicator, 'Falta indicador involucrado.');
    need(f.observed && (fin(f.observed.value) || f.observed.value === null) && typeof f.observed.unit === 'string', 'observed debe traer valor (o null) y unidad.');
    need(f.reference && (fin(f.reference.value) || f.reference.value === null) && typeof f.reference.basis === 'string', 'reference debe traer valor (o null) y base.');
    need(Array.isArray(f.evidence) && f.evidence.length > 0, 'Debe traer al menos una evidencia.');
    (f.evidence || []).forEach((x, i) => {
      need(LEVELS.includes(x.class), `evidence[${i}].class inválida.`);
      need(typeof x.text === 'string' && x.text, `evidence[${i}] sin texto.`);
      need(x.source && x.source.module && x.source.field, `evidence[${i}] sin fuente (módulo y campo): no hay insight sin trazabilidad.`);
      need(Array.isArray(x.numbers) && x.numbers.every(fin), `evidence[${i}].numbers debe ser una lista de números.`);
    });
    need(f.rule && f.rule.id && f.rule.family && fin(f.rule.version), 'Falta la regla que lo originó (id, familia, versión).');
    need(f.certainty && LEVELS.includes(f.certainty.level) && SUPPORT.includes(f.certainty.support) && f.certainty.basis, 'certainty requiere nivel, respaldo y la regla visible que lo justifica.');
    need(SEVERITY.includes(f.severity) && f.severity !== 'normal', 'severity debe ser seguimiento, importante o crítica (lo normal no es un hallazgo).');
    need(Array.isArray(f.limitations), 'limitations debe ser una lista (puede ir vacía solo si es un hecho).');
    need(f.validity && VALIDITY.includes(f.validity.status) && f.validity.firstSeen && f.validity.lastSeen && f.validity.expiresWhen, 'validity requiere estado, primera/última vez visto y condición de vencimiento.');
    need(Array.isArray(f.lineage) && f.lineage.length >= 1 && f.lineage.every((l) => l.engine && l.id && ['origin', 'duplicate', 'enrichment'].includes(l.role)), 'lineage debe citar el motor y el id de origen de cada fuente.');
    // --- reglas de certeza ---
    if (Array.isArray(f.evidence) && f.certainty && LEVELS.includes(f.certainty.level)) {
      const claims = f.evidence.filter((x) => x.class !== 'accion' && x.headline);
      const weakest = claims.length ? Math.min(...claims.map((x) => STRENGTH[x.class])) : null;
      need(claims.length > 0, 'Al menos una evidencia debe sostener el titular (headline: true).');
      if (weakest !== null) need(STRENGTH[f.certainty.level] <= weakest, `La certeza («${f.certainty.level}») no puede ser mayor que la de la evidencia más débil que sostiene el titular.`);
      need(!(f.certainty.level === 'hipotesis' && /^(hecho|calculo)$/.test(String(f.indicatorStatus || ''))), 'Una hipótesis no puede presentarse como hecho.');
      if (STRENGTH[f.certainty.level] < STRENGTH.driver) need(!CAUSAL.test(`${f.title} ${f.description}`), 'Lenguaje causal en un hallazgo que no es hecho, cálculo ni atribución: debe redactarse como posibilidad.');
      if (f.certainty.level === 'hipotesis' || f.certainty.level === 'senal') need(f.evidence.some((x) => x.class === 'accion' || x.validation), 'Una señal o hipótesis debe indicar cómo validarla (validation) o la próxima comprobación.');
    }
    // --- impacto económico (opcional pero, si existe, validado con el contrato de 2.5) ---
    if (f.economics) { const r = validateImpact(f.economics); if (!r.ok) r.errors.forEach((m) => e.push(`economics: ${m}`)); }
    else need(f.economicsReason, 'Sin impacto económico (economics: null) debe indicarse economicsReason.');
    return { ok: e.length === 0, errors: e };
  }

  /* ================= Deduplicación y agrupación (2.4) =================
   * Familia semántica = QUÉ se dice, sin importar qué motor lo dijo. Dos hallazgos con la misma llave son el mismo hallazgo. */
  const FAMILY_BY_RULE = [
    [/^(gap|pacing_gap|brecha)$/, () => 'pacing_gap'], [/^driver[_:]?(traffic|cr|aov|trafficVolume|conversionRate)$/i, (m) => `driver:${norm(m[1])}`],
    [/^(forecast|forecast_close)$/, () => 'forecast_close'], [/^channel[_:]?(\w+)$/i, (m) => `channel_lag:${m[1]}`],
    [/^data[_:]?(\w+)$/i, (m) => `data:${m[1]}`], [/^followup/, () => 'followup'], [/^pattern[_:]?(.+)$/i, (m) => `pattern:${m[1]}`]
  ];
  function norm(d) { const x = String(d).toLowerCase(); return /traffic|volume|sesion/.test(x) ? 'traffic' : /^cr|conversion/.test(x) ? 'cr' : 'aov'; }
  function familyOf(ruleFamily) { for (const [re, fn] of FAMILY_BY_RULE) { const m = re.exec(ruleFamily || ''); if (m) return fn(m); } return String(ruleFamily || 'other'); }
  function dedupKey(f) {
    return [f.scope.level, f.scope.channel || 'total', f.scope.entity || '-', f.indicator, f.period.key, f.period.comparison, familyOf(f.rule.family)].join('|');
  }
  /** Precedencia al elegir el canónico: motor de cálculo > atención > agentes > prioridades > narrativa (la narrativa solo cita). */
  const PRECEDENCE = ['calculo', 'atencion', 'agentes', 'prioridades', 'narrativa'];
  const rankOf = (f) => { const l = f.lineage.find((x) => x.role === 'origin') || f.lineage[0]; const i = PRECEDENCE.indexOf(l.family || ''); return i < 0 ? PRECEDENCE.length : i; };
  function mergeFindings(list) {
    const groups = new Map();
    list.forEach((f) => { const k = dedupKey(f); (groups.get(k) || groups.set(k, []).get(k)).push(f); });
    const out = [];
    groups.forEach((items, key) => {
      items.sort((a, b) => rankOf(a) - rankOf(b) || (STRENGTH[b.certainty.level] - STRENGTH[a.certainty.level]));
      const canon = JSON.parse(JSON.stringify(items[0]));
      items.slice(1).forEach((d) => d.lineage.forEach((l) => canon.lineage.push({ ...l, role: l.role === 'origin' ? 'duplicate' : l.role })));
      canon.dedupKey = key; canon.id = `f:${key}`;
      canon.validity.firstSeen = items.map((x) => x.validity.firstSeen).sort()[0];
      canon.validity.lastSeen = items.map((x) => x.validity.lastSeen).sort().slice(-1)[0];
      out.push(canon);
    });
    // Agrupación: un driver «explica» la brecha del mismo canal y periodo (relación, no suma)
    out.forEach((f) => {
      if (/^driver:/.test(f.dedupKey.split('|')[6])) {
        const parent = out.find((p) => p.dedupKey.split('|')[6] === 'pacing_gap' && p.scope.channel === f.scope.channel && p.period.key === f.period.key);
        if (parent) f.explains = parent.id;
      }
    });
    return out;
  }
  /** Ciclo de vida: compara las llaves vigentes con las de la corrida anterior (alineado con changeEngine.reconcile: nueva · sigue · resuelta). */
  function reconcileValidity(prev, current, { today, dataDay, missesToExpire = 2 }) {
    const byKey = new Map((prev || []).map((p) => [p.dedupKey, p])), seen = new Set(), out = [];
    current.forEach((f) => { seen.add(f.dedupKey); const p = byKey.get(f.dedupKey);
      out.push({ ...f, validity: { ...f.validity, status: 'activo', firstSeen: p ? p.validity.firstSeen : today, lastSeen: today, misses: 0 } }); });
    (prev || []).forEach((p) => {
      if (seen.has(p.dedupKey)) return;
      if (!dataDay || (p.validity.lastDataDay && dataDay < p.validity.lastDataDay)) { out.push(p); return; }   // datos más viejos o ausentes: no se resuelve nada
      const misses = (p.validity.misses || 0) + 1;
      out.push({ ...p, validity: { ...p.validity, misses, status: misses >= missesToExpire ? 'resuelto' : 'vigilancia' } });
    });
    return out;
  }

  /* ===== Extensión v1.1 (tools/audit/hallazgos-extension.js) ===== */
  const KINDS = ['hecho_observado', 'desviacion', 'hipotesis', 'causa_comprobada', 'oportunidad', 'riesgo', 'recomendacion'];
  const CAUSALITY = ['none', 'hypothesis', 'demonstrated'];
  const AI_FAMILIES = ['ia', 'cohere', 'narrativa_ia'];

  function kindOf(f) {
    if (f.type === 'risk') return 'riesgo'; if (f.type === 'opportunity') return 'oportunidad';
    if (f.certainty.level === 'hipotesis' || f.certainty.level === 'senal') return 'hipotesis';
    if (f.causality === 'demonstrated') return 'causa_comprobada';
    if (f.type === 'deviation') return 'desviacion';
    return 'hecho_observado';
  }

  function validateExtension(f) {
    const e = [], need = (c, m) => { if (!c) e.push(m); };
    if (f.causality !== undefined) need(CAUSALITY.includes(f.causality), `causality debe ser ${CAUSALITY.join(', ')}.`);
    if (f.kind !== undefined) need(KINDS.includes(f.kind), `kind debe ser ${KINDS.join(', ')}.`);
    if (f.causality === 'demonstrated') {
      need(f.evidence.some((x) => x.class === 'hecho' && x.proves === 'cause' && x.source && x.source.module), 'Una causa comprobada exige evidencia de clase «hecho» con proves:\'cause\' y fuente.');
      need(STRENGTH[f.certainty.level] >= STRENGTH.calculo, 'Una causa comprobada no puede tener una certeza menor que «cálculo».');
    }
    if (f.lineage.some((l) => AI_FAMILIES.includes(l.family)) && f.causality === 'demonstrated') e.push('La IA no puede elevar una hipótesis a causa comprobada.');
    if (f.certainty.level === 'hipotesis' || f.certainty.level === 'senal') need(f.causality !== 'demonstrated', 'Una hipótesis o señal no puede declararse causa comprobada.');
    if (f.dataReliability !== undefined) need(f.dataReliability && ['Alta', 'Media', 'Baja', 'Insuficiente'].includes(f.dataReliability.level) && f.dataReliability.contract === 'cc.reliability/1', 'dataReliability debe traer nivel y contrato cc.reliability/1.');
    if (f.actionRef !== undefined && f.actionRef !== null) need(typeof f.actionRef.id === 'string' && f.actionRef.id, 'actionRef debe traer el id de la acción.');
    if (f.economics === null || f.economics === undefined) need(f.economicsReason, 'Sin impacto económico debe indicarse economicsReason (no se inventa un impacto).');
    return e;
  }
  /** Contrato base de Fase 2 + extensión. */
  function validate(f) { const base = validateFinding(f); const ext = base.ok ? validateExtension(f) : []; return { ok: base.ok && !ext.length, errors: [...base.errors, ...ext] }; }

  /* ---------- adaptador desde attentionEngine (sin tocarlo) ---------- */
  const SEV = { blocking: 'critica', attention: 'importante', warning: 'seguimiento', info: 'seguimiento' };
  const SUP = { alto: 'alto', medio: 'medio', bajo: 'bajo' };
  const FAMILY = (id) => (/^driver_/.test(id) ? `driver:${familyOf('driver:' + id.slice(7)).split(':')[1] || id.slice(7)}` : id);
  /** @param item un elemento de AE.evaluate(...).findings · @param ctx { period:{type,key}, channel, today, dataReliability? } */
  function fromAttentionItem(item, ctx) {
    const today = ctx.today || '2026-09-23', sup = SUP[(item.support && item.support.level) || 'medio'] || 'medio', amt = fin(item.amount) ? item.amount : null;
    const kind = item.kind, scope = { level: kind === 'channel' ? 'channel' : 'total', channel: kind === 'channel' ? (item.channel || ctx.channel || 'total') : (ctx.channel || 'total') };
    const base = { schema: 'cc.finding', version: 1, id: `f:attention:${item.id}`, title: item.title, description: item.what, scope, period: { type: ctx.period.type, key: ctx.period.key, comparison: 'plan' },
      severity: SEV[item.severity] || 'seguimiento', limitations: item.missing && item.missing.length ? item.missing.map(String) : [], validity: { status: 'activo', firstSeen: today, lastSeen: today, expiresWhen: 'el dato deja de mostrar la condición o cierra el periodo' },
      lineage: [{ engine: 'attentionEngine', id: item.id, role: 'origin', family: 'atencion' }], detectedAt: today, updatedAt: today };
    const ev = (cls, text, mod, field, nums, extra) => Object.assign({ class: cls, text, source: { module: mod, field }, numbers: (nums || []).filter(fin) }, extra || {});
    let f;
    if (kind === 'gap') f = { ...base, type: 'deviation', indicator: 'revenue', observed: { value: null, unit: 'MXN' }, reference: { value: null, basis: 'plan de los mismos días' }, evidence: [ev('calculo', (item.evidence || [])[0] || item.what, 'forecastEngine', 'toDate.revenue', [amt], { headline: true })],
      rule: { id: 'attention.gap', family: 'gap', version: 1 }, certainty: { level: 'calculo', support: sup, basis: (item.support && item.support.rule) || 'Respaldo del motor de atención.' }, causality: 'none' };
    else if (kind === 'driver') f = { ...base, type: 'deviation', indicator: item.id.replace(/^driver_/, '') === 'cr' ? 'conversionRate' : item.id.replace(/^driver_/, '') === 'traffic' ? 'trafficVolume' : 'aov', observed: { value: null, unit: 'MXN' }, reference: { value: null, basis: 'periodo base de la atribución' },
      evidence: [ev('driver', (item.evidence || [])[0] || item.what, 'attribution', 'contribution', [amt], { headline: true }), ev('hipotesis', item.hypothesis || 'Hipótesis sin confirmar.', 'hypothesisEngine', 'hypotheses', [], { validation: item.nextCheck || 'Comparar el embudo por semana.' })],
      rule: { id: `attention.${item.id}`, family: item.id, version: 1 }, certainty: { level: 'driver', support: sup, basis: 'Atribución matemática secuencial; no es una causa demostrada.' }, causality: 'hypothesis' };
    else if (kind === 'forecast') f = { ...base, type: 'risk', indicator: 'revenue', observed: { value: null, unit: 'MXN' }, reference: { value: null, basis: 'meta del periodo' }, evidence: [ev('estimacion', (item.evidence || [])[0] || item.what, 'forecastEngine', 'forecast', [amt], { headline: true })],
      rule: { id: 'attention.forecast', family: 'forecast', version: 1 }, certainty: { level: 'estimacion', support: sup, basis: 'Proyección con el ritmo observado.' }, causality: 'none', limitations: ['Es una proyección: depende de que el ritmo se mantenga.'] };
    else if (kind === 'channel') f = { ...base, type: 'deviation', indicator: 'revenue', observed: { value: null, unit: 'MXN' }, reference: { value: null, basis: 'plan del canal' }, evidence: [ev('calculo', (item.evidence || [])[0] || item.what, 'pacing', 'channels', [amt], { headline: true })],
      rule: { id: `attention.${item.id}`, family: `channel_${scope.channel}`, version: 1 }, certainty: { level: 'calculo', support: sup, basis: 'Cálculo por canal del motor de pacing.' }, causality: 'none' };
    else if (kind === 'data') f = { ...base, type: 'finding', indicator: 'dataQuality', observed: { value: null, unit: 'estado' }, reference: { value: null, basis: 'contrato de datos' }, evidence: [ev('hecho', (item.evidence || [])[0] || item.what, 'quality', item.id, [], { headline: true })],
      rule: { id: `attention.${item.id}`, family: item.id, version: 1 }, certainty: { level: 'hecho', support: 'alto', basis: 'Regla de calidad de datos.' }, causality: 'none' };
    else f = { ...base, type: 'finding', indicator: 'followup', observed: { value: null, unit: 'estado' }, reference: { value: null, basis: 'plan de acción' }, evidence: [ev('hecho', item.what, 'actionPlan', item.id, [], { headline: true })],
      rule: { id: `attention.${item.id}`, family: 'followup', version: 1 }, certainty: { level: 'hecho', support: 'alto', basis: 'Estado del plan de acción.' }, causality: 'none' };
    // sin impacto económico verificable en 4.1: se declara (nunca se inventa); 4.5 lo conectará con FP.economics
    f.economics = null; f.economicsReason = amt === null ? 'Sin importe cuantificable en el elemento de origen.' : 'El importe del elemento no se convierte en impacto hasta conectar FP.economics (Fase 4.5); no se duplica aquí.';
    if (kind === 'driver' || kind === 'gap') f.economicsReason = kind === 'driver' ? 'La contribución de un driver se presenta como contribución matemática, no como impacto propio (evita doble conteo con la brecha).' : f.economicsReason;
    if (ctx.dataReliability) f.dataReliability = { level: ctx.dataReliability, contract: 'cc.reliability/1' };
    f.recommendation = item.next ? { label: item.next.label, view: item.next.view } : null; f.actionRef = null; f.kind = kindOf(f);
    f.difference = null;
    return f;
  }

  return { contract: 'cc.finding/1.1', LEVELS, STRENGTH, FROM_NARRATIVE, FROM_ARCHITECTURE, TYPES, SEVERITY, SUPPORT, VALIDITY, CAUSAL, KINDS, CAUSALITY,
    validateFinding, dedupKey, familyOf, mergeFindings, reconcileValidity, validate, validateExtension, kindOf, fromAttentionItem };
});
