/**
 * command-center-contracts.js — IMPLEMENTACIÓN DE REFERENCIA de los contratos de la Fase 2 (Command Center Intelligence).
 *
 * NO es código de la aplicación (no se carga desde index.html) y NO calcula ningún indicador oficial: los indicadores salen de los motores existentes.
 * Es la especificación ejecutable de lo que los motores NO tienen todavía: validar un hallazgo, deduplicarlo, clasificar el estado del negocio,
 * asignar severidad y combinar impactos económicos sin doble contabilización. La Fase 4 la porta a js/ (con las mismas pruebas).
 * Documentación: docs/command-center/MODELO_*.md.   Pruebas: tools/test-fase2-contratos.js y tools/regression/batch_fase2_*.py
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.CCContracts = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
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

  /* ================= Estado general del negocio (2.1) =================
   * Entradas: ya calculadas por los motores (compliance, forecastGapPct, growth vs comparable, hallazgos, calidad). Aquí solo se CLASIFICA. */
  const DEFAULT_BANDS = { aboveFrom: 1.01, onPlanFrom: 0.99, growth: 0.03, flat: 0.01, minCoverage: 0.6 };
  function classifyBusinessState(x, bands = DEFAULT_BANDS) {
    const b = { ...DEFAULT_BANDS, ...bands }, why = [];
    const cov = fin(x.coverage) ? x.coverage : null;
    // Excepción 0: sin base suficiente no se emite estado (se muestran las acciones de datos)
    if (x.blockingData || !fin(x.compliance) || (cov !== null && cov < b.minCoverage)) return { state: 'sin_base', qualifiers: [], why: ['Datos insuficientes: no se emite un estado del negocio.'] };
    const C = x.compliance >= b.aboveFrom ? 'arriba' : x.compliance >= b.onPlanFrom ? 'en_plan' : 'debajo';
    const G = !fin(x.growthVsComparable) ? 'sin_dato' : x.growthVsComparable >= b.growth ? 'crece' : x.growthVsComparable <= -b.growth ? 'cae' : Math.abs(x.growthVsComparable) < b.flat ? 'plano' : (x.growthVsComparable > 0 ? 'crece_poco' : 'cae_poco');
    const F = !fin(x.forecastGapPct) ? 'sin_dato' : 1 + x.forecastGapPct < b.onPlanFrom ? 'riesgo' : 'ok';
    const crit = (x.findings || []).some((f) => f.severity === 'critica'), imp = (x.findings || []).some((f) => f.severity === 'importante');
    why.push(`Cumplimiento ${C}`, `Evolución ${G}`, `Cierre ${F}`);
    const q = [];
    if ((x.findings || []).some((f) => f.type === 'opportunity' && f.economics && f.economics.category === 'alcanzable' && f.economics.status === 'ok' && f.material)) q.push('oportunidad_aceleracion');
    if (F === 'riesgo') q.push('cierre_en_riesgo');
    if (x.concentration) q.push('concentracion_en_un_canal');
    if (x.dataWarnings) q.push('datos_con_avisos');
    let state;
    if (G === 'cae' && (C === 'debajo' || F === 'riesgo' || crit)) state = 'deterioro';
    else if (crit) state = 'riesgo_cumplimiento';                                              // un hallazgo crítico activo prevalece
    else if (G === 'crece' && (C === 'debajo' || F === 'riesgo')) state = 'creciendo_bajo_potencial';   // crece, pero no alcanza el plan o el cierre
    else if (C === 'debajo' || F === 'riesgo') state = 'riesgo_cumplimiento';
    else if (G === 'crece' && !imp) state = 'creciendo';
    else if (!imp && (G === 'plano' || G === 'crece_poco' || G === 'cae_poco' || G === 'sin_dato' || G === 'crece')) state = 'saludable';
    else state = 'riesgo_cumplimiento';   // hallazgo importante activo con cumplimiento en plan: se vigila como riesgo
    return { state, qualifiers: q, axes: { C, G, F }, why };
  }

  /* ================= Severidad de una desviación (2.3) ================= */
  /**
   * @param {object} d { devPct (signo: negativo = adverso), band:{normal, unusual} (fracciones; de thresholdAdvisor o de config), moneyAbs, planBase, persistence (periodos/días adversos seguidos),
   *   support 'alto'|'medio'|'bajo', corroborated (otro indicador coincide), streakDays, materiality:{low,medium,high} }
   */
  function classifyDeviation(d) {
    const M = { low: 0.02, medium: 0.05, high: 0.15, ...(d.materiality || {}) }, reasons = [];
    if (d.support === 'bajo' && !fin(d.devPct)) return { severity: 'descartada', reasons: ['Sin datos suficientes: se reporta como brecha de datos, no como desviación.'] };
    const adv = fin(d.devPct) && d.devPct < 0 ? Math.abs(d.devPct) : 0, n = d.band.normal, u = d.band.unusual;
    const mat = fin(d.moneyAbs) && fin(d.planBase) && d.planBase > 0 ? d.moneyAbs / d.planBase : null;
    let lvl = adv <= n ? 0 : adv <= u ? 1 : adv <= 2 * u ? 2 : 3;
    reasons.push(`Desvío adverso ${(adv * 100).toFixed(1)} % vs banda normal ${(n * 100).toFixed(1)} % / inusual ${(u * 100).toFixed(1)} %`);
    if (mat !== null) {
      if (lvl === 0 && mat >= M.medium) { lvl = 1; reasons.push(`Pequeño en % pero material en dinero (${(mat * 100).toFixed(1)} % del plan del periodo): sube a seguimiento.`); }
      else if (lvl >= 1 && mat >= M.high) { lvl = Math.min(3, lvl + 1); reasons.push('Materialidad económica alta: sube un nivel.'); }
      else if (lvl >= 2 && mat < M.low) { lvl = 1; reasons.push('Materialidad económica baja: no pasa de seguimiento.'); }
    }
    const streak = d.streakDays || 5;
    if (lvl >= 1 && (d.persistence || 0) >= streak) { lvl = Math.min(3, lvl + 1); reasons.push(`Persistente (${d.persistence} ≥ ${streak}): sube un nivel.`); }
    if (lvl >= 2 && (d.persistence || 0) <= 1 && !d.corroborated && !(mat !== null && mat >= M.high)) { lvl = 1; reasons.push('Un solo punto sin corroboración: se mantiene en seguimiento (posible atípico).'); }
    if (d.support === 'bajo' && lvl > 1) { lvl = 1; reasons.push('Respaldo bajo: no pasa de seguimiento.'); }
    return { severity: SEVERITY[lvl], reasons, materiality: mat };
  }

  /* ================= Cuantificación económica (2.5) =================
   * La implementación vive en js/economics/impactModel.js (código de la aplicación, modelo dual ventas + contribución). Aquí solo se re-exporta
   * para que el contrato de hallazgo y las pruebas de Fase 2 usen UNA sola implementación (sin duplicar reglas de combinación). */
  const ECON = (typeof module === 'object' && module.exports) ? require('../../js/economics/impactModel.js') : (globalThis.FP && globalThis.FP.economics);
  const { CATEGORIES, validateImpact, combineImpacts, checkOrdering, jointRelative } = ECON;

  return { LEVELS, STRENGTH, FROM_NARRATIVE, FROM_ARCHITECTURE, TYPES, SEVERITY, SUPPORT, VALIDITY, CATEGORIES, DEFAULT_BANDS, CAUSAL,
    validateFinding, dedupKey, familyOf, mergeFindings, reconcileValidity, classifyBusinessState, classifyDeviation, validateImpact, combineImpacts, checkOrdering, jointRelative };
});
